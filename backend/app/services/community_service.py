"""
Community service for Phase 4:
- Feed post retrieval with filtering (topic, post_type)
- Post creation with linked projects and Career Passport verification
- Optimistic Likes toggle and Comments thread
- Helpful answer marking (+10 reputation & XP to author)
- Peer Directory search by skills, career track, or name
- Peer connection requests (Connect / Pending / Accepted)
- Direct messaging between peers
- Collaborative Study Groups (catalog, join/leave)
- Community reputation calculator
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.models.community import (
    Post,
    PostLike,
    Comment,
    Connection,
    DirectMessage,
    StudyGroup,
    UserStudyGroup,
)
from app.models.user import User, CareerID
from app.models.skill import Skill, UserSkill
from app.schemas.community import (
    PostCreate,
    PostOut,
    CommentCreate,
    CommentOut,
    PeerProfileOut,
    ConnectionOut,
    DirectMessageCreate,
    DirectMessageOut,
    StudyGroupCreate,
    StudyGroupOut,
    CommunityStatsOut,
)
from app.core.security import get_password_hash


BENCHMARK_PEERS = [
    {
        "email": "priya.sharma@campus.example.com",
        "handle": "@priya_sharma",
        "full_name": "Priya Sharma",
        "headline": "Final Year CSE | Full-Stack Developer & Open Source Contributor",
        "bio": "Building production microservices with FastAPI & React. Mentoring juniors in Data Structures and Web Dev.",
        "target_role": "Full Stack Developer",
        "xp_points": 780,
        "current_level": 4,
        "badges_count": 5,
        "skills": [("React", "verified"), ("FastAPI", "verified"), ("Python", "verified"), ("Docker", "assessed")]
    },
    {
        "email": "rohit.verma@campus.example.com",
        "handle": "@rohit_verma",
        "full_name": "Rohit Verma",
        "headline": "AI & ML Enthusiast | Working on NLP & Computer Vision",
        "bio": "Researching Transformer architectures for Indian regional languages. PyTorch, Hugging Face, and FastAPI.",
        "target_role": "Machine Learning Engineer",
        "xp_points": 620,
        "current_level": 3,
        "badges_count": 4,
        "skills": [("Python", "verified"), ("Machine Learning", "verified"), ("PyTorch", "verified"), ("Git", "verified")]
    },
    {
        "email": "aarav.patel@campus.example.com",
        "handle": "@aarav_cloud",
        "full_name": "Aarav Patel",
        "headline": "DevOps & Cloud Associate | Docker, Kubernetes & CI/CD",
        "bio": "Automating continuous integration pipelines. Big fan of infrastructure as code and microservice resilience.",
        "target_role": "Cloud & DevOps Associate",
        "xp_points": 540,
        "current_level": 3,
        "badges_count": 3,
        "skills": [("Docker", "verified"), ("Git", "verified"), ("Linux", "verified"), ("Python", "self_reported")]
    },
    {
        "email": "ananya.iyer@campus.example.com",
        "handle": "@ananya_data",
        "full_name": "Ananya Iyer",
        "headline": "Data Analyst | SQL, Pandas, & PowerBI Specialist",
        "bio": "Turning raw campus and logistics datasets into actionable visual executive dashboards.",
        "target_role": "Data Analyst",
        "xp_points": 490,
        "current_level": 2,
        "badges_count": 3,
        "skills": [("SQL", "verified"), ("Python", "verified"), ("Pandas", "verified"), ("Data Visualization", "assessed")]
    }
]

BENCHMARK_POSTS = [
    {
        "peer_handle": "@priya_sharma",
        "title": "Passed my Technical Interview for SDE-1 Intern! Here are 3 tips that made the difference",
        "content": (
            "Hey everyone! I just signed my offer letter for a 6-month SDE internship. 🚀\n\n"
            "Here is the exact strategy that helped me convert:\n"
            "1. **Explainable Thinking**: In coding rounds, don't write silent code. Always state your time & space complexity upfront.\n"
            "2. **Real Proof of Projects**: My interviewer spent 15 minutes reviewing my verified GitHub repo instead of random trivia.\n"
            "3. **Mock Interviews**: Used the platform's AI interview gym to drill corner cases on concurrency.\n\n"
            "Feel free to ask any questions in the comments, happy to review resumes!"
        ),
        "topic": "Interview Prep",
        "post_type": "milestone",
        "project_link": "https://github.com/priyasharma/cloud-microservices-demo",
        "passport_link": "https://verify.careerplatform.edu/passport/PASSPORT-PRIYA-2026",
        "likes": 28,
        "comments": [
            ("Congratulations Priya! Did they ask any system design questions or purely DSA?", False),
            ("Mainly low-level design (OOP classes for a parking lot) followed by 1 graph traversal problem! Keep your classes modular.", True)
        ]
    },
    {
        "peer_handle": "@rohit_verma",
        "title": "Open Sourced our Multilingual Sentiment Analysis Model on Hugging Face (PyTorch)",
        "content": (
            "We just open-sourced our capstone repository! It benchmarks fine-tuned mBERT against Hindi-English code-mixed tweets.\n\n"
            "Key achievements:\n"
            "- F1-Score: 89.4%\n"
            "- FastAPI backend serving predictions in under 45ms.\n"
            "- Verified via GitHub automated tests.\n\n"
            "Looking for 2 contributors interested in building a React frontend playground for it. Drop a comment or message me directly!"
        ),
        "topic": "Projects",
        "post_type": "project_showcase",
        "project_link": "https://github.com/rohitverma/multilingual-nlp-sentiment",
        "passport_link": None,
        "likes": 19,
        "comments": [
            ("This is awesome! Would love to help build the React UI for this. Connecting with you!", False)
        ]
    },
    {
        "peer_handle": "@aarav_cloud",
        "title": "Common mistake freshers make with Docker in College Projects: 1.2GB image sizes",
        "content": (
            "Quick technical tip for everyone submitting Dockerized capstone projects:\n\n"
            "❌ Don't use `FROM python:3.11` without multi-stage builds. Your image will bloat to 1.2 GB.\n"
            "✅ Use `FROM python:3.11-slim` or multi-stage builds. Strip build dependencies like gcc after `pip install`.\n"
            "Our team reduced our Docker container from 1.3GB down to 142MB! Interviewers notice these details."
        ),
        "topic": "Web Dev",
        "post_type": "technical_tip",
        "project_link": None,
        "passport_link": None,
        "likes": 34,
        "comments": [
            ("Using `.dockerignore` to exclude `.git` and `node_modules` is also huge!", True),
            ("Great tip! Do you recommend Alpine for Python or slim?", False),
            ("Always `slim` for Python! Alpine has glibc compatibility issues with pre-compiled wheels like NumPy.", True)
        ]
    },
    {
        "peer_handle": "@ananya_data",
        "title": "Study Circle: Weekly SQL & Pandas Data Cleaning Challenges",
        "content": (
            "Starting an active peer group for students preparing for Data Analyst & BI roles this hiring season.\n\n"
            "Every Wednesday we tackle one messy real-world CSV (missing values, skewed dates, anomalous revenue data) "
            "and write window functions and CTEs in PostgreSQL.\n\n"
            "Join the 'Data Analytics Peer Circle' study group in the tabs above!"
        ),
        "topic": "Data Science",
        "post_type": "collaboration",
        "project_link": None,
        "passport_link": None,
        "likes": 15,
        "comments": []
    }
]

BENCHMARK_GROUPS = [
    {
        "name": "Full Stack MERN & FastAPI Peer Circle",
        "topic": "Web Dev",
        "description": "Collaborative group for aspiring full stack engineers. Weekly code reviews, GitHub collaboration, and API design critiques.",
        "creator_handle": "@priya_sharma",
        "members_count": 14
    },
    {
        "name": "LeetCode & System Design Sprint",
        "topic": "Interview Prep",
        "description": "Daily problem solving in Graphs, Dynamic Programming, and OOP design. Preparing for campus placements and off-campus drives.",
        "creator_handle": "@priya_sharma",
        "members_count": 22
    },
    {
        "name": "AI / PyTorch Capstone Builders",
        "topic": "AI & ML",
        "description": "Working on machine learning capstones, dataset curation, model fine-tuning, and production deployment with FastAPI.",
        "creator_handle": "@rohit_verma",
        "members_count": 9
    },
    {
        "name": "DevOps & Cloud Infrastructure Enthusiasts",
        "topic": "Web Dev",
        "description": "Hands-on Docker, Kubernetes, GitHub Actions CI/CD workflows, and AWS free-tier architecture discussions.",
        "creator_handle": "@aarav_cloud",
        "members_count": 8
    }
]


def seed_community_data_if_empty(db: Session):
    """
    Seed initial benchmark peers, posts, comments, and study groups if not present.
    """
    # 1. Seed benchmark peers
    peer_user_map: Dict[str, User] = {}
    for p_data in BENCHMARK_PEERS:
        existing_user = db.query(User).filter(User.email == p_data["email"]).first()
        if not existing_user:
            new_user = User(
                email=p_data["email"],
                hashed_password=get_password_hash("CampusPass@2026"),
                role="student"
            )
            db.add(new_user)
            db.flush()

            new_career_id = CareerID(
                user_id=new_user.id,
                handle=p_data["handle"],
                full_name=p_data["full_name"],
                headline=p_data["headline"],
                bio=p_data["bio"],
                target_role=p_data["target_role"],
                xp_points=p_data["xp_points"],
                current_level=p_data["current_level"],
                badges_count=p_data["badges_count"]
            )
            db.add(new_career_id)

            # Add verified skills
            for s_name, ev_level in p_data["skills"]:
                sk_obj = db.query(Skill).filter(Skill.name == s_name).first()
                if not sk_obj:
                    sk_obj = Skill(name=s_name, normalized_name=s_name.lower().strip(), category="Technical")
                    db.add(sk_obj)
                    db.flush()
                u_sk = UserSkill(
                    user_id=new_user.id,
                    skill_id=sk_obj.id,
                    evidence_level=ev_level,
                    years_experience=2
                )
                db.add(u_sk)

            db.commit()
            peer_user_map[p_data["handle"]] = new_user
        else:
            peer_user_map[p_data["handle"]] = existing_user

    # 2. Seed benchmark posts if none exist
    if db.query(Post).count() == 0:
        for p_info in BENCHMARK_POSTS:
            author = peer_user_map.get(p_info["peer_handle"])
            if not author:
                continue
            
            post = Post(
                user_id=author.id,
                title=p_info["title"],
                content=p_info["content"],
                topic=p_info["topic"],
                post_type=p_info["post_type"],
                project_link=p_info["project_link"],
                passport_link=p_info["passport_link"],
                likes_count=p_info["likes"],
                comments_count=len(p_info["comments"])
            )
            db.add(post)
            db.flush()

            # Seed comments
            for c_text, is_helpful in p_info["comments"]:
                comment = Comment(
                    post_id=post.id,
                    user_id=author.id,
                    content=c_text,
                    is_helpful_answer=is_helpful
                )
                db.add(comment)

        db.commit()

    # 3. Seed study groups if none exist
    if db.query(StudyGroup).count() == 0:
        for g_info in BENCHMARK_GROUPS:
            creator = peer_user_map.get(g_info["creator_handle"])
            creator_id = creator.id if creator else list(peer_user_map.values())[0].id
            
            group = StudyGroup(
                name=g_info["name"],
                topic=g_info["topic"],
                description=g_info["description"],
                created_by=creator_id,
                members_count=g_info["members_count"],
                is_active=True
            )
            db.add(group)
        db.commit()


def calculate_reputation(db: Session, user_id: str) -> int:
    """
    Transparent, explainable reputation calculation:
    - Base reputation: 50
    - Each like received on posts: +2
    - Each helpful answer marked by community: +10
    - Each verified skill via Project-to-Proof: +15
    - Each accepted peer connection: +5
    """
    base = 50
    # Likes on user's posts
    user_posts = db.query(Post).filter(Post.user_id == user_id).all()
    likes_total = sum(p.likes_count for p in user_posts)
    
    # Helpful answers
    helpful_count = db.query(Comment).filter(
        Comment.user_id == user_id,
        Comment.is_helpful_answer == True
    ).count()

    # Verified skills
    verified_skills_count = db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.evidence_level == "verified"
    ).count()

    # Accepted connections
    connections_count = db.query(Connection).filter(
        or_(Connection.requester_id == user_id, Connection.recipient_id == user_id),
        Connection.status == "accepted"
    ).count()

    reputation = base + (likes_total * 2) + (helpful_count * 10) + (verified_skills_count * 15) + (connections_count * 5)
    return reputation


def get_feed_posts(
    db: Session,
    current_user_id: str,
    topic: Optional[str] = None,
    post_type: Optional[str] = None
) -> List[PostOut]:
    """
    Fetch community feed posts with topic/type filter, user like status, and author details.
    """
    query = db.query(Post)
    if topic and topic.lower() != "all":
        query = query.filter(Post.topic.ilike(f"%{topic}%"))
    if post_type and post_type.lower() != "all":
        query = query.filter(Post.post_type == post_type)

    posts = query.order_by(desc(Post.created_at)).all()
    results = []

    # Get posts current user has liked
    user_liked_ids = set(
        r[0] for r in db.query(PostLike.post_id).filter(PostLike.user_id == current_user_id).all()
    )

    for p in posts:
        author_cid = p.user.career_id if p.user else None
        
        # Load comments
        comments_out = []
        for c in p.comments:
            c_cid = c.user.career_id if c.user else None
            comments_out.append(CommentOut(
                id=c.id,
                post_id=c.post_id,
                user_id=c.user_id,
                author_name=c_cid.full_name if c_cid else "Anonymous User",
                author_handle=c_cid.handle if c_cid else "@anonymous",
                content=c.content,
                is_helpful_answer=c.is_helpful_answer,
                created_at=c.created_at
            ))

        results.append(PostOut(
            id=p.id,
            user_id=p.user_id,
            author_name=author_cid.full_name if author_cid else "Community Member",
            author_handle=author_cid.handle if author_cid else "@member",
            author_headline=author_cid.headline if author_cid else None,
            author_badges_count=author_cid.badges_count if author_cid else 1,
            title=p.title,
            content=p.content,
            topic=p.topic,
            post_type=p.post_type,
            project_link=p.project_link,
            passport_link=p.passport_link,
            likes_count=p.likes_count,
            comments_count=len(p.comments),
            has_liked=p.id in user_liked_ids,
            created_at=p.created_at,
            comments=comments_out
        ))

    return results


def create_post(db: Session, user_id: str, data: PostCreate) -> PostOut:
    """
    Create a new community post, attach project or passport proof, and award +25 XP.
    """
    post = Post(
        user_id=user_id,
        title=data.title,
        content=data.content,
        topic=data.topic,
        post_type=data.post_type,
        project_link=data.project_link,
        passport_link=data.passport_link,
        likes_count=0,
        comments_count=0
    )
    db.add(post)
    
    # Award +25 XP to user for community contribution
    user_cid = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    if user_cid:
        user_cid.xp_points = (user_cid.xp_points or 0) + 25
    
    db.commit()
    db.refresh(post)

    return PostOut(
        id=post.id,
        user_id=post.user_id,
        author_name=user_cid.full_name if user_cid else "User",
        author_handle=user_cid.handle if user_cid else "@user",
        author_headline=user_cid.headline if user_cid else None,
        author_badges_count=user_cid.badges_count if user_cid else 1,
        title=post.title,
        content=post.content,
        topic=post.topic,
        post_type=post.post_type,
        project_link=post.project_link,
        passport_link=post.passport_link,
        likes_count=0,
        comments_count=0,
        has_liked=False,
        created_at=post.created_at,
        comments=[]
    )


def toggle_like(db: Session, user_id: str, post_id: str) -> Dict[str, Any]:
    """
    Optimistic like toggle.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise ValueError("Post not found.")

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == user_id
    ).first()

    if existing_like:
        db.delete(existing_like)
        post.likes_count = max(0, (post.likes_count or 1) - 1)
        has_liked = False
    else:
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.likes_count = (post.likes_count or 0) + 1
        has_liked = True

    db.commit()
    return {"has_liked": has_liked, "likes_count": post.likes_count}


def add_comment(db: Session, user_id: str, post_id: str, data: CommentCreate) -> CommentOut:
    """
    Add a comment to a post. Increments comments_count.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise ValueError("Post not found.")

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=data.content,
        is_helpful_answer=False
    )
    db.add(comment)
    post.comments_count = (post.comments_count or 0) + 1
    
    # Award +10 XP for commenting
    user_cid = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    if user_cid:
        user_cid.xp_points = (user_cid.xp_points or 0) + 10

    db.commit()
    db.refresh(comment)

    return CommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        author_name=user_cid.full_name if user_cid else "User",
        author_handle=user_cid.handle if user_cid else "@user",
        content=comment.content,
        is_helpful_answer=comment.is_helpful_answer,
        created_at=comment.created_at
    )


def mark_comment_helpful(db: Session, user_id: str, comment_id: str) -> CommentOut:
    """
    Mark or unmark a comment as helpful answer.
    Awards +10 XP to the comment author when marked helpful.
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise ValueError("Comment not found.")

    comment.is_helpful_answer = not comment.is_helpful_answer
    
    # If newly marked helpful, award XP to comment author
    if comment.is_helpful_answer:
        author_cid = db.query(CareerID).filter(CareerID.user_id == comment.user_id).first()
        if author_cid:
            author_cid.xp_points = (author_cid.xp_points or 0) + 10

    db.commit()
    db.refresh(comment)

    c_cid = comment.user.career_id if comment.user else None
    return CommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        author_name=c_cid.full_name if c_cid else "User",
        author_handle=c_cid.handle if c_cid else "@user",
        content=comment.content,
        is_helpful_answer=comment.is_helpful_answer,
        created_at=comment.created_at
    )


def get_peers(
    db: Session,
    current_user_id: str,
    skill_filter: Optional[str] = None,
    search: Optional[str] = None
) -> List[PeerProfileOut]:
    """
    Get peer profiles for peer directory and mentorship.
    Calculates dynamic reputation, retrieves verified skills and connection status.
    """
    query = db.query(User).filter(User.id != current_user_id)
    users = query.all()

    # Get connection statuses with current user
    connections = db.query(Connection).filter(
        or_(Connection.requester_id == current_user_id, Connection.recipient_id == current_user_id)
    ).all()
    conn_map = {}
    for c in connections:
        other_id = c.recipient_id if c.requester_id == current_user_id else c.requester_id
        conn_map[other_id] = c.status

    peer_list = []
    for u in users:
        cid = u.career_id
        if not cid:
            continue

        # Check search match (name, handle, role)
        if search:
            s_lower = search.lower()
            if (s_lower not in (cid.full_name or "").lower() and
                s_lower not in (cid.handle or "").lower() and
                s_lower not in (cid.target_role or "").lower()):
                continue

        # Get verified skills
        verified_skills = [
            us.skill.name for us in u.skills if us.evidence_level == "verified" and us.skill
        ]

        # Check skill filter
        if skill_filter and skill_filter.lower() != "all":
            all_skills = [us.skill.name.lower() for us in u.skills if us.skill]
            if skill_filter.lower() not in all_skills:
                continue

        reputation = calculate_reputation(db, u.id)
        status = conn_map.get(u.id, "none")

        peer_list.append(PeerProfileOut(
            user_id=u.id,
            handle=cid.handle,
            full_name=cid.full_name,
            headline=cid.headline or "Engineering Student",
            target_role=cid.target_role or "Full Stack Developer",
            reputation_score=reputation,
            badges_count=cid.badges_count or 1,
            verified_skills=verified_skills,
            connection_status=status,
            bio=cid.bio
        ))

    # Sort peers by reputation desc
    peer_list.sort(key=lambda x: x.reputation_score, reverse=True)
    return peer_list


def toggle_connection(db: Session, requester_id: str, recipient_id: str) -> Dict[str, Any]:
    """
    Connect or disconnect with a peer.
    """
    if requester_id == recipient_id:
        raise ValueError("Cannot connect with yourself.")

    conn = db.query(Connection).filter(
        or_(
            and_(Connection.requester_id == requester_id, Connection.recipient_id == recipient_id),
            and_(Connection.requester_id == recipient_id, Connection.recipient_id == requester_id)
        )
    ).first()

    if conn:
        # If exists, toggle disconnect
        db.delete(conn)
        db.commit()
        return {"status": "none", "message": "Connection removed"}
    else:
        # Create accepted connection
        new_conn = Connection(
            requester_id=requester_id,
            recipient_id=recipient_id,
            status="accepted"
        )
        db.add(new_conn)
        
        # Award +15 XP for building network
        r_cid = db.query(CareerID).filter(CareerID.user_id == requester_id).first()
        if r_cid:
            r_cid.xp_points = (r_cid.xp_points or 0) + 15

        db.commit()
        return {"status": "connected", "message": "Connected with peer!"}


def get_direct_messages(db: Session, user_id: str, peer_id: str) -> List[DirectMessageOut]:
    """
    Get message history between current user and a peer.
    """
    messages = db.query(DirectMessage).filter(
        or_(
            and_(DirectMessage.sender_id == user_id, DirectMessage.receiver_id == peer_id),
            and_(DirectMessage.sender_id == peer_id, DirectMessage.receiver_id == user_id)
        )
    ).order_by(DirectMessage.sent_at.asc()).all()

    # Mark peer messages as read
    for m in messages:
        if m.receiver_id == user_id and not m.is_read:
            m.is_read = True
    db.commit()

    results = []
    for m in messages:
        sender_cid = m.sender.career_id if m.sender else None
        results.append(DirectMessageOut(
            id=m.id,
            sender_id=m.sender_id,
            sender_name=sender_cid.full_name if sender_cid else "Peer",
            sender_handle=sender_cid.handle if sender_cid else "@peer",
            receiver_id=m.receiver_id,
            content=m.content,
            is_read=m.is_read,
            sent_at=m.sent_at
        ))
    return results


def send_direct_message(db: Session, sender_id: str, data: DirectMessageCreate) -> DirectMessageOut:
    """
    Send a direct message to a peer.
    """
    if sender_id == data.receiver_id:
        raise ValueError("Cannot send message to yourself.")

    msg = DirectMessage(
        sender_id=sender_id,
        receiver_id=data.receiver_id,
        content=data.content,
        is_read=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    sender_cid = msg.sender.career_id if msg.sender else None
    return DirectMessageOut(
        id=msg.id,
        sender_id=msg.sender_id,
        sender_name=sender_cid.full_name if sender_cid else "You",
        sender_handle=sender_cid.handle if sender_cid else "@you",
        receiver_id=msg.receiver_id,
        content=msg.content,
        is_read=msg.is_read,
        sent_at=msg.sent_at
    )


def get_study_groups(db: Session, current_user_id: str) -> List[StudyGroupOut]:
    """
    Get active study groups with member status for current user.
    """
    groups = db.query(StudyGroup).filter(StudyGroup.is_active == True).all()
    user_group_ids = set(
        r[0] for r in db.query(UserStudyGroup.group_id).filter(UserStudyGroup.user_id == current_user_id).all()
    )

    results = []
    for g in groups:
        creator_user = db.query(User).filter(User.id == g.created_by).first()
        creator_name = creator_user.career_id.full_name if (creator_user and creator_user.career_id) else "Campus Lead"
        
        results.append(StudyGroupOut(
            id=g.id,
            name=g.name,
            topic=g.topic,
            description=g.description,
            creator_name=creator_name,
            members_count=g.members_count or 1,
            is_member=g.id in user_group_ids,
            created_at=g.created_at
        ))
    return results


def create_study_group(db: Session, user_id: str, data: StudyGroupCreate) -> StudyGroupOut:
    """
    Create a new collaborative study group.
    """
    group = StudyGroup(
        name=data.name,
        topic=data.topic,
        description=data.description,
        created_by=user_id,
        members_count=1,
        is_active=True
    )
    db.add(group)
    db.flush()

    # Add creator as first member
    membership = UserStudyGroup(user_id=user_id, group_id=group.id)
    db.add(membership)
    
    # Award +30 XP for founding a study group
    cid = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    if cid:
        cid.xp_points = (cid.xp_points or 0) + 30

    db.commit()
    db.refresh(group)

    return StudyGroupOut(
        id=group.id,
        name=group.name,
        topic=group.topic,
        description=group.description,
        creator_name=cid.full_name if cid else "You",
        members_count=1,
        is_member=True,
        created_at=group.created_at
    )


def toggle_study_group_membership(db: Session, user_id: str, group_id: str) -> Dict[str, Any]:
    """
    Join or leave a study group.
    """
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise ValueError("Study group not found.")

    membership = db.query(UserStudyGroup).filter(
        UserStudyGroup.group_id == group_id,
        UserStudyGroup.user_id == user_id
    ).first()

    if membership:
        db.delete(membership)
        group.members_count = max(1, (group.members_count or 1) - 1)
        is_member = False
    else:
        new_member = UserStudyGroup(user_id=user_id, group_id=group_id)
        db.add(new_member)
        group.members_count = (group.members_count or 1) + 1
        is_member = True

    db.commit()
    return {"is_member": is_member, "members_count": group.members_count}


def get_community_stats(db: Session, user_id: str) -> CommunityStatsOut:
    """
    Aggregates community metrics for top banner.
    """
    total_posts = db.query(Post).count()
    active_discussions = db.query(Comment).count()
    groups_count = db.query(StudyGroup).filter(StudyGroup.is_active == True).count()
    mentors_count = db.query(User).filter(User.id != user_id).count()
    user_rep = calculate_reputation(db, user_id)
    user_conns = db.query(Connection).filter(
        or_(Connection.requester_id == user_id, Connection.recipient_id == user_id),
        Connection.status == "accepted"
    ).count()

    return CommunityStatsOut(
        total_posts=total_posts,
        active_discussions=active_discussions,
        study_groups_count=groups_count,
        active_mentors_count=mentors_count,
        user_reputation=user_rep,
        user_connections_count=user_conns
    )
