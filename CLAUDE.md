# Repository Instructions

`AGENTS.md` in this repository and `AGENTS.md` in the parent directory both apply in full. Read
them before working.

The rule below governs every change here and must not be missed.

## Local Review Before Publishing

Serve the built site locally and let the user review it before anything reaches GitHub. Commit,
push, open a pull request, merge and deploy only after they confirm. This is absolute, including for
a small change, a text-only change, or a change with no visible effect.

```bash
npm run build
npx astro preview --port 4321
```

- English: `http://localhost:4321/`
- Japanese: `http://localhost:4321/ja/`
- Check both languages, and check desktop `1440x900` and mobile `390x844`, before handing the URL
  over.
