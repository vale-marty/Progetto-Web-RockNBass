document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;

    fetch('data/users.json')
        .then(res => res.json())
        .then(users => {
            // Cerchiamo l'utente nel file JSON
            const userFound = users.find(u => u.username === userIn && u.password === passIn);

            if (userFound) {
                // SALVIAMO I DATI NEL LOCALSTORAGE
                localStorage.setItem('isLogged', 'true');
                localStorage.setItem('username', userFound.username);
                localStorage.setItem('nomeUtente', userFound.nome);
                localStorage.setItem('userType', userFound.userType);

                // Alert di successo con SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: `<span style="color: #fff">Bentornato ${userFound.nome}!</span>`,
                    text: 'Accesso eseguito con successo. Reindirizzamento in corso...',
                    background: '#151515',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'account.html';
                });

            } else {
                // Alert di errore
                Swal.fire({
                    icon: 'error',
                    title: '<span style="color: #fff">Accesso Negato</span>',
                    text: 'Username o Password non corretti. Riprova, rockstar!',
                    background: '#151515',
                    confirmButtonColor: 'var(--brand-color)'
                });
            }
        })
        .catch(err => console.error("Errore nel caricamento del database utenti:", err));
})


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