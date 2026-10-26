const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/community/feed
router.get('/feed', requireAuth, (req, res) => {
  const { topic, post_type } = req.query;
  let posts = [...store.data.posts];

  if (topic && topic !== 'all') {
    posts = posts.filter((p) => p.topic.toLowerCase() === topic.toLowerCase());
  }
  if (post_type && post_type !== 'all') {
    posts = posts.filter((p) => p.post_type === post_type);
  }

  return res.json(posts);
});

// POST /api/v1/community/posts
router.post('/posts', requireAuth, (req, res) => {
  const { title, content, topic, post_type, project_link, passport_link } = req.body;

  if (!title || !content) {
    return res.status(400).json({ detail: 'Post title and content are required' });
  }

  const profile = store.getCareerProfile(req.userId);
  const newPost = {
    id: 'post-' + uuidv4().slice(0, 8),
    user_id: req.userId,
    author_name: profile.full_name,
    author_handle: profile.handle,
    author_headline: profile.headline,
    author_badges_count: profile.badges_count || 4,
    title,
    content,
    topic: topic || 'General',
    post_type: post_type || 'technical_tip',
    project_link,
    passport_link,
    likes_count: 0,
    comments_count: 0,
    has_liked: false,
    created_at: new Date().toISOString(),
    comments: [],
  };

  store.data.posts.unshift(newPost);

  // Award +25 XP
  store.updateCareerProfile(req.userId, { xp_points: (profile.xp_points || 740) + 25 });

  return res.status(201).json(newPost);
});

// POST /api/v1/community/posts/:id/like
router.post('/posts/:id/like', requireAuth, (req, res) => {
  const post = store.data.posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ detail: 'Post not found' });
  }

  post.has_liked = !post.has_liked;
  post.likes_count = post.has_liked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1);

  return res.json({ has_liked: post.has_liked, likes_count: post.likes_count });
});

// POST /api/v1/community/posts/:id/comments
router.post('/posts/:id/comments', requireAuth, (req, res) => {
  const post = store.data.posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ detail: 'Post not found' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ detail: 'Comment content is required' });
  }

  const profile = store.getCareerProfile(req.userId);
  const newComment = {
    id: 'c-' + uuidv4().slice(0, 8),
    post_id: post.id,
    user_id: req.userId,
    author_name: profile.full_name,
    author_handle: profile.handle,
    content,
    is_helpful_answer: false,
    created_at: new Date().toISOString(),
  };

  post.comments = post.comments || [];
  post.comments.push(newComment);
  post.comments_count = post.comments.length;

  return res.status(201).json(newComment);
});

// POST /api/v1/community/comments/:id/helpful
router.post('/comments/:id/helpful', requireAuth, (req, res) => {
  let target = null;
  store.data.posts.forEach((p) => {
    (p.comments || []).forEach((c) => {
      if (c.id === req.params.id) {
        c.is_helpful_answer = !c.is_helpful_answer;
        target = c;
      }
    });
  });

  if (!target) {
    return res.status(404).json({ detail: 'Comment not found' });
  }

  return res.json(target);
});

// GET /api/v1/community/peers
router.get('/peers', requireAuth, (req, res) => {
  const { skill, search } = req.query;
  let peers = [...store.data.peers];

  if (skill && skill !== 'All') {
    peers = peers.filter((p) => p.verified_skills.some((s) => s.toLowerCase() === skill.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    peers = peers.filter((p) => p.full_name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q) || p.headline.toLowerCase().includes(q));
  }

  return res.json(peers);
});

// POST /api/v1/community/peers/:id/connect
router.post('/peers/:id/connect', requireAuth, (req, res) => {
  const peer = store.data.peers.find((p) => p.user_id === req.params.id);
  if (!peer) {
    return res.status(404).json({ detail: 'Peer not found' });
  }

  peer.connection_status = peer.connection_status === 'connected' ? 'none' : 'connected';

  return res.json({
    status: peer.connection_status,
    message: peer.connection_status === 'connected' ? 'Connected successfully!' : 'Disconnected',
  });
});

// GET /api/v1/community/messages/:id
router.get('/messages/:id', requireAuth, (req, res) => {
  const history = store.data.messages[req.params.id] || [];
  return res.json(history);
});

// POST /api/v1/community/messages
router.post('/messages', requireAuth, (req, res) => {
  const { receiver_id, content } = req.body;
  if (!receiver_id || !content) {
    return res.status(400).json({ detail: 'receiver_id and content are required' });
  }

  const profile = store.getCareerProfile(req.userId);
  const newMsg = {
    id: 'dm-' + uuidv4().slice(0, 8),
    sender_id: req.userId,
    sender_name: profile.full_name,
    sender_handle: profile.handle,
    receiver_id,
    content,
    is_read: false,
    sent_at: new Date().toISOString(),
  };

  if (!store.data.messages[receiver_id]) {
    store.data.messages[receiver_id] = [];
  }
  store.data.messages[receiver_id].push(newMsg);

  return res.status(201).json(newMsg);
});

// GET /api/v1/community/groups
router.get('/groups', requireAuth, (req, res) => {
  return res.json(store.data.study_groups);
});

// POST /api/v1/community/groups
router.post('/groups', requireAuth, (req, res) => {
  const { name, topic, description } = req.body;
  if (!name || !topic) {
    return res.status(400).json({ detail: 'Group name and topic are required' });
  }

  const profile = store.getCareerProfile(req.userId);
  const newGroup = {
    id: 'g-' + uuidv4().slice(0, 8),
    name,
    topic,
    description: description || '',
    creator_name: profile.full_name,
    members_count: 1,
    is_member: true,
    created_at: new Date().toISOString().split('T')[0],
  };

  store.data.study_groups.unshift(newGroup);
  return res.status(201).json(newGroup);
});

// POST /api/v1/community/groups/:id/toggle-join
router.post('/groups/:id/toggle-join', requireAuth, (req, res) => {
  const group = store.data.study_groups.find((g) => g.id === req.params.id);
  if (!group) {
    return res.status(404).json({ detail: 'Study group not found' });
  }

  group.is_member = !group.is_member;
  group.members_count = group.is_member ? group.members_count + 1 : Math.max(1, group.members_count - 1);

  return res.json({ is_member: group.is_member, members_count: group.members_count });
});

// GET /api/v1/community/stats
router.get('/stats', requireAuth, (req, res) => {
  return res.json({
    total_posts: store.data.posts.length,
    active_discussions: store.data.posts.length + 4,
    study_groups_count: store.data.study_groups.length,
    active_mentors_count: 8,
    user_reputation: 185,
    user_connections_count: 14,
  });
});

module.exports = router;
