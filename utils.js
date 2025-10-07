const encodeTextBase64 = (plainText) => {
  try {
    // Convert to UTF-8 and encode to base64
    return btoa(unescape(encodeURIComponent(plainText)));
  } catch (error) {
    console.error("Error encoding text:", error);
    return plainText;
  }
};

// Decode a Base64 string, handling Unicode safely
const decodeTextBase64 = (encodedText) => {
  try {
    // Decode from base64 and convert from UTF-8
    return decodeURIComponent(escape(atob(encodedText)));
  } catch (error) {
    console.error("Error decoding text:", error);
    return "[Corrupted note]";
  }
};

// Generate a unique note ID using timestamp and random string
const createNoteId = () => {
  const timestampBase36 = Date.now().toString(36); // Timestamp in base36
  const randomBase36 = Math.random().toString(36).substring(2); // Random string in base36
  return `note_${timestampBase36}_${randomBase36}`;
};

// Format a timestamp into a readable date/time string
const formatDateTime = (timestamp) => {
  const dateObj = new Date(timestamp);
  const formatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return dateObj.toLocaleString("en-US", formatOptions);
};

// Escape HTML entities to prevent XSS attacks
const escapeHtmlEntities = (unsafeText) => {
  // TODO: Consider using a library for more robust escaping if needed
  const tempDiv = document.createElement("div");
  tempDiv.textContent = unsafeText;
  return tempDiv.innerHTML;
};

// Truncate text to a maximum length, adding "..." if truncated
const getTruncatedText = (inputText, maxLength = 100) => {
  if (inputText.length <= maxLength) return inputText;
  return inputText.substring(0, maxLength).trim() + "...";
};

// Sanitize note content to remove dangerous HTML and scripts
const sanitizeNoteContent = (noteContent) => {
  if (typeof noteContent !== "string") {
    throw new Error("Note content must be a string");
  }

  if (noteContent.length > 10000) {
    throw new Error("Note content too long (max 10,000 characters)");
  }

  if (noteContent.trim().length === 0) {
    throw new Error("Note content cannot be empty");
  }

  // Remove <script> tags and event handlers to prevent XSS
  // TODO: Improve sanitization for other dangerous HTML tags if needed
  const sanitizedContent = noteContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

  return sanitizedContent.trim();
};

// Validate if a string is a valid domain name
const isValidDomainName = (domainName) => {
  if (typeof domainName !== "string") {
    return false;
  }

  // TODO: This regex is basic, consider supporting internationalized domains
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-._]*[a-zA-Z0-9]$/;
  return domainPattern.test(domainName) && domainName.length <= 253;
};

// Simple rate limiter for operations (per key, per minute)
const operationRateLimiter = {
  operationTimestamps: new Map(),

  // Returns true if operation can be performed, false if rate limit exceeded
  canPerformOperation(operationKey, maxOperationsPerMinute = 30) {
    const currentTimestamp = Date.now();
    const timestamps = this.operationTimestamps.get(operationKey) || [];

    // Keep only timestamps within the last minute
    const recentTimestamps = timestamps.filter(
      (time) => currentTimestamp - time < 60000
    );

    if (recentTimestamps.length >= maxOperationsPerMinute) {
      return false;
    }

    recentTimestamps.push(currentTimestamp);
    this.operationTimestamps.set(operationKey, recentTimestamps);
    return true;
  },
};

// Expose utility functions to window object if running in browser
if (typeof window !== "undefined") {
  window.encodeTextBase64 = encodeTextBase64;
  window.decodeTextBase64 = decodeTextBase64;
  window.createNoteId = createNoteId;
  window.formatDateTime = formatDateTime;
  window.escapeHtmlEntities = escapeHtmlEntities;
  window.getTruncatedText = getTruncatedText;
  window.sanitizeNoteContent = sanitizeNoteContent;
  window.isValidDomainName = isValidDomainName;

  // Group all utilities under a single namespace
  window.secureNoteUtils = {
    encodeTextBase64,
    decodeTextBase64,
    createNoteId,
    formatDateTime,
    escapeHtmlEntities,
    getTruncatedText,
    sanitizeNoteContent,
    isValidDomainName,
    operationRateLimiter,
  };
}
