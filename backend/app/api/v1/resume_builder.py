"""
Resume Builder and Quality Checker Endpoints (Module 1.3 & 1.4).
"""
import urllib.parse
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.builder import ResumeBuildRequest, QualityCheckResponse
from app.services.docx_builder import generate_resume_docx
from app.services.quality_checker import audit_resume_quality
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/export-docx")
def export_resume_docx(
    request: ResumeBuildRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate and stream an editable, professional Microsoft Word DOCX resume.
    Formatted with clean margins, standardized typography, and bullet points.
    """
    doc_stream = generate_resume_docx(request)
    
    clean_name = "".join(c for c in request.personal_info.full_name if c.isalnum() or c in (' ', '_', '-')).strip() or "Resume"
    filename = f"{clean_name.replace(' ', '_')}_Resume.docx"
    encoded_filename = urllib.parse.quote(filename)

    return Response(
        content=doc_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\"; filename*=UTF-8''{encoded_filename}"
        }
    )


@router.post("/quality-check", response_model=QualityCheckResponse)
def check_resume_quality(
    request: ResumeBuildRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Run the heuristic quality checker.
    Evaluates action verbs, quantifiable metrics, and passive voice phrasing.
    Provides suggested rewrites without claiming guaranteed ATS passage.
    """
    return audit_resume_quality(request)
