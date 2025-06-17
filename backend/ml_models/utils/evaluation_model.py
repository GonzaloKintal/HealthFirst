import pandas as pd
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import lightgbm as lgb
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
    queryset = LicenseDatasetEntry.objects.all().values('id', 'text', 'status')
    df = pd.DataFrame.from_records(queryset)

    df['approved'] = (df['status'] == 'approved').astype(int)

    first_id = df['id'].min() if not df.empty else None
    last_id = df['id'].max() if not df.empty else None

    return {
        'texts': df['text'].tolist(),
        'approved': df['approved'].tolist(),
        'first_id': first_id,
        'last_id': last_id
    }


def load_rejection_reasons_data():
    """Carga datos desde la base de datos para el modelo de motivos de rechazo."""
    queryset = LicenseDatasetEntry.objects.filter(
        status='rejected',
        reason__isnull=False
    ).values('id', 'text', 'reason')
    df = pd.DataFrame.from_records(queryset)

    first_id = df['id'].min() if not df.empty else None
    last_id = df['id'].max() if not df.empty else None

    return {
        'texts': df['text'].tolist(),
        'reasons': df['reason'].tolist(),
        'first_id': first_id,
        'last_id': last_id
    }





class ApprovalClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=8000,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.95,
            stop_words=SPANISH_STOPWORDS,
            sublinear_tf=True
        )
        
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
        
    def fit(self, X_train, y_train, X_val=None, y_val=None):
        X_train_vec = self.vectorizer.fit_transform(X_train)
        
        if X_val is not None and y_val is not None:
            X_val_vec = self.vectorizer.transform(X_val)
            self.classifier.fit(
                X_train_vec, y_train,
                eval_set=[(X_val_vec, y_val)],
                callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
            )
        else:
            self.classifier.fit(X_train_vec, y_train)
    
    def predict(self, X):
        X_vec = self.vectorizer.transform(X)
        return self.classifier.predict(X_vec)
    
    def predict_proba(self, X):
        X_vec = self.vectorizer.transform(X)
        return self.classifier.predict_proba(X_vec)


class RejectionReasonClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9,
            stop_words=SPANISH_STOPWORDS,
            sublinear_tf=True
        )
        
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
    
    def fit(self, X_train, y_train):
        X_train_vec = self.vectorizer.fit_transform(X_train)
        self.classifier.fit(X_train_vec, y_train)
    
    def predict(self, X):
        X_vec = self.vectorizer.transform(X)
        return self.classifier.predict(X_vec)
    
    def predict_proba(self, X):
        X_vec = self.vectorizer.transform(X)
        return self.classifier.predict_proba(X_vec)


def train_approval_model():
    data = load_approval_data()
    texts = data['texts']
    labels = data['approved']   # aquí labels es approved
    first_id = data['first_id']
    last_id = data['last_id']
    
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, 
        test_size=0.2, 
        random_state=42, 
        stratify=labels
    )
    
    if len(set(y_train)) < 2:
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, 
            test_size=0.3, 
            random_state=123, 
            stratify=labels
        )
    
    if len(set(y_test)) < 2:
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, 
            test_size=min(0.4, len(texts) // 2), 
            random_state=456, 
            stratify=labels
        )
    
    X_train_split, X_val, y_train_split, y_val = train_test_split(
        X_train, y_train,
        test_size=0.2,
        random_state=42,
        stratify=y_train
    )
    
    model = ApprovalClassifier()
    model.fit(X_train_split, y_train_split, X_val, y_val)
    
    # Evaluar el modelo
    y_pred = model.predict(X_test)
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
        }
    }
    
    joblib.dump(model, APPROVAL_MODEL_PATH)
    MLModel.objects.create(
        model_type= 'LICENSE_APPROVAL',
        name= 'Modelo de aprobación de licencias',
        algorithm= 'LGBM',
        is_active= True,
        training_date = datetime.now(),
        first_training_id= first_id,
        last_training_id= last_id

    )
    return model, training_info


def train_rejection_reason_model():
    data = load_rejection_reasons_data()
    texts = data['texts']
    reasons = data['reasons']
    first_id = data['first_id']
    last_id = data['last_id']
    
    if len(texts) == 0:
        return None, None

    reason_counts = pd.Series(reasons).value_counts()
    min_samples_per_class = 2
    classes_with_few_samples = reason_counts[reason_counts < min_samples_per_class]
    
    if len(classes_with_few_samples) > 0 and len(texts) < 20:
        return train_with_cross_validation(texts, reasons)

    try:
        if len(texts) < 30:
            test_size = max(0.2, 2/len(texts)) 
        else:
            test_size = 0.25
            
        X_train, X_test, y_train, y_test = train_test_split(
            texts, reasons,
            test_size=test_size,
            random_state=42,
            stratify=reasons
        )
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(
            texts, reasons,
            test_size=test_size,
            random_state=42
        )
    
    model = RejectionReasonClassifier()
    model.fit(X_train, y_train)
    
    # Evaluar el modelo
    y_pred = model.predict(X_test)
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
        'train_distribution': train_dist.to_dict(),
        'test_distribution': test_dist.to_dict(),
        'classes_with_few_samples': len(classes_with_few_samples)
    }
    
    joblib.dump(model, REJECTION_MODEL_PATH)

    MLModel.objects.create(
    model_type= 'REJECTION_REASON',
    name= 'Modelo de clasificacion de motivos de rechazo',
    algorithm= 'LGBM',
    is_active= True,
    training_date = datetime.now(),
    first_training_id= first_id,
    last_training_id= last_id)

    return model, training_info


def train_with_cross_validation(texts, reasons):
    """Entrena usando validación cruzada para datasets muy pequeños."""
    from sklearn.model_selection import cross_val_score, StratifiedKFold
    
    model = RejectionReasonClassifier()
    cv_folds = min(3, len(set(reasons)))
    
    cv_scores = None
    try:
        skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        cv_scores = cross_val_score(model, texts, reasons, cv=skf, scoring='balanced_accuracy')
    except:
        pass
    
    model.fit(texts, reasons)
    
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
        'distribution': reason_counts.to_dict()
    }
    
    joblib.dump(model, REJECTION_MODEL_PATH)
    return model, training_info


def get_approval_model():
    """Carga el modelo de aprobación."""
    if APPROVAL_MODEL_PATH.exists():
        return joblib.load(APPROVAL_MODEL_PATH), None
    else:
        return train_approval_model()


def get_rejection_model():
    """Carga el modelo de motivos de rechazo."""
    if REJECTION_MODEL_PATH.exists():
        return joblib.load(REJECTION_MODEL_PATH), None
    else:
        return train_rejection_reason_model()


def predict_evaluation(text):
    """
    Predice si un certificado será approved o rejected.
    Si es rejected, predice el motivo más probable.
    """
    normalized_text = normalize_text(text)
    
    approval_model, _ = get_approval_model()
    approval_proba = approval_model.predict_proba([normalized_text])[0]
    
    prob_approved = approval_proba[1]
    prob_rejected = approval_proba[0]
    
    result = {
        'approved': prob_approved > 0.5,
        'probability_of_approval': f"{prob_approved * 100:.1f}%",
        'probability_of_rejection': f"{prob_rejected * 100:.1f}%",
        'reason_of_rejection': None
    }
    
    if not result['approved']:
        rejection_model, _ = get_rejection_model()
        if rejection_model is not None:
            try:
                motivo_pred = rejection_model.predict([normalized_text])[0]
                motivo_proba = rejection_model.predict_proba([normalized_text])[0]
                
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