'use strict';
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function getDB() {
    return await sqlite.open({ filename: './db/rocknbass.sqlite', driver: sqlite3.Database });
}

exports.tuttiGliOrdini = async () => {
    const db = await getDB();
    const ordini = await db.all('SELECT * FROM ordini ORDER BY id_ordine DESC');
    return ordini.map(o => ({ ...o, prodotti: JSON.parse(o.prodotti) }));
};

exports.creaOrdine = async (username, totale, prodotti) => {
    const db = await getDB();
    const dataOdierna = new Date().toLocaleDateString('it-IT');
    
    await db.run(`INSERT INTO ordini (username, data, totale, prodotti) VALUES (?, ?, ?, ?)`, 
        [username, dataOdierna, totale, JSON.stringify(prodotti)]);
        
    for (const item of prodotti) {
        await db.run(`UPDATE prodotti SET disponibilita = disponibilita - ? WHERE id = ?`, 
            [item.quantita, item.id]);
    }
};

exports.aggiornaStato = async (id_ordine, stato) => {
    const db = await getDB();
    await db.run('UPDATE ordini SET stato = ? WHERE id_ordine = ?', [stato, id_ordine]);
};