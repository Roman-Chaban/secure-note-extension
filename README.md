# Secure Note Extension

## Installation

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the folder containing this extension.

## Overview

Secure Note Extension allows you to save encrypted notes tied to specific domains.  
You can add notes via the floating button on any website or using the popup in the browser toolbar.

## Features

- Notes are domain-specific.
- Floating action button for quick note addition.
- Popup shows all notes for the current domain.
- Notes are stored locally using `chrome.storage.local`.
- Simple Base64 obfuscation for note content.

## Encryption Approach

- Base64 is used to obfuscate note content before saving.
- Note: Base64 is not cryptographically secure; it's only for basic obfuscation.

## Usage

1. Open any website.
2. Click the floating "+" button to add a new note for that domain.
3. Open the extension popup to view, add, or delete notes for the current domain.

## Known Limitations

- Base64 obfuscation is not secure encryption.
- Notes are stored locally and do not sync across devices.
- No advanced search or filtering implemented (can be added as an enhancement).

## Requirements

- Chrome (Manifest V3)
- Vanilla JavaScript (no frameworks)
- Pure CSS for styling
