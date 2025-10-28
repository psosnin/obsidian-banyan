# Obsidian Banyan Plugin Simplification Plan

## Overview

This document outlines the changes needed to simplify the Obsidian Banyan plugin to focus on a card-based note display with topic buttons.

## Completed Changes

### 1. BanyanPluginSettings.ts

- ✅ Removed complex filtering settings (filter schemes, view schemes, random review)
- ✅ Removed organizational features (cardsDirectory, sorting, random browse)
- ✅ Added `topicButtons: TopicButton[]` - list of topic homepage buttons
- ✅ Added `featuredNotePath: string` - path to featured note for upper right panel
- ✅ Kept essential settings: openWhenStartObsidian, fontTheme, titleDisplayMode, cardContentMaxHeight
- ✅ Updated CUR_SETTINGS_VERSION to 7

### 2. BanyanSettingTab.tsx

- ✅ Created clean simplified version
- ✅ Added featured note path setting
- ✅ Added topic buttons management (add/edit/delete)
- ✅ Removed all complex filtering UI

### 3. useSettingsStore.ts

- ✅ Simplified to only essential update methods
- ✅ Added `updateTopicButtons` and `updateFeaturedNotePath` methods
- ✅ Removed filter/view/random review related methods

## Remaining Work

### 4. Simplify Store (src/store/)

**index.ts** - Remove complex stores:

- Remove FilterSchemeState, ViewSchemeState, RandomReviewState imports and usage
- Keep only: DashBoardState, SettingsState, BaseState
- Remove filter/view scheme initialization in setupPlugin

**useDashBoardStore.ts** - Simplify to basic note loading:

- Remove all filtering logic (date ranges, keywords, tag filters)
- Remove scheme/view concepts
- Add simple methods:
  - `loadNoteByPath(path: string)` - load a single note for display
  - `loadAllNotes()` - load all notes for stats
  - Keep `allFiles` for stats
  - Remove `curScheme`, `curSchemeFiles`, `displayFiles`
  - Remove `pinFile`, filtering methods

**Delete unused stores:**

- useFilterSchemeStore.ts
- useViewSchemeStore.ts
- useRandomReviewStore.ts

### 5. Simplify BanyanPlugin.ts

Remove:

- All random review setup (`setupRandomReview`, `resetRandomReview`)
- Add note ribbon icon setup (`setupCreateNoteRibbonBtn`, `addNoteRibbonIcon`)
- File creation command and related fileUtils usage
- Settings migration logic for old filter/view schemes

Keep:

- Basic plugin lifecycle (onload, onunload)
- View registration for CardDashboard
- Settings tab
- Open dashboard command and ribbon
- Store setup

### 6. Create New Simplified Components

**SimplifiedSidebar.tsx** (replace SideBarContent.tsx):

```tsx
<div className="sidebar-content-container">
  <StatisticsInfo /> {/* Keep as-is */}
  <Heatmap /> {/* Keep as-is */}
  <div className="sidebar-margin-top" />
  <TopicButtons /> {/* NEW: Render topic buttons from settings */}
</div>
```

**TopicButtons.tsx** (NEW component):

- Render buttons from `settings.topicButtons`
- On click, load the corresponding note into main view
- Highlight active topic

**FeaturedNoteCard.tsx** (NEW component):

- Display note from `settings.featuredNotePath`
- Use similar card styling as CardNote
- Fixed position in upper right

### 7. Simplified CardDashboard.tsx

New simplified layout:

```
┌─────────────┬──────────────────────────────┐
│             │  FeaturedNoteCard            │
│  Sidebar:   ├──────────────────────────────┤
│  - Stats    │                              │
│  - Heatmap  │                              │
│  - Topics   │    Main: TopicNoteCard       │
│             │    (single card view)        │
│             │                              │
│             │                              │
└─────────────┴──────────────────────────────┘
```

Remove:

- All filtering UI (HeaderView search/filters)
- AddNoteView
- Pagination logic
- Multiple columns layout
- Sort buttons
- Batch operations

Add:

- `selectedTopicPath` state
- Load note from `selectedTopicPath` when topic button clicked
- Load note from `featuredNotePath` for upper panel

### 8. Simplify/Remove Unused Components

**Remove entirely:**

- src/pages/header/ (HeaderView, AddNoteView, Searchbar)
- src/pages/sidebar/filterScheme/
- src/pages/sidebar/viewScheme/
- src/pages/sidebar/randomReview/
- src/components/TagInput.tsx
- src/components/TagFilterView.tsx
- src/components/MigrateTitleModal.tsx
- src/components/ConfirmModal.tsx

**Keep:**

- CardNote.tsx (for displaying notes)
- Icon.tsx
- Heatmap.tsx

### 9. Update fileUtils.ts

Remove:

- `addFile()` method
- Any file creation logic
- Tag filtering helpers

Keep:

- `getAllFiles()` - for stats
- `readCachedFileContent()` - for displaying notes
- Basic file watching

### 10. Clean up CSS

Remove styles for:

- Filter schemes UI
- View schemes UI
- Random review UI
- Add note UI
- Search bar
- Multiple columns

Keep/Update:

- Card styles
- Sidebar styles
- Heatmap styles
- Stats display

## Implementation Order

1. ✅ Update BanyanPluginSettings.ts
2. ✅ Update BanyanSettingTab.tsx
3. ✅ Update useSettingsStore.ts
4. ⏳ Delete unused store files
5. ⏳ Update useDashBoardStore.ts
6. ⏳ Update store/index.ts
7. ⏳ Create TopicButtons.tsx component
8. ⏳ Create FeaturedNoteCard.tsx component
9. ⏳ Create SimplifiedSidebar.tsx
10. ⏳ Rewrite CardDashboard.tsx
11. ⏳ Simplify BanyanPlugin.ts
12. ⏳ Update fileUtils.ts
13. ⏳ Delete unused components
14. ⏳ Update CSS files
15. ⏳ Test and debug

## Key Behavior

- **On startup:** Display default or first topic's note
- **Topic button click:** Load and display that topic's note in main area
- **Featured note:** Always displayed in upper right panel
- **Heatmap click:** Could load notes created on that date (optional feature to keep)
- **Stats:** Show total note count, tag count, days used

## Migration from Old Settings

When users upgrade, handle old settings gracefully:

- Ignore old `filterSchemes`, `viewSchemes`, `randomReviewFilters`
- Set `topicButtons` to empty array if undefined
- Set `featuredNotePath` to empty string if undefined
- Preserve `firstUseDate` for stats

## Testing Checklist

- [ ] Settings UI works (add/edit/delete topics, set featured note)
- [ ] Topic buttons display and are clickable
- [ ] Clicking topic button loads correct note
- [ ] Featured note displays correctly
- [ ] Stats display correctly (notes count, tags count, days used)
- [ ] Heatmap displays and is interactive
- [ ] Card rendering works (titles, content, styling)
- [ ] Plugin loads without errors
- [ ] Settings persist across restarts
