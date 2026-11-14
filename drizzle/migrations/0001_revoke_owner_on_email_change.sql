CREATE OR REPLACE FUNCTION public.assign_verified_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
IF NEW.email = 'krysztokdev@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN
INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
ELSE
DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin';
END IF;
RETURN NEW;
END $$;
CREATE TRIGGER revoke_owner_on_email_change AFTER UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_verified_owner();