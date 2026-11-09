-- trigger-only function: nobody needs to call it via the API
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_admin() is used inside RLS policies; move it out of the exposed API schema.
-- Policies reference the function by OID, so they keep working after the move.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;
