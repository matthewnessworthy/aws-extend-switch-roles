export function applyTheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-theme', mode);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function installVisualModeListener() {
  const brw = chrome || browser;
  brw.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'sync' && changes.visualMode) {
      const mode = changes.visualMode.newValue || 'default';
      localStorage.setItem('visualMode', mode);
      applyTheme(mode);
    }
  });
}
