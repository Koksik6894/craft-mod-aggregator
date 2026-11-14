<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- API settings use authenticated server functions and a protected user_roles row; only the verified owner mailbox receives the role, never the first visitor or editable user metadata.
- Store replaceable API credentials encrypted with AES-GCM in a service-role-only table; never return ciphertext or plaintext to the browser, and keep encryption material in Cloud secrets.
- Sanitize external mod Markdown before rendering HTML so descriptions cannot execute scripts in the owner's session.
