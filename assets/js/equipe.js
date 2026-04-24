/* equipe.html — page-specific scripts */


document.querySelectorAll('.nav-link').forEach(a => {
  if (a.dataset.page === 'equipe') a.classList.add('active');
});
