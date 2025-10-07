const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --gradient-fab-main: linear-gradient(135deg, #0077ff 0%, #00c6ff 100%);
      --gradient-fab-hover: linear-gradient(135deg, #0055cc 0%, #0099cc 100%);
      --color-white: #ffffff;
      --color-gray-light: #f9fbfd;
      --color-gray-border: #e3e8ee;
      --color-text-dark: #1a2a3a;
      --color-gray-text: #6c7a89;
      --color-gray-muted: #7a8ca3;
      --color-blue-primary: #0077ff;
      --color-blue-bg: #e3f0ff;
      --color-blue-lighter: #b3d6ff;
      --gradient-modal-header: linear-gradient(90deg, #e3f0ff 0%, #f9fbfd 100%);
      --gradient-button-primary: linear-gradient(90deg, #0077ff 0%, #00c6ff 100%);
      --gradient-button-primary-hover: linear-gradient(90deg, #0055cc 0%, #0099cc 100%);
      --gradient-button-danger: linear-gradient(90deg, #ff4d4f 0%, #ffb199 100%);
      --gradient-button-danger-hover: linear-gradient(90deg, #d9001b 0%, #ffb199 100%);
      --gradient-button-success: linear-gradient(90deg, #00c853 0%, #b2ff59 100%);
      --gradient-button-success-hover: linear-gradient(90deg, #009624 0%, #b2ff59 100%);
      --shadow-fab: 0 4px 16px rgba(0,0,0,0.18);
      --shadow-fab-hover: 0 8px 32px rgba(0,0,0,0.22);
      --shadow-modal-main: 0 12px 48px rgba(0,0,0,0.18);
      --shadow-button-small: 0 2px 8px rgba(0,0,0,0.07);
      --shadow-button-focus: 0 4px 16px rgba(0,119,255,0.08);
      --shadow-textarea-hover: 0 1px 4px rgba(0,119,255,0.08);
      --shadow-outline-focus: 0 0 0 2px rgba(0,119,255,0.12);
    }
    
    .secure-note-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--gradient-fab-main);
      color: var(--color-white);
      border: none;
      font-size: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-fab);
      z-index: 10000;
      transition: box-shadow 0.2s, transform 0.2s;
      outline: none;
    }

    .secure-note-fab:hover, .secure-note-fab:focus {
      box-shadow: var(--shadow-fab-hover);
      transform: scale(1.08);
      background: var(--gradient-fab-hover);
    }

    .secure-note-injected-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-width: 96vw;
      min-height: 320px;
      background: var(--color-gray-light);
      border-radius: 18px;
      box-shadow: var(--shadow-modal-main);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      overflow: hidden;
      animation: modalFadeIn 0.25s cubic-bezier(.4,0,.2,1) forwards;
      border: 1px solid var(--color-gray-border);
    }

    .secure-note-modal-header {
      padding: 18px 24px;
      background: var(--gradient-modal-header);
      border-bottom: 1px solid var(--color-gray-border);
      font-weight: 700;
      font-size: 18px;
      color: var(--color-text-dark);
      display: flex;
      justify-content: space-between;
      align-items: center;
      letter-spacing: 0.5px;
    }

    .secure-note-close {
      background: none;
      border: none;
      font-size: 22px;
      cursor: pointer;
      color: var(--color-gray-text);
      transition: color 0.2s;
      padding: 0 4px;
      border-radius: 50%;
    }

    .secure-note-close:hover, .secure-note-close:focus {
      color: var(--color-blue-primary);
      background: var(--color-blue-bg);
    }

    .secure-note-modal-body {
      padding: 20px 24px 18px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-height: 70vh;
      overflow-y: auto;
      background: var(--color-gray-light);
    }

    .secure-note-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .secure-note-note {
      background: var(--color-white);
      border-radius: 10px;
      box-shadow: var(--shadow-button-small);
      border: 1px solid var(--color-gray-border);
      padding: 14px 16px 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      transition: box-shadow 0.2s;
    }

    .secure-note-note:hover {
      box-shadow: var(--shadow-button-focus);
      border-color: var(--color-blue-lighter);
    }

    .secure-note-date {
      font-size: 12px;
      color: var(--color-gray-muted);
      font-weight: 500;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
    }

    .secure-note-content {
      padding: 0;
      border: none;
      background: none;
      font-size: 15px;
      color: var(--color-text-dark);
      white-space: pre-wrap;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 6px;
      outline: none;
      word-break: break-word;
    }

    .secure-note-content:hover, .secure-note-content:focus {
      background: var(--color-blue-bg);
    }

    .secure-note-actions {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }

    .secure-note-btn {
      background: var(--gradient-button-primary);
      color: var(--color-white);
      border: none;
      padding: 5px 14px;
      cursor: pointer;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s, transform 0.1s;
      align-self: flex-start;
      box-shadow: var(--shadow-textarea-hover);
      outline: none;
    }

    .secure-note-btn:hover, .secure-note-btn:focus {
      background: var(--gradient-button-primary-hover);
      transform: scale(1.05);
    }

    .secure-note-btn.delete {
      background: var(--gradient-button-danger);
      color: var(--color-white);
    }

    .secure-note-btn.delete:hover, .secure-note-btn.delete:focus {
      background: var(--gradient-button-danger-hover);
    }

    .secure-note-btn.copy {
      background: var(--gradient-button-success);
      color: var(--color-white);
    }

    .secure-note-btn.copy:hover, .secure-note-btn.copy:focus {
      background: var(--gradient-button-success-hover);
    }

    .secure-note-textarea {
      width: 100%;
      min-height: 70px;
      padding: 12px;
      font-size: 15px;
      border: 2px solid var(--color-gray-border);
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: var(--color-white);
      color: var(--color-text-dark);
      outline: none;
    }

    .secure-note-textarea:focus {
      border-color: var(--color-blue-primary);
      box-shadow: var(--shadow-outline-focus);
    }

    .secure-note-empty {
      text-align: center;
      color: var(--color-gray-muted);
      font-size: 15px;
      padding: 24px 0;
      font-style: italic;
      letter-spacing: 0.2px;
    }

    .secure-note-tooltip {
      position: absolute;
      top: -32px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-blue-primary);
      color: var(--color-white);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 2;
      white-space: nowrap;
    }

    .secure-note-note.show-tooltip .secure-note-tooltip {
      opacity: 1;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    @media (max-width: 600px) {
      .secure-note-injected-modal {
        width: 98vw;
        min-width: 0;
        max-width: 98vw;
        border-radius: 12px;
        padding: 0;
      }
        
      .secure-note-modal-header, .secure-note-modal-body {
        padding-left: 12px;
        padding-right: 12px;
      }
    }
  `;
  document.head.appendChild(style);
};

// Export function to global scope for content script usage
if (typeof window !== "undefined") {
  window.injectStyles = injectStyles;
}
