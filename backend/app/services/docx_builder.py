"""
AI Resume Builder Word (.docx) Exporter Service.
Generates an ATS-compliant, beautifully styled Microsoft Word document using python-docx.
"""
import io
try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
from app.schemas.builder import ResumeBuildRequest


def add_horizontal_rule(paragraph):
    """Inserts a thin bottom border under a section heading for ATS-friendly visual elegance."""
    if not DOCX_AVAILABLE:
        return
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')  # 0.75 pt line
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), '4F46E5')  # Brand Indigo accent color
    pBdr.append(bottom)
    pPr.append(pBdr)


def generate_resume_docx(data: ResumeBuildRequest) -> io.BytesIO:
    """Builds and returns a formatted Word document in memory."""
    if not DOCX_AVAILABLE:
        # Fallback to plain text document stream
        buf = io.BytesIO()
        text = f"{data.full_name}\n{data.email} | {data.phone}\n\nSUMMARY\n{data.summary}\n\nSKILLS\n{', '.join(data.skills)}"
        buf.write(text.encode("utf-8"))
        buf.seek(0)
        return buf
    doc = Document()

    # Standard 0.75-inch margins
    for section in doc.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # 1. Candidate Header
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_name = p_name.add_run(data.personal_info.full_name)
    run_name.font.size = Pt(20)
    run_name.font.bold = True
    run_name.font.name = "Calibri"
    run_name.font.color.rgb = RGBColor(15, 23, 42)  # Slate 900

    # Contact line
    contact_parts = [data.personal_info.email, data.personal_info.phone]
    if data.personal_info.location:
        contact_parts.append(data.personal_info.location)
    p_contact = doc.add_paragraph(" | ".join(contact_parts))
    p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact.paragraph_format.space_after = Pt(2)
    for run in p_contact.runs:
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(71, 85, 105)

    # Links line
    link_parts = []
    if data.personal_info.github:
        link_parts.append(f"GitHub: {data.personal_info.github}")
    if data.personal_info.linkedin:
        link_parts.append(f"LinkedIn: {data.personal_info.linkedin}")
    if data.personal_info.portfolio:
        link_parts.append(f"Portfolio: {data.personal_info.portfolio}")
    if link_parts:
        p_links = doc.add_paragraph(" | ".join(link_parts))
        p_links.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_links.paragraph_format.space_after = Pt(8)
        for run in p_links.runs:
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(99, 102, 241)  # Indigo

    def add_section_header(title: str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(title.upper())
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(79, 70, 229)
        add_horizontal_rule(p)

    # 2. Summary
    if data.personal_info.headline:
        add_section_header("Professional Summary")
        p_sum = doc.add_paragraph(
            f"Results-driven {data.target_job_title} with practical experience building modern web applications "
            f"and robust backends. Demonstrated proficiency in {', '.join(data.skills[:4])}. "
            "Passionate about scalable architectures, clean code standards, and agile collaboration."
        )
        p_sum.paragraph_format.space_after = Pt(6)
        p_sum.runs[0].font.size = Pt(10)

    # 3. Technical Skills
    if data.skills:
        add_section_header("Technical Skills")
        p_skills = doc.add_paragraph()
        p_skills.paragraph_format.space_after = Pt(6)
        r_label = p_skills.add_run("Core Competencies: ")
        r_label.bold = True
        r_label.font.size = Pt(10)
        r_skills = p_skills.add_run(", ".join(data.skills))
        r_skills.font.size = Pt(10)

    # 4. Demonstrated Projects
    if data.projects:
        add_section_header("Key Projects")
        for proj in data.projects:
            p_head = doc.add_paragraph()
            p_head.paragraph_format.space_before = Pt(4)
            p_head.paragraph_format.space_after = Pt(1)
            r_title = p_head.add_run(proj.title)
            r_title.bold = True
            r_title.font.size = Pt(10.5)

            if proj.tech_stack:
                r_tech = p_head.add_run(f" | {proj.tech_stack}")
                r_tech.italic = True
                r_tech.font.size = Pt(9.5)
                r_tech.font.color.rgb = RGBColor(100, 116, 139)

            p_desc = doc.add_paragraph(proj.description, style='List Bullet')
            p_desc.paragraph_format.space_after = Pt(4)
            p_desc.runs[0].font.size = Pt(9.5)

    # 5. Work Experience & Internships
    if data.work_experience:
        add_section_header("Professional Experience")
        for exp in data.work_experience:
            p_exp = doc.add_paragraph()
            p_exp.paragraph_format.space_before = Pt(4)
            p_exp.paragraph_format.space_after = Pt(1)
            r_exp_title = p_exp.add_run(exp.title)
            r_exp_title.bold = True
            r_exp_title.font.size = Pt(10.5)

            r_comp = p_exp.add_run(f" — {exp.company}")
            r_comp.font.size = Pt(10)

            if exp.duration:
                r_dur = p_exp.add_run(f" ({exp.duration})")
                r_dur.italic = True
                r_dur.font.size = Pt(9.5)
                r_dur.font.color.rgb = RGBColor(100, 116, 139)

            for bp in exp.bullet_points:
                p_bp = doc.add_paragraph(bp, style='List Bullet')
                p_bp.paragraph_format.space_after = Pt(2)
                p_bp.runs[0].font.size = Pt(9.5)

    # 6. Education
    if data.education:
        add_section_header("Education")
        for edu in data.education:
            p_edu = doc.add_paragraph()
            p_edu.paragraph_format.space_before = Pt(3)
            p_edu.paragraph_format.space_after = Pt(2)
            r_deg = p_edu.add_run(edu.degree)
            r_deg.bold = True
            r_deg.font.size = Pt(10)

            r_inst = p_edu.add_run(f" | {edu.institution} ({edu.year})")
            r_inst.font.size = Pt(9.5)

    # 7. Certifications
    if data.certifications:
        add_section_header("Certifications & Achievements")
        for cert in data.certifications:
            p_cert = doc.add_paragraph(cert, style='List Bullet')
            p_cert.paragraph_format.space_after = Pt(2)
            p_cert.runs[0].font.size = Pt(9.5)

    stream = io.BytesIO()
    doc.save(stream)
    stream.seek(0)
    return stream
