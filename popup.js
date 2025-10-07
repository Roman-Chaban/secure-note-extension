// DOM elements for UI interaction
const domainNameElement = document.getElementById("domainName");
const notesListElement = document.getElementById("notesList");
const addNoteButton = document.getElementById("addNoteBtn");
const noteInputElement = document.getElementById("noteInput");
const searchInputElement = document.getElementById("searchInput");
const exportButtonElement = document.getElementById("exportBtn");

// Stores the currently active domain name and all notes
let activeDomainName = "";
let allNotes = [];

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
  allNotes = notes; // Store all notes for search functionality
  displayNotes(notes);
};

/**
 * Displays notes in the UI (used by both render and filter functions)
 */
const displayNotes = (notes) => {
  notesListElement.innerHTML = "";

  if (notes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = searchInputElement?.value?.trim()
      ? "No notes match your search."
      : "No notes yet. Add your first note!";
    notesListElement.appendChild(emptyState);
    return;
  }

  notes.forEach((note) => {
    const noteItem = document.createElement("div");
    noteItem.className = "note-item";

    // Note header with timestamp and delete button
    const noteHeader = document.createElement("div");
    noteHeader.className = "note-header";

    const timestamp = document.createElement("div");
    timestamp.className = "note-timestamp";
    timestamp.textContent = formatNoteTimestamp(note.ts);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "note-delete";
    deleteBtn.addEventListener(
      "click",
      withAsyncErrorHandling(async () => {
        if (!confirm("Delete this note?")) return;
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

    noteHeader.appendChild(timestamp);
    noteHeader.appendChild(deleteBtn);

    // Note content
    const content = document.createElement("div");
    content.className = "note-content";
    content.textContent = decodeNoteContent(note.content);
    content.style.cursor = "pointer";
    content.title = "Click to edit";

    // Edit functionality
    content.addEventListener("click", () => {
      const textarea = document.createElement("textarea");
      textarea.className = "note-textarea";
      textarea.value = decodeNoteContent(note.content);

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "add-note-btn";
      saveBtn.style.marginTop = "8px";

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

      noteItem.replaceChild(textarea, content);
      noteItem.appendChild(saveBtn);
    });

    noteItem.appendChild(noteHeader);
    noteItem.appendChild(content);
    notesListElement.appendChild(noteItem);
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
    addNoteButton.disabled = true; // Disable button after adding
    await renderDomainNotes();
  })
);

// Enable/disable add button based on input content
noteInputElement.addEventListener("input", () => {
  const hasContent = noteInputElement.value.trim().length > 0;
  addNoteButton.disabled = !hasContent;
});

// Enable add note on Enter key
noteInputElement.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    if (!addNoteButton.disabled) {
      addNoteButton.click();
    }
  }
});

// Search functionality
searchInputElement?.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();

  console.log("Search input changed:", searchTerm);

  if (!searchTerm) {
    displayNotes(allNotes);
    return;
  }

  const filteredNotes = allNotes.filter((note) => {
    const content = decodeNoteContent(note.content).toLowerCase();
    const timestamp = formatNoteTimestamp(note.ts).toLowerCase();
    return content.includes(searchTerm) || timestamp.includes(searchTerm);
  });

  console.log("Filtered notes count:", filteredNotes.length);
  displayNotes(filteredNotes);
});

// Export functionality
exportButtonElement?.addEventListener(
  "click",
  withAsyncErrorHandling(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Export button clicked intentionally");

    if (allNotes.length === 0) {
      alert("No notes to export for this domain.");
      return;
    }

    const exportData = {
      domain: activeDomainName,
      exportDate: new Date().toISOString(),
      notes: allNotes.map((note) => ({
        content: decodeNoteContent(note.content),
        timestamp: formatNoteTimestamp(note.ts),
        id: note.id,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secure-notes-${activeDomainName}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  })
);

// Initialize the popup by loading the current domain and its notes
withAsyncErrorHandling(loadActiveDomain)();
