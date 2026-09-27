'use strict';
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function getDB() {
    return await sqlite.open({ filename: './db/rocknbass.sqlite', driver: sqlite3.Database });
}

exports.tuttiINoleggi = async () => {
    const db = await getDB();
    return await db.all('SELECT * FROM noleggi ORDER BY id_noleggio DESC');
};

exports.creaNoleggio = async (username, id_prodotto, canone_mensile, durata_mesi) => {
    const db = await getDB();
    const dataInizio = new Date();
    const dataFine = new Date();
    dataFine.setMonth(dataInizio.getMonth() + Number(durata_mesi));

    await db.run(`
        INSERT INTO noleggi (username, id_prodotto, data_inizio, data_fine, canone_mensile, stato)
        VALUES (?, ?, ?, ?, ?, 'Attivo')
    `, [username, id_prodotto, dataInizio.toLocaleDateString('it-IT'), dataFine.toLocaleDateString('it-IT'), canone_mensile]);

    await db.run(`UPDATE prodotti SET disponibilita = disponibilita - 1 WHERE id = ?`, [id_prodotto]);
};