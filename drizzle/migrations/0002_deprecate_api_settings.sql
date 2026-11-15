COMMENT ON TABLE public.api_credentials IS 'DEPRECATED: owner panel removed; runtime uses server-side Cloud secret only';
COMMENT ON TABLE public.user_roles IS 'DEPRECATED: owner panel removed';
REVOKE SELECT ON public.user_roles FROM authenticated;
DROP TRIGGER IF EXISTS assign_verified_owner ON auth.users;
DROP TRIGGER IF EXISTS revoke_owner_on_email_change ON auth.users;