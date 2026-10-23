"""
Initial data seeding service.
Populates standard benchmark job descriptions and skill taxonomies.
"""
from sqlalchemy.orm import Session
from app.models.gap_report import JobDescription
from app.models.skill import Skill
from app.services.skill_matcher import KNOWN_SKILLS, normalize_skill


BENCHMARK_JOBS = [
    {
        "title": "Junior Full Stack Developer",
        "company": "TechNova Solutions",
        "location": "Remote / Bengaluru",
        "source_url": "https://careers.technova.example.com/jobs/fullstack-junior",
        "description_text": (
            "We are seeking an enthusiastic Junior Full Stack Developer to build modern web applications. "
            "You will work with React on the frontend and FastAPI/Python on the backend. Experience with PostgreSQL "
            "and Docker is a strong plus."
        ),
        "essential_skills": ["Python", "FastAPI", "React", "JavaScript", "SQL", "Git"],
        "preferred_skills": ["Docker", "TypeScript", "Tailwind CSS", "Redis"],
        "experience_level": "Fresher / 0-2 Years"
    },
    {
        "title": "Data Analyst (Fresher / Entry-Level)",
        "company": "Apex Analytics Corp",
        "location": "Hyderabad / Hybrid",
        "source_url": "https://careers.apexanalytics.example.com/data-analyst",
        "description_text": (
            "Apex Analytics is hiring an entry-level Data Analyst to extract insights from enterprise databases. "
            "The ideal candidate has strong SQL querying abilities, Python scripting (Pandas, NumPy), and "
            "dashboard creation experience."
        ),
        "essential_skills": ["SQL", "Python", "Pandas", "Data Visualization"],
        "preferred_skills": ["Tableau", "Power BI", "PostgreSQL", "Machine Learning"],
        "experience_level": "Fresher / 0-1 Years"
    },
    {
        "title": "Machine Learning Engineer Intern",
        "company": "DeepVision AI Labs",
        "location": "Pune / Remote",
        "source_url": "https://deepvision.example.com/careers/intern-ml",
        "description_text": (
            "Join our applied AI team to build and evaluate predictive models. You should have a solid mathematical "
            "grounding in linear algebra and hands-on familiarity with PyTorch or Scikit-Learn."
        ),
        "essential_skills": ["Python", "Machine Learning", "Scikit-Learn", "NumPy", "Git"],
        "preferred_skills": ["PyTorch", "Deep Learning", "Docker", "NLP"],
        "experience_level": "Internship / Student"
    },
    {
        "title": "Cloud & DevOps Associate",
        "company": "CloudScale Systems",
        "location": "Noida / Remote",
        "source_url": "https://cloudscale.example.com/jobs/devops-assoc",
        "description_text": (
            "Help automate continuous integration and containerized deployments across AWS infrastructure. "
            "Requires Linux command line proficiency, Docker containerization, and Git workflow experience."
        ),
        "essential_skills": ["Linux", "Docker", "Git", "AWS"],
        "preferred_skills": ["Kubernetes", "CI/CD", "Python", "Terraform"],
        "experience_level": "Fresher / 1-2 Years"
    }
]


def seed_database_if_empty(db: Session):
    """Seed benchmark jobs and skills if tables are currently empty."""
    # 1. Seed Skills Taxonomy
    existing_skills_count = db.query(Skill).count()
    if existing_skills_count == 0:
        for skill_name in KNOWN_SKILLS:
            norm = normalize_skill(skill_name)
            category = "Technical"
            if skill_name in ["react", "vue", "angular", "tailwind css", "html", "css", "javascript", "typescript"]:
                category = "Frontend"
            elif skill_name in ["fastapi", "django", "flask", "node", "express", "sql", "postgresql", "mongodb"]:
                category = "Backend"
            elif skill_name in ["docker", "kubernetes", "aws", "git", "linux", "ci/cd"]:
                category = "DevOps"
            elif skill_name in ["machine learning", "deep learning", "pandas", "numpy", "pytorch", "tableau"]:
                category = "Data & AI"

            new_skill = Skill(
                name=skill_name.title() if len(skill_name) > 3 else skill_name.upper(),
                normalized_name=norm,
                category=category,
                description=f"Proficiency in {skill_name} technology and practical application."
            )
            db.add(new_skill)
        db.commit()

    # 2. Seed Benchmark Job Descriptions
    existing_jobs_count = db.query(JobDescription).count()
    if existing_jobs_count == 0:
        for job_data in BENCHMARK_JOBS:
            job = JobDescription(**job_data)
            db.add(job)
        db.commit()
