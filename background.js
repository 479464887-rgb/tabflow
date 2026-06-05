// TabFlow — Tab workspace manager
chrome.runtime.onInstalled.addListener(() => console.log('TabFlow ready'));

// Save current tabs as workspace
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === 'saveWorkspace') {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      const workspace = { name: req.name || 'Workspace ' + Date.now(), tabs: tabs.map(t => ({ title: t.title, url: t.url })), savedAt: Date.now() };
      chrome.storage.local.get(['workspaces'], data => {
        const workspaces = data.workspaces || [];
        workspaces.push(workspace);
        chrome.storage.local.set({ workspaces: workspaces.slice(-20) }, () => sendResponse({ success: true }));
      });
    });
    return true;
  }
  if (req.action === 'getWorkspaces') {
    chrome.storage.local.get(['workspaces'], data => sendResponse(data.workspaces || []));
    return true;
  }
  if (req.action === 'openWorkspace') {
    chrome.storage.local.get(['workspaces'], data => {
      const ws = (data.workspaces || []).find(w => w.name === req.name);
      if (ws) ws.tabs.forEach(t => chrome.tabs.create({ url: t.url }));
      sendResponse({ success: !!ws });
    });
    return true;
  }
});
