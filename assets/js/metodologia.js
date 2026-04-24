/* metodologia.html — page-specific scripts */


document.querySelectorAll('.nav-link').forEach(a => {
  if (a.dataset.page === 'metodologia') a.classList.add('active');
});
