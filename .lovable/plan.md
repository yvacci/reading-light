

# Multi-Tab UI Updates: Pioneer Sidebar, Daily Text, Bible Highlighting, and Home Layout

## Summary
This plan covers 6 areas: (1) Add "Pampatibay" encouragement verses and Quick Links to the Pioneer left sidebar, (2) Combine "Naka-iskedyul" and "Kailangang Dalawin" into one unified visits section with richer details, (3) Fix Daily Text (Teksto) tab fonts to use serif and consistent sizing with no dark bold colors, (4) Replace verse-number-tap highlighting in the Bible reader with touch-and-drag text selection, (5) Rearrange and clean up the Home tab layout with Pampatibay section, and (6) Unify all number/letter colors and font sizes across tabs.

---

## Changes

### 1. Pioneer Tab Left Sidebar -- Add Pampatibay and Quick Links
**File: `src/pages/PioneerPage.tsx`**

Add the `PIONEER_VERSES` array and `QUICK_LINKS` array (from ReferencePane) into PioneerPage. In the `StudiesVisitsPanel` or above it inside the left sidebar `<aside>`, insert:
- A "Pampatibay" card at the top showing a random encouragement verse (above Bible Studies)
- A "Mabilis na Link" section at the bottom with external links (WOL, JW.org, etc.)

### 2. Combine Scheduled and Needs-Visit Sections
**File: `src/pages/PioneerPage.tsx` (StudiesVisitsPanel)**

Merge "Kailangang Dalawin" and "Naka-iskedyul na Bisita" into one unified "Mga Bisita" section. Each entry will show:
- Name and type (BS/RV)
- Last visit log (most recent from `visitHistory`)
- Map link (address with MapPin icon)
- Next visit date/time
- Days since last visit

### 3. Daily Text Tab -- Serif Fonts and Consistent Sizing
**File: `src/pages/DailyTextPage.tsx`**

- Change the body content `fontFamily` from `'Inter', sans-serif` to `'Lora', Georgia, serif` (line 241)
- Change the title from `Playfair Display` to `Lora` for consistency (lines 176, 229)
- Change all `font-bold` and `font-semibold` on text/numbers to use `text-muted-foreground` instead of `text-foreground` (no dark colors for bold text)

### 4. Bible Reader -- Touch-and-Drag Text Selection for Highlighting
**File: `src/components/ChapterReader.tsx`**

- Remove the verse-number click handler that opens the action popup (lines 94-111)
- Re-enable native text selection by removing `user-select: none` override for bible-content
- Add a `selectionchange` / `mouseup` / `touchend` listener that detects selected text ranges
- When user selects text by dragging, extract the selected text and the verse number(s) it spans
- Open the `VerseActionPopup` at the selection position with the selected text for highlighting/bookmarking
- Keep existing highlight tap-to-edit behavior on `<mark>` elements

**File: `src/index.css`**
- Remove `-webkit-user-select: none; user-select: none;` from `.bible-content` to allow text selection

### 5. Home Tab -- Clean Layout with Pampatibay
**File: `src/pages/HomePage.tsx`**

- Add a "Pampatibay" encouragement card (same random verse from PIONEER_VERSES) above or below the Weekly Chart
- Use comfortable card sizes (`p-4`, `min-h-[80px]`) -- not too small
- Ensure all numbers use `text-sm text-muted-foreground` (not dark `text-foreground`)
- Ensure all labels use `text-xs text-muted-foreground`

### 6. Unified Color and Font Sizing
**Files: `PioneerPage.tsx`, `HomePage.tsx`, `DailyTextPage.tsx`**

- All numbers and bold text: use `text-muted-foreground` instead of `text-foreground` (no darker colors)
- All metric numbers: `text-sm font-bold text-muted-foreground`
- All labels: `text-xs text-muted-foreground`
- Serif font (Lora) enforced across all content areas

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/PioneerPage.tsx` | Add PIONEER_VERSES + QUICK_LINKS arrays, add Pampatibay card above StudiesVisitsPanel in sidebar, add Quick Links below, merge Kailangang Dalawin + Naka-iskedyul into unified "Mga Bisita" section with last log, map, next visit details. Change bold number colors from `text-foreground` to `text-muted-foreground`. |
| `src/pages/HomePage.tsx` | Add Pampatibay encouragement card. Change all `text-foreground` on numbers to `text-muted-foreground`. |
| `src/pages/DailyTextPage.tsx` | Change body font to Lora serif, title font to Lora, change bold text colors to `text-muted-foreground`. |
| `src/components/ChapterReader.tsx` | Remove verse-number click-to-highlight. Add touch-drag selection listener that detects selected text and opens VerseActionPopup for highlighting. |
| `src/index.css` | Remove `user-select: none` from `.bible-content` to enable native text selection for drag highlighting. |

### Bible Highlighting Flow (New)

```text
User touches and drags across text in Bible reader
        |
        v
selectionchange / touchend fires
        |
        v
Get window.getSelection() range and text
        |
        v
Find verse number(s) from closest [data-verse] ancestors
        |
        v
Open VerseActionPopup at selection position
        |
        v
User picks highlight color -> addHighlight() with selected text + verse range
```

