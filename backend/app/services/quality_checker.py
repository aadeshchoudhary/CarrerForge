"""
Resume Optimization and Quality Checker Service (Module 1.4).
Audits resume content for action verbs, quantifiable metrics, weak phrasing, and section completeness.
Provides concrete suggested rewrites without claiming guaranteed ATS success.
"""
import re
from typing import List, Dict, Any
from app.schemas.builder import ResumeBuildRequest, QualityCheckResponse, QualityIssue

# Strong action verbs favored in engineering resumes
STRONG_ACTION_VERBS = {
    "architected", "engineered", "implemented", "optimized", "developed", "designed",
    "deployed", "automated", "refactored", "integrated", "constructed", "built",
    "streamlined", "orchestrated", "spearheaded", "accelerated", "scaled", "formulated"
}

# Weak, passive, or vague phrases to flag
WEAK_PHRASES = [
    "worked on", "helped with", "assisted in", "responsible for", "handled",
    "did some", "tried to", "participated in", "took care of"
]

# Patterns detecting metrics (percentages, numbers, multipliers, times)
METRICS_PATTERN = r'(\d+%\s*|\b\d+x\b|\b\d+\s*(?:ms|seconds|users|requests|percent|gb|mb)\b|\b\d{2,}\b)'


def audit_resume_quality(data: ResumeBuildRequest) -> QualityCheckResponse:
    """Performs deep heuristic audit of resume content and structure."""
    issues: List[QualityIssue] = []
    strengths: List[str] = []

    # 1. Check Contact Links Completeness
    if not data.personal_info.github and not data.personal_info.linkedin:
        issues.append(QualityIssue(
            id="q-contact-1",
            category="missing_section",
            severity="high",
            title="Missing Online Portfolio / Code Evidence Links",
            description="Recruiters and technical evaluators expect links to GitHub repositories or LinkedIn to verify proof-of-work.",
            target_text="Personal Info",
            suggested_rewrite="Add your GitHub profile (e.g. github.com/username) and LinkedIn URL."
        ))
    else:
        strengths.append("Contains professional online portfolio / repository links.")

    # 2. Check Action Verbs & Weak Phrasing across Work Experience & Projects
    all_bullets = []
    for exp in data.work_experience:
        all_bullets.extend(exp.bullet_points)
    for proj in data.projects:
        if proj.description:
            all_bullets.append(proj.description)

    strong_verb_count = 0
    metric_count = 0
    weak_phrase_found = False

    for bullet in all_bullets:
        lower = bullet.lower()
        words = re.findall(r'\b[a-zA-Z]+\b', lower)
        
        # Check first word for strong action verb
        if words and words[0] in STRONG_ACTION_VERBS:
            strong_verb_count += 1
        elif any(verb in lower for verb in STRONG_ACTION_VERBS):
            strong_verb_count += 1

        # Check for weak phrases
        for wp in WEAK_PHRASES:
            if wp in lower:
                weak_phrase_found = True
                clean_target = bullet[:70] + "..." if len(bullet) > 70 else bullet
                issues.append(QualityIssue(
                    id=f"q-weak-{len(issues)}",
                    category="passive_voice",
                    severity="medium",
                    title=f"Passive Phrasing: '{wp.title()}'",
                    description=f"Phrases like '{wp}' diminish perceived ownership. Replace with an impactful technical action verb.",
                    target_text=clean_target,
                    suggested_rewrite=re.sub(re.escape(wp), "Engineered and delivered", bullet, flags=re.IGNORECASE)
                ))

        # Check for quantifiable metrics
        if re.search(METRICS_PATTERN, lower):
            metric_count += 1

    # 3. Score Action Verbs
    total_bullets = max(1, len(all_bullets))
    action_verb_ratio = min(1.0, strong_verb_count / total_bullets)
    action_verbs_score = int(action_verb_ratio * 100)

    if action_verbs_score >= 70:
        strengths.append("High density of decisive technical action verbs (e.g. 'Engineered', 'Optimized').")
    else:
        issues.append(QualityIssue(
            id="q-verbs-low",
            category="weak_bullet",
            severity="medium",
            title="Low Action-Verb Density",
            description="Start each bullet point with a strong past-tense action verb describing your specific technical contribution.",
            suggested_rewrite="Example: 'Engineered a RESTful microservice using FastAPI and PostgreSQL, reducing query latency by 35%.'"
        ))

    # 4. Score Quantifiable Metrics
    metrics_ratio = min(1.0, metric_count / total_bullets)
    quantifiable_metrics_score = int(metrics_ratio * 100)

    if quantifiable_metrics_score >= 40:
        strengths.append("Includes measurable impact numbers and performance percentages.")
    else:
        issues.append(QualityIssue(
            id="q-metrics-low",
            category="missing_metrics",
            severity="high",
            title="Insufficient Quantifiable Metrics",
            description="Technical hiring managers look for numbers showing scope, speed, scale, or accuracy improvements.",
            suggested_rewrite="Quantify your project outcomes: e.g., 'Serving 500+ daily requests', 'Reduced load time by 40%', 'Achieved 92% classification accuracy'."
        ))

    # 5. Check Project Descriptions Quality
    if len(data.projects) < 2:
        issues.append(QualityIssue(
            id="q-proj-count",
            category="missing_section",
            severity="high",
            title="Low Project Count",
            description="Students and freshers should showcase at least 2 distinct practical projects to demonstrate applied skills.",
            suggested_rewrite="Add a full-stack or domain-specific capstone project with a live demonstration or repository link."
        ))

    # 6. Overall Completeness & Quality Score
    completeness_score = 100
    if not data.education:
        completeness_score -= 20
    if not data.skills or len(data.skills) < 5:
        completeness_score -= 20
    if len(data.projects) == 0:
        completeness_score -= 30

    # Weighted Overall Score
    quality_score = int(
        (0.35 * completeness_score) +
        (0.35 * action_verbs_score) +
        (0.30 * quantifiable_metrics_score)
    )
    quality_score = max(35, min(98, quality_score))

    grade = "A (Excellent)" if quality_score >= 85 else "B (Solid Profile)" if quality_score >= 70 else "C (Needs Revision)"

    return QualityCheckResponse(
        quality_score=quality_score,
        grade=grade,
        action_verbs_score=action_verbs_score,
        quantifiable_metrics_score=quantifiable_metrics_score,
        completeness_score=completeness_score,
        issues=issues[:6],  # Top 6 issues to avoid overwhelming
        strengths=strengths,
        disclaimer="This quality audit highlights structure, readability, and metric density. It does not promise guaranteed ATS success or official employer hiring decisions."
    )
