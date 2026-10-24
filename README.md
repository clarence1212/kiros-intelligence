# Kiros Intelligence Group website (version 2)

A static site hosted on GitHub Pages. It has no server, database, cookies or analytics, and needs no build tools on the server.

## Structure

| Path | What it is |
|---|---|
| `index.html` | Home page |
| `methodology.html` | How the three frameworks connect |
| `ai-readiness-index.html` | Kiros AI Readiness & Value Index (K-ARVI), interactive |
| `agent-value-ledger.html` | Agent Value Ledger, with the adjustable calculator |
| `ai-delegation-map.html` | AI Delegation Map, controls, helper and Singapore guidance references |
| `services.html`, `services/*.html` | Six advisory services and one delivery service |
| `enterprise-assessment.html` | Flagship Enterprise AI Value Creation Assessment |
| `industries.html`, `industries/*.html` | Eight industry pages |
| `insights.html`, `briefs/*.html` | Research briefs |
| `about.html`, `people.html`, `capabilities/research.html`, `capabilities/ventures.html` | Firm pages |
| `contact.html`, `privacy.html` | Enquiry form and privacy notice |
| `assets/site.css` | All styles |
| `assets/js/` | Interactive tools (see below) |
| `sitemap.xml`, `robots.txt`, `404.html`, `CNAME` | Technical files |

Old addresses redirect: `approach.html` → `agent-value-ledger.html`; `capabilities.html` → `services.html`; `capabilities/strategy|transformation|governance.html` → the matching `services/` page.

GitHub Pages also serves each page without `.html`, so `/ai-readiness-index`, `/agent-value-ledger` and `/ai-delegation-map` work as clean URLs.

## Editing the assessment (K-ARVI)

All questions, weights and interpretation rules live in **`assets/js/kiros-index-config.js`**. Scoring logic is in `kiros-index-logic.js`, and the interface in `kiros-index-ui.js`. Normally only the config file needs to change.

- **Questions:** edit `questions`. Each has an `id`, a dimension (`dim`), the statement (`q`) and a short explanation (`help`). Keep the number of questions per dimension equal, so that each dimension is scored on the same basis.
- **Answer scale:** edit `scale`. Scores are averaged per dimension and converted to 0–100.
- **Dimension weights:** edit `weight` in `dimensions`. **They must add up to 1.** The composite is the weighted average of the dimension scores.
- **Maturity bands:** edit `bands` (provisional; not validated benchmarks).
- **Value pathways:** each pathway in `pathways` is a weighted average of specific answers (`parts`, question id → weight). **Weights in each pathway must add up to 1.** Pathways measure readiness to pursue value, not the value itself.
- **Priority actions:** edit `actions` by dimension. Up to two actions are shown for a dimension under 40, and one for a dimension from 40 to 59.
- **Sector context:** `industries` controls the sector list and the context line shown with results. It does not change any score.

If weights do not add up, the browser console shows a warning (`K-ARVI configuration: ...`).

## Editing the ledger calculator

Inputs, labels, defaults and limits live in **`assets/js/ledger-config.js`**. The calculation is in `ledger-model.js`, and the interface in `ledger-ui.js`.

The calculation:
- **Revenue benefit** = revenue in scope × uplift % × gross margin %. It is counted as gross profit, not revenue.
- **Cost benefit** = hours freed × cost per hour × share actually redeployed.
- **Risk benefit:** off by default, and included only when switched on.
- **Year 0:** minus the implementation cost.
- **Years 1 to N:** annual benefit × ramp-up minus the running cost. Ramp-up applies to year 1 only.
- **Working capital:** the one-off release is added once, in year 1. Its financing value is shown for reference only and is not added again.
- **Results:**
  - Net present value, discounted at the cost of capital.
  - Payback, interpolated within the year it occurs.

All defaults are hypothetical, and the page labels them as such.

## Editing site content

Page text is generated from `content2.py` by `build2.py` (kept in the build folder, not published). Run `python3 kig2-build/build2.py --github`, then copy the `kig2-site/` output to the repository.

## Enquiry form and privacy

The form validates the fields and then opens a pre-filled email to `consulting@kiros-intelligence.com`. Nothing is stored or sent by the site.

Spam protection has two parts:
- a hidden field that bots tend to fill;
- a minimum time on the page before the form can be submitted.

To switch to a form service later, replace the submit handler in `assets/js/site-ui.js`. Update `privacy.html` at the same time.

## Analytics and conversion events

No analytics are installed. The tools dispatch `kig:conversion` browser events (`karvi_start`, `karvi_complete`, `karvi_to_assessment`, `karvi_to_contact`, `delegation_helper_used`, `enquiry_submitted`), and these go nowhere by default.

If analytics are added later, listen for these events only after the visitor has given consent. Do not send assessment answers or form contents, and update the privacy notice.

## Content rules

- Do not add clients, testimonials, results, certifications or partnerships that cannot be verified.
- Label every worked example and scenario as hypothetical.
- Do not present readiness scores as estimates of return.
- Describe the network accurately: based in Asia-Pacific, with collaborators across the United States and Europe; no claimed offices.
- Keep the Singapore guidance references and their dates current. They were last checked in October 2026.
