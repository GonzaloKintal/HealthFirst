import base64
import re
import os
import pytesseract

from pdfminer.high_level import extract_text
from datetime import datetime
from io import BytesIO
from PyPDF2 import PdfReader
from pdf2image import convert_from_path

def pdf_to_base64_and_save(pdf_path, output_txt_path):
    """Convierte un PDF a Base64 y lo guarda en un .txt. Me sirve para el dataset"""
    #Lo uso para crear el dataset
    try:
        # Leer el PDF en modo binario
        with open(pdf_path, "rb") as pdf_file:
            pdf_bytes = pdf_file.read()
        
        # Codificar a Base64
        base64_bytes = base64.b64encode(pdf_bytes)
        base64_string = base64_bytes.decode('utf-8')
        
        # Guardar en un archivo .txt
        with open(output_txt_path, "w") as txt_file:
            txt_file.write(base64_string)
        
        print(f"¡Conversión exitosa! Base64 guardado en: {output_txt_path}")

    except FileNotFoundError:
        print(f" Error: No se encontró el archivo PDF en {pdf_path}")
    except Exception as e:
        print(f" Error inesperado: {str(e)}")

def base64_a_texto(base64_pdf, es_imagen=False):
    """Decodifica Base64 y extrae texto. Le avisas si es una imagen pdf la que vas a pasar"""
    try:
        pdf_bytes = base64.b64decode(base64_pdf)
        with open("temp.pdf", "wb") as temp_file:
            temp_file.write(pdf_bytes)
        
        if not es_imagen:
            with open("temp.pdf", "rb") as archivo:
                texto = "".join([pagina.extract_text() for pagina in PdfReader(archivo).pages])
        else:
            texto = ""
            for img in convert_from_path("temp.pdf"):
                texto += pytesseract.image_to_string(img)
        
        return texto
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        if os.path.exists("temp.pdf"):
            os.remove("temp.pdf")


def search_in_pdf_base64(texto, search_term):
    """Avisa si se encontraron todas las palabras claves de la lista en el texto"""
    texto_lower = texto.lower()
    return all(term.lower() in texto_lower for term in search_term)

def date_in_range(certificate_text,license):
    """Verifica si una fecha encontrada en texto_certificado está entre licencia.start_date y licencia.end_date. """
    # Busca fechas en formato dd-mm-aaaa o dd/mm/aaaa

    match = re.search(r'(\d{2})[-/](\d{2})[-/](\d{4})',certificate_text)
    if not match:
        return False
    
    day,month, year = map(int, match.groups())
    certificate_date = datetime(year,month,day).date()
    
    return license.start_date <= certificate_date <= license.end_date

