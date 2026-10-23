"""
Unit tests for the explainable weighted skill matching algorithm.
"""
from app.services.skill_matcher import (
    normalize_skill,
    extract_skills_from_text,
    calculate_weighted_coverage,
)


def test_skill_normalization():
    assert normalize_skill("reactjs") == "react"
    assert normalize_skill("React.js") == "react"
    assert normalize_skill("Node.js") == "node"
    assert normalize_skill("Postgres") == "postgresql"
    assert normalize_skill("FAST API") == "fastapi"


def test_extract_skills_from_text():
    sample_text = """
    Experienced Software Developer with strong background in Python, FastAPI, and React.
    Hands-on work with Docker containers, PostgreSQL databases, and Git version control.
    """
    skills = extract_skills_from_text(sample_text)
    assert "Python" in skills
    assert "Fastapi" in skills or "FASTAPI" in skills or "FastAPI" in [s.upper() for s in skills]
    assert "React" in skills
    assert "Docker" in skills
    assert "Postgresql" in skills or "POSTGRESQL" in skills


def test_weighted_coverage_calculation_exact():
    candidate_skills = ["Python", "FastAPI", "React", "SQL"]
    essential = ["Python", "FastAPI", "React", "SQL"]  # 4/4 = 1.0 (75%)
    preferred = ["Docker", "Kubernetes"]               # 0/2 = 0.0 (0%)

    result = calculate_weighted_coverage(candidate_skills, essential, preferred)
    
    # 75% * 1.0 + 25% * 0.0 = 75.0%
    assert result["coverage_score"] == 75.0
    assert len(result["matched_skills"]) == 4
    assert "Docker" in result["missing_preferred"]
    assert result["formula_breakdown"]["essential_weight_percent"] == 75
    assert result["formula_breakdown"]["preferred_weight_percent"] == 25
