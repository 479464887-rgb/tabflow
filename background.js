// ExtPay - Payment integration
importScripts('ExtPay.js');
const extpay = ExtPay('tabflow');
extpay.startBackground();

// TabFlow - Background Service Worker
const DEFAULTS = {
  maxWorkspaces: 20,
  autoClean: false,
  theme: 'dark'
};

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.sync.get('settings');
  if (!settings) await chrome.storage.sync.set({ settings: DEFAULTS });
  const { workspaces } = await chrome.storage.local.get('workspaces');
  if (!workspaces) await chrome.storage.local.set({ workspaces: [] });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SAVE_WORKSPACE':
      saveWorkspace(request.name).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'RESTORE_WORKSPACE':
      restoreWorkspace(request.id).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'DELETE_WORKSPACE':
      deleteWorkspace(request.id).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'GET_WORKSPACES':
      getWorkspaces().then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'GET_CURRENT_TABS':
      getCurrentTabs().then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'CLOSE_DUPLICATES':
      closeDuplicates().then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'SWITCH_TAB':
      switchTab(request.tabId).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'GET_SETTINGS':
      chrome.storage.sync.get('settings').then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'SAVE_SETTINGS':
      chrome.storage.sync.set({ settings: request.settings }).then(() => sendResponse({ success: true }));
      return true;
  }
});

async function saveWorkspace(name) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const { workspaces = [] } = await chrome.storage.local.get('workspaces');
  const { settings } = await chrome.storage.sync.get('settings');

  const ws = {
    id: 'ws_' + Date.now().toString(36),
    name: name || `工作区 ${workspaces.length + 1}`,
    tabs: tabs.map(t => ({
      title: t.title,
      url: t.url,
      favIconUrl: t.favIconUrl,
      pinned: t.pinned,
      groupId: t.groupId
    })),
    tabCount: tabs.length,
    createdAt: Date.now(),
    windowType: 'current'
  };

  const updated = [ws, ...workspaces].slice(0, (settings || DEFAULTS).maxWorkspaces || 20);
  await chrome.storage.local.set({ workspaces: updated });
  return { success: true, workspace: ws, total: updated.length };
}

async function restoreWorkspace(id) {
  const { workspaces = [] } = await chrome.storage.local.get('workspaces');
  const ws = workspaces.find(w => w.id === id);
  if (!ws) return { error: 'Workspace not found' };

  // Create new window with saved tabs
  const urls = ws.tabs.map(t => t.url).filter(Boolean);
  if (urls.length) {
    await chrome.windows.create({ url: urls });
  }
  return { success: true, count: urls.length };
}

async function deleteWorkspace(id) {
  const { workspaces = [] } = await chrome.storage.local.get('workspaces');
  await chrome.storage.local.set({ workspaces: workspaces.filter(w => w.id !== id) });
  return { success: true };
}

async function getWorkspaces() {
  const { workspaces = [] } = await chrome.storage.local.get('workspaces');
  return { workspaces };
}

async function getCurrentTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groups = await chrome.tabGroups.query({ windowId: tabs[0]?.windowId || -1 });

  return {
    tabs: tabs.map(t => ({
      id: t.id,
      title: t.title,
      url: t.url,
      favIconUrl: t.favIconUrl,
      active: t.active,
      pinned: t.pinned,
      groupId: t.groupId,
      audible: t.audible,
      discarded: t.discarded
    })),
    groups: groups.map(g => ({
      id: g.id,
      title: g.title,
      color: g.color,
      collapsed: g.collapsed
    })),
    count: tabs.length,
    pinnedCount: tabs.filter(t => t.pinned).length
  };
}

async function closeDuplicates() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const seen = new Map();
  const toClose = [];

  for (const tab of tabs) {
    if (tab.pinned) continue;
    const key = tab.url;
    if (seen.has(key)) {
      toClose.push(tab.id);
    } else {
      seen.set(key, tab.id);
    }
  }

  if (toClose.length) {
    await chrome.tabs.remove(toClose);
  }
  return { closed: toClose.length };
}

async function switchTab(tabId) {
  await chrome.tabs.update(tabId, { active: true });
  return { success: true };
}
