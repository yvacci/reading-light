

# Redesign: Pioneer, Home, Settings + New Classic Theme + Serif Fonts

## Summary
Comprehensive redesign of the Home, Pioneer, and Settings tabs with a modern, clean look. Add a new "Classic" theme with light colors and a black-and-white option. Force serif fonts (Lora) across all UI tabs. Update Pioneer "Form of Ministry" to remove priority percentages, remove Bible Study cards from Pioneer (keep only in Pagaaral at Pagdalaw), and unify number sizing across all tabs.

---

## Changes

### 1. Pioneer Tab -- Form of Ministry
- Remove the priority percentage before each label (e.g., remove "35%")
- Display only: `Field Service -- 0/50 -- 0%` (label, hours/target, progress percentage)
- Remove the Bible Study and Return Visit cards from the `CombinedMetricsCard` (Matagumpay na BS/RV rows). These remain visible only inside the Studies/Pagaaral at Pagdalaw page.
- Keep Yearly Goal and Monthly Goal in CombinedMetricsCard.

### 2. Unified Number Sizing
- All numbers across Ministry Summary (Home), Pioneer calendar, and Pioneer metrics will use a consistent `text-sm` (14px) size to match calendar day numbers.
- Remove oversized `text-lg` / `text-xl` number styles from Ministry Summary boxes and Pioneer metrics.

### 3. Home Tab Redesign
- Ministry Summary card: all 4 info boxes (Yearly Goal, Monthly Goal, BS, RV) use the same number size as calendar numbers (`text-sm font-bold`).
- Cleaner spacing, remove `ghibli-card` class references. Use plain `rounded-2xl border border-border bg-card`.

### 4. Settings Tab Redesign
- Keep current minimalist approach but ensure modern clean look: tighter spacing, consistent section padding.
- Add two new theme options: "Classic" and "Monochrome" (black and white).

### 5. New Themes
- **Classic**: Light warm colors (cream/beige base, navy text, muted blue primary). Clean and traditional look.
- **Monochrome**: Pure black and white only. Background white, foreground black, primary black, muted gray.
- Add both to `ThemeContext.tsx` THEME_OPTIONS and `themes.css`.

### 6. Force Serif Fonts Across All Tabs
- Change the base body font to `'Lora', Georgia, serif` (already set).
- Remove `font-family: 'Josefin Sans'` from `.bible-content` and `.daily-text-content` -- these will also use Lora serif.
- Keep `.app-title` and `.app-subheading` as Josefin Sans for display headings only.
- Update WeeklyChart axis font families from Josefin Sans to Lora.

### 7. Update Panes and Sidebars
- `ReaderSidebar.tsx` and `ReferencePane.tsx`: ensure consistent serif typography and updated number sizing to match the new design system.

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/styles/themes.css` | Add `.theme-classic` and `.theme-monochrome` with light/dark variants and background patterns |
| `src/contexts/ThemeContext.tsx` | Add `'classic'` and `'monochrome'` to `ThemeName` union type and `THEME_OPTIONS` array |
| `src/index.css` | Remove Josefin Sans from `.bible-content` and `.daily-text-content`. Keep Lora as base serif font. |
| `src/pages/PioneerPage.tsx` | Remove priority % from FormOfMinistry labels. Remove BS/RV cards from CombinedMetricsCard. Unify number sizes to `text-sm`. |
| `src/pages/HomePage.tsx` | Unify Ministry Summary box number sizes to `text-sm`. Clean up card styling. |
| `src/pages/SettingsPage.tsx` | Add Classic and Monochrome theme options with icons and preview colors. |
| `src/components/WeeklyChart.tsx` | Change axis fontFamily from Josefin Sans to Lora. |
| `src/components/ReaderSidebar.tsx` | Ensure consistent number sizing and serif fonts. |
| `src/components/ReferencePane.tsx` | Ensure consistent number sizing and serif fonts. |

### New Theme CSS Values (Classic)
- Light: cream background `40 40% 96%`, navy foreground `220 30% 18%`, muted blue primary `210 50% 45%`
- Dark: deep navy background `220 25% 12%`, light cream foreground `40 20% 88%`

### New Theme CSS Values (Monochrome)
- Light: pure white `0 0% 100%`, pure black foreground `0 0% 8%`, black primary `0 0% 15%`
- Dark: pure black `0 0% 5%`, white foreground `0 0% 95%`, white primary `0 0% 85%`

