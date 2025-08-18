create table if not exists public.voice_story (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text,
  status text not null default 'created',
  provider text,
  provider_call_id text,
  audio_url text,
  transcript text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_voice_story_status on public.voice_story(status);
create index if not exists idx_voice_story_created_at on public.voice_story(created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_voice_story_updated_at on public.voice_story;
create trigger trg_voice_story_updated_at
before update on public.voice_story
for each row execute function public.set_updated_at();


