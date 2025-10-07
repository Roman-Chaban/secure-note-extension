// Listen for the extension installation event and log a message to the console
chrome.runtime.onInstalled.addListener(() => {
  console.log("Secure Note Extension has been successfully installed.");
});
