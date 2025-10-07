if (window.__secureNoteInjected) {
  // Already injected, do nothing
} else {
  try {
    window.__secureNoteInjected = true;

    const DOMAIN = window.location.hostname;
    let modal = null;

    // Inject styles using imported function
    if (typeof window.injectStyles === "function") {
      window.injectStyles();
    } else {
      console.warn("Secure Note Extension: styles.js not loaded properly");
    }

    const createFab = () => {
      const fab = document.createElement("button");
      fab.className = "secure-note-fab";
      fab.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="none"/>
      <path d="M14 7V21M7 14H21" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
      fab.title = "Add secure note";
      fab.onclick = showModal;
      document.body.appendChild(fab);
    };

    const showModal = async () => {
      if (modal) return;

      modal = document.createElement("div");
      modal.className = "secure-note-injected-modal open";

      const header = document.createElement("div");
      header.className = "secure-note-modal-header";
      header.textContent = `Secure Notes for ${DOMAIN}`;

      const closeBtn = document.createElement("button");
      closeBtn.className = "secure-note-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = () => {
        modal.remove();
        modal = null;
      };
      header.appendChild(closeBtn);

      const body = document.createElement("div");
      body.className = "secure-note-modal-body";

      const notesList = document.createElement("div");
      notesList.className = "secure-note-list";

      const textarea = document.createElement("textarea");
      textarea.className = "secure-note-textarea";
      textarea.placeholder = "Write a secure note...";
      setTimeout(() => textarea.focus(), 100);

      const addBtn = document.createElement("button");
      addBtn.className = "secure-note-btn";
      addBtn.textContent = "Add note";

      addBtn.onclick = async () => {
        const text = textarea.value.trim();
        if (!text) return showTooltip(addBtn, "Please enter a note.");
        await addNote(text);
        textarea.value = "";
        await renderNotes(notesList);
        textarea.focus();
      };

      body.appendChild(notesList);
      body.appendChild(textarea);
      body.appendChild(addBtn);
      modal.appendChild(header);
      modal.appendChild(body);
      document.body.appendChild(modal);

      await renderNotes(notesList);
    };

    const showTooltip = (el, msg) => {
      let tip = el.querySelector(".secure-note-tooltip");
      if (!tip) {
        tip = document.createElement("div");
        tip.className = "secure-note-tooltip";
        el.appendChild(tip);
      }
      tip.textContent = msg;
      tip.style.opacity = "1";
      setTimeout(() => {
        tip.style.opacity = "0";
      }, 1800);
    };

    const getNotes = async () => {
      try {
        const stored = await chrome.storage.local.get("notesByDomain");
        const map =
          stored && typeof stored.notesByDomain === "object"
            ? stored.notesByDomain
            : {};
        return map[DOMAIN] || [];
      } catch (e) {
        console.error("Failed to get notes:", e);
        return [];
      }
    };

    const addNote = async (text) => {
      const note = {
        content: btoa(
          new Uint8Array(new TextEncoder().encode(text)).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        ),
        ts: Date.now(),
        id: Date.now() + Math.random().toString(16).slice(2),
      };
      const stored = await chrome.storage.local.get("notesByDomain");
      const map = stored.notesByDomain || {};
      const arr = map[DOMAIN] || [];
      arr.unshift(note);
      map[DOMAIN] = arr;
      await chrome.storage.local.set({ notesByDomain: map });
    };

    const updateNote = async (noteId, newContent) => {
      const stored = await chrome.storage.local.get("notesByDomain");
      const map = stored.notesByDomain || {};
      const notes = map[DOMAIN] || [];
      const noteIndex = notes.findIndex((n) => n.id === noteId);
      if (noteIndex !== -1) {
        notes[noteIndex].content = btoa(
          new Uint8Array(new TextEncoder().encode(newContent)).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        notes[noteIndex].ts = Date.now();
        map[DOMAIN] = notes;
        await chrome.storage.local.set({ notesByDomain: map });
      }
    };

    const renderNotes = async (container) => {
      container.innerHTML = "";
      const notes = await getNotes();
      if (!notes.length) {
        const empty = document.createElement("div");
        empty.className = "secure-note-empty";
        empty.textContent = "No notes yet. Add your first note!";
        container.appendChild(empty);
        return;
      }
      notes.forEach((note) => {
        const item = document.createElement("div");
        item.className = "secure-note-note";

        const decodedBytes = Uint8Array.from(atob(note.content), (c) =>
          c.charCodeAt(0)
        );
        const content = new TextDecoder().decode(decodedBytes);
        const date = new Date(note.ts).toLocaleString();

        const dateEl = document.createElement("div");
        dateEl.className = "secure-note-date";
        dateEl.textContent = date;

        const contentEl = document.createElement("div");
        contentEl.className = "secure-note-content";
        contentEl.title = "Click to edit";
        contentEl.textContent = content;
        contentEl.tabIndex = 0;

        // Edit on click
        contentEl.addEventListener("click", () => {
          const editArea = document.createElement("textarea");
          editArea.className = "secure-note-textarea";
          editArea.value = content;
          setTimeout(() => editArea.focus(), 100);

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "Save";
          saveBtn.className = "secure-note-btn";
          saveBtn.onclick = async () => {
            const newContent = editArea.value.trim();
            if (!newContent) {
              showTooltip(saveBtn, "Note cannot be empty.");
              return;
            }
            await updateNote(note.id, newContent);
            await renderNotes(container);
          };

          item.replaceChild(editArea, contentEl);
          item.appendChild(saveBtn);
        });

        // Actions: Copy, Delete
        const actions = document.createElement("div");
        actions.className = "secure-note-actions";

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.className = "secure-note-btn copy";
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(content);
            item.classList.add("show-tooltip");
            let tip = item.querySelector(".secure-note-tooltip");
            if (!tip) {
              tip = document.createElement("div");
              tip.className = "secure-note-tooltip";
              tip.textContent = "Copied!";
              item.appendChild(tip);
            }
            tip.textContent = "Copied!";
            setTimeout(() => item.classList.remove("show-tooltip"), 1200);
          } catch {
            showTooltip(copyBtn, "Copy failed");
          }
        };

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "secure-note-btn delete";
        delBtn.onclick = async () => {
          if (!confirm("Delete this note?")) return;
          const stored = await chrome.storage.local.get("notesByDomain");
          const map = stored.notesByDomain || {};
          map[DOMAIN] = map[DOMAIN].filter((n) => n.id !== note.id);
          await chrome.storage.local.set({ notesByDomain: map });
          await renderNotes(container);
        };

        actions.appendChild(copyBtn);
        actions.appendChild(delBtn);

        item.appendChild(dateEl);
        item.appendChild(contentEl);
        item.appendChild(actions);

        container.appendChild(item);
      });
    };

    createFab();
  } catch (error) {
    console.error("Secure Note Extension initialization failed:", error);
  }
}
