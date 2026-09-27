"use strict";

document.addEventListener('DOMContentLoaded', () => {
    aggiornaNavbarLoggata();
    aggiornaBadgeCarrello();
    impostaNavAttiva();
});

function aggiornaNavbarLoggata() {
    const iconaAccount = document.getElementById('navAccountIcon');
    
    // Controlliamo se nel localStorage esiste una chiave che identifica l'utente
    
    const tipoUtente = localStorage.getItem('userType');

    if (tipoUtente && tipoUtente !== 'ospite') {
        // Cambia la destinazione del link
        iconaAccount.href = '/account'; 
        
    } else {
        // Se non è loggato punta a login
        iconaAccount.href = '/login';
    }
}

// FUNZIONE PER IL PALLINO DEL CARRELLO
function aggiornaBadgeCarrello() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    // Recuperiamo i dati (stessa chiave usata in carrello.js)
    const datiCarrello = localStorage.getItem('carrello_musica');
    const carrello = datiCarrello ? JSON.parse(datiCarrello) : [];

    // Calcoliamo la somma delle quantità di tutti gli oggetti
    const totaleArticoli = carrello.reduce((acc, item) => acc + item.quantita, 0);

    if (totaleArticoli > 0) {
        badge.innerText = totaleArticoli;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// FUNZIONE PER EVIDENZIARE LA PAGINA ATTUALE NELLA NAVBAR
function impostaNavAttiva() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        // Rimuove la classe da tutti
        link.classList.remove('active');
        
        // La aggiunge solo se l'href del link coincide con l'URL della pagina
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}