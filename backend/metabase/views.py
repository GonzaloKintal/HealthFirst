from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import jwt
import time

METABASE_SITE_URL = "http://localhost:3000";
METABASE_SECRET_KEY = "c8848a15cb452764571eff50ae0ad7f15b05d164cfbcbe92c66f744e1c8289fa";

def metabase_iframe_url(request):
    payload = {
        "resource": {"dashboard": 33},
        "params": {},
        "exp": round(time.time()) + (60 * 10)  # 10 min exp
    }
    token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm="HS256")
    # IMPORTANTE:para decodificar por el error de token
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    iframeUrl = f"{METABASE_SITE_URL}/embed/dashboard/{token}#theme=light&bordered=true&titled=true"
    return JsonResponse({"iframeUrl": iframeUrl})
