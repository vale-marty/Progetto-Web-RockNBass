'use strict';

const express = require('express');
const router = express.Router();

const prodottoDao = require('../dao/prodottoDao');
const richiestaDao = require('../dao/richiestaDao');

// Rotta Home Page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'RockNBass - Vendita e Noleggio Bassi Elettrici',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Prodotti
router.get('/prodotti', (req, res) => {
    res.render('prodotti', {
        title: 'RockNBass - Catalogo Bassi',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Scuole 
router.get('/scuole', (req, res) => {
    res.render('scuole',{
        title: 'RockNBass - Servizi Scuole',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Contatti
router.get('/contatti', (req, res) => {
    res.render('contatti', {
        title: 'RockNBass - Contatti',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Carrello
router.get('/carrello', (req, res) => {
    res.render('carrello', {
        title: 'RockNBass - Carrello',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Dettaglio Prodotto Singolo 
router.get('/prodotto-singolo', (req, res) => {
    res.render('prodotto-singolo', {
        title: 'RockNBass - Dettaglio',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagamento
router.get('/pagamento', (req, res) => {
    res.render('pagamento', {
        title: 'RockNBass - Checkout',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina di Login
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'RockNBass - Accedi',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina di Registrazione
router.get('/registrazione', (req, res) => {
    res.render('registrazione', {
        title: 'RockNBass - Registrati',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Account 
router.get('/account', (req, res) => {
    res.render('account', {
        title: 'RockNBass - Il tuo Profilo',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta API per ottenere tutti i prodotti dal database
router.get('/api/prodotti', async (req, res) => {
    try {
        const prodottiFormattati = await prodottoDao.tuttiIProdotti();
        res.json(prodottiFormattati);
    } catch (error) {
        console.error("Errore API prodotti:", error);
        res.status(500).json({ error: "Errore nel recupero dei prodotti" });
    }
});

// Rotta API per ricevere i messaggi dal modulo di contatto
router.post('/api/contatti', async (req, res) => {
    try {
        const { nome, telefono, email, motivo, messaggio } = req.body;
        await richiestaDao.creaRichiesta(nome, telefono, email, motivo, messaggio);
        res.status(201).json({ message: "Messaggio inviato con successo!" });
    } catch (error) {
        console.error("Errore salvataggio contatto:", error);
        res.status(500).json({ error: "Impossibile inviare il messaggio" });
    }
});

module.exports = router;