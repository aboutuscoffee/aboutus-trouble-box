import { useState } from 'react';
import PostForm from './components/PostForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import FaqList from './components/FaqList.jsx';

const TABS = [
  { key: 'post', label: '投稿する' },
  { key: 'dashboard', label: 'ダッシュボード' },
  { key: 'faq', label: 'みんなのFAQ' },
];

export default function App() {
  const [tab, setTab] = useState('post');

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-title">お悩みBOX</p>
        <p className="app-subtitle">接客で困ったことを共有・解決しよう</p>
      </header>

      <main className="tab-content">
        {tab === 'post' && <PostForm />}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'faq' && <FaqList />}
      </main>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
