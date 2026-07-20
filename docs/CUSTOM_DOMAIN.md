# Custom Domain Change

The organization Pages repository is designed to run without an Astro base path.

## Before the change

- Confirm the domain is controlled by the organizer.
- Record current DNS and GitHub Pages settings.
- Keep `RELEASE_APPROVED` unchanged while testing DNS.

## Change sequence

1. Add the required DNS records at the domain provider.
2. Set the custom domain in the GitHub Pages repository settings.
3. Set repository variable `CUSTOM_DOMAIN` to the domain name.
4. Change `PUBLIC_SITE_URL` to the final `https://` URL.
5. Add the domain to the Turnstile allowed-host list.
6. Update the Apps Script allowed origin setting.
7. Run the release workflow and verify HTTPS, canonical URLs, language links, the contact form, and certificate lookup.

The workflow writes `dist/CNAME` only when `CUSTOM_DOMAIN` is non-empty. No Astro
`base` setting should be added during this change.
