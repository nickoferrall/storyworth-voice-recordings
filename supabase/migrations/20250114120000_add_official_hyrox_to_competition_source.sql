-- Allow OFFICIAL_HYROX as a first-class source for competitions
alter table "public"."Competition" drop constraint if exists "chk_competition_source";

alter table "public"."Competition"
  add constraint "chk_competition_source"
  check (
    source = any (
      array['USER_CREATED', 'SCRAPED_ARETAS', 'SCRAPED_COMP_CORNER', 'OFFICIAL_HYROX']
    )
  );


