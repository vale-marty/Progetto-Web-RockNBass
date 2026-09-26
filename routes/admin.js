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

// ROTTA 1: ELIMINA UN PRODOTTO
router.delete('/prodotti/:id', async (req, res) => {
    try {
        const db = await getDB();
        // Cancella la riga dove l'id corrisponde a quello passato nell'URL
        await db.run('DELETE FROM prodotti WHERE id = ?', [req.params.id]);
        res.json({ message: "Prodotto eliminato definitivamente!" });
    } catch (error) {
        console.error("Errore eliminazione:", error);
        res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
});

// ROTTA 2: AGGIUNGI O MODIFICA UN PRODOTTO
router.post('/prodotti', async (req, res) => {
    try {
        const db = await getDB();
        const p = req.body; // I dati inviati dal tuo form in account.js

        // Controlliamo se l'ID esiste già per decidere se fare UPDATE o INSERT
        const esistente = await db.get('SELECT id FROM prodotti WHERE id = ?', [p.id]);

        if (esistente) {
            // Se esiste, aggiorniamo (UPDATE)
            await db.run(`
                UPDATE prodotti SET 
                marca = ?, modello = ?, prezzo = ?, descrizione = ?, immagine = ?, 
                macro_categoria = ?, categoria = ?, tags = ?, disponibilita = ?, 
                prezzo_noleggio_mensile = ?, specifiche = ?
                WHERE id = ?
            `, [
                p.marca, p.modello, p.prezzo, p.descrizione, p.immagine,
                p.macro_categoria, JSON.stringify(p.categoria), JSON.stringify(p.tags),
                p.disponibilita, p.prezzo_noleggio_mensile, JSON.stringify(p.specifiche),
                p.id
            ]);
        } else {
            // Se non esiste, lo aggiungiamo come nuovo (INSERT)
            await db.run(`
                INSERT INTO prodotti (id, marca, modello, prezzo, descrizione, immagine, macro_categoria, categoria, tags, disponibilita, prezzo_noleggio_mensile, specifiche)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                p.id, p.marca, p.modello, p.prezzo, p.descrizione, p.immagine,
                p.macro_categoria, JSON.stringify(p.categoria), JSON.stringify(p.tags),
                p.disponibilita, p.prezzo_noleggio_mensile, JSON.stringify(p.specifiche)
            ]);
        }
        
        res.json({ message: "Prodotto salvato con successo nel database!" });
    } catch (error) {
        console.error("Errore salvataggio prodotto:", error);
        res.status(500).json({ error: "Impossibile salvare il prodotto" });
    }
});

// 3. RECUPERA TUTTE LE RICHIESTE DI CONTATTO
router.get('/richieste', async (req, res) => {
    try {
        const db = await getDB();
        const richieste = await db.all('SELECT * FROM richieste ORDER BY id DESC');
        res.json(richieste);
    } catch (error) {
        res.status(500).json({ error: "Errore nel recupero delle richieste" });
    }
});

// 4. SEGNA UNA RICHIESTA COME LETTA
router.put('/richieste/:id/letta', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('UPDATE richieste SET letta = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: "Richiesta segnata come letta" });
    } catch (error) {
        res.status(500).json({ error: "Errore aggiornamento richiesta" });
    }
});

// 5. ELIMINA UNA RICHIESTA DI CONTATTO
router.delete('/richieste/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM richieste WHERE id = ?', [req.params.id]);
        res.json({ message: "Richiesta eliminata" });
    } catch (error) {
        res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
});

module.exports = router;