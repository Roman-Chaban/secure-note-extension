class SecureNoteElement extends HTMLElement {
  constructor() {
    super();
    // Attach shadow DOM for encapsulation
    this.attachShadow({ mode: "open" });
    this._noteData = null;
  }

  static get observedAttributes() {
    // Observe these attributes for changes
    return ["note-id", "encrypted-content", "timestamp", "expanded"];
  }

  connectedCallback() {
    // Initial render and event setup when element is added to DOM
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Re-render only if attribute value actually changed
    if (oldValue !== newValue) {
      this.render();
    }
  }

  get noteData() {
    return this._noteData;
  }

  set noteData(data) {
    this._noteData = data;
    if (data) {
      // Update attributes when noteData is set
      this.setAttribute("note-id", data.id);
      this.setAttribute("encrypted-content", data.content);
      this.setAttribute("timestamp", data.timestamp);
    }
    this.render();
  }

  render() {
    // Get attributes for rendering
    const noteId = this.getAttribute("note-id");
    const encryptedContent = this.getAttribute("encrypted-content");
    const timestamp = this.getAttribute("timestamp");
    const isExpanded = this.hasAttribute("expanded");

    // If required attributes are missing, do not render
    if (!noteId || !encryptedContent || !timestamp) {
      return;
    }

    let decryptedContent = "[Error decrypting note]";
    let truncatedContent = decryptedContent;

    try {
      // Try to decrypt and truncate note content
      decryptedContent = window.secureNoteUtils.decryptText(encryptedContent);
      truncatedContent = window.secureNoteUtils.truncateText(
        decryptedContent,
        150
      );
    } catch (error) {
      // TODO: Handle decryption errors gracefully
      console.error("Error decrypting note:", error);
    }

    // Format timestamp for display
    const formattedTime = window.secureNoteUtils.formatTimestamp(
      parseInt(timestamp)
    );
    // Determine if note needs expansion button
    const needsExpansion = decryptedContent.length > 150;

    // Render note HTML and styles
    this.shadowRoot.innerHTML = `
            <style>
                /* Styles for note appearance and animation */
                :host {
                    display: block;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                :host::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    transform: scaleY(0);
                    transition: transform 0.3s ease;
                    transform-origin: bottom;
                }

                :host(:hover) {
                    border-color: #667eea;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                    transform: translateY(-2px);
                }

                :host(:hover)::before {
                    transform: scaleY(1);
                }

                .note-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .note-timestamp {
                    font-size: 10px;
                    color: #6b7280;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: monospace;
                }

                .note-actions {
                    display: flex;
                    gap: 6px;
                }

                .btn {
                    background: none;
                    border: 1px solid currentColor;
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-size: 9px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.025em;
                }

                .btn-expand {
                    color: #667eea;
                }

                .btn-expand:hover {
                    background: #667eea;
                    color: white;
                }

                .btn-delete {
                    color: #ef4444;
                }

                .btn-delete:hover {
                    background: #ef4444;
                    color: white;
                }

                .note-content {
                    font-size: 13px;
                    line-height: 1.5;
                    color: #1f2937;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                }

                .note-content.collapsed {
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    white-space: normal;
                }

                :host(.new) {
                    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            </style>
            
            <div class="note-header">
                <span class="note-timestamp">${formattedTime}</span>
                <div class="note-actions">
                    ${
                      needsExpansion
                        ? `
                        <button class="btn btn-expand" id="expandBtn">
                            ${isExpanded ? "Show Less" : "Show More"}
                        </button>
                    `
                        : ""
                    }
                    <button class="btn btn-delete" id="deleteBtn">Delete</button>
                </div>
            </div>
            
            <div class="note-content ${
              isExpanded || !needsExpansion ? "" : "collapsed"
            }" id="noteContent">
                ${
                  isExpanded || !needsExpansion
                    ? decryptedContent
                    : truncatedContent
                }
            </div>
        `;
  }

  setupEventListeners() {
    // Setup expand/collapse and delete button event listeners
    const expandBtn = this.shadowRoot.getElementById("expandBtn");
    const deleteBtn = this.shadowRoot.getElementById("deleteBtn");

    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        // Toggle expanded attribute
        const isExpanded = this.hasAttribute("expanded");
        if (isExpanded) {
          this.removeAttribute("expanded");
        } else {
          this.setAttribute("expanded", "");
        }

        // Dispatch custom event for expansion toggle
        this.dispatchEvent(
          new CustomEvent("note-toggle", {
            bubbles: true,
            detail: {
              noteId: this.getAttribute("note-id"),
              expanded: !isExpanded,
            },
          })
        );
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        // Dispatch custom event for note deletion
        this.dispatchEvent(
          new CustomEvent("note-delete", {
            bubbles: true,
            detail: {
              noteId: this.getAttribute("note-id"),
            },
          })
        );
      });
    }
  }
}

// Register custom elements with proper error handling
if (
  typeof window !== "undefined" &&
  window.customElements &&
  typeof window.customElements.define === "function"
) {
  try {
    // Check if element is already defined
    if (!window.customElements.get("secure-note")) {
      window.customElements.define("secure-note", SecureNoteElement);
    }
  } catch (error) {
    // TODO: Handle registration errors gracefully
    console.warn(
      "Secure Note Extension: Could not register custom element:",
      error
    );
  }
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.SecureNoteElement = SecureNoteElement;
}
