import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

const CATEGORIES = ['接客', '商品', 'オペレーション', 'その他'];
const URGENCIES = ['今困ってる', 'そのうち'];

export default function PostForm() {
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [urgency, setUrgency] = useState('今困ってる');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const resetForm = () => {
    setCategory('');
    setIsAnonymous(true);
    setAuthorName('');
    setUrgency('今困ってる');
    setBody('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConfirmed(false);
    setError('');

    if (!category) {
      setError('カテゴリを選んでください');
      return;
    }
    if (!body.trim()) {
      setError('困っていることを入力してください');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from('trouble_posts').insert({
      category,
      is_anonymous: isAnonymous,
      author_name: isAnonymous ? null : authorName.trim() || null,
      urgency,
      body: body.trim(),
    });
    setSubmitting(false);

    if (insertError) {
      setError('送信に失敗しました。もう一度お試しください。');
      return;
    }

    resetForm();
    setConfirmed(true);
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <p className="field-label">カテゴリ</p>
        <div className="chip-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${category === c ? ' selected' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <p className="field-label">投稿方法</p>
        <div className="segmented">
          <button
            type="button"
            className={`segmented-btn${isAnonymous ? ' selected' : ''}`}
            onClick={() => setIsAnonymous(true)}
          >
            匿名
          </button>
          <button
            type="button"
            className={`segmented-btn${!isAnonymous ? ' selected' : ''}`}
            onClick={() => setIsAnonymous(false)}
          >
            記名
          </button>
        </div>
        {!isAnonymous && (
          <input
            type="text"
            className="text-input"
            placeholder="お名前"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        )}
      </div>

      <div className="form-group">
        <p className="field-label">緊急度</p>
        <div className="segmented compact">
          {URGENCIES.map((u) => (
            <button
              key={u}
              type="button"
              className={`segmented-btn${urgency === u ? ' selected' : ''}`}
              onClick={() => setUrgency(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ flex: 1 }}>
        <p className="field-label">困っていること</p>
        <textarea
          className="textarea"
          placeholder="困っていることを書いてください"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {error && <p className="error-line">{error}</p>}
      {confirmed && <p className="confirm-line">送信しました。ありがとうございます。</p>}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? '送信中…' : '送信する'}
      </button>
    </form>
  );
}
