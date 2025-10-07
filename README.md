# Secure Note Extension

A Chrome extension for saving encrypted notes tied to specific domains with a floating action button and popup interface.

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** in the top-right corner
4. Click **Load unpacked** and select the extension folder
5. The extension will appear in your browser toolbar

### Extension Files Structure

```
secure-note-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # Content script for FAB
├── background.js          # Service worker
├── styles.js              # CSS injection module
├── utils.js               # Utility functions
├── variables.css          # CSS design system
├── web-components.js      # Custom components
└── icon/
    └── icon.png           # Extension icon
```

## Features

✅ **Domain-Specific Notes** - Notes are automatically tied to the current website domain  
✅ **Floating Action Button (FAB)** - Quick note addition via floating button on any website  
✅ **Popup Interface** - View, add, edit, and delete notes through browser toolbar popup  
✅ **Local Storage** - Notes stored securely in Chrome's local storage  
✅ **Modern UI** - Professional glassmorphism design with CSS variables system  
✅ **Responsive Design** - Works on desktop and mobile viewports  
✅ **Accessibility** - Keyboard navigation and screen reader support  
✅ **Search & Export** - Find notes quickly and export data

## Encryption Approach

### Security Implementation

- **Base64 Encoding**: Notes are encoded using Base64 before storage for basic obfuscation
- **Domain Isolation**: Notes are automatically scoped to specific domains, preventing cross-site data access
- **Local Storage**: Data stored in Chrome's `chrome.storage.local` API, which is sandboxed per extension

### Technical Details

```javascript
// Encoding process
const encodedNote = btoa(unescape(encodeURIComponent(noteContent)));

// Decoding process
const decodedNote = decodeURIComponent(escape(atob(encodedNote)));
```

**⚠️ Security Note**: Base64 is **not cryptographically secure encryption** - it's obfuscation only. For production use, consider implementing AES encryption with proper key management.

## Architecture & Design Decisions

### Technology Stack

- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No external frameworks for minimal footprint
- **CSS Variables** - Centralized design system with 200+ variables
- **Modular Architecture** - Separated concerns across multiple files

### Key Design Decisions

1. **Domain-Based Storage** - Notes automatically tied to `window.location.hostname`
2. **FAB Pattern** - Familiar material design floating action button
3. **CSS-in-JS for Content Scripts** - Avoids CSP issues with injected styles
4. **Arrow Functions** - Modern ES6+ syntax throughout codebase
5. **Web Components** - Custom elements for reusable UI components

## Usage

### Getting Started

1. **Install the extension** following the installation instructions above
2. **Navigate to any website** (e.g., github.com, stackoverflow.com)
3. **Add a note** using one of these methods:
   - Click the floating "+" button (bottom-right corner)
   - Click the extension icon in the toolbar
4. **Type your note** in the textarea and click "Add Note"
5. **View notes** by opening the extension popup - shows all notes for current domain

### Interface Guide

**Floating Action Button (FAB)**

- Appears on all websites as a blue circular button
- Click to open quick note creation modal
- Positioned bottom-right, stays visible while scrolling

**Popup Interface**

- Access via extension icon in browser toolbar
- Shows domain-specific notes list
- Search functionality with real-time filtering
- Export notes as JSON for backup

**Note Management**

- ✏️ **Edit**: Click note content to expand/collapse
- 🗑️ **Delete**: Click delete button with confirmation
- 📋 **Copy**: Copy note content to clipboard
- 🔍 **Search**: Filter notes by content

## Known Limitations & Future Enhancements

### Current Limitations

⚠️ **Security**: Base64 encoding is not secure encryption - suitable for obfuscation only  
⚠️ **Sync**: Notes stored locally only, no cross-device synchronization  
⚠️ **Backup**: No automatic backup system (manual export available)  
⚠️ **Size Limits**: Limited by Chrome storage quota (~5MB for local storage)

### Potential Enhancements

🔮 **Security Improvements**

- Implement AES-256 encryption with user password
- Add password-protected note categories
- Secure note sharing between devices

🔮 **Feature Additions**

- Rich text editor with markdown support
- Note categories and tags system
- Advanced search with filters
- Automatic backup to cloud storage
- Note templates and quick snippets
- Keyboard shortcuts for power users

🔮 **UI/UX Improvements**

- Dark mode theme support
- Customizable FAB position
- Note sorting options (date, alphabetical)
- Drag-and-drop note organization

## Technical Requirements

### Browser Support

- **Chrome 90+** (Manifest V3 requirement)
- **Edge 90+** (Chromium-based)

### Permissions Used

- `storage` - Local note storage
- `activeTab` - Current domain detection
- `scripting` - Content script injection
- `tabs` - Tab management for domain context

### Development Dependencies

- No external libraries or frameworks
- Pure vanilla JavaScript (ES6+)
- Native Web APIs only
- CSS custom properties for theming

## Contributing

This extension uses modern web standards and follows Chrome extension best practices. The modular architecture makes it easy to extend functionality or customize the design system through CSS variables.

## License

MIT License - Feel free to use and modify for your projects.
