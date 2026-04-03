import re

GITHUB_PATTERN = re.compile(r"^https?://(www\.)?github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$")
VALID_METHODOLOGIES = ["Agile", "Scrum", "Kanban", "Waterfall", "XP", "Lean", "Other"]

def is_valid_github_url(url: str) -> bool:
    return bool(GITHUB_PATTERN.match(url.strip()))

def extract_repo_name(url: str) -> str:
    """Extract owner/repo from GitHub URL."""
    m = GITHUB_PATTERN.match(url.strip())
    if m:
        return f"{m.group(2)}/{m.group(3)}"
    return ""

def is_valid_methodology(m: str) -> bool:
    return m in VALID_METHODOLOGIES

def task_columns_for_methodology(methodology: str) -> list:
    configs = {
        "Scrum": ["Backlog", "Sprint", "In Progress", "Review", "Done"],
        "Kanban": ["Backlog", "To Do", "In Progress", "Done"],
        "Agile":  ["Backlog", "To Do", "In Progress", "Review", "Done"],
        "Waterfall": ["Requirements", "Design", "Implementation", "Testing", "Deployment"],
        "XP":     ["Stories", "In Progress", "Testing", "Done"],
        "Lean":   ["Ideas", "Doing", "Done"],
        "Other":  ["To Do", "In Progress", "Done"],
    }
    return configs.get(methodology, configs["Agile"])
