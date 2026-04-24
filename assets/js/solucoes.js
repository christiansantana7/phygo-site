/* solucoes.html — page-specific scripts */


document.querySelectorAll('.nav-link').forEach(a => {
  if (a.dataset.page === 'solucoes') a.classList.add('active');
});
