const encryptText = (plainText) => {
  try {
    return btoa(unescape(encodeURIComponent(plainText)));
  } catch (error) {
    console.error("Error encrypting text:", error);
    return plainText;
  }
};

const decryptText = (encodedText) => {
  try {
    return decodeURIComponent(escape(atob(encodedText)));
  } catch (error) {
    console.error("Error decrypting text:", error);
    return "[Corrupted note]";
  }
};

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `note_${timestamp}_${randomPart}`;
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};

const sanitizeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const validateNoteContent = (content) => {
  if (typeof content !== "string") {
    throw new Error("Note content must be a string");
  }

  if (content.length > 10000) {
    throw new Error("Note content too long (max 10,000 characters)");
  }

  if (content.trim().length === 0) {
    throw new Error("Note content cannot be empty");
  }

  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

  return sanitized.trim();
};

const validateDomain = (domain) => {
  if (typeof domain !== "string") {
    return false;
  }

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-._]*[a-zA-Z0-9]$/;
  return domainRegex.test(domain) && domain.length <= 253;
};

const rateLimiter = {
  operations: new Map(),

  canPerform(operation, maxPerMinute = 30) {
    const now = Date.now();
    const operationHistory = this.operations.get(operation) || [];

    const recentOps = operationHistory.filter((time) => now - time < 60000);

    if (recentOps.length >= maxPerMinute) {
      return false;
    }

    recentOps.push(now);
    this.operations.set(operation, recentOps);
    return true;
  },
};

if (typeof window !== "undefined") {
  // Export individual functions to global scope for backward compatibility
  window.encryptText = encryptText;
  window.decryptText = decryptText;
  window.generateUniqueId = generateUniqueId;
  window.formatTimestamp = formatTimestamp;
  window.sanitizeHtml = sanitizeHtml;
  window.truncateText = truncateText;
  window.validateNoteContent = validateNoteContent;
  window.validateDomain = validateDomain;

  // Export as a module object
  window.secureNoteUtils = {
    encryptText,
    decryptText,
    generateUniqueId,
    formatTimestamp,
    sanitizeHtml,
    truncateText,
    validateNoteContent,
    validateDomain,
    rateLimiter,
  };
}
