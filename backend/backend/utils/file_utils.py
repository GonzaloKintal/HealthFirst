from datetime import datetime

import base64
import re

def base64_to_string(base64_text):
    """Decodifica el texto Base64 a bytes y luego texto"""
    decoded_bytes = base64.b64decode(base64_text)
    decoded_string = decoded_bytes.decode('utf-8')  # Cambia 'utf-8' por otra codificación si es necesario
    return  decoded_string

def search(keys,text):
    """Avisa si todas las palabras claves fueron encontradas en el texto"""
    text_lower = text.lower()
    return all(key.lower() in text_lower for key in keys)


def date_in_range(certificate_text,license):
    """Verifica si una fecha encontrada en texto_certificado está entre licencia.start_date y licencia.end_date. """
    # Busca fechas en formato dd-mm-aaaa o dd/mm/aaaa

    match = re.search(r'(\d{2})[-/](\d{2})[-/](\d{4})',certificate_text)
    if not match:
        return False
    
    day,month, year = map(int, match.groups())
    certificate_date = datetime(year,month,day).date()
    
    return license.start_date <= certificate_date <= license.end_date

"""#pruebasTontas~
texto_base64 = "SGVsbG8gV29ybGQh"  # "Hello World!" 
texto_decodificado = base64_to_string(texto_base64)
keys=["hello","World"]
print(texto_decodificado) 
print (search(keys,texto_decodificado))"""