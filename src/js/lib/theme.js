// Mode this context last applied. Lets the storage.onChanged listener skip a
// value this same page just wrote (avoids double-applying after a same-page
// radio change) while still propagating changes that originate from another
// same-origin page — options.html and popup.html share one localStorage, so a
// localStorage-based guard would wrongly suppress those cross-page updates.
let appliedMode = null;

export function applyTheme(mode) {
  appliedMode = mode;
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
      if (mode === appliedMode) return;
      localStorage.setItem('visualMode', mode);
      applyTheme(mode);
    }
  });
}
