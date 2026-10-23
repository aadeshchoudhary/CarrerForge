import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Award,
  FolderGit2,
  ExternalLink,
  Plus,
  CheckCircle2,
  Sparkles,
  Send,
  Users,
  ShieldCheck,
  Flame,
  HelpCircle,
  Briefcase,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { PostItem, CommunityStats } from '../types';

export const CommunityFeedPage: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Post Composer State
  const [showComposer, setShowComposer] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newTopic, setNewTopic] = useState<string>('Web Dev');
  const [newPostType, setNewPostType] = useState<string>('technical_tip');
  const [newProjectLink, setNewProjectLink] = useState<string>('');
  const [newPassportLink, setNewPassportLink] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [composerSuccess, setComposerSuccess] = useState<string | null>(null);

  // Active Commenting State: map of postId -> draft comment text
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const topics = ['All', 'Web Dev', 'AI & ML', 'Data Science', 'Internships', 'Projects', 'Interview Prep'];
  const postTypes = [
    { value: 'All', label: 'All Formats' },
    { value: 'milestone', label: '🏆 Milestone' },
    { value: 'project_showcase', label: '🚀 Project Showcase' },
    { value: 'technical_tip', label: '💡 Technical Tip' },
    { value: 'question', label: '❓ Question' },
    { value: 'collaboration', label: '🤝 Collaboration' },
  ];

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const [feedData, statsData] = await Promise.all([
        api.getCommunityFeed({
          topic: selectedTopic !== 'All' ? selectedTopic : undefined,
          post_type: selectedType !== 'All' ? selectedType : undefined,
        }),
        api.getCommunityStats(),
      ]);
      setPosts(feedData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedTopic, selectedType]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setSubmitting(true);
      const created = await api.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        topic: newTopic,
        post_type: newPostType,
        project_link: newProjectLink.trim() || undefined,
        passport_link: newPassportLink.trim() || undefined,
      });

      setPosts([created, ...posts]);
      setNewTitle('');
      setNewContent('');
      setNewProjectLink('');
      setNewPassportLink('');
      setComposerSuccess('Post published! +25 XP awarded for contributing to the community.');
      setShowComposer(false);
      setTimeout(() => setComposerSuccess(null), 5000);
      
      // Refresh stats
      const updatedStats = await api.getCommunityStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to publish post. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const hasLiked = !p.has_liked;
            const likes_count = hasLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
            return { ...p, has_liked: hasLiked, likes_count };
          }
          return p;
        })
      );
      await api.togglePostLike(postId);
    } catch (err) {
      console.error('Error toggling like:', err);
      fetchFeed(); // rollback on failure
    }
  };

  const toggleCommentsVisibility = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId: string) => {
    const draft = commentDrafts[postId]?.trim();
    if (!draft) return;

    try {
      setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
      const newComment = await api.addComment(postId, draft);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments_count: p.comments_count + 1,
              comments: [...p.comments, newComment],
            };
          }
          return p;
        })
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to submit comment.');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleToggleHelpful = async (postId: string, commentId: string) => {
    try {
      const updated = await api.toggleHelpfulComment(commentId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.map((c) => (c.id === commentId ? updated : c)),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Error toggling helpful comment:', err);
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case 'milestone':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300">🏆 Milestone</span>;
      case 'project_showcase':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-300">🚀 Showcase</span>;
      case 'technical_tip':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300">💡 Tech Tip</span>;
      case 'question':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border border-sky-300">❓ Question</span>;
      case 'collaboration':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-300">🤝 Collaborate</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Post</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Engagement Stats */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30">
                Phase 4: Community & Social Proof
              </span>
              <span className="bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Explainable Reputation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Professional Community & Feed
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Exchange technical insights, celebrate verified career milestones, and discuss interview strategies with peers and mentors.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-center px-2">
              <div className="text-xs text-indigo-200 font-medium flex items-center justify-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Posts
              </div>
              <div className="text-xl font-bold">{stats?.total_posts ?? '—'}</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xs text-indigo-200 font-medium flex items-center justify-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Comments
              </div>
              <div className="text-xl font-bold">{stats?.active_discussions ?? '—'}</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xs text-indigo-200 font-medium flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Peers
              </div>
              <div className="text-xl font-bold">{stats?.active_mentors_count ?? '—'}</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xs text-amber-300 font-medium flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Your Rep
              </div>
              <div className="text-xl font-bold text-amber-300">{stats?.user_reputation ?? '50'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {composerSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            {composerSuccess}
          </div>
        </div>
      )}

      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTopic === t
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Create Post Button & Format Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {postTypes.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowComposer(!showComposer)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Collapsible Post Composer */}
      {showComposer && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-indigo-100 dark:border-slate-700 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Publish a Technical Post or Milestone
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md">
              Earns +25 XP
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Post Title *
              </label>
              <input
                type="text"
                placeholder="e.g. How I improved my Docker build speed by 80%"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Topic *
                </label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Web Dev">Web Dev</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Internships">Internships</option>
                  <option value="Projects">Projects</option>
                  <option value="Interview Prep">Interview Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Format *
                </label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="technical_tip">💡 Technical Tip</option>
                  <option value="milestone">🏆 Milestone</option>
                  <option value="project_showcase">🚀 Project Showcase</option>
                  <option value="question">❓ Question</option>
                  <option value="collaboration">🤝 Collaboration</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Detailed Content (Markdown supported) *
            </label>
            <textarea
              rows={4}
              placeholder="Share step-by-step guidance, code snippet highlights, or placement interview insights..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Social Proof Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                Attach Verified GitHub Repo (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={newProjectLink}
                onChange={(e) => setNewProjectLink(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Attach Career Passport Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. /passport/verify/@alex_dev"
                value={newPassportLink}
                onChange={(e) => setNewPassportLink(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowComposer(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading verified community discussions...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">No discussions found in this topic</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Be the first to share a technical breakthrough, ask a placement question, or start a study collaboration!
          </p>
          <button
            onClick={() => setShowComposer(true)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700 transition-all hover:shadow-md"
            >
              {/* Header: Author + Post Type */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow">
                    {post.author_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {post.author_name}
                      </span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                        {post.author_handle}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
                        <Award className="w-2.5 h-2.5" />
                        {post.author_badges_count} badges
                      </span>
                    </div>
                    {post.author_headline && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {post.author_headline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {post.topic}
                  </span>
                  {getPostTypeBadge(post.post_type)}
                </div>
              </div>

              {/* Title & Body */}
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {post.title}
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4">
                {post.content}
              </div>

              {/* Verified Links Attachment Row */}
              {(post.project_link || post.passport_link) && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs">
                  {post.project_link && (
                    <a
                      href={post.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Verified GitHub Proof</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {post.passport_link && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Official Passport Credential</span>
                    </span>
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/80 pt-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                      post.has_liked
                        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.has_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}</span>
                  </button>

                  <button
                    onClick={() => toggleCommentsVisibility(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors font-medium"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>{post.comments_count} {post.comments_count === 1 ? 'Reply' : 'Replies'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Expandable Comments Thread */}
              {expandedComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-xl">
                  {/* List Comments */}
                  {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-2.5">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                            comment.is_helpful_answer
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {comment.author_name}
                              </span>
                              <span className="text-[11px] text-indigo-500 font-mono">
                                {comment.author_handle}
                              </span>
                              {comment.is_helpful_answer && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                                  <Sparkles className="w-3 h-3" /> Helpful Answer (+10 XP)
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleToggleHelpful(post.id, comment.id)}
                              title="Mark or unmark as helpful answer"
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                                comment.is_helpful_answer
                                  ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {comment.is_helpful_answer ? '★ Marked Helpful' : '☆ Mark Helpful'}
                            </button>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No replies yet. Share your experience or ask a follow-up!
                    </p>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write an insightful reply..."
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) =>
                        setCommentDrafts({ ...commentDrafts, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={submittingComment[post.id] || !commentDrafts[post.id]?.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
