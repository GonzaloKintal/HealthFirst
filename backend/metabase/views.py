from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import jwt
import time

METABASE_SITE_URL = "http://localhost:3000";
METABASE_SECRET_KEY = "9e114d47a458e429fa391c82330c79024d7231434ba3327613b609bb7efb0450";

def metabase_iframe_url(request):
    payload = {
        "resource": {"dashboard": 4},
        "params": {},
        "exp": round(time.time()) + (60 * 10)  # 10 min exp
    }
    token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm="HS256")
    # IMPORTANTE:para decodificar por el error de token
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    iframeUrl = f"{METABASE_SITE_URL}/embed/dashboard/{token}#theme=light&bordered=true&titled=true"
    return JsonResponse({"iframeUrl": iframeUrl})
