'use strict';
const express = require('express');
const router = express.Router();
const ordineDao = require('../dao/ordineDao');

router.get('/', async (req, res) => {
    try {
        res.json(await ordineDao.tuttiGliOrdini());
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero degli ordini" });
    }
});

router.post('/', async (req, res) => {
    try {
        const { username, totale, prodotti } = req.body;
        await ordineDao.creaOrdine(username, totale, prodotti);
        res.status(201).json({ message: "Ordine completato e magazzino aggiornato!" });
    } catch (error) {
        res.status(500).json({ error: "Impossibile salvare l'ordine" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await ordineDao.aggiornaStato(req.params.id, req.body.stato);
        res.json({ message: "Stato aggiornato!" });
    } catch (error) {
        res.status(500).json({ error: "Errore aggiornamento stato" });
    }
});

module.exports = router;