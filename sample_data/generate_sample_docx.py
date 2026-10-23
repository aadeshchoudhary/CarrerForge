"""
Helper script to generate sample PDF/DOCX resumes for local testing and viva demonstrations.
"""
from docx import Document
import os

OUTPUT_DIR = os.path.dirname(__file__)


def create_sample_resume():
    doc = Document()
    doc.add_heading("Aarav Sharma", 0)
    doc.add_paragraph("Email: aarav.sharma.dev@gmail.com | Phone: +91 98765 43210")
    doc.add_paragraph("GitHub: github.com/aarav-sharma | LinkedIn: linkedin.com/in/aarav-sharma")
    doc.add_paragraph("Location: Bengaluru, India\n")

    # Summary
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph(
        "Motivated Computer Science graduate with hands-on experience in full-stack web development. "
        "Proficient in Python, FastAPI, React, and PostgreSQL. Passionate about designing robust RESTful APIs "
        "and clean, responsive UI components."
    )

    # Technical Skills
    doc.add_heading("Technical Skills", level=1)
    doc.add_paragraph("• Programming Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3")
    doc.add_paragraph("• Frontend Frameworks: React, Tailwind CSS, Redux")
    doc.add_paragraph("• Backend Frameworks: FastAPI, Node.js, Express, RESTful APIs")
    doc.add_paragraph("• Databases: PostgreSQL, SQLite, MongoDB")
    doc.add_paragraph("• DevOps & Tools: Git, GitHub, Docker, Linux, Postman")

    # Education
    doc.add_heading("Education", level=1)
    p_edu = doc.add_paragraph()
    p_edu.add_run("Bachelor of Technology in Computer Science & Engineering\n").bold = True
    p_edu.add_run("National Institute of Technology | 2020 - 2024 | CGPA: 8.7/10.0")

    # Projects
    doc.add_heading("Key Projects", level=1)
    p_p1 = doc.add_paragraph()
    p_p1.add_run("1. AI Resume Parser & Career Matcher\n").bold = True
    p_p1.add_run(
        "Built a modular web platform using React, FastAPI, and PostgreSQL. "
        "Implemented deterministic skill extraction and weighted gap scoring against target job descriptions."
    )

    p_p2 = doc.add_paragraph()
    p_p2.add_run("2. Real-Time Collaborative Task Board\n").bold = True
    p_p2.add_run(
        "Engineered a Kanban board web application with React and Tailwind CSS. "
        "Integrated WebSockets for live status updates across teams."
    )

    # Experience
    doc.add_heading("Experience & Internships", level=1)
    p_exp = doc.add_paragraph()
    p_exp.add_run("Software Developer Intern — CloudInnovate Labs (6 Months)\n").bold = True
    p_exp.add_run(
        "Developed responsive frontend components in React and optimized database queries in PostgreSQL, "
        "improving page load latency by 32%."
    )

    out_path = os.path.join(OUTPUT_DIR, "Aarav_Sharma_FullStack_Resume.docx")
    doc.save(out_path)
    print(f"Sample DOCX resume created at: {out_path}")


if __name__ == "__main__":
    create_sample_resume()
