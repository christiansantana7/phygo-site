/* compliance.html — page-specific scripts */


document.querySelectorAll('.nav-link').forEach(a => {
  if (a.dataset.page === 'home') a.classList.add('active');
});
