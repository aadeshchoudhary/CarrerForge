import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Award,
  Send,
  Plus,
  BookOpen,
  Flame,
  CheckCircle2,
  Sparkles,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { PeerProfile, DirectMessageItem, StudyGroupItem } from '../types';

export const CareerConnectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'groups'>('directory');

  // Peer Directory State
  const [peers, setPeers] = useState<PeerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [loadingPeers, setLoadingPeers] = useState<boolean>(true);

  // Direct Message Drawer / Active Conversation State
  const [activeChatPeer, setActiveChatPeer] = useState<PeerProfile | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  // Study Groups State
  const [studyGroups, setStudyGroups] = useState<StudyGroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupTopic, setNewGroupTopic] = useState<string>('Web Dev');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [creatingGroup, setCreatingGroup] = useState<boolean>(false);

  // Reputation explanation modal
  const [showReputationModal, setShowReputationModal] = useState<boolean>(false);

  const skillsFilterList = ['All', 'React', 'FastAPI', 'Python', 'SQL', 'Docker', 'Machine Learning', 'Git'];

  const fetchPeers = async () => {
    try {
      setLoadingPeers(true);
      const data = await api.getPeers({
        skill: selectedSkillFilter !== 'All' ? selectedSkillFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setPeers(data);
    } catch (err) {
      console.error('Failed to load peers:', err);
    } finally {
      setLoadingPeers(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const data = await api.getStudyGroups();
      setStudyGroups(data);
    } catch (err) {
      console.error('Failed to load study groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchPeers();
  }, [selectedSkillFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'groups') {
      fetchGroups();
    }
  }, [activeTab]);

  const handleToggleConnect = async (peer: PeerProfile) => {
    try {
      // Optimistic update
      setPeers((prev) =>
        prev.map((p) => {
          if (p.user_id === peer.user_id) {
            const nextStatus = p.connection_status === 'connected' ? 'none' : 'connected';
            return { ...p, connection_status: nextStatus };
          }
          return p;
        })
      );
      await api.toggleConnect(peer.user_id);
    } catch (err) {
      console.error('Error toggling connection:', err);
      fetchPeers();
    }
  };

  const openChatWithPeer = async (peer: PeerProfile) => {
    setActiveChatPeer(peer);
    try {
      const history = await api.getDirectMessages(peer.user_id);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load message history:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatPeer || !newMessageText.trim()) return;

    try {
      setSendingMessage(true);
      const sent = await api.sendDirectMessage({
        receiver_id: activeChatPeer.user_id,
        content: newMessageText.trim(),
      });
      setMessages((prev) => [...prev, sent]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Could not deliver message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleGroupMembership = async (groupId: string) => {
    try {
      setStudyGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            const isJoining = !g.is_member;
            return {
              ...g,
              is_member: isJoining,
              members_count: isJoining ? g.members_count + 1 : Math.max(1, g.members_count - 1),
            };
          }
          return g;
        })
      );
      await api.toggleStudyGroupMembership(groupId);
    } catch (err) {
      console.error('Error updating study group membership:', err);
      fetchGroups();
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDesc.trim()) return;

    try {
      setCreatingGroup(true);
      const created = await api.createStudyGroup({
        name: newGroupName.trim(),
        topic: newGroupTopic,
        description: newGroupDesc.trim(),
      });
      setStudyGroups([created, ...studyGroups]);
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateGroup(false);
    } catch (err) {
      console.error('Error creating study group:', err);
      alert('Failed to create study group.');
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30">
                Phase 4: Peer Mentorship & Collaboration
              </span>
              <button
                onClick={() => setShowReputationModal(true)}
                className="bg-amber-500/30 text-amber-300 hover:bg-amber-500/40 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-400/30 transition-colors"
              >
                <Flame className="w-3.5 h-3.5" /> Explainable Reputation System
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Career Connect & Study Circles
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Connect with fellow students, find peer mentors with verified skill evidence, exchange direct messages, and join topic-based study groups.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Peer Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'groups'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Groups</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'directory' ? (
        <div className="space-y-4">
          {/* Search & Skill Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search peers by name, role, or @handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Skill Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Skills:</span>
              {skillsFilterList.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkillFilter(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSkillFilter === skill
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Peers Grid */}
          {loadingPeers ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Finding verified student peers...</p>
            </div>
          ) : peers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">No peers match your search</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try selecting "All" or typing a different role or skill query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {peers.map((peer) => (
                <div
                  key={peer.user_id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    {/* Top Row: Avatar + Handle + Reputation */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow">
                          {peer.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {peer.full_name}
                            </h3>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                              {peer.handle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {peer.target_role}
                          </p>
                        </div>
                      </div>

                      {/* Reputation Badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{peer.reputation_score} Rep</span>
                      </div>
                    </div>

                    {/* Headline / Bio */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                      {peer.headline}
                    </p>

                    {/* Verified Skills Pills */}
                    <div className="mb-4">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Verified Skills (Code Proof):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {peer.verified_skills && peer.verified_skills.length > 0 ? (
                          peer.verified_skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Portfolio in assessment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/80">
                    <button
                      onClick={() => handleToggleConnect(peer)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        peer.connection_status === 'connected'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {peer.connection_status === 'connected' ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => openChatWithPeer(peer)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Study Groups Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Collaborative Student Study Groups
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Join a circle of peers preparing for upcoming placement rounds, project reviews, or system design.
              </p>
            </div>
            <button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Found Study Group</span>
            </button>
          </div>

          {/* Create Group Form */}
          {showCreateGroup && (
            <form
              onSubmit={handleCreateGroup}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-indigo-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Found a New Peer Circle (+30 XP)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FastAPI & Microservices Architecture"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Topic *
                  </label>
                  <select
                    value={newGroupTopic}
                    onChange={(e) => setNewGroupTopic(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Web Dev">Web Dev</option>
                    <option value="Interview Prep">Interview Prep</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Internships">Internships</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Description & Goal *
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline meeting cadence, target milestones, and topics you will cover together..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow disabled:opacity-50"
                >
                  {creatingGroup ? 'Creating...' : 'Found Group'}
                </button>
              </div>
            </form>
          )}

          {/* Groups Grid */}
          {loadingGroups ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading collaborative study circles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {group.topic}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{group.members_count} Members</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {group.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/80 text-xs">
                    <span className="text-slate-400">Led by {group.creator_name}</span>
                    <button
                      onClick={() => handleToggleGroupMembership(group.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        group.is_member
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                      }`}
                    >
                      {group.is_member ? 'Joined ✓' : 'Join Circle'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Messaging Slide-Over / Modal */}
      {activeChatPeer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[520px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow">
                  {activeChatPeer.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {activeChatPeer.full_name}
                  </h4>
                  <p className="text-[11px] text-indigo-500 font-mono">
                    {activeChatPeer.handle} • {activeChatPeer.target_role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveChatPeer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Send a hello or ask for project feedback!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.receiver_id === activeChatPeer.user_id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                        {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessageText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Explainable Reputation System Modal */}
      {showReputationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Explainable Reputation Formula
                </h3>
              </div>
              <button
                onClick={() => setShowReputationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with our platform transparency standard, community reputation is calculated strictly from verified actions and genuine peer assistance:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Base Reputation</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">+50 points</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Helpful Answer in Community</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+10 points / answer</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Verified Skill (GitHub Proof)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">+15 points / skill</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Likes Earned on Technical Posts</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">+2 points / like</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Accepted Peer Connection</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">+5 points / connection</span>
              </div>
            </div>

            <button
              onClick={() => setShowReputationModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
