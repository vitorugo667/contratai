-- ContratAí — Setup do Supabase
-- Execute este SQL no editor do Supabase (supabase.com → seu projeto → SQL Editor)

-- 1. Tabela de dados do usuário (um registro por usuário)
create table if not exists user_data (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade unique not null,
  data        jsonb default '{}',
  updated_at  timestamptz default now()
);

-- 2. Row Level Security — cada usuário só acessa seus próprios dados
alter table user_data enable row level security;

create policy "Usuário acessa somente seus dados"
  on user_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. (Opcional) Índice para busca por user_id
create index if not exists user_data_user_id_idx on user_data(user_id);
