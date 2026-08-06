# Repository Instructions

- Serve the built site locally and let the user review it before anything reaches GitHub. Commit,
  push, merge and deploy only after they confirm. This is absolute; see `Local Review Before
  Publishing` in the parent `AGENTS.md`.
- Do not add claims about a venue, jury, partner, history, audience, or prior winner without evidence and an approved source record.
- Keep English at `/` and Japanese at `/ja/` structurally aligned.
- Update `src/config/image-slots.json` before replacing an image.
- Never add API keys, access tokens, private email data, review notes, or applicant data.
- Run `npm run build` after content or code changes.
- Run `npm run build:release` only after all public settings and the operations attestation are complete.
