/**
 * Styles injection module for Secure Note Extension
 * Contains all CSS styles for FAB button and modal components
 */

const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .secure-note-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0077ff 0%, #00c6ff 100%);
      color: #fff;
      border: none;
      font-size: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      z-index: 10000;
      transition: box-shadow 0.2s, transform 0.2s;
      outline: none;
    }
    .secure-note-fab:hover, .secure-note-fab:focus {
      box-shadow: 0 8px 32px rgba(0,0,0,0.22);
      transform: scale(1.08);
      background: linear-gradient(135deg, #0055cc 0%, #0099cc 100%);
    }
    .secure-note-injected-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-width: 96vw;
      min-height: 320px;
      background: #f9fbfd;
      border-radius: 18px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.18);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      overflow: hidden;
      animation: modalFadeIn 0.25s cubic-bezier(.4,0,.2,1) forwards;
      border: 1px solid #e3e8ee;
    }
    .secure-note-modal-header {
      padding: 18px 24px;
      background: linear-gradient(90deg, #e3f0ff 0%, #f9fbfd 100%);
      border-bottom: 1px solid #e3e8ee;
      font-weight: 700;
      font-size: 18px;
      color: #1a2a3a;
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
      color: #6c7a89;
      transition: color 0.2s;
      padding: 0 4px;
      border-radius: 50%;
    }
    .secure-note-close:hover, .secure-note-close:focus {
      color: #0077ff;
      background: #e3f0ff;
    }
    .secure-note-modal-body {
      padding: 20px 24px 18px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-height: 70vh;
      overflow-y: auto;
      background: #f9fbfd;
    }
    .secure-note-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .secure-note-note {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      border: 1px solid #e3e8ee;
      padding: 14px 16px 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      transition: box-shadow 0.2s;
    }
    .secure-note-note:hover {
      box-shadow: 0 4px 16px rgba(0,119,255,0.08);
      border-color: #b3d6ff;
    }
    .secure-note-date {
      font-size: 12px;
      color: #7a8ca3;
      font-weight: 500;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
    }
    .secure-note-content {
      padding: 0;
      border: none;
      background: none;
      font-size: 15px;
      color: #1a2a3a;
      white-space: pre-wrap;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 6px;
      outline: none;
      word-break: break-word;
    }
    .secure-note-content:hover, .secure-note-content:focus {
      background: #e3f0ff;
    }
    .secure-note-actions {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }
    .secure-note-btn {
      background: linear-gradient(90deg, #0077ff 0%, #00c6ff 100%);
      color: #fff;
      border: none;
      padding: 5px 14px;
      cursor: pointer;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s, transform 0.1s;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,119,255,0.08);
      outline: none;
    }
    .secure-note-btn:hover, .secure-note-btn:focus {
      background: linear-gradient(90deg, #0055cc 0%, #0099cc 100%);
      transform: scale(1.05);
    }
    .secure-note-btn.delete {
      background: linear-gradient(90deg, #ff4d4f 0%, #ffb199 100%);
      color: #fff;
    }
    .secure-note-btn.delete:hover, .secure-note-btn.delete:focus {
      background: linear-gradient(90deg, #d9001b 0%, #ffb199 100%);
    }
    .secure-note-btn.copy {
      background: linear-gradient(90deg, #00c853 0%, #b2ff59 100%);
      color: #fff;
    }
    .secure-note-btn.copy:hover, .secure-note-btn.copy:focus {
      background: linear-gradient(90deg, #009624 0%, #b2ff59 100%);
    }
    .secure-note-textarea {
      width: 100%;
      min-height: 70px;
      padding: 12px;
      font-size: 15px;
      border: 2px solid #e3e8ee;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fff;
      color: #1a2a3a;
      outline: none;
    }
    .secure-note-textarea:focus {
      border-color: #0077ff;
      box-shadow: 0 0 0 2px rgba(0,119,255,0.12);
    }
    .secure-note-empty {
      text-align: center;
      color: #7a8ca3;
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
      background: #0077ff;
      color: #fff;
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
