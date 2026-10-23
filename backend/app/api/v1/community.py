"""
Community, Social Feed, Peer Mentorship, and Study Groups API endpoints (Phase 4).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.community import (
    PostCreate,
    PostOut,
    CommentCreate,
    CommentOut,
    PeerProfileOut,
    DirectMessageCreate,
    DirectMessageOut,
    StudyGroupCreate,
    StudyGroupOut,
    CommunityStatsOut,
)
from app.services import community_service

router = APIRouter()


@router.get("/feed", response_model=List[PostOut])
def get_feed(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    post_type: Optional[str] = Query(None, description="Filter by post type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch the community feed with optional topic and post_type filters.
    Includes optimistic like state for the current logged-in user.
    """
    return community_service.get_feed_posts(
        db=db,
        current_user_id=current_user.id,
        topic=topic,
        post_type=post_type
    )


@router.post("/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new post in the community feed.
    Can attach verified project links or Career Passport verification hashes.
    """
    return community_service.create_post(
        db=db,
        user_id=current_user.id,
        data=post_in
    )


@router.post("/posts/{post_id}/like")
def toggle_like(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle like on a community post.
    """
    try:
        return community_service.toggle_like(
            db=db,
            user_id=current_user.id,
            post_id=post_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: str,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a comment or answer to a post discussion thread.
    """
    try:
        return community_service.add_comment(
            db=db,
            user_id=current_user.id,
            post_id=post_id,
            data=comment_in
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/comments/{comment_id}/helpful", response_model=CommentOut)
def toggle_helpful_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark or unmark a comment as a helpful answer. Awards +10 reputation and XP to author.
    """
    try:
        return community_service.mark_comment_helpful(
            db=db,
            user_id=current_user.id,
            comment_id=comment_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/peers", response_model=List[PeerProfileOut])
def get_peers(
    skill: Optional[str] = Query(None, description="Filter peers by skill"),
    search: Optional[str] = Query(None, description="Search by name, handle or role"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Directory of peers and mentors for Career Connect networking.
    Includes verified skills, badges, and reputation scores.
    """
    return community_service.get_peers(
        db=db,
        current_user_id=current_user.id,
        skill_filter=skill,
        search=search
    )


@router.post("/peers/{peer_id}/connect")
def toggle_connect(
    peer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send or toggle a connection request with a peer.
    """
    try:
        return community_service.toggle_connection(
            db=db,
            requester_id=current_user.id,
            recipient_id=peer_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/messages/{peer_id}", response_model=List[DirectMessageOut])
def get_messages(
    peer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve direct chat message history with a peer.
    """
    return community_service.get_direct_messages(
        db=db,
        user_id=current_user.id,
        peer_id=peer_id
    )


@router.post("/messages", response_model=DirectMessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    msg_in: DirectMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a direct message to a peer.
    """
    try:
        return community_service.send_direct_message(
            db=db,
            sender_id=current_user.id,
            data=msg_in
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/groups", response_model=List[StudyGroupOut])
def get_study_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get active collaborative study groups.
    """
    return community_service.get_study_groups(
        db=db,
        current_user_id=current_user.id
    )


@router.post("/groups", response_model=StudyGroupOut, status_code=status.HTTP_201_CREATED)
def create_group(
    group_in: StudyGroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Found a new collaborative study group.
    """
    return community_service.create_study_group(
        db=db,
        user_id=current_user.id,
        data=group_in
    )


@router.post("/groups/{group_id}/toggle-join")
def toggle_group_membership(
    group_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Join or leave a collaborative study group.
    """
    try:
        return community_service.toggle_study_group_membership(
            db=db,
            user_id=current_user.id,
            group_id=group_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/stats", response_model=CommunityStatsOut)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated community engagement statistics.
    """
    return community_service.get_community_stats(
        db=db,
        user_id=current_user.id
    )
