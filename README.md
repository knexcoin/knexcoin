# Lumero — Website

Marketing site for **KnexCoin (NEX)**, the velocity layer of the KnexCoin two-layer monetary system. Deployed at [knexcoin.com](https://www.knexcoin.com).

## Stack

Single-folder static site. No build step.

- HTML, CSS, vanilla JS (no framework)
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scroll
- [GSAP + ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — scroll-tied animations
- Hosted on **Cloudflare Pages** (project `lumero-site`)
- DNS + SSL via **Cloudflare** (apex + www)
- Analytics: Google Analytics 4 (`G-NHLYMQH3KV`) with Consent Mode v2
- Forms: [FormSubmit](https://formsubmit.co) → `david@knexmail.com`

## Pages

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` | Hero + manifesto + interactive sphere |
| `/architecture.html` | `architecture.html` | Two-layer system explainer |
| `/roadmap.html` | `roadmap.html` | 12-month phased plan |
| `/docs.html` | `docs.html` | Documentation index |
| `/network.html` | `network.html` | Testnet stats + validator tiers |
| `/latest.html` | `latest.html` | News / posts list |
| `/contact.html` | `contact.html` | Channels + contact form |
| `/privacy.html` | `privacy.html` | Privacy policy |
| `/terms.html` | `terms.html` | Terms of service |
| `/cookies.html` | `cookies.html` | Cookie controls |
| `/404.html` | `404.html` | Not found page |

Shared:

- `styles.css` — base palette, grid, nav, footer, prose, cookies banner
- `cookies-banner.js` — consent banner with Google Consent Mode v2 integration
- `knex-coin.svg`, `og-image.svg` / `og-image.png`, favicons
- `robots.txt`, `sitemap.xml`

## Deploy

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and a Cloudflare API token with `Account → Cloudflare Pages → Edit` and `Zone → DNS → Edit` on `knexcoin.com`.

```bash
# Stage clean output (excludes Dockerfile / nginx scaffolding)
mkdir -p dist
cp *.html *.css *.svg *.png *.js robots.txt sitemap.xml dist/

# Deploy
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=cfb39d5e60c943f66507f02fc1058ea3 \
wrangler pages deploy dist \
  --project-name=lumero-site \
  --branch=main \
  --commit-dirty=true
```

## Dockerfile / nginx config

`Dockerfile` and `nginx.conf.template` are remnants from an earlier Google Cloud Run deployment attempt. They are not used by the current Cloudflare Pages flow but are kept for reference if the site is ever moved off Pages.

## License

All code in this repository is proprietary. © 2026 Distributed Ledger Technologies, Inc. All rights reserved. See [`terms.html`](terms.html) for details.
