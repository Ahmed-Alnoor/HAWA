# HAWA
Hawa Landing Page

Single-file, bilingual (EN / AR, RTL) lead-generation landing page for **Hawa The Residences** by Al Marwan Developments,
Tilal City, Sharjah. Built on the same structure as the District 11 landing page: header with Call and Enquire, a first form
right after the intro, a Call + Enquire bar on phones and tablets, a form dialog that opens only when a visitor presses
a button (nothing pops up on its own), and a final form.
Motion runs on GSAP + ScrollTrigger and Lenis smooth scrolling, inlined in the file (GSAP Standard License, Lenis MIT).

- `index.html` is the whole page (HTML + CSS + JS inline, no frameworks).
- `assets/images/` holds every image the page uses (WebP only; nothing unused is kept).
- `assets/fonts/` holds the brand fonts as WOFF2, converted from the files at the repository root: Radikal UltraThin, Light, Medium
  and Bold, and Noto Kufi Arabic (variable, Arabic letters only). The page loads no fonts from outside.
- The uploaded source files (layers, renders, brochure PDFs) stay at the repository root and are not loaded by the page.

Open `index.html` directly, or host it together with the `assets/` folder. Arabic: add `?lang=ar` to the URL, or use the toggle.

## Design
- **Sky intro.** The page opens in the sky. Six layers (sky, three cloud bands, the building and the logo) each drift
  and react to scrolling at their own speed. On computers they also lean with the mouse. Scrolling rises through the clouds into a
  bright white mist, where the title *Live where the city BREATHES* appears letter by letter. The mist then warms into
  the light-brown page.
- **The rest of the page** sits on warm light-brown sand tones (no pure white). Type is the brand's Radikal: thin capitals
  for titles, light for text. Arabic uses Noto Kufi Arabic, also inside Radikal text.
- **Scroll effects on images.** The story images wipe up one after another inside a tall frame. *The Hawa Life* images sit on a curved
  ring that turns as you scroll. The courtyard scene opens to full screen. Feature photos are revealed behind a lifting curtain
  and drift inside their frames, and the images lean slightly with the scroll speed.
- Visitors who ask their device for reduced motion get a still version of every section. On phones the 3D card tilt and the
  scroll-speed lean are left out, because they jitter with touch scrolling.
- `CLOUDS (2).png` contains a faint dashed line (a leftover path outline). The page's copy `hero-cloud-c.webp` has it painted out;
  re-export the source without it if the layer is ever updated.

## Media map
| Where | Files |
| --- | --- |
| Sky intro layers | `hero-sky.webp`, `hero-building.webp`, `hero-cloud-a/b/c.webp` (each cloud band is the cloud plus its mirror, so it repeats without a seam) |
| Story 01–05 | `facade-front`, `courtyard-pool`, `living-room`, `bedroom-window`, `balcony-view` |
| The Hawa Life ring | `pool-sunset`, `lounge-gathering`, `pool-lane`, `dining`, `pool-cabana`, `bedroom-view`, `cycle-track`, `lounge-corner` |
| Courtyard scene | `pool-wide.webp` (wide screens), `pool-woman.webp` (upright screens) |
| Courtyards / retail | `pool-lounger`, `kids-splash`, `retail-promenade`, `garden-walk` |
| Residences | `plan-studio-a/b`, `plan-1br-a/b`, `plan-2br-a/b/c`, `plan-3br` (taken from the brochure) + photos `bedroom`, `living-room`, `lounge-gathering`, `dining` |
| Location | a live Google map of the District 11 Sales Office (see `mapQuery` / `mapLink` below) |
| Final form | `facade-golden.webp` |

To swap a picture, replace the file with one of the same name and shape. The residence types, layouts and room lists
are in the `UNITS` object in the script, and the ring's captions are the `data-title` attributes on its images.

## Go-live settings
Edit the `CONFIG` block near the top of the `<script>` in `index.html`:

| Key | What it does |
| --- | --- |
| `formEndpoint` | URL that receives leads (e.g. a Google Sheet web app). **Empty for now:** the page runs in demo mode and leads are **not saved** (they are logged in the browser console). |
| `phone` / `phoneDisplay` | Click-to-call number and how it is shown (800 61). |
| `whatsapp` | WhatsApp number, digits only (e.g. `9715XXXXXXXX`). WhatsApp buttons stay hidden until this is set. |
| `email` | Contact email (info@almarwandevelopments.com). |
| `metrikaId` | Yandex Metrika counter id, if a counter snippet is added to `<head>`. |
| `mapLink` | Where **Get directions** goes: the District 11 Sales Office in Google Maps (`https://maps.app.goo.gl/EmRhSJgA6nsAXPw8A`). |
| `mapQuery` | What the embedded map shows: `District 11 Sales Office, Sheikh Mohammed Bin Zayed Rd, Muwaileh Commercial, Sharjah`. Put coordinates here instead (e.g. `25.30,55.45`, copied from Google Maps) to pin the exact spot. |

Each lead is posted as form fields: `project`, `name`, `phone` (with country code), `country_code`, `email`, `buyer_type`
(home buyer / investor / broker), `unit` (Studio, 1, 2, 3 Bedroom or not sure yet), `form` (hero, modal, final),
`context` (e.g. `plans-2br-B`, `visit`, `price`), `plan_viewed`, `language`, `page`, `referrer`, `submitted_at`
and any UTM / gclid / fbclid values. The hidden `hawa_hp` field is a bot trap and should be ignored if filled.
The fields match the District 11 page, plus `unit` and `plan_viewed`, so the same Google Apps Script can be used with those two columns added.
A `generate_lead` event is pushed to `dataLayer` (GTM) and fired to gtag, Meta Pixel, Snap and TikTok if they are installed.
