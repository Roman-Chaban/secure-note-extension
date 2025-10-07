if (window.__secureNoteInjected) {
  // Already injected, do nothing
} else {
  try {
    window.__secureNoteInjected = true;

    const currentDomain = window.location.hostname;
    let modalElement = null;

    // Inject styles using imported function
    if (typeof window.injectStyles === "function") {
      window.injectStyles();
    } else {
      console.warn("Secure Note Extension: styles.js not loaded properly");
    }

    const createFloatingActionButton = () => {
      const fabButton = document.createElement("button");
      fabButton.className = "secure-note-fab";
      fabButton.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="none"/>
      <path d="M14 7V21M7 14H21" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
      fabButton.title = "Add secure note";
      fabButton.onclick = openModal;
      document.body.appendChild(fabButton);
    };

    const openModal = async () => {
      if (modalElement) return;

      modalElement = document.createElement("div");
      modalElement.className = "secure-note-injected-modal open";

      const modalHeader = document.createElement("div");
      modalHeader.className = "secure-note-modal-header";
      modalHeader.textContent = `Secure Notes for ${currentDomain}`;

      const closeButton = document.createElement("button");
      closeButton.className = "secure-note-close";
      closeButton.innerHTML = "&times;";
      closeButton.onclick = () => {
        modalElement.remove();
        modalElement = null;
      };
      modalHeader.appendChild(closeButton);

      const modalBody = document.createElement("div");
      modalBody.className = "secure-note-modal-body";

      const notesContainer = document.createElement("div");
      notesContainer.className = "secure-note-list";

      const noteInputTextarea = document.createElement("textarea");
      noteInputTextarea.className = "secure-note-textarea";
      noteInputTextarea.placeholder = "Write a secure note...";
      setTimeout(() => noteInputTextarea.focus(), 100);

      const addNoteButton = document.createElement("button");
      addNoteButton.className = "secure-note-btn";
      addNoteButton.textContent = "Add note";

      addNoteButton.onclick = async () => {
        const noteText = noteInputTextarea.value.trim();
        if (!noteText) return showTooltip(addNoteButton, "Please enter a note.");
        await saveNote(noteText);
        noteInputTextarea.value = "";
        await renderNotesList(notesContainer);
        noteInputTextarea.focus();
      };

      modalBody.appendChild(notesContainer);
      modalBody.appendChild(noteInputTextarea);
      modalBody.appendChild(addNoteButton);
      modalElement.appendChild(modalHeader);
      modalElement.appendChild(modalBody);
      document.body.appendChild(modalElement);

      await renderNotesList(notesContainer);
    };

    const showTooltip = (targetElement, message) => {
      let tooltipElement = targetElement.querySelector(".secure-note-tooltip");
      if (!tooltipElement) {
        tooltipElement = document.createElement("div");
        tooltipElement.className = "secure-note-tooltip";
        targetElement.appendChild(tooltipElement);
      }
      tooltipElement.textContent = message;
      tooltipElement.style.opacity = "1";
      setTimeout(() => {
        tooltipElement.style.opacity = "0";
      }, 1800);
    };

    const fetchNotes = async () => {
      try {
        const storageData = await chrome.storage.local.get("notesByDomain");
        const notesByDomain =
          storageData && typeof storageData.notesByDomain === "object"
            ? storageData.notesByDomain
            : {};
        return notesByDomain[currentDomain] || [];
      } catch (error) {
        console.error("Failed to get notes:", error);
        return [];
      }
    };

    const saveNote = async (noteContent) => {
      const noteObject = {
        content: btoa(
          new Uint8Array(new TextEncoder().encode(noteContent)).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        ),
        timestamp: Date.now(),
        id: Date.now() + Math.random().toString(16).slice(2),
      };
      const storageData = await chrome.storage.local.get("notesByDomain");
      const notesByDomain = storageData.notesByDomain || {};
      const notesArray = notesByDomain[currentDomain] || [];
      notesArray.unshift(noteObject);
      notesByDomain[currentDomain] = notesArray;
      await chrome.storage.local.set({ notesByDomain });
    };

    const updateNoteContent = async (noteId, updatedContent) => {
      const storageData = await chrome.storage.local.get("notesByDomain");
      const notesByDomain = storageData.notesByDomain || {};
      const notesArray = notesByDomain[currentDomain] || [];
      const noteIndex = notesArray.findIndex((note) => note.id === noteId);
      if (noteIndex !== -1) {
        notesArray[noteIndex].content = btoa(
          new Uint8Array(new TextEncoder().encode(updatedContent)).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        notesArray[noteIndex].timestamp = Date.now();
        notesByDomain[currentDomain] = notesArray;
        await chrome.storage.local.set({ notesByDomain });
      }
    };

    const renderNotesList = async (containerElement) => {
      containerElement.innerHTML = "";
      const notesArray = await fetchNotes();
      if (!notesArray.length) {
        const emptyStateElement = document.createElement("div");
        emptyStateElement.className = "secure-note-empty";
        emptyStateElement.textContent = "No notes yet. Add your first note!";
        containerElement.appendChild(emptyStateElement);
        return;
      }
      notesArray.forEach((noteObject) => {
        const noteItemElement = document.createElement("div");
        noteItemElement.className = "secure-note-note";

        const decodedBytes = Uint8Array.from(atob(noteObject.content), (c) =>
          c.charCodeAt(0)
        );
        const noteText = new TextDecoder().decode(decodedBytes);
        const formattedDate = new Date(noteObject.timestamp).toLocaleString();

        const dateElement = document.createElement("div");
        dateElement.className = "secure-note-date";
        dateElement.textContent = formattedDate;

        const contentElement = document.createElement("div");
        contentElement.className = "secure-note-content";
        contentElement.title = "Click to edit";
        contentElement.textContent = noteText;
        contentElement.tabIndex = 0;

        // Edit on click
        contentElement.addEventListener("click", () => {
          const editTextarea = document.createElement("textarea");
          editTextarea.className = "secure-note-textarea";
          editTextarea.value = noteText;
          setTimeout(() => editTextarea.focus(), 100);

          const saveEditButton = document.createElement("button");
          saveEditButton.textContent = "Save";
          saveEditButton.className = "secure-note-btn";
          saveEditButton.onclick = async () => {
            const updatedText = editTextarea.value.trim();
            if (!updatedText) {
              showTooltip(saveEditButton, "Note cannot be empty.");
              return;
            }
            await updateNoteContent(noteObject.id, updatedText);
            await renderNotesList(containerElement);
          };

          noteItemElement.replaceChild(editTextarea, contentElement);
          noteItemElement.appendChild(saveEditButton);
        });

        // Actions: Copy, Delete
        const actionsContainer = document.createElement("div");
        actionsContainer.className = "secure-note-actions";

        const copyButton = document.createElement("button");
        copyButton.textContent = "Copy";
        copyButton.className = "secure-note-btn copy";
        copyButton.onclick = async () => {
          try {
            await navigator.clipboard.writeText(noteText);
            noteItemElement.classList.add("show-tooltip");
            let tooltipElement = noteItemElement.querySelector(".secure-note-tooltip");
            if (!tooltipElement) {
              tooltipElement = document.createElement("div");
              tooltipElement.className = "secure-note-tooltip";
              tooltipElement.textContent = "Copied!";
              noteItemElement.appendChild(tooltipElement);
            }
            tooltipElement.textContent = "Copied!";
            setTimeout(() => noteItemElement.classList.remove("show-tooltip"), 1200);
          } catch {
            showTooltip(copyButton, "Copy failed");
          }
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "secure-note-btn delete";
        deleteButton.onclick = async () => {
          if (!confirm("Delete this note?")) return;
          const storageData = await chrome.storage.local.get("notesByDomain");
          const notesByDomain = storageData.notesByDomain || {};
          notesByDomain[currentDomain] = notesByDomain[currentDomain].filter((note) => note.id !== noteObject.id);
          await chrome.storage.local.set({ notesByDomain });
          await renderNotesList(containerElement);
        };

        actionsContainer.appendChild(copyButton);
        actionsContainer.appendChild(deleteButton);

        noteItemElement.appendChild(dateElement);
        noteItemElement.appendChild(contentElement);
        noteItemElement.appendChild(actionsContainer);

        containerElement.appendChild(noteItemElement);
      });
    };

    createFloatingActionButton();
  } catch (error) {
    console.error("Secure Note Extension initialization failed:", error);
  }
}
