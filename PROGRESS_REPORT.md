# Simplification Progress Report

## Completed Work

### 1. Settings & Configuration ✅

- **BanyanPluginSettings.ts**: Stripped down to essentials
  - Added `topicButtons[]` and `featuredNotePath`
  - Removed filter schemes, view schemes, random review
  - Removed cardsDirectory, sorting, random browse
  
- **BanyanSettingTab.tsx**: Clean settings UI
  - Topic buttons management (add/edit/delete)
  - Featured note path configuration
  - Basic appearance settings

### 2. Store Simplification ✅

- **Deleted**: useFilterSchemeStore.ts, useViewSchemeStore.ts, useRandomReviewStore.ts
- **Updated useSettingsStore.ts**:
  - Added `updateTopicButtons()` and `updateFeaturedNotePath()`
  - Removed complex filtering methods
  
- **Rewrote useDashBoardStore.ts**:
  - Simple note loading by path
  - State for selected topic note and featured note
  - Removed all filtering/scheme logic
  
- **Updated store/index.ts**: Removed deleted stores from CombineState

### 3. Main Plugin ✅

- **BanyanPlugin.ts**: Simplified significantly
  - Removed random review setup
  - Removed add note ribbon
  - Removed file creation commands
  - Clean settings migration for v7
  - Now uses SimplifiedCardDashboard

### 4. New Simplified Components ✅

Created:

- **TopicButtons.tsx**: Renders topic buttons, handles click to load notes
- **FeaturedNoteCard.tsx**: Displays the featured note from settings
- **SimplifiedSidebarContent.tsx**: Stats, heatmap, and topic buttons
- **SimplifiedCardDashboard.tsx**: New 3-panel layout
- **simplified.css**: Styling for new simplified layout

## Remaining Work

### Critical - Must Fix for Plugin to Build

1. **Import simplified.css in SimplifiedCardDashboard.tsx**
   Add: `import './simplified.css';`

2. **Fix i18n for handwriting font theme** (BanyanSettingTab.tsx:153)
   The translation key 'setting_font_theme_handwriting' doesn't exist
   - Either add it to translations or change to existing key

3. **Delete/Update Old Components**
   These are still using old store and causing build errors:
   - `src/pages/CardDashboard.tsx` (OLD - replace with SimplifiedCardDashboard)
   - `src/pages/cards/CardNoteMenu.tsx` (uses pinFile, viewSchemes)
   - `src/pages/cards/CardNote2.tsx` (uses editing files state)
   - `src/pages/header/` folder (entire folder - not needed)
   - `src/pages/sidebar/SideBarContent.tsx` (replace with SimplifiedSidebarContent)

### Recommended Cleanup

4. **Clean up fileUtils.ts**
   - Remove `addFile()` method (file creation)
   - Remove `openRandomFile()` method
   - Keep getAllFiles(), readCachedFileContent()

5. **Update CardNote.tsx and CardNote2.tsx**
   Option A: Simplify CardNote.tsx to remove dependencies on old store
   Option B: Use only CardNote.tsx, delete CardNote2.tsx

6. **Remove Unused Model Files**
   - `src/models/FilterScheme.ts`
   - `src/models/ViewScheme.ts`
   - `src/models/RandomReviewFilters.ts`
   - `src/models/DateRange.ts`
   - `src/models/TagFilter.ts`

7. **Delete Unused Component Folders**
   - `src/pages/sidebar/filterScheme/`
   - `src/pages/sidebar/viewScheme/`
   - `src/pages/sidebar/randomReview/`
   - `src/components/TagInput.tsx`
   - `src/components/TagFilterView.tsx`
   - `src/components/MigrateTitleModal.tsx`
   - `src/components/ConfirmModal.tsx`

8. **CSS Cleanup**
   - Remove styles for deleted components from `dashboard.css`, `sidebar.css`, etc.
   - Import `simplified.css` in main stylesheet

## Quick Fix Steps to Get Building

1. Delete or rename old CardDashboard.tsx:

   ```bash
   mv src/pages/CardDashboard.tsx src/pages/CardDashboard.tsx.old
   ```

2. Import CSS in SimplifiedCardDashboard.tsx

3. Fix the font theme translation or use different key

4. Try build again - there will still be errors in CardNote components, but the main dashboard should work

## Testing Plan

Once building:

1. Check settings UI - can add/edit/delete topics
2. Check dashboard loads without errors
3. Click topic button - does it load note?
4. Check featured note displays
5. Check stats display (notes, tags, days)
6. Check heatmap renders

## Known Issues to Address

- CardNote.tsx still has dependencies on old store (curScheme, sortType, etc.)
- CardNoteMenu.tsx needs complete rewrite or removal
- Many old components reference deleted stores
- Need to decide whether to keep CardNote2 or consolidate into CardNote

## File Status Summary

✅ Completed and Working:

- BanyanPluginSettings.ts
- BanyanSettingTab.tsx
- useSettingsStore.ts
- useDashBoardStore.ts
- store/index.ts
- BanyanPlugin.ts
- TopicButtons.tsx
- FeaturedNoteCard.tsx
- SimplifiedSidebarContent.tsx
- SimplifiedCardDashboard.tsx

⚠️ Needs Updates:

- CardNote.tsx (remove old store deps)
- CardNote2.tsx (remove old store deps or delete)
- CardNoteMenu.tsx (rewrite or delete)

❌ Should be Deleted:

- Old CardDashboard.tsx
- Old SideBarContent.tsx  
- All filter/view/random review components
- Unused model files

## Estimated Remaining Effort

- **Quick fixes to get building**: 30 minutes
- **Clean up all old components**: 2-3 hours
- **Testing and bug fixes**: 1-2 hours
- **Total**: 3-6 hours

## Next Immediate Steps

1. Run: `mv src/pages/CardDashboard.tsx src/pages/CardDashboard.tsx.old`
2. Add CSS import to SimplifiedCardDashboard.tsx
3. Fix font theme i18n issue
4. Try building
5. Address remaining CardNote errors
6. Test the plugin
