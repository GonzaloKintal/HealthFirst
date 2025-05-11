import predictions as pr
import file_utils as f_u
import os


#1.PRUEBA: Reconoce que un pdf imagen o pdf texto : FUNCIONA
os.chdir("HealthFirst/backend/backend/utils")

base64_1=f_u.pdf_to_base64("certificado_medico.pdf")
base64_2=f_u.pdf_to_base64("pdf_imagen_lq.pdf")
base64_3=f_u.pdf_to_base64("pdf_imagen.pdf")
base64_4=f_u.pdf_to_base64("pdf_texto.pdf")
"""
print(f"Este PDF ES imagen. Se analizó y se concluyó: {f_u.is_pdf_image(base64_1)}\n")
print(f"Este PDF ES imagen. Se analizó y se concluyó: {f_u.is_pdf_image(base64_2)}\n")
print(f"Este PDF ES imagen. Se analizó y se concluyó: {f_u.is_pdf_image(base64_3)}\n")
print(f"Este PDF NO ES imagen. Se analizó y se concluyó: {f_u.is_pdf_image(base64_4)}\n")
"""
 
#2. PRUEBA: de base64 a texto (no normalizado) :FUNCIONA (medico es complicado)
extraction_text1=f_u.base64_to_text(base64_1,is_image=True)
extraction_text2=f_u.base64_to_text(base64_2,is_image=True)
extraction_text3=f_u.base64_to_text(base64_3,is_image=True)
extraction_text4=f_u.base64_to_text(base64_4,is_image=False)

print(f"{extraction_text1}\n")
print("-----------------------------------------------------")
"""print(f"{extraction_text2}\n")
print("-----------------------------------------------------")
print(f"{extraction_text3}\n")
print("-----------------------------------------------------")
print(f"{extraction_text4}\n")"""

#3. PRUEBA: normalizar texto del certificado : FUNCIONA 
text1=f_u.normalize_text(extraction_text1)
#text2=f_u.normalize_text(extraction_text2)
#text3=f_u.normalize_text(extraction_text3)
#text4=f_u.normalize_text(extraction_text4)
"""
print(f"{text1}\n")
print("-----------------------------------------------------")
print(f"{text2}\n")
print("-----------------------------------------------------")
print(f"{text3}\n")
print("-----------------------------------------------------")
print(f"{text4}\n")
"""