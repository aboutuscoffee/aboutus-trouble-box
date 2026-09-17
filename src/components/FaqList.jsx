import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function FaqList() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('trouble_posts')
        .select('*')
        .eq('status', '解決済み')
        .eq('share_to_faq', true)
        .order('created_at', { ascending: false });
      setFaqs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="empty-state">読み込み中…</p>;

  if (faqs.length === 0) {
    return <p className="empty-state">まだ公開されているFAQはありません</p>;
  }

  return (
    <div>
      {faqs.map((f) => (
        <div key={f.id} className="faq-item">
          <span className="badge">
            {f.category === 'その他' && f.category_detail ? `その他：${f.category_detail}` : f.category}
          </span>
          <p className="faq-q">{f.body}</p>
          <div className="faq-a">{f.reply}</div>
        </div>
      ))}
    </div>
  );
}
