// Search popup elements by only id
const $domainNameLabel = document.getElementById("domainName");
const $notesContainer = document.getElementById("notesList");
const $addNoteButton = document.getElementById("addNoteBtn");
const $noteInputField = document.getElementById("noteInput");
const $searchInputField = document.getElementById("searchInput");
const $exportNotesButton = document.getElementById("exportBtn");

// Stores the currently active domain name and all notes
let currentDomain = "";
let domainNotesCache = [];

/**
 * Wraps async functions to handle errors gracefully.
 * @param {Function} asyncFunction - The async function to wrap.
 * @returns {Function}
 */
const handleAsyncErrors =
  (asyncFunction) =>
  (...args) =>
    asyncFunction(...args).catch(console.error);

/**
 * Loads the current tab's domain and renders its notes.
 */
const initializeDomainNotes = async () => {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!activeTab?.url) throw new Error("Active tab URL not found");
    const urlObject = new URL(activeTab.url);
    currentDomain = urlObject.hostname;
    $domainNameLabel.textContent = currentDomain;
    await renderNotesForDomain();
  } catch (error) {
    $domainNameLabel.textContent = "Domain unavailable";
    $notesContainer.textContent = "Failed to load notes.";
    console.error(error);
  }
};

/**
 * Retrieves notes for the current domain from storage.
 * @returns {Promise<Array>}
 */
const getNotesFromStorage = async () => {
  const { notesByDomain = {} } = await chrome.storage.local.get(
    "notesByDomain"
  );
  return Array.isArray(notesByDomain[currentDomain])
    ? notesByDomain[currentDomain]
    : [];
};

/**
 * Saves a new note for the current domain.
 * @param {Object} note - The note object to save.
 */
const saveNoteToStorage = async (note) => {
  const { notesByDomain = {} } = await chrome.storage.local.get(
    "notesByDomain"
  );
  const notes = Array.isArray(notesByDomain[currentDomain])
    ? notesByDomain[currentDomain]
    : [];

  notes.unshift(note);
  notesByDomain[currentDomain] = notes;
  await chrome.storage.local.set({ notesByDomain });
};

/**
 * Updates an existing note for the current domain.
 * @param {string} noteId
 * @param {string} newContent
 */
const updateNoteInStorage = async (noteId, newContent) => {
  const { notesByDomain = {} } = await chrome.storage.local.get(
    "notesByDomain"
  );

  const notes = Array.isArray(notesByDomain[currentDomain])
    ? notesByDomain[currentDomain]
    : [];

  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex !== -1) {
    notes[noteIndex].content = encodeNoteContent(newContent);
    notes[noteIndex].ts = Date.now();
    notesByDomain[currentDomain] = notes;
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
const generateNoteId = () => {
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
const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

/**
 * Renders all notes for the current domain in the UI.
 */
const renderNotesForDomain = async () => {
  const notes = await getNotesFromStorage();
  domainNotesCache = notes; // Store all notes for search functionality
  renderNotesList(notes);
};

/**
 * Displays notes in the UI (used by both render and filter functions)
 */
const renderNotesList = (notes) => {
  $notesContainer.innerHTML = "";

  if (notes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = $searchInputField?.value?.trim()
      ? "No notes match your search."
      : "No notes yet. Add your first note!";
    $notesContainer.appendChild(emptyState);
    return;
  }

  notes.forEach((note) => {
    const noteItem = document.createElement("div");
    noteItem.className = "note-item";

    // Note header with timestamp and delete button
    const noteHeader = document.createElement("div");
    noteHeader.className = "note-header";

    const noteTimestamp = document.createElement("div");
    noteTimestamp.className = "note-timestamp";
    noteTimestamp.textContent = formatTimestamp(note.ts);

    const deleteNoteButton = document.createElement("button");
    deleteNoteButton.textContent = "Delete";
    deleteNoteButton.className = "note-delete";
    deleteNoteButton.addEventListener(
      "click",
      handleAsyncErrors(async () => {
        if (!confirm("Delete this note?")) return;
        const { notesByDomain = {} } = await chrome.storage.local.get(
          "notesByDomain"
        );
        notesByDomain[currentDomain] = (
          notesByDomain[currentDomain] || []
        ).filter((existingNote) => existingNote.id !== note.id);
        await chrome.storage.local.set({ notesByDomain });
        await renderNotesForDomain();
      })
    );

    noteHeader.appendChild(noteTimestamp);
    noteHeader.appendChild(deleteNoteButton);

    // Note content
    const noteContent = document.createElement("div");
    noteContent.className = "note-content";
    noteContent.textContent = decodeNoteContent(note.content);
    noteContent.style.cursor = "pointer";
    noteContent.title = "Click to edit";

    // Edit functionality
    noteContent.addEventListener("click", () => {
      const noteTextarea = document.createElement("textarea");
      noteTextarea.className = "note-textarea";
      noteTextarea.value = decodeNoteContent(note.content);

      const saveNoteButton = document.createElement("button");
      saveNoteButton.textContent = "Save";
      saveNoteButton.className = "add-note-btn";
      saveNoteButton.style.marginTop = "8px";

      saveNoteButton.addEventListener(
        "click",
        handleAsyncErrors(async () => {
          const newContent = noteTextarea.value.trim();
          if (!newContent) {
            alert("Note cannot be empty.");
            return;
          }
          await updateNoteInStorage(note.id, newContent);
          await renderNotesForDomain();
        })
      );

      noteItem.replaceChild(noteTextarea, noteContent);
      noteItem.appendChild(saveNoteButton);
    });

    noteItem.appendChild(noteHeader);
    noteItem.appendChild(noteContent);
    $notesContainer.appendChild(noteItem);
  });
};

// Handles adding a new note via the UI
$addNoteButton.addEventListener(
  "click",
  handleAsyncErrors(async () => {
    const noteText = $noteInputField.value.trim();
    if (!noteText) {
      alert("Please enter a note.");
      return;
    }
    const newNote = {
      id: generateNoteId(),
      ts: Date.now(),
      content: encodeNoteContent(noteText),
    };
    await saveNoteToStorage(newNote);
    $noteInputField.value = "";
    $addNoteButton.disabled = true; // Disable button after adding
    await renderNotesForDomain();
  })
);

// Enable/disable add button based on input content
$noteInputField.addEventListener("input", () => {
  const hasContent = $noteInputField.value.trim().length > 0;
  $addNoteButton.disabled = !hasContent;
});

// Enable add note on Enter key
$noteInputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    if (!$addNoteButton.disabled) {
      $addNoteButton.click();
    }
  }
});

// Search functionality
$searchInputField?.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();

  console.log("Search input changed:", searchTerm);

  if (!searchTerm) {
    renderNotesList(domainNotesCache);
    return;
  }

  const filteredNotes = domainNotesCache.filter((note) => {
    const content = decodeNoteContent(note.content).toLowerCase();
    const timestamp = formatTimestamp(note.ts).toLowerCase();
    return content.includes(searchTerm) || timestamp.includes(searchTerm);
  });

  console.log("Filtered notes count:", filteredNotes.length);
  renderNotesList(filteredNotes);
});

// Export functionality
$exportNotesButton?.addEventListener(
  "click",
  handleAsyncErrors(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Export button clicked intentionally");

    if (domainNotesCache.length === 0) {
      alert("No notes to export for this domain.");
      return;
    }

    const exportData = {
      domain: currentDomain,
      exportDate: new Date().toISOString(),
      notes: domainNotesCache.map((note) => ({
        content: decodeNoteContent(note.content),
        timestamp: formatTimestamp(note.ts),
        id: note.id,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `secure-notes-${currentDomain}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  })
);

// Initialize the popup by loading the current domain and its notes
handleAsyncErrors(initializeDomainNotes)();
