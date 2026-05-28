var m = localStorage.getItem('visualMode');
if (m === 'light' || m === 'dark') {
  document.documentElement.setAttribute('data-theme', m);
} else {
  document.documentElement.removeAttribute('data-theme');
}
