'use strict';
const express = require('express');
const router = express.Router();
const noleggioDao = require('../dao/noleggioDao');

router.get('/', async (req, res) => {
    try {
        res.json(await noleggioDao.tuttiINoleggi());
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero dei noleggi" });
    }
});

router.post('/', async (req, res) => {
    try {
        const { username, id_prodotto, canone_mensile, durata_mesi } = req.body;
        await noleggioDao.creaNoleggio(username, id_prodotto, canone_mensile, durata_mesi);
        res.status(201).json({ message: "Contratto registrato!" });
    } catch (error) {
        res.status(500).json({ error: "Impossibile registrare il noleggio" });
    }
});

module.exports = router;