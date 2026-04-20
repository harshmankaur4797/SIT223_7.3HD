import urllib.request
import urllib.parse
import json
import base64

auth_str = "admin:1b15525f3e4345c098edae93d400d15a"
auth_b64 = base64.b64encode(auth_str.encode('ascii')).decode('ascii')

req = urllib.request.Request("http://localhost:8080/crumbIssuer/api/json")
req.add_header("Authorization", f"Basic {auth_b64}")

with urllib.request.urlopen(req) as response:
    crumb_data = json.loads(response.read().decode())
    session_cookie = response.headers.get("Set-Cookie")

post_req = urllib.request.Request("http://localhost:8080/job/deakin-coffee-pipeline/build", method="POST")
post_req.add_header("Authorization", f"Basic {auth_b64}")
post_req.add_header(crumb_data["crumbRequestField"], crumb_data["crumb"])
if session_cookie:
    post_req.add_header("Cookie", session_cookie)

with urllib.request.urlopen(post_req) as post_response:
    print(f"Build triggered successfully! Status Code: {post_response.status}")
