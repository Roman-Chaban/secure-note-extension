// DOM elements for UI interaction
const domainNameElement = document.getElementById("domainName");
const notesListElement = document.getElementById("notesList");
const addNoteButton = document.getElementById("addNoteBtn");
const noteInputElement = document.getElementById("noteInput");

// Stores the currently active domain name
let activeDomainName = "";

/**
 * Wraps async functions to handle errors gracefully.
 * @param {Function} asyncFunction - The async function to wrap.
 * @returns {Function}
 */
const withAsyncErrorHandling =
  (asyncFunction) =>
  (...args) =>
    asyncFunction(...args).catch(console.error);

/**
 * Loads the current tab's domain and renders its notes.
 */
const loadActiveDomain = async () => {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!activeTab?.url) throw new Error("Active tab URL not found");
    const urlObject = new URL(activeTab.url);
    activeDomainName = urlObject.hostname;
    domainNameElement.textContent = activeDomainName;
    await renderDomainNotes();
  } catch (error) {
    domainNameElement.textContent = "Domain unavailable";
    notesListElement.textContent = "Failed to load notes.";
    console.error(error);
  }
};

/**
 * Retrieves notes for the current domain from storage.
 * @returns {Promise<Array>}
 */
const fetchNotesForDomain = async () => {
  const { notesByDomain = {} } = await chrome.storage.local.get(
    "notesByDomain"
  );
  return Array.isArray(notesByDomain[activeDomainName])
    ? notesByDomain[activeDomainName]
    : [];
};

/**
 * Saves a new note for the current domain.
 * @param {Object} note - The note object to save.
 */
const storeNoteForDomain = async (note) => {
  const { notesByDomain = {} } = await chrome.storage.local.get(
    "notesByDomain"
  );
  const domainNotes = Array.isArray(notesByDomain[activeDomainName])
    ? notesByDomain[activeDomainName]
    : [];
  domainNotes.unshift(note);
  notesByDomain[activeDomainName] = domainNotes;
  await chrome.storage.local.set({ notesByDomain });
};

/**
 * Updates an existing note for the current domain.
 * @param {string} noteId
 * @param {string} newContent
 */
const updateNoteForDomain = async (noteId, newContent) => {
  const { notesByDomain = {} } = await chrome.storage.local.get(
    "notesByDomain"
  );
  const notes = Array.isArray(notesByDomain[activeDomainName])
    ? notesByDomain[activeDomainName]
    : [];
  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex !== -1) {
    notes[noteIndex].content = encodeNoteContent(newContent);
    notes[noteIndex].ts = Date.now();
    notesByDomain[activeDomainName] = notes;
    await chrome.storage.local.set({ notesByDomain });
  }
};

/**
 * Encodes note content to base64 for safe storage.
 * @param {string} plainText
 * @returns {string}
 */
const encodeNoteContent = (plainText) =>
  btoa(unescape(encodeURIComponent(plainText)));

/**
 * Decodes base64 note content back to plain text.
 * @param {string} encodedText
 * @returns {string}
 */
const decodeNoteContent = (encodedText) => {
  try {
    return decodeURIComponent(escape(atob(encodedText)));
  } catch {
    return "[Corrupted note]";
  }
};

/**
 * Generates a unique identifier for each note.
 * @returns {string}
 */
const generateUniqueNoteId = () => {
  const randomValues = crypto.getRandomValues(new Uint32Array(2));
  return `${Date.now().toString(36)}-${randomValues[0].toString(
    16
  )}${randomValues[1].toString(16)}`;
};

/**
 * Formats a timestamp for display.
 * @param {number} timestamp
 * @returns {string}
 */
const formatNoteTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

/**
 * Renders all notes for the current domain in the UI.
 */
const renderDomainNotes = async () => {
  const notes = await fetchNotesForDomain();
  notesListElement.innerHTML = "";
  if (notes.length === 0) {
    notesListElement.textContent = "No notes yet.";
    return;
  }
  notes.forEach((note) => {
    const noteItemElement = document.createElement("div");
    noteItemElement.className = "secure-note-item";

    const metadataElement = document.createElement("div");
    metadataElement.className = "meta";
    metadataElement.textContent = formatNoteTimestamp(note.ts);

    const previewElement = document.createElement("div");
    previewElement.className = "preview";
    previewElement.textContent = decodeNoteContent(note.content);
    previewElement.style.cursor = "pointer";
    previewElement.title = "Click to edit";

    // Edit logic: click to edit note
    previewElement.addEventListener("click", () => {
      const textarea = document.createElement("textarea");
      textarea.className = "secure-note-textarea";
      textarea.value = decodeNoteContent(note.content);
      noteItemElement.replaceChild(textarea, previewElement);

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "secure-note-btn";
      saveBtn.addEventListener(
        "click",
        withAsyncErrorHandling(async () => {
          const newContent = textarea.value.trim();
          if (!newContent) {
            alert("Note cannot be empty.");
            return;
          }
          await updateNoteForDomain(note.id, newContent);
          await renderDomainNotes();
        })
      );

      noteItemElement.insertBefore(
        saveBtn,
        noteItemElement.querySelector(".delete-btn")
      );
    });

    const deleteButtonElement = document.createElement("button");
    deleteButtonElement.textContent = "Delete";
    deleteButtonElement.className = "delete-btn";
    deleteButtonElement.addEventListener(
      "click",
      withAsyncErrorHandling(async () => {
        const { notesByDomain = {} } = await chrome.storage.local.get(
          "notesByDomain"
        );
        notesByDomain[activeDomainName] = (
          notesByDomain[activeDomainName] || []
        ).filter((existingNote) => existingNote.id !== note.id);
        await chrome.storage.local.set({ notesByDomain });
        await renderDomainNotes();
      })
    );

    noteItemElement.append(
      metadataElement,
      previewElement,
      deleteButtonElement
    );
    notesListElement.appendChild(noteItemElement);
  });
};

// Handles adding a new note via the UI
addNoteButton.addEventListener(
  "click",
  withAsyncErrorHandling(async () => {
    const noteText = noteInputElement.value.trim();
    if (!noteText) {
      alert("Please enter a note.");
      return;
    }
    const newNote = {
      id: generateUniqueNoteId(),
      ts: Date.now(),
      content: encodeNoteContent(noteText),
    };
    await storeNoteForDomain(newNote);
    noteInputElement.value = "";
    await renderDomainNotes();
  })
);

// Initialize the popup by loading the current domain and its notes
withAsyncErrorHandling(loadActiveDomain)();
