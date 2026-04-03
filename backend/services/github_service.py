import requests
import os

GITHUB_API = "https://api.github.com"

def _headers(token: str) -> dict:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h

def verify_pat(pat: str) -> dict:
    """Verify a PAT is valid and return the GitHub username."""
    r = requests.get(f"{GITHUB_API}/user", headers=_headers(pat))
    if r.status_code == 200:
        d = r.json()
        return {"ok": True, "login": d.get("login"), "avatar": d.get("avatar_url"), "name": d.get("name")}
    return {"ok": False, "error": "Invalid token or insufficient permissions"}

def add_collaborator(repo_full_name: str, github_username: str, owner_pat: str, permission="push") -> dict:
    """Add github_username as collaborator using the repo owner's PAT."""
    if not owner_pat:
        return {"ok": False, "error": "Project owner has not set a GitHub PAT in their profile."}
    if not repo_full_name:
        return {"ok": False, "error": "No GitHub repo linked to this project."}
    if not github_username:
        return {"ok": False, "error": "Collaborator has no GitHub username on their profile."}
    url = f"{GITHUB_API}/repos/{repo_full_name}/collaborators/{github_username}"
    r   = requests.put(url, json={"permission": permission}, headers=_headers(owner_pat))
    if r.status_code in (201, 204):
        return {"ok": True}
    try:
        msg = r.json().get("message", "GitHub API error")
    except Exception:
        msg = f"HTTP {r.status_code}"
    return {"ok": False, "error": msg}

def get_contributors(repo_full_name: str, pat: str = "") -> list:
    r = requests.get(f"{GITHUB_API}/repos/{repo_full_name}/contributors", headers=_headers(pat))
    return r.json() if r.status_code == 200 else []

def get_commit_activity(repo_full_name: str, pat: str = "") -> list:
    r = requests.get(f"{GITHUB_API}/repos/{repo_full_name}/stats/commit_activity", headers=_headers(pat))
    return r.json() if r.status_code == 200 else []

def get_repo_info(repo_full_name: str, pat: str = "") -> dict:
    r = requests.get(f"{GITHUB_API}/repos/{repo_full_name}", headers=_headers(pat))
    if r.status_code == 200:
        d = r.json()
        return {
            "name": d.get("name"), "full_name": d.get("full_name"),
            "description": d.get("description"), "stars": d.get("stargazers_count", 0),
            "forks": d.get("forks_count", 0), "open_issues": d.get("open_issues_count", 0),
            "language": d.get("language"), "default_branch": d.get("default_branch"),
            "updated_at": d.get("updated_at"),
        }
    return {}

def exchange_code_for_token(code):
    url = f"{GITHUB_API}/login/oauth/access_token"
    
    payload = {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "code": code
    }
    
    headers = {
        "Accept": "application/json"
    }
    
    response = requests.post(url,data=payload,headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Failed to get token: {response.text}")
    
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        raise Exception(f"No access token found: {data}")
    
    return access_token

def get_github_user(token):
    url = f"{GITHUB_API}/user"
    headers = _headers(token)
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to get user: {response.text}")
    return response.json()