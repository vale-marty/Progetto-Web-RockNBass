'use strict';
const express = require('express');
const router = express.Router();
const prodottoDao = require('../dao/prodottoDao');
const richiestaDao = require('../dao/richiestaDao');

router.delete('/prodotti/:id', async (req, res) => {
    try {
        await prodottoDao.eliminaProdotto(req.params.id);
        res.json({ message: "Prodotto eliminato!" });
    } catch (error) {
        res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
});

router.post('/prodotti', async (req, res) => {
    try {
        await prodottoDao.salvaProdotto(req.body);
        res.json({ message: "Prodotto salvato con successo!" });
    } catch (error) {
        res.status(500).json({ error: "Impossibile salvare il prodotto" });
    }
});

router.get('/richieste', async (req, res) => {
    try {
        res.json(await richiestaDao.tutteLeRichieste());
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero delle richieste" });
    }
});

router.put('/richieste/:id/letta', async (req, res) => {
    try {
        await richiestaDao.segnaComeLetta(req.params.id);
        res.json({ message: "Richiesta segnata come letta" });
    } catch (error) {
        res.status(500).json({ error: "Errore aggiornamento richiesta" });
    }
});

router.delete('/richieste/:id', async (req, res) => {
    try {
        await richiestaDao.eliminaRichiesta(req.params.id);
        res.json({ message: "Richiesta eliminata" });
    } catch (error) {
        res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
});

module.exports = router;