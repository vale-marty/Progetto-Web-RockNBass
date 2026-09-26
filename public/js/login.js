"use strict";

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value;
    
    // Effettua la chiamata POST alla nostra nuova API di autenticazione
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: userIn, password: passIn })
    })
    .then(async response => {
        const data = await response.json();
        
        if (!response.ok) {
            // Lancia un errore catturabile dal catch qui sotto
            throw new Error(data.error || "Errore di accesso");
        }
        
        // LOGIN AVVENUTO: Salviamo alcuni dati non sensibili nel localStorage 
        // per far funzionare l'interfaccia (navbar, carrello, ecc.)
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('nomeUtente', data.user.nome);
        localStorage.setItem('userType', data.user.ruolo);
        
        Swal.fire({
            icon: 'success',
            title: `Bentornato ${data.user.nome}!`,
            text: 'Accesso eseguito con successo. Reindirizzamento in corso...',
            background: '#151515',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        }).then(() => {
            window.location.href = '/account'; 
        });
    })
    .catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Accesso Negato',
            text: err.message, // Mostrerà "Password non corretta" o "Username non trovato"
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
    });
});


// --- ALLERT RECUPERO PASSWORD --- //
function mostraRecupero() {
    Swal.fire({
        title: '<span style="color: #fff">Chiave di basso smarrita?</span>',
        html: `
            <p style="color: #aaa">Un vero bassista non la dimentica mai!</p>
            <p style="color: #fff">Per recuperare la password scrivi a:</p>
            <h4 style="color: var(--brand-color); font-weight: bold;">rockbass@support.it</h4>
        `,
        background: '#151515',
        confirmButtonColor: 'var(--brand-color)',
        confirmButtonText: 'Ricevuto!',
        border: '1px solid #333'
    });
}