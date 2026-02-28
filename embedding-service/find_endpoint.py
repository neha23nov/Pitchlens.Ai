import requests

ENDEE_URL = "http://localhost:8080/api/v1"
INDEX = "pitch_index"

vec = [0.01] * 384
body = {"vectors": [{"id": "test1", "values": vec, "metadata": {"text": "test"}}]}

attempts = [
    ("PUT",   f"{ENDEE_URL}/index/{INDEX}/add"),
    ("POST",  f"{ENDEE_URL}/index/{INDEX}/add"),
    ("POST",  f"{ENDEE_URL}/index/{INDEX}/upsert"),
    ("PUT",   f"{ENDEE_URL}/index/{INDEX}/upsert"),
    ("POST",  f"{ENDEE_URL}/index/{INDEX}/vectors"),
    ("PUT",   f"{ENDEE_URL}/index/{INDEX}/vectors"),
    ("POST",  f"{ENDEE_URL}/index/{INDEX}/vectors/add"),
    ("PUT",   f"{ENDEE_URL}/index/{INDEX}/vectors/add"),
    ("PATCH", f"{ENDEE_URL}/index/{INDEX}/add"),
    ("POST",  f"{ENDEE_URL}/vectors"),
    ("PUT",   f"{ENDEE_URL}/vectors"),
    ("POST",  f"{ENDEE_URL}/index/{INDEX}/insert"),
    ("PUT",   f"{ENDEE_URL}/index/{INDEX}/insert"),
]

for method, url in attempts:
    try:
        r = requests.request(method, url, json=body, timeout=5)
        status = "✅ SUCCESS" if r.status_code in [200,201] else "❌"
        print(f"{status} {method:6} .../{url.split('/')[-1]:20} → {r.status_code}: {r.text[:50]}")
    except Exception as e:
        print(f"❌ ERROR  {method:6} .../{url.split('/')[-1]:20} → {e}")