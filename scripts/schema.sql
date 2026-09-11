create table if not exists trouble_posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('接客', '商品', 'オペレーション', 'その他')),
  is_anonymous boolean not null default true,
  author_name text,
  urgency text not null check (urgency in ('今困ってる', 'そのうち')),
  body text not null,
  status text not null default '未回答' check (status in ('未回答', '回答済み', '解決済み')),
  reply text,
  replied_by text,
  replied_at timestamptz,
  share_to_faq boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table trouble_posts enable row level security;

create policy "anon full access" on trouble_posts
  for all
  to anon
  using (true)
  with check (true);
