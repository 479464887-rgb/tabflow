// TabFlow - Options
const DEFAULTS = { maxWorkspaces: 20, autoClean: false };
document.addEventListener('DOMContentLoaded', async () => {
  const { settings } = await chrome.storage.sync.get('settings');
  const s = settings || DEFAULTS;
  document.getElementById('max-workspaces').value = s.maxWorkspaces || 20;
  document.getElementById('save').addEventListener('click', async () => {
    const btn = document.getElementById('save'); btn.disabled = true; btn.textContent = '保存中...';
    await chrome.storage.sync.set({ settings: { maxWorkspaces: parseInt(document.getElementById('max-workspaces').value) || 20 } });
    btn.disabled = false; btn.textContent = '保存设置';
    const el = document.getElementById('status'); el.textContent = '✓ 已保存!'; el.style.display = 'inline';
    setTimeout(() => el.style.display = 'none', 2000);
  });
});
