### Changelog

#### 1.3.0

New Features:

- Support for shuffled browsing: when enabled, notes will be displayed in a random order instead of by time.
- New note titles can now use the same timestamp format as the "Timestamp Note Generator" plugin.

Improvements:

- Tag input box: improved the style of the tag delete button.
- Card view (desktop): right-click context menu is now supported.
- Card view (mobile): added a new "Add Note" button at the bottom right for quick note creation.

Bug Fixes:

- Add Note Editor: the editor area will now be hidden if the placeholder file fails to load.
- Card view (desktop): fixed an issue where the note position would change unexpectedly during in-place editing.
- Card view (mobile): fixed an issue where cards were too narrow and visually unappealing when the content was too short.

#### 1.2.13​​

​​Improvements:​​
- ​​Search Bar​​ - The filter button now highlights when searching with additional filter conditions (beyond just keywords).
- ​​Tag Input Box​​ - Increased the size of tag delete buttons for better usability.
- ​​Card View​​ - Added support for displaying backlinks (can be enabled in settings).
- ​​Card View​​ - Introduced in-place editing functionality (available in settings, desktop-only feature).
	- Note: Requires "Show Inline Title" to be enabled for displaying and editing titles in card view.
- ​​Card View​​ - Added new title display option: files can now show their title property as the primary title.


​​Bug Fixes:​​
- ​​Settings​​ - Fixed issue where paths were being forced to lowercase.
	- Note: If your directory paths were incorrectly saved as all lowercase, you'll need to manually reconfigure them.
- Card View - Fixed issue where titles appeared too small on mobile.​​​
- Add Note Editor​​ - Fixed incorrect highlight state of confirmation button.
- ​​Add Note Editor​​ - Resolved unclickable editor area issue.
	- Background: This was reliably reproducible when the system path contained uppercase letters while settings showed lowercase paths. After fixing the lowercase path issue, this problem no longer occurs.
	- Workaround Added: A new "Add Note" button has been added to the sidebar as a fallback option in case users encounter unclickable areas but still need to create notes.