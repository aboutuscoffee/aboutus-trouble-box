import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const FILTERS = ['未回答', '回答済み', '解決済み', 'すべて'];

const STATUS_CLASS = {
  未回答: 'status-unanswered',
  回答済み: 'status-answered',
  解決済み: 'status-resolved',
};

function stripeClass(post) {
  if (post.status === '解決済み') return 'resolved';
  if (post.urgency === '今困ってる') return 'urgent';
  return 'later';
}

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('未回答');
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trouble_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = filter === 'すべて' ? posts : posts.filter((p) => p.status === filter);

  const updatePost = (id, patch) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  return (
    <div>
      <div className="filter-row chip-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip${filter === f ? ' selected' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="empty-state">読み込み中…</p>}
      {!loading && visible.length === 0 && (
        <p className="empty-state">該当する投稿はありません</p>
      )}

      {!loading &&
        visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            expanded={expandedId === post.id}
            onToggle={() => setExpandedId(expandedId === post.id ? null : post.id)}
            onUpdate={(patch) => updatePost(post.id, patch)}
          />
        ))}
    </div>
  );
}

function PostCard({ post, expanded, onToggle, onUpdate }) {
  const [reply, setReply] = useState(post.reply || '');
  const [repliedBy, setRepliedBy] = useState(post.replied_by || '');
  const [saving, setSaving] = useState(false);

  const authorLabel = post.is_anonymous ? '匿名' : post.author_name || '記名';

  const handleAnswer = async () => {
    if (!reply.trim()) return;
    setSaving(true);
    const patch = {
      status: '回答済み',
      reply: reply.trim(),
      replied_by: repliedBy.trim() || null,
      replied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('trouble_posts').update(patch).eq('id', post.id);
    setSaving(false);
    if (!error) onUpdate(patch);
  };

  const handleResolve = async () => {
    setSaving(true);
    const patch = { status: '解決済み', updated_at: new Date().toISOString() };
    const { error } = await supabase.from('trouble_posts').update(patch).eq('id', post.id);
    setSaving(false);
    if (!error) onUpdate(patch);
  };

  const handleShareToggle = async (checked) => {
    onUpdate({ share_to_faq: checked });
    await supabase
      .from('trouble_posts')
      .update({ share_to_faq: checked, updated_at: new Date().toISOString() })
      .eq('id', post.id);
  };

  return (
    <div className="post-card">
      <div className={`post-card-stripe ${stripeClass(post)}`} />
      <div className="post-card-body">
        <div onClick={onToggle} style={{ cursor: 'pointer' }}>
          <div className="post-card-top">
            <span className="badge">{post.category}</span>
            <span className={`status-pill ${STATUS_CLASS[post.status]}`}>{post.status}</span>
          </div>
          <p className="post-author">{authorLabel}</p>
          <p className="post-body-text">{post.body}</p>
        </div>

        {post.reply && (
          <div className="reply-bubble">
            <p className="reply-bubble-author">
              {post.replied_by ? `${post.replied_by}より` : '回答'}
            </p>
            {post.reply}
          </div>
        )}

        {expanded && (
          <div className="reply-form">
            {post.status === '未回答' && (
              <>
                <textarea
                  className="textarea"
                  placeholder="回答を入力"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <input
                  type="text"
                  className="text-input"
                  placeholder="回答者"
                  value={repliedBy}
                  onChange={(e) => setRepliedBy(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-secondary filled"
                  disabled={saving}
                  onClick={handleAnswer}
                >
                  回答する
                </button>
              </>
            )}

            {post.status === '回答済み' && (
              <div className="reply-actions">
                <button
                  type="button"
                  className="btn-secondary filled"
                  disabled={saving}
                  onClick={handleResolve}
                >
                  解決済みにする
                </button>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={post.share_to_faq}
                    onChange={(e) => handleShareToggle(e.target.checked)}
                  />
                  みんなのFAQに公開する
                </label>
              </div>
            )}

            {post.status === '解決済み' && (
              <div className="reply-actions">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={post.share_to_faq}
                    onChange={(e) => handleShareToggle(e.target.checked)}
                  />
                  みんなのFAQに公開する
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
