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

// 1. RECUPERA TUTTI GLI ORDINI
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const ordini = await db.all('SELECT * FROM ordini ORDER BY id_ordine DESC');
        
        // Riconvertiamo la colonna prodotti da Testo ad Array
        const ordiniFormattati = ordini.map(o => {
            return { ...o, prodotti: JSON.parse(o.prodotti) };
        });
        
        res.json(ordiniFormattati);
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero degli ordini" });
    }
});

// 2. CREA UN NUOVO ORDINE E SCALA IL MAGAZZINO
router.post('/', async (req, res) => {
    try {
        const { username, totale, prodotti } = req.body;
        const dataOdierna = new Date().toLocaleDateString('it-IT');
        
        const db = await getDB();
        
        // 1. Inseriamo il nuovo ordine nella tabella 'ordini'
        await db.run(`
            INSERT INTO ordini (username, data, totale, prodotti)
            VALUES (?, ?, ?, ?)
        `, [username, dataOdierna, totale, JSON.stringify(prodotti)]);
        
        // 2. Scaliamo le quantità dal magazzino per ogni prodotto nel carrello
        for (const item of prodotti) {
            await db.run(`
                UPDATE prodotti 
                SET disponibilita = disponibilita - ? 
                WHERE id = ?
            `, [item.quantita, item.id]);
        }
        
        res.status(201).json({ message: "Ordine completato e magazzino aggiornato!" });
    } catch (error) {
        console.error("Errore salvataggio ordine:", error);
        res.status(500).json({ error: "Impossibile salvare l'ordine e aggiornare il magazzino" });
    }
});

// 3. MODIFICA STATO DELL'ORDINE (Admin)
router.put('/:id', async (req, res) => {
    try {
        const { stato } = req.body;
        const db = await getDB();
        await db.run('UPDATE ordini SET stato = ? WHERE id_ordine = ?', [stato, req.params.id]);
        res.json({ message: "Stato aggiornato!" });
    } catch (error) {
        res.status(500).json({ error: "Errore aggiornamento stato" });
    }
});

module.exports = router;