/* contato.html — page-specific scripts */


function sendToWhatsApp() {
    const nome = document.getElementById('cf_nome').value.trim();
    const email = document.getElementById('cf_email').value.trim();
    const tel = document.getElementById('cf_tel').value.trim();
    const mensagem = document.getElementById('cf_msg').value.trim();
    
    let msg = `Olá! Vim pelo site da Phygo e gostaria de agendar uma conversa.%0A%0A`;
    msg += `*Nome:* ${encodeURIComponent(nome)}%0A`;
    msg += `*E-mail:* ${encodeURIComponent(email)}%0A`;
    if (tel) msg += `*Telefone:* ${encodeURIComponent(tel)}%0A`;
    if (mensagem) msg += `%0A*Mensagem:* ${encodeURIComponent(mensagem)}%0A`;
    
    window.open(`https://wa.me/5512981153079?text=${msg}`, '_blank');
    
    const btn = document.querySelector('#contactForm button[type=submit]');
    btn.textContent = 'Redirecionando ao WhatsApp...';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Agendar Conversa via WhatsApp'; btn.disabled = false; }, 3000);
}



document.querySelectorAll('.nav-link').forEach(a => {
  if (a.dataset.page === 'contato') a.classList.add('active');
});
