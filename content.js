if (window.__secureNoteInjected) {
  // Already injected, do nothing
} else {
  window.__secureNoteInjected = true;

  const DOMAIN = window.location.hostname;
  let modal = null;

  function createFab() {
    const fab = document.createElement("button");
    fab.className = "secure-note-fab";
    fab.textContent = "+";
    fab.title = "Add secure note";
    fab.onclick = showModal;
    document.body.appendChild(fab);
  }

  async function showModal() {
    if (modal) return;

    modal = document.createElement("div");
    modal.className = "secure-note-injected-modal open";

    const header = document.createElement("div");
    header.className = "secure-note-modal-header";
    header.textContent = DOMAIN;

    const closeBtn = document.createElement("button");
    closeBtn.className = "secure-note-close";
    closeBtn.textContent = "✕";
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

    const addBtn = document.createElement("button");
    addBtn.className = "secure-note-btn";
    addBtn.textContent = "Add note";

    addBtn.onclick = async () => {
      const text = textarea.value.trim();
      if (!text) return alert("Please enter a note.");
      await addNote(text);
      textarea.value = "";
      await renderNotes(notesList);
    };

    body.appendChild(notesList);
    body.appendChild(textarea);
    body.appendChild(addBtn);
    modal.appendChild(header);
    modal.appendChild(body);
    document.body.appendChild(modal);

    await renderNotes(notesList);
  }

  async function getNotes() {
    const stored = await chrome.storage.local.get("notesByDomain");
    const map = stored.notesByDomain || {};
    return map[DOMAIN] || [];
  }

  async function addNote(text) {
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
  }

  async function updateNote(noteId, newContent) {
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
  }

  async function renderNotes(container) {
    container.innerHTML = "";
    const notes = await getNotes();
    if (!notes.length) {
      container.textContent = "No notes yet.";
      return;
    }
    notes.forEach((note) => {
      const item = document.createElement("div");
      const decodedBytes = Uint8Array.from(atob(note.content), (c) =>
        c.charCodeAt(0)
      );
      const content = new TextDecoder().decode(decodedBytes);
      const date = new Date(note.ts).toLocaleString();
      item.innerHTML = `<div class="secure-note-date">${date}</div>
                        <div class="secure-note-content" style="cursor: pointer;" title="Click to edit">${content}</div>`;

      const contentEl = item.querySelector(".secure-note-content");
      contentEl.addEventListener("click", () => {
        const textarea = document.createElement("textarea");
        textarea.className = "secure-note-textarea";
        textarea.value = content;
        item.replaceChild(textarea, contentEl);

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.className = "secure-note-btn";
        saveBtn.onclick = async () => {
          const newContent = textarea.value.trim();
          if (!newContent) {
            alert("Note cannot be empty.");
            return;
          }
          await updateNote(note.id, newContent);
          await renderNotes(container);
        };

        item.insertBefore(saveBtn, item.querySelector(".secure-note-btn"));
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "secure-note-btn";
      delBtn.onclick = async () => {
        const stored = await chrome.storage.local.get("notesByDomain");
        const map = stored.notesByDomain || {};
        map[DOMAIN] = map[DOMAIN].filter((n) => n.id !== note.id);
        await chrome.storage.local.set({ notesByDomain: map });
        await renderNotes(container);
      };

      item.appendChild(delBtn);
      container.appendChild(item);
    });
  }

  createFab();
}
