"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', validazioneRegistrazione);
    }
});

function selectProfile(type) {
    document.getElementById('userType').value = type;

    const btnPrivato = document.getElementById('btnPrivato');
    const btnScuola = document.getElementById('btnScuola');
    const extraFields = document.getElementById('extraFields');

    if (type === 'scuola') {
        // Gestione Bottoni
        btnScuola.classList.add('active');
        btnPrivato.classList.remove('active');
        
        // Mostra campi extra
        extraFields.classList.remove('d-none');
        
        // Setup campi obbligatori
        setRequired(true);
    } else {
        // Gestione Bottoni
        btnPrivato.classList.add('active');
        btnScuola.classList.remove('active');
        
        // Nascondi campi extra
        extraFields.classList.add('d-none');
        
        // Setup campi obbligatori
        setRequired(false);
    }
}

// Funzione helper per pulizia
function setRequired(val) {
    document.getElementById('regScuolaNome').required = val;
    document.getElementById('regPiva').required = val;
    document.getElementById('regSede').required = val;
}

function validazioneRegistrazione(event) {
    // Blocchiamo l'invio nativo del form per gestire la validazione via JS
    event.preventDefault();

    // 1. Riferimenti ai campi principali
    const form = event.target;
    const inputsRequired = form.querySelectorAll('input[required]');
    const emailInput = document.getElementById('regEmail');
    const passInput = document.getElementById('regPass');
    const confPassInput = document.getElementById('regPassConf');
    const pivaInput = document.getElementById('regPiva');
    const userType = document.getElementById('userType').value;

    let isValid = true;

    // Reset degli errori grafici precedenti
    const allInputs = form.querySelectorAll('input');
    allInputs.forEach(i => i.classList.remove('is-invalid', 'border-danger'));

    // --- 1. VALIDAZIONE CAMPI OBBLIGATORI VUOTI ---
    // (Prende automaticamente solo i campi attivi grazie al selectProfile)
    inputsRequired.forEach(i => {
        if (!i.value.trim()) {
            i.classList.add('is-invalid', 'border-danger');
            isValid = false;
        }
    });

    // --- 2. VALIDAZIONE EMAIL ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // --- 3. VALIDAZIONE PARTITA IVA (Solo se profilo Scuola) ---
    if (userType === 'scuola' && pivaInput) {
        const cleanPiva = pivaInput.value.replace(/\s+/g, '');
        // Controllo standard: 11 cifre numeriche
        if (cleanPiva.length !== 11 || isNaN(cleanPiva)) {
            pivaInput.classList.add('is-invalid', 'border-danger');
            isValid = false;
        }
    }

    // --- 4. VALIDAZIONE PASSWORD AVANZATA ---
    if (passInput) {
        const password = passInput.value;
        
        // Regole: Minimo 8 caratteri, almeno una MAIUSCOLA, un numero e un carattere speciale (@$!%*?&)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            passInput.classList.add('is-invalid', 'border-danger');
            isValid = false;
            
            // Messaggio specifico per la password
            Swal.fire({
                icon: 'info',
                title: '<span style="color: #fff">Password troppo debole</span>',
                html: `
                    <div class="text-start text-white-50 small">
                        <p>Per la tua sicurezza, la password deve contenere:</p>
                        <ul>
                            <li>Almeno <b>8 caratteri</b></li>
                            <li>Almeno una <b>lettera maiuscola</b></li>
                            <li>Almeno un <b>numero</b></li>
                            <li>Almeno un <b>carattere speciale</b> (@, $, !, %, *, ?, &)</li>
                        </ul>
                    </div>
                `,
                background: '#151515',
                confirmButtonColor: 'var(--brand-color)'
            });
            return; // Interrompiamo subito per far correggere la password
        }
    }

    // --- 5. CONTROLlo COINCIDENZA PASSWORD ---
    if (passInput && confPassInput && passInput.value !== confPassInput.value) {
        confPassInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Se qualcosa è andato storto, mostriamo l'errore 
    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: '<span style="color: #fff">Errore di Registrazione</span>',
            text: 'Controlla i campi contrassegnati in rosso. Assicurati che le password coincidano e che i dati siano corretti.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        return;
    }

    // 2. INVIO REALE DEI DATI AL SERVER
    const submitBtn = form.querySelector('button[type="submit"]');
    const testoOriginale = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Creazione profilo...`;

    // Creiamo un oggetto con i dati del form
    const formData = {
        userType: userType,
        nome: document.getElementById('regNome').value.trim(),
        username: document.getElementById('regUsername').value.trim(),
        email: emailInput.value.trim(),
        password: passInput.value,
        partita_iva: pivaInput ? pivaInput.value.trim() : null,
        sede_legale: document.getElementById('regSede') ? document.getElementById('regSede').value.trim() : null
    };

    // Facciamo la chiamata POST alla nostra nuova rotta
    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(async (response) => {
        const data = await response.json();
        
        if (!response.ok) {
            // Se il server ci restituisce un errore (es. email già in uso)
            throw new Error(data.error || "Errore durante la registrazione");
        }

        // Se va tutto bene, mostriamo il successo
        Swal.fire({
            icon: 'success',
            title: 'Profilo Creato!',
            html: 'Benvenuto nella nostra rete musicale. Il tuo account è attivo!',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)',
            confirmButtonText: 'Vai al Login'
        }).then(() => {
            // Mandiamo l'utente a fare il login vero e proprio
            window.location.href = '/login'; 
        });
    })
    .catch((error) => {
        // Ripristiniamo il bottone in caso di errore
        submitBtn.disabled = false;
        submitBtn.innerHTML = testoOriginale;
        
        Swal.fire({
            icon: 'error',
            title: 'Ops!',
            text: error.message,
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
    });
}