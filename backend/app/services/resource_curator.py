"""
Training Resource Hub Curator Service (Module 3.11).
Seeds and queries curated learning materials (Documentation, YouTube tutorials, Coding Practice, Project Guides).
Includes bilingual Hindi and English resources.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.resource import LearningResource
from app.services.skill_matcher import normalize_skill


CURATED_RESOURCES = [
    # Python
    {
        "title": "Python Official Tutorial & Standard Library Docs",
        "skill": "python",
        "type": "documentation",
        "provider": "Python Software Foundation",
        "url": "https://docs.python.org/3/tutorial/",
        "difficulty": "Beginner",
        "hours": 10,
        "is_free": True,
        "language": "English",
        "desc": "Official foundational introduction to syntax, data structures, and standard library modules."
    },
    {
        "title": "Python for Beginners Full Course in Hindi (CodeWithHarry)",
        "skill": "python",
        "type": "youtube",
        "provider": "YouTube - CodeWithHarry",
        "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg",
        "difficulty": "Beginner",
        "hours": 15,
        "is_free": True,
        "language": "Hindi",
        "desc": "Comprehensive beginner-to-advanced Python tutorial series in Hindi with exercises."
    },
    # React
    {
        "title": "React.dev — The Official Interactive React Documentation",
        "skill": "react",
        "type": "documentation",
        "provider": "React Team",
        "url": "https://react.dev",
        "difficulty": "Beginner",
        "hours": 12,
        "is_free": True,
        "language": "English",
        "desc": "Hands-on interactive explanations of components, hooks, props, and UI state management."
    },
    {
        "title": "Complete React Course in Hindi (Chai aur Code)",
        "skill": "react",
        "type": "youtube",
        "provider": "YouTube - Chai aur Code",
        "url": "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige",
        "difficulty": "Intermediate",
        "hours": 18,
        "is_free": True,
        "language": "Hindi",
        "desc": "Deep architectural dive into React hooks, context API, and real-world project development in Hindi."
    },
    # FastAPI
    {
        "title": "FastAPI Interactive Tutorial & User Guide",
        "skill": "fastapi",
        "type": "documentation",
        "provider": "FastAPI Official",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "difficulty": "Intermediate",
        "hours": 8,
        "is_free": True,
        "language": "English",
        "desc": "Learn asynchronous RESTful APIs, dependency injection, Pydantic schemas, and Swagger docs."
    },
    # SQL & PostgreSQL
    {
        "title": "SQL Tutorial for Beginners — Full Course",
        "skill": "sql",
        "type": "youtube",
        "provider": "freeCodeCamp.org",
        "url": "https://www.youtube.com/watch?v=HXV3zeRR3h4",
        "difficulty": "Beginner",
        "hours": 5,
        "is_free": True,
        "language": "English",
        "desc": "Foundational SQL database queries, JOINs, aggregations, schema creation, and constraints."
    },
    {
        "title": "PostgreSQL Tutorial for Developers",
        "skill": "postgresql",
        "type": "documentation",
        "provider": "PostgreSQL Tutorial",
        "url": "https://www.postgresqltutorial.com/",
        "difficulty": "Intermediate",
        "hours": 10,
        "is_free": True,
        "language": "English",
        "desc": "Practical PostgreSQL tutorials with clear examples and query optimization techniques."
    },
    # Docker
    {
        "title": "Docker Hands-On Workshop & Official Docs",
        "skill": "docker",
        "type": "documentation",
        "provider": "Docker Inc.",
        "url": "https://docs.docker.com/get-started/",
        "difficulty": "Intermediate",
        "hours": 6,
        "is_free": True,
        "language": "English",
        "desc": "Learn containerization, Dockerfiles, images, multi-container compose, and volume persistence."
    },
    # Machine Learning & Pandas
    {
        "title": "Pandas User Guide & 10-Minute Cookbooks",
        "skill": "pandas",
        "type": "documentation",
        "provider": "Pandas Community",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "difficulty": "Beginner",
        "hours": 4,
        "is_free": True,
        "language": "English",
        "desc": "Quickstart guide to DataFrames, series slicing, missing value imputation, and grouping."
    },
    {
        "title": "Scikit-Learn Machine Learning in Python",
        "skill": "machine learning",
        "type": "documentation",
        "provider": "Scikit-Learn Community",
        "url": "https://scikit-learn.org/stable/tutorial/basic/tutorial.html",
        "difficulty": "Intermediate",
        "hours": 12,
        "is_free": True,
        "language": "English",
        "desc": "Predictive data analysis, linear models, clustering, classification, and evaluation metrics."
    },
    # Git
    {
        "title": "Git & GitHub Crash Course for Beginners",
        "skill": "git",
        "type": "youtube",
        "provider": "Traversy Media",
        "url": "https://www.youtube.com/watch?v=SWYqp7iY_Tc",
        "difficulty": "Beginner",
        "hours": 2,
        "is_free": True,
        "language": "English",
        "desc": "Master branches, commits, pull requests, merge conflict resolution, and remote repositories."
    }
]


def seed_learning_resources_if_empty(db: Session):
    """Populates learning resources table if empty."""
    count = db.query(LearningResource).count()
    if count == 0:
        for res in CURATED_RESOURCES:
            new_res = LearningResource(
                title=res["title"],
                skill_normalized=normalize_skill(res["skill"]),
                resource_type=res["type"],
                provider=res["provider"],
                url=res["url"],
                difficulty=res["difficulty"],
                estimated_hours=res["hours"],
                is_free=res["is_free"],
                language=res["language"],
                description=res["desc"]
            )
            db.add(new_res)
        db.commit()


def search_resources(
    db: Session,
    skill: Optional[str] = None,
    resource_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    language: Optional[str] = None,
    is_free_only: bool = False
) -> List[LearningResource]:
    """Queries resources with multi-factor filtering."""
    query = db.query(LearningResource)

    if skill:
        norm = normalize_skill(skill)
        query = query.filter(LearningResource.skill_normalized == norm)

    if resource_type:
        query = query.filter(LearningResource.resource_type == resource_type)

    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)

    if language:
        query = query.filter(LearningResource.language.ilike(f"%{language}%"))

    if is_free_only:
        query = query.filter(LearningResource.is_free == True)

    return query.all()
