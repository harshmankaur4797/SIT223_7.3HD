import urllib.request
import urllib.parse
import json
import base64
import sys

auth_str = "admin:1b15525f3e4345c098edae93d400d15a"
auth_b64 = base64.b64encode(auth_str.encode('ascii')).decode('ascii')

def get_crumb():
    req = urllib.request.Request("http://localhost:8080/crumbIssuer/api/json")
    req.add_header("Authorization", f"Basic {auth_b64}")
    try:
        with urllib.request.urlopen(req) as response:
            crumb_data = json.loads(response.read().decode())
            session_cookie = response.headers.get("Set-Cookie")
            return crumb_data, session_cookie
    except Exception as e:
        print(f"Failed to get crumb: {e}")
        return None, None

def run_script(groovy_code):
    crumb, cookie = get_crumb()
    if not crumb: return
    
    data = urllib.parse.urlencode({'script': groovy_code}).encode()
    req = urllib.request.Request("http://localhost:8080/scriptText", data=data, method="POST")
    req.add_header("Authorization", f"Basic {auth_b64}")
    req.add_header(crumb["crumbRequestField"], crumb["crumb"])
    if cookie:
        req.add_header("Cookie", cookie)
    
    try:
        with urllib.request.urlopen(req) as response:
            print(response.read().decode())
    except Exception as e:
        print(f"Failed to run script: {e}")

def trigger_build():
    crumb, cookie = get_crumb()
    if not crumb: return
    
    req = urllib.request.Request("http://localhost:8080/job/deakin-coffee-pipeline/build", method="POST")
    req.add_header("Authorization", f"Basic {auth_b64}")
    req.add_header(crumb["crumbRequestField"], crumb["crumb"])
    if cookie:
        req.add_header("Cookie", cookie)
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Build triggered successfully! Status Code: {response.status}")
    except Exception as e:
        print(f"Failed to trigger build: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "trigger":
        trigger_build()
    elif len(sys.argv) > 1 and sys.argv[1] == "script":
        script_code = sys.stdin.read()
        run_script(script_code)
    else:
        print("Usage: python trigger_build.py [trigger|script]")
