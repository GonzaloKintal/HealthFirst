import base64
import re
import os
import pytesseract
import unicodedata

#from PIL import Image #podria no necesitarse
from pdfminer.high_level import extract_text
from datetime import datetime #podria no necesitarse
from io import BytesIO
from PyPDF2 import PdfReader
from pdf2image import convert_from_path

def is_pdf_image(base64_pdf):
   """ Determina si el PDF es una imagen"""
   pdf_bytes = base64.b64decode(base64_pdf)
   text = extract_text(BytesIO(pdf_bytes))
   return not bool(text.strip())  # True si NO hay texto



def base64_to_text(base64_pdf, is_image=False):
    """Decodifica un PDF en base64 y extrae texto. Usa OCR si is_image=True."""
    try:
        pdf_bytes = base64.b64decode(base64_pdf)
        with open("temp.pdf", "wb") as temp_file:
            temp_file.write(pdf_bytes)

        text = ""

        if not is_image:
            with open("temp.pdf", "rb") as file:
                reader = PdfReader(file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text
        else:
            os.environ['TESSDATA_PREFIX'] = '/usr/share/tesseract-ocr/5/tessdata'
            images = convert_from_path("temp.pdf")
            for img in images:
                text += pytesseract.image_to_string(img, lang='spa')  # si tenés soporte

        return text.strip()

    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        if os.path.exists("temp.pdf"):
            os.remove("temp.pdf")

#Solo para testing
def pdf_to_base64(pdf_path):
    """Convierte un pdf a base64 y lo muestra"""
    try:
        # Leer pdf en modo binario
        with open(pdf_path, "rb") as pdf_file:
            pdf_bytes = pdf_file.read()
        
        # Codifica a base64
        base64_bytes = base64.b64encode(pdf_bytes)
        base64_text = base64_bytes.decode('utf-8')
        return base64_text

    except Exception as e:
        print(f" Error inesperado: {str(e)}")

#-------------------------------------------------
def date_in_range(certificate_text,start_date, end_date):
    """Verifica si una fecha encontrada en texto_certificado está entre licencia.start_date y licencia.end_date. """
    # Busca fechas en formato dd-mm-aaaa o dd/mm/aaaa

    match = re.search(r'(\d{2})[-/](\d{2})[-/](\d{4})',certificate_text)
    if not match:
        return False
    
    day,month, year = map(int, match.groups())
    certificate_date = datetime(year,month,day).date()
    
    return start_date <= certificate_date <= end_date

import unicodedata
import re

def search_in_pdf_text(normalized_text, search_terms):
    for term in search_terms:
        term_str = str(term).lower()
        
        if term_str.isdigit():
            #busca DNI directamente
            if not re.search(r'\b' + re.escape(term_str) + r'\b', normalized_text):
                return False
        else:
            normalized_term = normalize_text(term_str)
            if normalized_term not in normalized_text:
                return False
    return True

def normalize_text(text):
    """Normaliza texto: minúsculas, sin tildes, sin puntuación, conserva ñ/Ñ"""
    if not isinstance(text, str):
        return ""  # Maneja valores no-string
    
    clean_text = []
    for char in text:
        if char in ['ñ', 'Ñ']:
            clean_text.append(char)
        else:
            normalized_char = unicodedata.normalize('NFD', char)
            clean_text.append(''.join(c for c in normalized_char if unicodedata.category(c) != 'Mn'))
    text = ''.join(clean_text).lower()
    text = re.sub(r'[^\wñÑ\s]', '', text)  # Remueve puntuación pero conserva espacios
    text = re.sub(r'\s+', ' ', text).strip()
    return text