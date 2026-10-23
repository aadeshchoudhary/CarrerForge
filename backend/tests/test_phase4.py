"""
Unit and integration tests for Phase 4 backend features:
- Community Feed & Filtering
- Post Creation with Project/Passport Links
- Like & Comment Threads
- Helpful Answer Marking & Reputation Calculation
- Peer Directory & Skill Search
- Direct Messaging & Study Groups
"""
import pytest
from app.core.database import SessionLocal
from app.models.user import User, CareerID
from app.models.community import Post, Comment, StudyGroup, DirectMessage
from app.schemas.community import (
    PostCreate,
    CommentCreate,
    DirectMessageCreate,
    StudyGroupCreate,
)
from app.services.community_service import (
    get_feed_posts,
    create_post,
    toggle_like,
    add_comment,
    mark_comment_helpful,
    get_peers,
    toggle_connection,
    get_direct_messages,
    send_direct_message,
    get_study_groups,
    create_study_group,
    toggle_study_group_membership,
    get_community_stats,
    calculate_reputation,
)


def get_test_user(db, email="test_phase4_user@college.edu", handle="@test_phase4"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, hashed_password="hashed_dummy_password")
        db.add(user)
        db.flush()
        cid = CareerID(
            user_id=user.id,
            handle=handle,
            full_name="Phase 4 Tester",
            target_role="Full Stack Developer",
            xp_points=200,
            badges_count=2
        )
        db.add(cid)
        db.commit()
        db.refresh(user)
    return user


def test_community_feed_and_filtering():
    db = SessionLocal()
    user = get_test_user(db)
    
    # 1. Fetch all posts
    feed = get_feed_posts(db, user.id)
    assert len(feed) >= 1
    assert any(p.topic in ["Interview Prep", "Web Dev", "Projects", "Data Science"] for p in feed)

    # 2. Filter by topic
    web_dev_feed = get_feed_posts(db, user.id, topic="Web Dev")
    assert all("web dev" in p.topic.lower() for p in web_dev_feed)
    db.close()


def test_post_creation_and_like_toggle():
    db = SessionLocal()
    user = get_test_user(db)

    post_data = PostCreate(
        title="Building Resilient Microservices with FastAPI and Celery",
        content="Here is a detailed guide on handling background workers and task queues reliably in Python.",
        topic="Web Dev",
        post_type="technical_tip",
        project_link="https://github.com/test-user/microservices-demo"
    )
    new_post = create_post(db, user.id, post_data)
    assert new_post.title == post_data.title
    assert new_post.project_link == post_data.project_link
    assert new_post.likes_count == 0

    # Toggle Like (Like)
    res1 = toggle_like(db, user.id, new_post.id)
    assert res1["has_liked"] is True
    assert res1["likes_count"] == 1

    # Toggle Like (Unlike)
    res2 = toggle_like(db, user.id, new_post.id)
    assert res2["has_liked"] is False
    assert res2["likes_count"] == 0

    db.close()


def test_comment_thread_and_helpful_answer():
    db = SessionLocal()
    user = get_test_user(db)
    
    # Find any existing post
    post = db.query(Post).first()
    assert post is not None

    comment_in = CommentCreate(content="Great tip! How do you handle database migration rollbacks in production?")
    comment_out = add_comment(db, user.id, post.id, comment_in)
    assert comment_out.content == comment_in.content
    assert comment_out.is_helpful_answer is False

    # Mark as helpful
    updated_comment = mark_comment_helpful(db, user.id, comment_out.id)
    assert updated_comment.is_helpful_answer is True

    # Test reputation includes helpful answer
    rep = calculate_reputation(db, user.id)
    assert rep >= 60  # Base 50 + 10 for helpful answer

    db.close()


def test_peer_directory_and_connection():
    db = SessionLocal()
    user = get_test_user(db)
    
    peers = get_peers(db, user.id)
    assert len(peers) >= 1
    
    target_peer = peers[0]
    assert target_peer.user_id != user.id
    assert target_peer.reputation_score >= 50

    # Toggle connection
    conn_res = toggle_connection(db, user.id, target_peer.user_id)
    assert conn_res["status"] == "connected"

    # Toggle again should disconnect
    disc_res = toggle_connection(db, user.id, target_peer.user_id)
    assert disc_res["status"] == "none"

    db.close()


def test_direct_messaging():
    db = SessionLocal()
    user = get_test_user(db)
    peers = get_peers(db, user.id)
    target_peer = peers[0]

    msg_data = DirectMessageCreate(
        receiver_id=target_peer.user_id,
        content="Hey, let's collaborate on the FastAPI project!"
    )
    sent_msg = send_direct_message(db, user.id, msg_data)
    assert sent_msg.content == msg_data.content

    history = get_direct_messages(db, user.id, target_peer.user_id)
    assert len(history) >= 1
    assert any(m.content == msg_data.content for m in history)
    db.close()


def test_study_groups_and_membership():
    db = SessionLocal()
    user = get_test_user(db)

    groups = get_study_groups(db, user.id)
    assert len(groups) >= 1
    target_group = db.query(StudyGroup).first()
    assert target_group is not None

    # Toggle join
    res = toggle_study_group_membership(db, user.id, target_group.id)
    assert "is_member" in res
    assert "members_count" in res

    # Create new study group
    new_group_data = StudyGroupCreate(
        name="Phase 4 Automated Test Circle",
        topic="AI & ML",
        description="Testing automated collaborative group creation and membership joining."
    )
    created_group = create_study_group(db, user.id, new_group_data)
    assert created_group.name == new_group_data.name
    assert created_group.is_member is True

    # Community Stats
    stats = get_community_stats(db, user.id)
    assert stats.total_posts >= 1
    assert stats.study_groups_count >= 1

    db.close()
