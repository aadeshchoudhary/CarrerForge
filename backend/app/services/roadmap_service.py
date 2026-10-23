"""
Personalized Career Roadmap Generator Service (Module 2.7).
Generates structured multi-phase milestones (Foundations -> Core Skills -> Projects -> Interview Readiness).
Adapts dynamically to the candidate's existing confirmed skills and identified missing requirements.
"""
from typing import List, Dict, Any
from app.services.skill_matcher import normalize_skill


ROLE_CURRICULUMS = {
    "Full Stack Developer": [
        {
            "phase": "Phase 1: Web Foundations",
            "title": "Modern JavaScript & Responsive Web Layouts",
            "desc": "Master ES6+ asynchronous features, DOM manipulation, and responsive CSS with Tailwind.",
            "skills": ["JavaScript", "HTML", "CSS", "Tailwind CSS"],
            "is_project": False,
            "resources": [
                {"title": "JavaScript.info Modern Tutorial", "type": "docs", "url": "https://javascript.info"},
                {"title": "freeCodeCamp Responsive Web Design", "type": "course", "url": "https://www.freecodecamp.org"}
            ]
        },
        {
            "phase": "Phase 2: Frontend Frameworks",
            "title": "Single-Page Application Architecture with React & TypeScript",
            "desc": "Component lifecycles, hooks, state management, and strict TypeScript typing.",
            "skills": ["React", "TypeScript"],
            "is_project": False,
            "resources": [
                {"title": "React Official Documentation", "type": "docs", "url": "https://react.dev"},
                {"title": "React with TypeScript CheatSheet", "type": "guide", "url": "https://react-typescript-cheatsheet.netlify.app"}
            ]
        },
        {
            "phase": "Phase 2: Backend & APIs",
            "title": "High-Performance RESTful APIs with Python FastAPI",
            "desc": "Dependency injection, Pydantic data schemas, SQLAlchemy ORM, and JWT authentication.",
            "skills": ["Python", "FastAPI", "RESTful APIs"],
            "is_project": False,
            "resources": [
                {"title": "FastAPI Interactive Documentation", "type": "docs", "url": "https://fastapi.tiangolo.com"}
            ]
        },
        {
            "phase": "Phase 3: Relational Persistence",
            "title": "Database Schema Design & Query Optimization with PostgreSQL",
            "desc": "Relational foreign keys, indexing, ACID transactions, and connection pooling.",
            "skills": ["PostgreSQL", "SQL"],
            "is_project": False,
            "resources": [
                {"title": "PostgreSQL Tutorial for Developers", "type": "guide", "url": "https://www.postgresqltutorial.com"}
            ]
        },
        {
            "phase": "Phase 3: Applied Project Proof",
            "title": "Full-Stack Production Capstone Project",
            "desc": "Build and deploy an authenticated web application combining React, FastAPI, and PostgreSQL with Docker.",
            "skills": ["React", "FastAPI", "PostgreSQL", "Docker", "Git"],
            "is_project": True,
            "resources": [
                {"title": "Full-Stack FastAPI Template Guide", "type": "project_tutorial", "url": "https://github.com/tiangolo/full-stack-fastapi-template"}
            ]
        },
        {
            "phase": "Phase 4: Interview & Deployment",
            "title": "System Design Fundamentals & Technical Coding Prep",
            "desc": "API caching, pagination, load balancing, and solving data structures problems.",
            "skills": ["System Design", "Problem Solving"],
            "is_project": False,
            "resources": [
                {"title": "System Design Primer by Donne Martin", "type": "docs", "url": "https://github.com/donnemartin/system-design-primer"}
            ]
        }
    ],

    "Data Analyst": [
        {
            "phase": "Phase 1: Data Manipulation",
            "title": "SQL Querying & Enterprise Database Extraction",
            "desc": "Master multi-table JOINs, subqueries, aggregation, window functions, and indexing.",
            "skills": ["SQL", "PostgreSQL"],
            "is_project": False,
            "resources": [
                {"title": "Mode Analytics Interactive SQL Tutorial", "type": "course", "url": "https://mode.com/sql-tutorial/"}
            ]
        },
        {
            "phase": "Phase 2: Analytical Programming",
            "title": "Python for Data Analysis (Pandas & NumPy)",
            "desc": "Clean messy real-world datasets, perform exploratory data analysis (EDA), and compute descriptive statistics.",
            "skills": ["Python", "Pandas", "NumPy"],
            "is_project": False,
            "resources": [
                {"title": "10 Minutes to Pandas Guide", "type": "docs", "url": "https://pandas.pydata.org/docs/user_guide/10min.html"}
            ]
        },
        {
            "phase": "Phase 3: Visual Storytelling",
            "title": "Interactive Dashboards & Business Intelligence",
            "desc": "Design executive dashboards using Tableau or Power BI with drill-down filters.",
            "skills": ["Data Visualization", "Tableau", "Power BI"],
            "is_project": False,
            "resources": [
                {"title": "Tableau Public Free Training Videos", "type": "youtube", "url": "https://www.tableau.com/learn/training"}
            ]
        },
        {
            "phase": "Phase 3: Applied Project Proof",
            "title": "End-to-End Customer Insights Case Study",
            "desc": "Extract business data from SQL, clean and analyze in Python, and publish an interactive portfolio dashboard.",
            "skills": ["SQL", "Python", "Pandas", "Data Visualization"],
            "is_project": True,
            "resources": [
                {"title": "Kaggle Real-World Analytics Projects", "type": "project_tutorial", "url": "https://www.kaggle.com/datasets"}
            ]
        }
    ],

    "Machine Learning Engineer": [
        {
            "phase": "Phase 1: Foundations",
            "title": "Mathematical Foundations & Scikit-Learn Modeling",
            "desc": "Linear algebra, multivariable calculus, regression, classification, and cross-validation.",
            "skills": ["Python", "NumPy", "Scikit-Learn", "Machine Learning"],
            "is_project": False,
            "resources": [
                {"title": "Scikit-Learn Machine Learning in Python", "type": "docs", "url": "https://scikit-learn.org"}
            ]
        },
        {
            "phase": "Phase 2: Deep Learning",
            "title": "Neural Networks & Deep Learning with PyTorch",
            "desc": "Feedforward networks, CNNs for computer vision, Transformers, and loss backpropagation.",
            "skills": ["PyTorch", "Deep Learning"],
            "is_project": False,
            "resources": [
                {"title": "Deep Learning with PyTorch 60-Minute Blitz", "type": "docs", "url": "https://pytorch.org/tutorials/beginner/blitz"}
            ]
        },
        {
            "phase": "Phase 3: Applied Project Proof",
            "title": "Model Serving & Production Inference API",
            "desc": "Containerize a trained model with Docker and expose a low-latency FastAPI inference endpoint.",
            "skills": ["PyTorch", "FastAPI", "Docker"],
            "is_project": True,
            "resources": [
                {"title": "Made With ML Production Course", "type": "course", "url": "https://madewithml.com"}
            ]
        }
    ]
}


def build_personalized_roadmap(target_role: str, user_confirmed_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Constructs a customized roadmap for the given target role.
    Marks items as already completed if the user has confirmed all prerequisite skills for that item.
    """
    # Normalize role lookup
    canonical_role = "Full Stack Developer"
    for role_key in ROLE_CURRICULUMS.keys():
        if role_key.lower() in target_role.lower() or target_role.lower() in role_key.lower():
            canonical_role = role_key
            break

    curriculum = ROLE_CURRICULUMS.get(canonical_role, ROLE_CURRICULUMS["Full Stack Developer"])
    normalized_user_skills = {normalize_skill(s) for s in user_confirmed_skills}

    roadmap_items = []
    for idx, item in enumerate(curriculum):
        # Check if user already has all targeted skills for this milestone
        targeted = item["skills"]
        has_all_skills = len(targeted) > 0 and all(
            normalize_skill(sk) in normalized_user_skills for sk in targeted
        )
        
        status = "completed" if (has_all_skills and not item["is_project"]) else "pending"

        roadmap_items.append({
            "phase_title": item["phase"],
            "title": item["title"],
            "description": item["desc"],
            "skills_targeted": item["skills"],
            "resource_recommendations": item["resources"],
            "is_project_milestone": item["is_project"],
            "status": status,
            "order_index": idx + 1
        })

    return roadmap_items
