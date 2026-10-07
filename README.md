# HAWA
Hawa Landing Page

Single-file, bilingual (EN / AR, RTL) lead-generation landing page for **Hawa Residence** (مساكن هواء) by Al Marwan Developments,
Tilal City, Sharjah: studio, 1 & 2 bedroom apartments from AED 592,000, 5% down payment, 1% monthly payments,
handover Q4 2028. Built on the same structure as the District 11 landing page. Motion runs on GSAP + ScrollTrigger and Lenis
smooth scrolling, inlined in the file (GSAP Standard License, Lenis MIT).

Open `index.html` directly, or host it together with the `assets/` folder. Those two are all a web host needs: `README.md` and `source/` stay in the repository. Arabic: add `?lang=ar` to the URL, or use the toggle.

## Folder
| Path | What it is |
| --- | --- |
| `index.html` | The whole page (HTML + CSS + JS inline, no frameworks). |
| `assets/images/` | Every image the page uses, as WebP (nothing unused is kept). |
| `assets/fonts/` | Radikal UltraThin, Light and Medium (Latin letters only) and Noto Kufi Arabic (Arabic letters only, weights 200–500), as WOFF2: only the weights and letters the page uses. The page loads no fonts from outside. |
| `source/` | The original material, not loaded by the page: `brochure/` (EN and AR PDFs), `fonts/` (Radikal OTF, Noto Kufi TTF), `hero-layers/` (sky, cloud and building layers), `logos/` (Hawa logos in English and Arabic, and the Arabic Al Marwan logo), `renders/` (all project renders, named by what they show). |

## Page, top to bottom
1. **Sky intro.** Six layers (sky, three cloud bands, the building and the logo) each drift and react to scrolling at their own speed.
   On computers they also lean with the mouse. Scrolling rises through the clouds into a warm white mist, where *Live where the city
   BREATHES* rises letter by letter. The Arabic page uses the Arabic logo.
2. **Offer + first form.** *Own your apartment today in Sharjah*: starting price, down payment, monthly payment and handover,
   then the project facts (268 apartments, 4 floors, 88,400 sq ft plot, 282 parking spaces).
3. **Story.** Five images wipe up one after another inside a tall frame.
4. **The Hawa Life.** Seven images on a curved ring that turns as you scroll.
5. **Courtyard scene**, **courtyards and retail**, **residences** (studio, 1 and 2 bedroom plans from the brochure),
   **in every residence**, **location** (the project map from the brochure, in Arabic on the Arabic page), **developer**, **final form**.
   On the Arabic page the layouts read أ / ب / ج, and the developer section shows the Arabic Al Marwan logo: its letters rise from right
   to left, the long stroke is written out, and the dot drops in and keeps floating gently.
6. **Footer.** The District 11 Sales Office with a live Google map and a *Get directions* link.

The header has **Call** and **Enquire**; phones and tablets get a Call + Enquire bar once the visitor is past the intro.
The form dialog opens only when a visitor presses a button: nothing pops up on its own.
Visitors who ask their device for reduced motion get a still version of every section. On phones the 3D card tilt and the
scroll-speed lean are left out, and every section is clipped at the screen edge, so the page cannot be dragged sideways.

Type is the brand's Radikal (UltraThin capitals for titles, Light for text) and Noto Kufi Arabic. Colours are the variables at the top
of the `<style>` (`:root`).

## Media map
| Where | Files in `assets/images/` |
| --- | --- |
| Sky intro | `hero-sky`, `hero-building`, `hero-cloud-a/b/c` (each cloud band is the cloud plus its mirror, so it repeats without a seam). `source/hero-layers/clouds-3.png` contains a faint dashed line (a leftover path outline); `hero-cloud-c` has it painted out. |
| Story 01–05 | `facade-front`, `courtyard-pool`, `living-room`, `bedroom-window`, `balcony-view` |
| The Hawa Life ring | `pool-sunset`, `lounge-gathering`, `dining`, `pool-cabana`, `bedroom-view`, `cycle-track`, `lounge-corner` |
| Courtyard scene | `pool-wide` (wide screens), `pool-woman` (upright screens) |
| Courtyards / retail | `pool-lounger`, `kids-splash`, `retail-promenade`, `garden-walk` |
| Residences | `plan-studio-a/b`, `plan-1br-a/b`, `plan-2br-a/b/c` + photos `bedroom`, `living-room`, `lounge-gathering` |
| Location | `location-map` (English) and `location-map-ar` (Arabic): the same square crop of each brochure's map. The Arabic brochure prints the road as "E611"; `location-map-ar` has it corrected to E61. The pulsing frame is `.map-pin` in the CSS. |
| Final form | `facade-golden` |

To swap a picture, replace the file with one of the same name and shape. Residence types, layouts and room lists are in the
`UNITS` object in the script; the ring's captions are the `data-title` attributes on its images.

## Go-live settings
Edit the `CONFIG` block near the top of the `<script>` in `index.html`:

| Key | What it does |
| --- | --- |
| `formEndpoint` | URL that receives leads (e.g. a Google Sheet web app). **Empty for now:** the page runs in demo mode: leads are **not saved** (they are logged in the browser console) and no lead goal is reported to Metrika or other analytics. |
| `phone` / `phoneDisplay` | Click-to-call number and how it is shown (800 61). |
| `whatsapp` | WhatsApp number, digits only (e.g. `9715XXXXXXXX`). WhatsApp buttons stay hidden until this is set. |
| `email` | Contact email (info@almarwandevelopments.com). |
| `metrikaId` | Yandex Metrika counter `113514133`. Its tag is in `<head>`. Leads reach the goal `lead`; Call, WhatsApp and email clicks reach `contact_call`, `contact_whatsapp` and `contact_email`. |
| `mapLink` | Where **Get directions** goes: the District 11 Sales Office in Google Maps. |
| `mapQuery` | What the footer map shows: `District 11 Sales Office, Sheikh Mohammed Bin Zayed Rd, Muwaileh Commercial, Sharjah`. Put coordinates here instead (e.g. `25.30,55.45`, copied from Google Maps) to pin the exact spot. |

Prices and payment terms appear in the offer section (`#offer` in the HTML) and, in Arabic, in the `of.*` lines of the `AR` object.

Each lead is posted as form fields: `project`, `name`, `phone` (one international number: a number typed with its own `+` or `00` keeps its code; otherwise the chosen code is added, and a leading 0 or a repeated code is dropped), `country_code`, `email`, `buyer_type`
(home buyer / investor / broker), `unit` (Studio, 1 Bedroom, 2 Bedroom or not sure yet), `form` (hero, modal, final),
`context` (e.g. `plans-2br-B`, `payment`, `visit`, `price`), `plan_viewed`, `language`, `page`, `referrer`, `submitted_at`
and any UTM / gclid / fbclid values. The hidden `hawa_hp` field is a bot trap and should be ignored if filled.
The fields match the District 11 page, plus `unit` and `plan_viewed`, so the same Google Apps Script can be used with those two columns added.
A `generate_lead` event is pushed to `dataLayer` (GTM) and fired to gtag, Meta Pixel, Snap and TikTok if they are installed.
