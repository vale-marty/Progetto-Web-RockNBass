'use strict';
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function getDB() {
    return await sqlite.open({ filename: './db/rocknbass.sqlite', driver: sqlite3.Database });
}

exports.tuttiIProdotti = async () => {
    const db = await getDB();
    const prodotti = await db.all('SELECT * FROM prodotti');
    return prodotti.map(p => ({
        ...p,
        categoria: JSON.parse(p.categoria || '[]'),
        tags: JSON.parse(p.tags || '[]'),
        specifiche: JSON.parse(p.specifiche || '{}')
    }));
};

exports.eliminaProdotto = async (id) => {
    const db = await getDB();
    await db.run('DELETE FROM prodotti WHERE id = ?', [id]);
};

exports.salvaProdotto = async (p) => {
    const db = await getDB();
    const esistente = await db.get('SELECT id FROM prodotti WHERE id = ?', [p.id]);

    if (esistente) {
        await db.run(`
            UPDATE prodotti SET 
            marca = ?, modello = ?, prezzo = ?, descrizione = ?, immagine = ?, 
            macro_categoria = ?, categoria = ?, tags = ?, disponibilita = ?, 
            prezzo_noleggio_mensile = ?, specifiche = ? WHERE id = ?
        `, [
            p.marca, p.modello, p.prezzo, p.descrizione, p.immagine,
            p.macro_categoria, JSON.stringify(p.categoria), JSON.stringify(p.tags),
            p.disponibilita, p.prezzo_noleggio_mensile, JSON.stringify(p.specifiche), p.id
        ]);
    } else {
        await db.run(`
            INSERT INTO prodotti (id, marca, modello, prezzo, descrizione, immagine, macro_categoria, categoria, tags, disponibilita, prezzo_noleggio_mensile, specifiche)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            p.id, p.marca, p.modello, p.prezzo, p.descrizione, p.immagine,
            p.macro_categoria, JSON.stringify(p.categoria), JSON.stringify(p.tags),
            p.disponibilita, p.prezzo_noleggio_mensile, JSON.stringify(p.specifiche)
        ]);
    }
};