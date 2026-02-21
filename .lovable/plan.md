

# Pioneer Tab Redesign

## What Changes

### 1. Remove the purple "Monthly Target" box
The progress bar section showing "Kabuuang Oras 0/50" with days logged (lines 442-462) will be deleted entirely from the Pioneer tab.

### 2. Restructure the layout
**Mobile (phone):** Single column stacking vertically:
- Calendar
- Ministry Overview (Yearly Goal + Monthly Goal)
- Form of Ministry
- Studies & Visits link button

**Tablet/Foldable (md+):** Two-column grid:
- Left sidebar (280px, sticky): StudiesVisitsPanel (Bible Studies, Return Visits, Needs Visit, Scheduled)
- Main column: Calendar, then Ministry Overview, then Form of Ministry, then Studies link -- all stacked vertically under the calendar

### 3. Unified number sizing
All numbers across Pioneer metrics and Home Ministry Summary will use `text-sm font-bold` (14px) consistently to match calendar day numbers.

### 4. Card and font sizing improvements
- Increase label text from `text-[10px]`/`text-[11px]` to `text-xs` (12px) for better readability
- Ensure card padding is comfortable (`p-4`) across all cards
- Keep serif font (Lora) consistent

---

## Technical Details

### File: `src/pages/PioneerPage.tsx`

| Section | Change |
|---------|--------|
| Lines 442-462 | Delete the "Monthly Target" section (purple progress box) |
| Lines 386-392 | Keep the left sidebar with StudiesVisitsPanel for `md:` screens |
| Lines 394-463 | Restructure main column: Calendar only (remove Monthly Target) |
| Lines 465-506 | Move CombinedMetricsCard and FormOfMinistry into the main column (under calendar), remove duplicate StudiesVisitsPanel from right column |
| Grid layout | Change from `md:grid-cols-[280px_1fr]` with 3 visual sections to clean 2-column: `md:grid-cols-[280px_1fr]` with sidebar + single main column |

### File: `src/pages/HomePage.tsx`
- Ensure Ministry Summary number sizes stay at `text-sm font-bold` consistently

