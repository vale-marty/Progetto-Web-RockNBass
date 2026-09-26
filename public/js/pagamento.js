"use strict";

document.addEventListener('DOMContentLoaded', () => {
    renderRiepilogoCheckout();
});

function renderRiepilogoCheckout() {
    const container = document.getElementById('checkout-items');
    const carrello = JSON.parse(localStorage.getItem('carrello_musica')) || [];
    const isScuola = localStorage.getItem('userType') === 'scuola';

    let totaleScontato = 0;
    let html = "";

    if (carrello.length === 0) {
        window.location.href = '/carrello';
        return;
    }

    carrello.forEach(item => {
        let prezzoFinale = item.prezzoUnitario;
        if (item.tipo === 'acquisto' && isScuola) {
            prezzoFinale = item.prezzoUnitario * 0.85;
        }

        const subTotaleScontato = prezzoFinale * item.quantita;
        totaleScontato += subTotaleScontato;

        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="pe-2">
                    <small class="text-white d-block">${item.marca} ${item.modello}</small>
                    <small class="text-white-50">${item.quantita}x | ${item.tipo.toUpperCase()}</small>
                </div>
                <span class="text-white small">€ ${subTotaleScontato.toFixed(2)}</span>
            </div>
        `;
    });

    container.innerHTML = html;

    const containerSconto = document.getElementById("sconto");
    if (containerSconto) {
        if (isScuola) {
            containerSconto.innerHTML = `
                <div class="w-100 text-end">
                    <small class="text-success fw-bold" style="font-size: 0.75rem;">
                        <i class="bi bi-percentage"></i> Sconto Scuola 15% incluso negli acquisti
                    </small>
                </div>`;
        } else {
            containerSconto.innerHTML = "";
        }
    }

    document.getElementById('check-total').innerText = `€ ${totaleScontato.toFixed(2)}`;
}

function confermaOrdine() {
    const form = document.getElementById('paymentForm');

    // --- TRIGGER DEL FUMETTO NATIVO ---
    // Se il form ha campi obbligatori vuoti, il browser mostra il fumetto e ferma la funzione
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 1. Riferimenti ai campi per validazione avanzata
    const inputs = document.querySelectorAll('input[required]');
    const emailInput = document.getElementById('payEmail');
    const cardInput = document.getElementById('payCard');
    const expInput = document.getElementById('payExp');
    const cvcInput = document.getElementById('payCvc');

    let isValid = true;

    // Reset errori grafici precedenti
    inputs.forEach(i => i.classList.remove('is-invalid', 'border-danger'));

    // Validazione Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value)) {
        emailInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Validazione Carta (almeno 16 cifre)
    const cleanCard = cardInput.value.replace(/\s+/g, '');
    if (cardInput && (cleanCard.length < 16 || isNaN(cleanCard))) {
        cardInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Validazione Scadenza (MM/AA)
    const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (expInput && !expRegex.test(expInput.value)) {
        expInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Validazione CVC (3 cifre)
    if (cvcInput && (cvcInput.value.length !== 3 || isNaN(cvcInput.value))) {
        cvcInput.classList.add('is-invalid', 'border-danger');
        isValid = false;
    }

    // Se i dati sono logicamente errati (es. carta troppo corta)
    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: '<span style="color: #fff">Oops! Pagamento non riuscito</span>',
            text: 'I dati inseriti non sembrano corretti. Controlla i campi evidenziati.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        return;
    }

    Swal.fire({
        title: '<span style="color: #fff">Confermi l\'acquisto?</span>',
        text: "L'importo verrà addebitato sulla tua carta.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-color)',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sì, paga ora!',
        cancelButtonText: 'Annulla',
        background: '#151515',
    }).then((result) => {
        if (result.isConfirmed) {
            // 3. SE L'UTENTE CONFERMA, PARTE IL CARICAMENTO
            eseguiTransazione(form);
        }
    });
}

async function eseguiTransazione(form) {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Elaborazione...`;

    // 1. Recuperiamo i dati
    const carrello = JSON.parse(localStorage.getItem('carrello_musica')) || [];
    const username = localStorage.getItem('username');
    const isScuola = localStorage.getItem('userType') === 'scuola';

    // 2. Separiamo gli acquisti dai noleggi
    const prodottiAcquisto = carrello.filter(item => item.tipo === 'acquisto');
    const prodottiNoleggio = carrello.filter(item => item.tipo === 'noleggio');

    // 3. Calcoliamo il totale solo per gli acquisti
    let totaleAcquisti = 0;
    prodottiAcquisto.forEach(item => {
        let prezzoFinale = item.prezzoUnitario;
        if (isScuola) {
            prezzoFinale = item.prezzoUnitario * 0.85; // Sconto 15% per scuole
        }
        totaleAcquisti += (prezzoFinale * item.quantita);
    });

    try {
        // 4. Se ci sono prodotti da acquistare, inviamo l'ordine
        if (prodottiAcquisto.length > 0) {
            const resOrdini = await fetch('/api/ordini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    totale: totaleAcquisti,
                    prodotti: prodottiAcquisto
                })
            });
            if (!resOrdini.ok) throw new Error("Errore salvataggio ordine di acquisto");
        }

        // 5. Se ci sono prodotti da noleggiare, inviamo i contratti di noleggio
        if (prodottiNoleggio.length > 0) {
            // Un noleggio potrebbe avere più quantità, oppure esserci più strumenti noleggiati
            for (const item of prodottiNoleggio) {
                // Se ha noleggiato 2 quantità dello stesso basso, creiamo 2 contratti separati
                for (let i = 0; i < item.quantita; i++) {
                    const resNoleggio = await fetch('/api/noleggi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: username,
                            id_prodotto: item.id,
                            canone_mensile: item.prezzoUnitario,
                            durata_mesi: 1 // Puoi implementare la scelta dei mesi in futuro, di base 1 mese
                        })
                    });
                    if (!resNoleggio.ok) throw new Error("Errore salvataggio contratto di noleggio");
                }
            }
        }

        // 6. Se tutto è andato a buon fine
        Swal.fire({
            icon: 'success',
            title: 'Pagamento Autorizzato!',
            html: 'Transazione completata con successo.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)',
            confirmButtonText: 'Vai alla Dashboard'
        }).then(() => {
            localStorage.removeItem('carrello_musica'); // Svuotiamo il carrello
            window.location.href = '/account'; // Rimandiamo all'account
        });

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Errore',
            text: 'Impossibile completare la transazione. Riprova più tardi.',
            background: '#151515',
            confirmButtonColor: 'var(--brand-color)'
        });
        btn.disabled = false;
        btn.innerHTML = `Paga Ora`;
    }
}

