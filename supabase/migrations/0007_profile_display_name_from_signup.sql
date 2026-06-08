-- Le profil reprend le pseudo (display_name) saisi à l'inscription email/mot de passe,
-- avec repli sur full_name/name (OAuth éventuel) puis le préfixe de l'email.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email,'@',1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- create or replace conserve les grants, mais on réaffirme le retrait par sécurité (advisor).
revoke execute on function public.handle_new_user() from anon, authenticated, public;
