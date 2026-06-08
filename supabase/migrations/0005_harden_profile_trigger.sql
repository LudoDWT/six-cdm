-- Empêche l'appel direct de la fonction trigger via l'API REST (advisor sécurité).
-- Le trigger continue de fonctionner : son exécution ne dépend pas du privilège EXECUTE.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
