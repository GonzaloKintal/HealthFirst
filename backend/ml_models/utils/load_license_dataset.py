import csv
from pathlib import Path
from ml_models.models import LicenseDatasetEntry
from django.core.exceptions import ValidationError
from django.db import transaction

csv_file_path = Path("ml_models/utils/coherence_license_type_dataset.csv")

with open(csv_file_path, newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)

    with transaction.atomic():
        for i, row in enumerate(reader, start=1):
            if not row or not all(k in row for k in ('text', 'clase', 'estado')):
                print(f"⚠️ Fila {i} inválida o incompleta, ignorada: {row}")
                continue

            entry = LicenseDatasetEntry(
                text=row['text'] or "",
                type=row['clase'],
                status=row['estado'],
                reason=row.get('motivo') or None,
            )
            try:
                entry.full_clean()
                entry.save()
                print(f"✅ Fila {i} cargada: {entry}")
            except ValidationError as e:
                print(f"❌ Error en fila {i}: {row}")
                print(f"   ↳ {e}")
