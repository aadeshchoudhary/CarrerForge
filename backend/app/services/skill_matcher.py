"""
Skill Matching, Normalization, and Explainable Weighted Gap Analysis Engine.

This module implements:
1. Normalization & Synonym Mapping (e.g. 'reactjs' -> 'react', 'postgres' -> 'postgresql').
2. Documented Weighted Skill Coverage Formula:
   - Essential Skills weight: 75%
   - Preferred Skills weight: 25%
3. Transparent Mathematical Breakdown for Explainable AI (XAI).
"""
import re
from typing import List, Dict, Any, Tuple, Set


# Standard normalization map: maps variants/aliases to canonical standard names
SYNONYM_MAP = {
    "react.js": "react",
    "reactjs": "react",
    "node.js": "node",
    "nodejs": "node",
    "py": "python",
    "python3": "python",
    "postgres": "postgresql",
    "postgres sql": "postgresql",
    "js": "javascript",
    "ts": "typescript",
    "mongo": "mongodb",
    "fast api": "fastapi",
    "rest api": "restful apis",
    "rest apis": "restful apis",
    "rest": "restful apis",
    "docker containers": "docker",
    "aws cloud": "aws",
    "amazon web services": "aws",
    "k8s": "kubernetes",
    "ml": "machine learning",
    "dl": "deep learning",
    "ai": "artificial intelligence",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "sql server": "sql",
}

# Master list of recognized tech skills
KNOWN_SKILLS = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c", "c#", "go", "ruby", "php", "sql", "html", "css",
    # Frontend
    "react", "vue", "angular", "next.js", "tailwind css", "bootstrap", "redux", "html5", "css3",
    # Backend & Frameworks
    "fastapi", "django", "flask", "node", "express", "spring boot", "restful apis", "graphql",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle", "cassandra",
    # DevOps & Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "linux", "terraform",
    # Data & AI
    "machine learning", "deep learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
    "data visualization", "tableau", "power bi", "nlp", "computer vision",
    # Soft skills & Methodologies
    "agile", "scrum", "problem solving", "teamwork", "communication", "system design"
]


def normalize_skill(skill_name: str) -> str:
    """Normalize skill name: lowercase, strip punctuation, apply synonym dictionary."""
    clean = skill_name.strip().lower()
    clean = re.sub(r'[\(\)]', '', clean)
    return SYNONYM_MAP.get(clean, clean)


def extract_skills_from_text(text: str) -> List[str]:
    """
    Deterministically scan text for recognized skills using word boundary matching.
    Guarantees consistent extraction without requiring expensive cloud tokens.
    """
    found_skills: Set[str] = set()
    lower_text = " " + text.lower() + " "
    # Replace common separators with spaces
    sanitized_text = re.sub(r'[,;/\|•\n]', ' ', lower_text)

    for skill in KNOWN_SKILLS:
        # Check canonical skill
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, sanitized_text):
            found_skills.add(skill.title() if len(skill) > 3 else skill.upper())

    # Check synonyms
    for alias, canonical in SYNONYM_MAP.items():
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(alias) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, sanitized_text):
            found_skills.add(canonical.title() if len(canonical) > 3 else canonical.upper())

    return sorted(list(found_skills))


def calculate_weighted_coverage(
    candidate_skills: List[str],
    essential_requirements: List[str],
    preferred_requirements: List[str]
) -> Dict[str, Any]:
    """
    Calculate the documented weighted skill-coverage score.

    Mathematical Formulation:
      S_essential = Matched_Essential / Total_Essential
      S_preferred = Matched_Preferred / Total_Preferred (if Total_Preferred > 0 else 1.0)
      
      Score = (0.75 * S_essential + 0.25 * S_preferred) * 100
    """
    # Normalize candidate set
    normalized_candidate = {normalize_skill(s) for s in candidate_skills}

    # Match essential
    matched_essential = []
    missing_essential = []
    for req in essential_requirements:
        norm_req = normalize_skill(req)
        if norm_req in normalized_candidate or any(norm_req in cand for cand in normalized_candidate):
            matched_essential.append(req)
        else:
            missing_essential.append(req)

    # Match preferred
    matched_preferred = []
    missing_preferred = []
    for req in preferred_requirements:
        norm_req = normalize_skill(req)
        if norm_req in normalized_candidate or any(norm_req in cand for cand in normalized_candidate):
            matched_preferred.append(req)
        else:
            missing_preferred.append(req)

    total_ess = len(essential_requirements)
    total_pref = len(preferred_requirements)

    ess_ratio = (len(matched_essential) / total_ess) if total_ess > 0 else 1.0
    pref_ratio = (len(matched_preferred) / total_pref) if total_pref > 0 else 1.0

    # Weights: 75% essential, 25% preferred
    if total_pref > 0:
        raw_score = (0.75 * ess_ratio + 0.25 * pref_ratio) * 100
        weight_ess = 75
        weight_pref = 25
    else:
        raw_score = ess_ratio * 100
        weight_ess = 100
        weight_pref = 0

    coverage_score = round(raw_score, 1)

    formula_breakdown = {
        "formula": "Score = (Weight_Essential * Ratio_Essential) + (Weight_Preferred * Ratio_Preferred)",
        "essential_weight_percent": weight_ess,
        "preferred_weight_percent": weight_pref,
        "total_essential": total_ess,
        "matched_essential_count": len(matched_essential),
        "essential_ratio": round(ess_ratio, 2),
        "total_preferred": total_pref,
        "matched_preferred_count": len(matched_preferred),
        "preferred_ratio": round(pref_ratio, 2),
        "calculated_score": coverage_score,
        "interpretation": (
            f"You match {len(matched_essential)} of {total_ess} essential skills "
            f"and {len(matched_preferred)} of {total_pref} preferred skills."
        )
    }

    # Actionable improvement advice
    advice = []
    if missing_essential:
        top_missing = ", ".join(missing_essential[:3])
        advice.append(f"Focus on core prerequisites first: prioritize learning {top_missing}.")
    if missing_preferred:
        top_pref = ", ".join(missing_preferred[:2])
        advice.append(f"To stand out among applicants, add practical evidence for {top_pref}.")
    if coverage_score >= 80:
        advice.append("Strong alignment! Ensure your resume highlights quantifiable project achievements.")
    elif coverage_score >= 50:
        advice.append("Moderate alignment. Completing a targeted portfolio project will bridge the remaining gap.")
    else:
        advice.append("Foundational gap detected. Follow a guided career roadmap before applying.")

    return {
        "coverage_score": coverage_score,
        "matched_skills": matched_essential + matched_preferred,
        "missing_essential": missing_essential,
        "missing_preferred": missing_preferred,
        "needs_evidence": [s for s in matched_essential if s.lower() in ["git", "docker", "fastapi"]][:2],
        "formula_breakdown": formula_breakdown,
        "improvement_advice": " ".join(advice)
    }
