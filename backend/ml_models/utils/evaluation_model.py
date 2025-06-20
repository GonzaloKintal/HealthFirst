import pandas as pd
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder, StandardScaler
from scipy.sparse import hstack, csr_matrix
import lightgbm as lgb
import numpy as np
from ml_models.models import MLModel
from ml_models.utils.file_utils import normalize_text
from .spanish_stopwords import SPANISH_STOPWORDS
from sklearn.model_selection import cross_val_score, StratifiedKFold
from datetime import datetime
from ml_models.models import LicenseDatasetEntry


# Paths
APPROVAL_MODEL_PATH = Path(__file__).resolve().parent / 'modelo_aprobacion.joblib'
REJECTION_MODEL_PATH = Path(__file__).resolve().parent / 'modelo_motivo_rechazo.joblib'
DATASET_PATH = Path(__file__).resolve().parent / 'coherence_license_type_dataset.csv'


def load_approval_data():
    """Carga datos desde la base de datos para el modelo de aprobación/rechazo."""
    queryset = LicenseDatasetEntry.objects.all().values('id', 'text', 'status', 'type')
    df = pd.DataFrame.from_records(queryset)

    df['approved'] = (df['status'] == 'approved').astype(int)

    first_id = df['id'].min() if not df.empty else None
    last_id = df['id'].max() if not df.empty else None

    return {
        'texts': df['text'].tolist(),
        'types': df['type'].tolist(),
        'approved': df['approved'].tolist(),
        'first_id': first_id,
        'last_id': last_id
    }


def load_rejection_reasons_data():
    """Carga datos desde la base de datos para el modelo de motivos de rechazo."""
    queryset = LicenseDatasetEntry.objects.filter(
        status='rejected',
        reason__isnull=False
    ).values('id', 'text', 'reason', 'type')
    df = pd.DataFrame.from_records(queryset)

    first_id = df['id'].min() if not df.empty else None
    last_id = df['id'].max() if not df.empty else None

    return {
        'texts': df['text'].tolist(),
        'types': df['type'].tolist(),
        'reasons': df['reason'].tolist(),
        'first_id': first_id,
        'last_id': last_id
    }


class ApprovalClassifier:
    def __init__(self, text_weight=0.7, type_weight=0.3):
        self.text_weight = text_weight
        self.type_weight = type_weight
        
        self.vectorizer = TfidfVectorizer(
            max_features=8000,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.95,
            stop_words=SPANISH_STOPWORDS,
            sublinear_tf=True
        )
        
        self.type_encoder = LabelEncoder()
        self.type_scaler = StandardScaler()
        
        self.classifier = lgb.LGBMClassifier(
            n_estimators=1000,
            learning_rate=0.05,
            max_depth=8,
            num_leaves=31,
            subsample=0.8,
            colsample_bytree=0.8,
            class_weight='balanced',
            random_state=42,
            verbose=-1,
            early_stopping_rounds=100
        )
        
    def _prepare_features(self, texts, types, fit_transform=False):
        """Combina características de texto y tipo con pesos balanceados."""
        if fit_transform:
            text_features = self.vectorizer.fit_transform(texts)
            type_features_encoded = self.type_encoder.fit_transform(types)
        else:
            text_features = self.vectorizer.transform(texts)
            type_features_encoded = self.type_encoder.transform(types)
        
        # Crear características de tipo expandidas (one-hot + replicación)
        n_types = len(self.type_encoder.classes_) if hasattr(self.type_encoder, 'classes_') else len(set(types))
        type_features_onehot = np.zeros((len(types), n_types))
        for i, encoded_type in enumerate(type_features_encoded):
            if encoded_type < n_types:
                type_features_onehot[i, encoded_type] = 1
        
        # Expandir las características de tipo para darle más peso dimensional
        type_features_expanded = np.tile(type_features_onehot, (1, 20))  # Replicar 20 veces
        
        # Escalar las características de tipo
        if fit_transform:
            type_features_scaled = self.type_scaler.fit_transform(type_features_expanded)
        else:
            type_features_scaled = self.type_scaler.transform(type_features_expanded)
        
        # Aplicar pesos
        text_features_weighted = text_features * self.text_weight
        type_features_weighted = type_features_scaled * self.type_weight
        
        # Crear características de interacción (texto modulado por tipo)
        text_dense = text_features.toarray() if hasattr(text_features, 'toarray') else text_features
        interaction_features = []
        for i in range(len(texts)):
            # Tomar las top 100 características de texto y modularlas por el tipo
            top_text_features = text_dense[i][:100] if text_dense.shape[1] >= 100 else text_dense[i]
            interaction = top_text_features * (1 + type_features_encoded[i] * 0.1)
            interaction_features.append(interaction)
        
        interaction_features = np.array(interaction_features)
        interaction_weighted = interaction_features * (self.text_weight * self.type_weight)
        
        # Combinar todas las características
        combined_features = hstack([
            text_features_weighted,
            csr_matrix(type_features_weighted),
            csr_matrix(interaction_weighted)
        ])
        
        return combined_features
        
    def fit(self, X_train_text, X_train_type, y_train, X_val_text=None, X_val_type=None, y_val=None):
        X_train_combined = self._prepare_features(X_train_text, X_train_type, fit_transform=True)
        
        if X_val_text is not None and X_val_type is not None and y_val is not None:
            X_val_combined = self._prepare_features(X_val_text, X_val_type, fit_transform=False)
            self.classifier.fit(
                X_train_combined, y_train,
                eval_set=[(X_val_combined, y_val)],
                callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
            )
        else:
            self.classifier.fit(X_train_combined, y_train)
    
    def predict(self, texts, types):
        X_combined = self._prepare_features(texts, types, fit_transform=False)
        return self.classifier.predict(X_combined)
    
    def predict_proba(self, texts, types):
        X_combined = self._prepare_features(texts, types, fit_transform=False)
        return self.classifier.predict_proba(X_combined)


class RejectionReasonClassifier:
    def __init__(self, text_weight=0.6, type_weight=0.4):
        self.text_weight = text_weight
        self.type_weight = type_weight
        
        self.vectorizer = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=1.0,
            stop_words=SPANISH_STOPWORDS,
            sublinear_tf=True
        )
        
        self.type_encoder = LabelEncoder()
        self.type_scaler = StandardScaler()
        
        self.classifier = lgb.LGBMClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=4,
            num_leaves=15,
            subsample=0.8,
            colsample_bytree=0.8,
            class_weight='balanced',
            scale_pos_weight=None,
            random_state=42,
            verbose=-1,
            reg_alpha=0.1,
            reg_lambda=0.1,
            min_child_samples=1,
        )
    
    def _prepare_features(self, texts, types, fit_transform=False):
        """Combina características de texto y tipo con pesos balanceados."""
        if fit_transform:
            text_features = self.vectorizer.fit_transform(texts)
            type_features_encoded = self.type_encoder.fit_transform(types)
        else:
            text_features = self.vectorizer.transform(texts)
            type_features_encoded = self.type_encoder.transform(types)
        
        # Crear características de tipo expandidas (one-hot + replicación)
        n_types = len(self.type_encoder.classes_) if hasattr(self.type_encoder, 'classes_') else len(set(types))
        type_features_onehot = np.zeros((len(types), n_types))
        for i, encoded_type in enumerate(type_features_encoded):
            if encoded_type < n_types:
                type_features_onehot[i, encoded_type] = 1
        
        # Expandir las características de tipo para darle más peso dimensional
        type_features_expanded = np.tile(type_features_onehot, (1, 25))  # Replicar 25 veces
        
        # Escalar las características de tipo
        if fit_transform:
            type_features_scaled = self.type_scaler.fit_transform(type_features_expanded)
        else:
            type_features_scaled = self.type_scaler.transform(type_features_expanded)
        
        # Aplicar pesos
        text_features_weighted = text_features * self.text_weight
        type_features_weighted = type_features_scaled * self.type_weight
        
        # Crear características específicas por tipo (para motivos de rechazo)
        text_dense = text_features.toarray() if hasattr(text_features, 'toarray') else text_features
        type_specific_features = []
        for i in range(len(texts)):
            # Crear características que son específicas del tipo
            type_multiplier = np.zeros(n_types)
            type_multiplier[type_features_encoded[i]] = 1
            
            # Características de texto moduladas por tipo (más específicas para motivos)
            top_text = text_dense[i][:50] if text_dense.shape[1] >= 50 else text_dense[i]
            text_by_type = np.outer(type_multiplier, top_text).flatten()
            type_specific_features.append(text_by_type)
        
        type_specific_features = np.array(type_specific_features)
        type_specific_weighted = type_specific_features * self.type_weight * 0.5
        
        # Combinar todas las características
        combined_features = hstack([
            text_features_weighted,
            csr_matrix(type_features_weighted),
            csr_matrix(type_specific_weighted)
        ])
        
        return combined_features
    
    def fit(self, X_train_text, X_train_type, y_train):
        X_train_combined = self._prepare_features(X_train_text, X_train_type, fit_transform=True)
        self.classifier.fit(X_train_combined, y_train)
    
    def predict(self, texts, types):
        X_combined = self._prepare_features(texts, types, fit_transform=False)
        return self.classifier.predict(X_combined)
    
    def predict_proba(self, texts, types):
        X_combined = self._prepare_features(texts, types, fit_transform=False)
        return self.classifier.predict_proba(X_combined)


def train_and_save_approval_model():
    data = load_approval_data()
    texts = data['texts']
    types = data['types']
    labels = data['approved']
    first_id = data['first_id']
    last_id = data['last_id']
    
    # Crear DataFrame para facilitar el split estratificado
    df_temp = pd.DataFrame({
        'text': texts,
        'type': types,
        'label': labels
    })
    
    X_train, X_test, y_train, y_test = train_test_split(
        df_temp[['text', 'type']], df_temp['label'], 
        test_size=0.2, 
        random_state=42, 
        stratify=df_temp['label']
    )
    
    if len(set(y_train)) < 2:
        X_train, X_test, y_train, y_test = train_test_split(
            df_temp[['text', 'type']], df_temp['label'], 
            test_size=0.3, 
            random_state=123, 
            stratify=df_temp['label']
        )
    
    if len(set(y_test)) < 2:
        X_train, X_test, y_train, y_test = train_test_split(
            df_temp[['text', 'type']], df_temp['label'], 
            test_size=min(0.4, len(texts) // 2), 
            random_state=456, 
            stratify=df_temp['label']
        )
    
    X_train_split, X_val, y_train_split, y_val = train_test_split(
        X_train, y_train,
        test_size=0.2,
        random_state=42,
        stratify=y_train
    )
    
    model = ApprovalClassifier()
    model.fit(
        X_train_split['text'].tolist(), 
        X_train_split['type'].tolist(), 
        y_train_split, 
        X_val['text'].tolist(), 
        X_val['type'].tolist(), 
        y_val
    )
    
    # Evaluar el modelo
    y_pred = model.predict(X_test['text'].tolist(), X_test['type'].tolist())
    accuracy = accuracy_score(y_test, y_pred)
    
    # Distribución de clases
    train_dist = pd.Series(y_train).value_counts()
    test_dist = pd.Series(y_test).value_counts()
    
    training_info = {
        'model_type': 'approval',
        'total_samples': len(texts),
        'train_samples': len(y_train),
        'test_samples': len(y_test),
        'accuracy': round(accuracy, 4),
        'train_distribution': {
            'approved': int(train_dist.get(1, 0)),
            'rejected': int(train_dist.get(0, 0))
        },
        'test_distribution': {
            'approved': int(test_dist.get(1, 0)),
            'rejected': int(test_dist.get(0, 0))
        },
        'unique_types': len(set(types))
    }
    
    joblib.dump(model, APPROVAL_MODEL_PATH)
    MLModel.objects.create(
        model_type='LICENSE_APPROVAL',
        name='Modelo de aprobación de licencias',
        algorithm='LGBM',
        is_active=True,
        training_date=datetime.now(),
        first_training_id=first_id,
        last_training_id=last_id
    )
    return model, training_info


def train_and_save_rejection_reason_model():
    data = load_rejection_reasons_data()
    texts = data['texts']
    types = data['types']
    reasons = data['reasons']
    first_id = data['first_id']
    last_id = data['last_id']
    
    if len(texts) == 0:
        return None, None

    reason_counts = pd.Series(reasons).value_counts()
    min_samples_per_class = 2
    classes_with_few_samples = reason_counts[reason_counts < min_samples_per_class]
    
    if len(classes_with_few_samples) > 0 and len(texts) < 20:
        return train_with_cross_validation(texts, types, reasons, first_id, last_id)

    # Crear DataFrame para facilitar el manejo
    df_temp = pd.DataFrame({
        'text': texts,
        'type': types,
        'reason': reasons
    })

    try:
        if len(texts) < 30:
            test_size = max(0.2, 2/len(texts)) 
        else:
            test_size = 0.25
            
        X_train, X_test, y_train, y_test = train_test_split(
            df_temp[['text', 'type']], df_temp['reason'],
            test_size=test_size,
            random_state=42,
            stratify=df_temp['reason']
        )
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(
            df_temp[['text', 'type']], df_temp['reason'],
            test_size=test_size,
            random_state=42
        )
    
    model = RejectionReasonClassifier()
    model.fit(X_train['text'].tolist(), X_train['type'].tolist(), y_train)
    
    # Evaluar el modelo
    y_pred = model.predict(X_test['text'].tolist(), X_test['type'].tolist())
    accuracy = accuracy_score(y_test, y_pred)
    
    # Distribución de motivos
    train_dist = pd.Series(y_train).value_counts()
    test_dist = pd.Series(y_test).value_counts()
    
    training_info = {
        'model_type': 'rejection_reasons',
        'total_samples': len(texts),
        'train_samples': len(y_train),
        'test_samples': len(y_test),
        'accuracy': round(accuracy, 4),
        'unique_reasons': len(reason_counts),
        'unique_types': len(set(types)),
        'train_distribution': train_dist.to_dict(),
        'test_distribution': test_dist.to_dict(),
        'classes_with_few_samples': len(classes_with_few_samples)
    }
    
    joblib.dump(model, REJECTION_MODEL_PATH)

    MLModel.objects.create(
        model_type='REJECTION_REASON',
        name='Modelo de clasificacion de motivos de rechazo',
        algorithm='LGBM',
        is_active=True,
        training_date=datetime.now(),
        first_training_id=first_id,
        last_training_id=last_id
    )

    return model, training_info


def train_with_cross_validation(texts, types, reasons, first_id, last_id):
    """Entrena usando validación cruzada para datasets muy pequeños."""
    from sklearn.model_selection import cross_val_score, StratifiedKFold
    
    model = RejectionReasonClassifier()
    cv_folds = min(3, len(set(reasons)))
    
    cv_scores = None
    try:
        skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        # Para cross_val_score necesitamos una función que combine las features
        class TempModel:
            def __init__(self, model):
                self.model = model
            
            def fit(self, X, y):
                texts_cv = [x[0] for x in X]
                types_cv = [x[1] for x in X]
                self.model.fit(texts_cv, types_cv, y)
                return self
            
            def predict(self, X):
                texts_cv = [x[0] for x in X]
                types_cv = [x[1] for x in X]
                return self.model.predict(texts_cv, types_cv)
        
        X_combined = list(zip(texts, types))
        temp_model = TempModel(RejectionReasonClassifier())
        cv_scores = cross_val_score(temp_model, X_combined, reasons, cv=skf, scoring='balanced_accuracy')
    except:
        pass
    
    model.fit(texts, types, reasons)
    
    # Información del entrenamiento con validación cruzada
    reason_counts = pd.Series(reasons).value_counts()
    training_info = {
        'model_type': 'rejection_reasons_cv',
        'total_samples': len(texts),
        'train_samples': len(texts),
        'test_samples': 0,
        'cv_folds': cv_folds,
        'cv_mean_score': round(cv_scores.mean(), 4) if cv_scores is not None else None,
        'cv_std_score': round(cv_scores.std(), 4) if cv_scores is not None else None,
        'unique_reasons': len(reason_counts),
        'unique_types': len(set(types)),
        'distribution': reason_counts.to_dict()
    }
    
    joblib.dump(model, REJECTION_MODEL_PATH)
    return model, training_info


def get_approval_model():
    """Carga el modelo de aprobación."""
    if APPROVAL_MODEL_PATH.exists():
        return joblib.load(APPROVAL_MODEL_PATH), None
    else:
        return train_and_save_approval_model()


def get_rejection_model():
    """Carga el modelo de motivos de rechazo."""
    if REJECTION_MODEL_PATH.exists():
        return joblib.load(REJECTION_MODEL_PATH), None
    else:
        return train_and_save_rejection_reason_model()


def predict_evaluation(text, license_type):
    """
    Predice si un certificado será approved o rejected.
    Si es rejected, predice el motivo más probable.
    
    Args:
        text (str): Texto del certificado
        license_type (str): Tipo de licencia
    """
    normalized_text = normalize_text(text)
    
    approval_model, _ = get_approval_model()
    approval_proba = approval_model.predict_proba([normalized_text], [license_type])[0]
    
    prob_approved = approval_proba[1]
    prob_rejected = approval_proba[0]
    
    result = {
        'approved': prob_approved > 0.5,
        'probability_of_approval': f"{prob_approved * 100:.1f}%",
        'probability_of_rejection': f"{prob_rejected * 100:.1f}%",
        'license_type': license_type,
        'reason_of_rejection': None
    }
    
    if not result['approved']:
        rejection_model, _ = get_rejection_model()
        if rejection_model is not None:
            try:
                motivo_pred = rejection_model.predict([normalized_text], [license_type])[0]
                motivo_proba = rejection_model.predict_proba([normalized_text], [license_type])[0]
                
                motivos_with_proba = [
                    (motivo, prob) 
                    for motivo, prob in zip(rejection_model.classifier.classes_, motivo_proba)
                ]
                motivos_sorted = sorted(motivos_with_proba, key=lambda x: x[1], reverse=True)
                
                result['reason_of_rejection'] = motivo_pred
                result['top_reasons'] = [
                    f"{motivo}: {prob*100:.1f}%" 
                    for motivo, prob in motivos_sorted[:3]
                ]
            except Exception as e:
                result['reason_of_rejection'] = "No se pudo determinar el motivo"
                result['error'] = str(e)
    
    return result