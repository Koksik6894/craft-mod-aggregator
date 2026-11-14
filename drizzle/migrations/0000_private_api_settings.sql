CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, PRIMARY KEY(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_own_roles ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.api_credentials (provider text PRIMARY KEY CHECK (provider = 'curseforge'), encrypted_value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid NOT NULL);
GRANT ALL ON public.api_credentials TO service_role;
REVOKE ALL ON public.api_credentials FROM anon, authenticated;
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.assign_verified_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
IF NEW.email = 'krysztokdev@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN
INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
END IF;
RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.assign_verified_owner() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER assign_verified_owner AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_verified_owner();
INSERT INTO public.user_roles(user_id, role) SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'krysztokdev@gmail.com' AND email_confirmed_at IS NOT NULL ON CONFLICT DO NOTHING;