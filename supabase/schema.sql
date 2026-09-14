-- ============================================================================
-- De kapstok van de CAD-groep — databaseschema
-- ----------------------------------------------------------------------------
-- Voer dit bestand een keer uit in de SQL-editor van een Supabase-project.
-- Het script mag opnieuw worden uitgevoerd; bestaande gegevens blijven staan.
--
-- Wat het regelt:
--   * iedereen (zonder account) mag zinnen lezen, toevoegen en de TEKST van
--     een zin bewerken;
--   * niemand zonder account kan iets verwijderen of verbergen — dat is niet
--     alleen in de website uitgezet, maar ook in de database onmogelijk
--     gemaakt via kolomrechten;
--   * alleen een beheerder kan zinnen weghalen (archiveren), terugzetten,
--     definitief verwijderen en de namen van de haakjes wijzigen.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Beheerders
-- ----------------------------------------------------------------------------
-- Wie hierin staat, is beheerder. Je vult deze tabel handmatig: zie README.md,
-- stap 3. Via de API kan niemand zichzelf toevoegen.

create table if not exists public.beheerders (
  gebruiker_id  uuid primary key references auth.users (id) on delete cascade,
  toegevoegd_op timestamptz not null default now()
);

alter table public.beheerders enable row level security;

drop policy if exists "beheerder ziet eigen regel" on public.beheerders;
create policy "beheerder ziet eigen regel"
  on public.beheerders for select to authenticated
  using (gebruiker_id = auth.uid());

create or replace function public.is_beheerder() returns boolean
  language sql stable security definer set search_path = public, auth as $$
    select exists (
      select 1 from public.beheerders b where b.gebruiker_id = auth.uid()
    );
  $$;

-- ----------------------------------------------------------------------------
-- 2. De zes haakjes
-- ----------------------------------------------------------------------------

create table if not exists public.haken (
  id            smallint primary key check (id between 1 and 6),
  naam          text not null check (char_length(btrim(naam)) between 1 and 40),
  bijgewerkt_op timestamptz not null default now()
);

insert into public.haken (id, naam) values
  (1, 'Haakje 1'),
  (2, 'Haakje 2'),
  (3, 'Haakje 3'),
  (4, 'Haakje 4'),
  (5, 'Haakje 5'),
  (6, 'Haakje 6')
on conflict (id) do nothing;

alter table public.haken enable row level security;

drop policy if exists "haakjes zijn openbaar leesbaar" on public.haken;
create policy "haakjes zijn openbaar leesbaar"
  on public.haken for select to anon, authenticated
  using (true);

-- Hernoemen gebeurt uitsluitend via de functie hernoem_haak() hieronder,
-- dus er is geen update-policy voor de API-rollen.

-- ----------------------------------------------------------------------------
-- 3. De zinnen en woorden
-- ----------------------------------------------------------------------------

create table if not exists public.zinnen (
  id             uuid primary key default gen_random_uuid(),
  haak_id        smallint not null references public.haken (id),
  tekst          text not null check (char_length(btrim(tekst)) between 1 and 280),
  verborgen      boolean not null default false,
  aangemaakt_op  timestamptz not null default now(),
  bijgewerkt_op  timestamptz not null default now(),
  bewerkingen    integer not null default 0
);

create index if not exists zinnen_haak_zichtbaar_idx
  on public.zinnen (haak_id, aangemaakt_op)
  where not verborgen;

-- De administratie van een bewerking wordt door de database bijgehouden, niet
-- door de bezoeker: die mag alleen de kolom `tekst` aanraken.
create or replace function public.zin_bewerkt() returns trigger
  language plpgsql as $$
  begin
    if new.tekst is distinct from old.tekst then
      new.bijgewerkt_op := now();
      new.bewerkingen := old.bewerkingen + 1;
    end if;
    return new;
  end;
  $$;

drop trigger if exists zin_bewerkt_trigger on public.zinnen;
create trigger zin_bewerkt_trigger
  before update on public.zinnen
  for each row execute function public.zin_bewerkt();

alter table public.zinnen enable row level security;

drop policy if exists "zichtbare zinnen zijn openbaar" on public.zinnen;
create policy "zichtbare zinnen zijn openbaar"
  on public.zinnen for select to anon
  using (not verborgen);

drop policy if exists "beheerder ziet ook het archief" on public.zinnen;
create policy "beheerder ziet ook het archief"
  on public.zinnen for select to authenticated
  using (not verborgen or public.is_beheerder());

drop policy if exists "iedereen mag een zin toevoegen" on public.zinnen;
create policy "iedereen mag een zin toevoegen"
  on public.zinnen for insert to anon, authenticated
  with check (not verborgen);

drop policy if exists "iedereen mag zichtbare tekst bewerken" on public.zinnen;
create policy "iedereen mag zichtbare tekst bewerken"
  on public.zinnen for update to anon, authenticated
  using (not verborgen)
  with check (not verborgen);

-- Verwijderen: geen enkele policy, dus voor anon en authenticated onmogelijk.
-- De beheerder verwijdert via verwijder_zin_definitief() hieronder.

-- ----------------------------------------------------------------------------
-- 4. Kolomrechten: de harde grens tussen bewerken en verwijderen
-- ----------------------------------------------------------------------------
-- Policies bepalen WELKE rijen je mag raken, kolomrechten bepalen WELKE
-- kolommen. Samen zorgen ze ervoor dat een bezoeker met een zelfgemaakt
-- verzoek nog steeds alleen `tekst` kan wijzigen — niet `verborgen`, niet
-- `haak_id`, en niets kan verwijderen.

revoke all on public.zinnen from anon, authenticated;
revoke all on public.haken from anon, authenticated;

grant select              on public.haken  to anon, authenticated;
grant select              on public.zinnen to anon, authenticated;
grant insert (haak_id, tekst) on public.zinnen to anon, authenticated;
grant update (tekst)          on public.zinnen to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Beheerdersacties
-- ----------------------------------------------------------------------------
-- Elke functie controleert zelf of de aanroeper beheerder is, en weigert
-- anders. Ze draaien als eigenaar en omzeilen daarmee de kolomrechten van
-- stap 4 — precies de bedoeling, want alleen zo kan de beheerder wel meer.

create or replace function public.verberg_zin(p_id uuid, p_verborgen boolean)
  returns void language plpgsql security definer set search_path = public as $$
  begin
    if not public.is_beheerder() then
      raise exception 'Alleen een beheerder kan zinnen weghalen of terugzetten'
        using errcode = '42501';
    end if;
    update public.zinnen set verborgen = p_verborgen where id = p_id;
  end;
  $$;

create or replace function public.verwijder_zin_definitief(p_id uuid)
  returns void language plpgsql security definer set search_path = public as $$
  begin
    if not public.is_beheerder() then
      raise exception 'Alleen een beheerder kan zinnen definitief verwijderen'
        using errcode = '42501';
    end if;
    delete from public.zinnen where id = p_id;
  end;
  $$;

create or replace function public.hernoem_haak(p_id smallint, p_naam text)
  returns void language plpgsql security definer set search_path = public as $$
  begin
    if not public.is_beheerder() then
      raise exception 'Alleen een beheerder kan een haakje hernoemen'
        using errcode = '42501';
    end if;
    if char_length(btrim(p_naam)) not between 1 and 40 then
      raise exception 'Een haaknaam is 1 tot 40 tekens lang' using errcode = '22023';
    end if;
    update public.haken
       set naam = btrim(p_naam), bijgewerkt_op = now()
     where id = p_id;
  end;
  $$;

revoke all on function public.verberg_zin(uuid, boolean) from public, anon;
revoke all on function public.verwijder_zin_definitief(uuid) from public, anon;
revoke all on function public.hernoem_haak(smallint, text) from public, anon;
revoke all on function public.is_beheerder() from public, anon;

grant execute on function public.verberg_zin(uuid, boolean) to authenticated;
grant execute on function public.verwijder_zin_definitief(uuid) to authenticated;
grant execute on function public.hernoem_haak(smallint, text) to authenticated;
grant execute on function public.is_beheerder() to authenticated;
