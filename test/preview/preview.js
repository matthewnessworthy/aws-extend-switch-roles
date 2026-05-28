document.getElementById('btn-light').addEventListener('click', function() {
  document.documentElement.setAttribute('data-theme', 'light');
});
document.getElementById('btn-dark').addEventListener('click', function() {
  document.documentElement.setAttribute('data-theme', 'dark');
});
document.getElementById('btn-auto').addEventListener('click', function() {
  document.documentElement.removeAttribute('data-theme');
});
