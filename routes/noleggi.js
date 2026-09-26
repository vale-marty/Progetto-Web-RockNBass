'use strict';

const express = require('express');
const router = express.Router();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function getDB() {
    return await sqlite.open({
        filename: './db/rocknbass.sqlite',
        driver: sqlite3.Database
    });
}

// 1. RECUPERA TUTTI I NOLEGGI (L'admin vede tutti, la scuola vede solo i propri)
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const noleggi = await db.all('SELECT * FROM noleggi ORDER BY id_noleggio DESC');
        res.json(noleggi);
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero dei noleggi" });
    }
});

// 2. CREA UN NUOVO CONTRATTO DI NOLEGGIO
router.post('/', async (req, res) => {
    try {
        const { username, id_prodotto, canone_mensile, durata_mesi } = req.body;
        
        const dataInizio = new Date();
        const dataFine = new Date();
        dataFine.setMonth(dataInizio.getMonth() + Number(durata_mesi));

        const dataInizioStr = dataInizio.toLocaleDateString('it-IT');
        const dataFineStr = dataFine.toLocaleDateString('it-IT');

        const db = await getDB();
        
        // Inseriamo il noleggio
        await db.run(`
            INSERT INTO noleggi (username, id_prodotto, data_inizio, data_fine, canone_mensile, stato)
            VALUES (?, ?, ?, ?, ?, 'Attivo')
        `, [username, id_prodotto, dataInizioStr, dataFineStr, canone_mensile]);

        // Scaliamo la disponibilità del prodotto a magazzino
        await db.run(`
            UPDATE prodotti 
            SET disponibilita = disponibilita - 1 
            WHERE id = ?
        `, [id_prodotto]);

        res.status(201).json({ message: "Contratto di noleggio registrato con successo!" });
    } catch (error) {
        console.error("Errore salvataggio noleggio:", error);
        res.status(500).json({ error: "Impossibile registrare il noleggio" });
    }
});

module.exports = router;