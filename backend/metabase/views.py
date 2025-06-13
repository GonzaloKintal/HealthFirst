from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import jwt
import time

#METABASE_SITE_URL = "http://ec2-54-205-20-165.compute-1.amazonaws.com:3000";
METABASE_SITE_URL = "https://metabase-vd.duckdns.org";
METABASE_SECRET_KEY = "b6c90930d0256debc70b6b653f2198ef342f952da1349fb7d7f6120f63c27554";

def metabase_iframe_url(request):
    
    # Obtener parámetros opcionales desde request GET
    request_date = request.GET.get("request_date")
    license_type = request.GET.get("license_type")
    user = request.GET.get("user")
    evaluator = request.GET.get("evaluator")

    params = {}
    if request_date:
        params["Request Date"] = request_date
    if license_type:
        params["License Type"] = license_type
    if user:
        params["User"] = user
    if evaluator:
        params["Evaluator"] = evaluator

    payload = {
        "resource": {"dashboard": 1},
        "params": params,
        "exp": round(time.time()) + (60 * 10)  # 10 min exp
    }
    token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm="HS256")
    # IMPORTANTE:para decodificar por el error de token
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    iframeUrl = f"{METABASE_SITE_URL}/embed/dashboard/{token}#theme=light&bordered=true&titled=true"
    return JsonResponse({"iframeUrl": iframeUrl})
