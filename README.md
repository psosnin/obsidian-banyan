# Banyan - Obsidian Note Navigator

English | [简体中文](./README_zh.md)

> A powerful Obsidian note management and navigation plugin

## Introduction

Banyan is an Obsidian note management and navigation plugin that helps you efficiently browse and manage your Obsidian notes.
Through an intuitive card view interface, you can quickly access and operate notes in a single panel.
The plugin supports multi-dimensional filtering functions, allowing you to filter notes through tag combinations, keyword searches, creation dates, and other conditions, and save commonly used filtering rules for quick access later.
In addition, Banyan also provides multiple view modes, heat map statistics display, and other features, making your note management experience more flexible, intuitive, and efficient.

## Core Features

### Card Panel

- **Card-style Note View**: Display note content in an aesthetically pleasing and intuitive card format
- **Smart Layout**: Support single/double column layouts, automatically optimizing display effects based on panel width
- **Rich Operations**: Support quick opening, deleting, pinning notes, and copying note links

### Advanced Filtering

- **Tag Filtering**: Precisely filter notes through tag combinations, supporting both inclusion and exclusion of tags
- **Time Filtering**: Filter by note creation date range
- **Content Search**: Search for keywords in note content

### Filter Plans and View Management

- **Filter Plans**: Set up combinations of commonly used filtering conditions
- **Custom Views**: Create and save personalized note collections

### Auxiliary Functions

- **Heat Map Statistics**: Intuitively display the distribution of note creation times
- **Random Review**: Unlike Obsidian's built-in "Random Note" which doesn't support setting a scope, this plugin supports limiting the scope with multiple tags for better random note review.

## Installation Guide

### Install from Obsidian Community Plugin Library

1. Open Obsidian settings panel
2. Go to "Third-party plugins" option
3. Turn off "Safe mode"
4. Click "Browse", search for "Banyan"
5. Click install and enable the plugin

### Manual Installation

1. Download the latest version of the release package
2. Extract the files, copy the resulting `banyan/` directory to your Obsidian vault's `.obsidian/plugins/` directory
3. Restart Obsidian and enable the plugin in settings

## Usage Guide

### Basic Operations

- **Open Note Panel**: Click the "Card" icon in the left sidebar, or execute the "Open Note Panel" command through the command palette
- **Add Card Note**: Click the "Bulb" icon in the left sidebar, or execute the "Add Card Note" command through the command palette
- **Open Random Note**: Click the "Dice" icon in the left sidebar, or execute the "Open Random Note" command through the command palette

### Card Operations

Right-click on a card to perform the following operations:
- Open note
- Add to view/Remove from current view
- Pin/Unpin
- Copy link
- Delete note

### Filter Notes

1. In the note panel, use the filtering options in the left sidebar
2. You can precisely filter through tag combinations, date ranges, and other conditions
3. Save commonly used filtering conditions as filter plans for quick access

### View Management

1. In the note panel, switch to the "View" tab
2. Create a new view and add the required notes
3. Switch freely between different views

## Configuration Options

In the plugin settings panel, you can customize the following options:

- **Note Directory**: Set the default note directory displayed in the card panel
- **Auto-open on Startup**: When enabled, the note panel will automatically open when Obsidian starts
- **Display Columns**: Set the number of note display columns in the card panel (1 column or 2 columns)
- **Random Note Scope**: Set tag filtering conditions for the random note function

## Contributing

Welcome to submit issue reports and feature suggestions! If you want to contribute code to the project, feel free to submit a Pull Request.

## License

This project is licensed under the GPLv3 License. See the [LICENSE](LICENSE) file for details.