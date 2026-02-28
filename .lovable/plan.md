
The user wants the Platform Overview to render as a proper formal document — structured like a professional PDF-style business document with clear numbered sections, formal typography, a cover page, table of contents, section dividers, and document-style layout (not a marketing webpage with cards and gradients).

**What to change in `src/pages/PlatformOverview.tsx`:**

1. **Cover Page** — Full A4-style white cover with GHKonect logo, document title "GHKonect Business Platform — Full Product & Commercial Scope", version, date, confidentiality notice, and a thin ruled line separator

2. **Table of Contents** — Numbered list: 1. Executive Summary, 2. Platform Modules, 3. Business Dashboard, 4. Commercial Benefits, 5. Who It's For, 6. Subscription Plans & Feature Matrix

3. **Formal section headings** — Replace badge + hero text with numbered section headers (e.g. "Section 1 — Executive Summary"), ruled lines, serif-style document font weight

4. **Document typography** — Replace card grids with structured prose + bullet lists in a single-column document layout (max-w-4xl, centered, white background, no gradients)

5. **Feature modules** — Each module gets a sub-section number (2.1, 2.2, etc.) with a ruled sub-header and a clean bullet list (no colored icon cards)

6. **Dashboard section** — Rendered as a formal spec document with sub-sections (3.1 Header, 3.2 KPI Cards, 3.3 Quick Actions, etc.)

7. **Commercial section** — Formal table layout for tool consolidation, revenue streams table, ROI analysis paragraph

8. **Print styles** — Update PRINT_STYLES to match the document layout: single column, no card shadows, black text on white, proper A4 margins (2.5cm), page numbers via CSS counter

9. **Remove** all marketing-style CTA banners, hero gradients, and decorative backgrounds from the document body (keep floating download button)

**File to modify:** `src/pages/PlatformOverview.tsx` — full restructure of JSX layout and PRINT_STYLES constant
