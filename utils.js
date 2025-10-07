/**
 * Utility functions for secure note operations.
 * @namespace secureNoteUtils
 */

/**
 * Encodes a string to Base64 format using UTF-8 encoding.
 * @function
 * @memberof secureNoteUtils
 * @param {string} plainText - The text to encode.
 * @returns {string} The Base64 encoded string.
 */

/**
 * Decodes a Base64 string to its original UTF-8 format.
 * @function
 * @memberof secureNoteUtils
 * @param {string} encodedText - The Base64 encoded string.
 * @returns {string} The decoded plain text.
 */

/**
 * Generates a unique identifier using the current timestamp and cryptographically secure random values.
 * @function
 * @memberof secureNoteUtils
 * @returns {string} A unique identifier string.
 */

/**
 * Formats a timestamp into a human-readable local date and time string.
 * @function
 * @memberof secureNoteUtils
 * @param {number|string|Date} timestamp - The timestamp to format.
 * @returns {string} The formatted date and time string.
 */

/**
 * Updates a note by domain and noteId with new content.
 * @function
 * @memberof secureNoteUtils
 * @param {string} domain - The domain of the note.
 * @param {string} noteId - The ID of the note to update.
 * @param {string} newContent - The new content for the note.
 * @returns {Promise<void>}
 */
window.secureNoteUtils = {
  encodeContent: (txt) => btoa(unescape(encodeURIComponent(txt))),
  decodeContent: (txt) => {
    try {
      return decodeURIComponent(escape(atob(txt)));
    } catch {
      return "[Corrupted note]";
    }
  },
  generateId: () =>
    Date.now().toString(36) +
    "-" +
    crypto.getRandomValues(new Uint32Array(2)).join(""),
  formatTimestamp: (ts) => new Date(ts).toLocaleString(),
  updateNote: async (domain, noteId, newContent) => {
    const stored = await chrome.storage.local.get("notesByDomain");
    const map = stored.notesByDomain || {};
    const notes = map[domain] || [];
    const noteIndex = notes.findIndex((n) => n.id === noteId);
    if (noteIndex !== -1) {
      notes[noteIndex].content =
        window.secureNoteUtils.encodeContent(newContent);
      notes[noteIndex].ts = Date.now();
      map[domain] = notes;
      await chrome.storage.local.set({ notesByDomain: map });
    }
  },
};
