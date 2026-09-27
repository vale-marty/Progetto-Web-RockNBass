'use strict';
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function getDB() {
    return await sqlite.open({ filename: './db/rocknbass.sqlite', driver: sqlite3.Database });
}

exports.creaRichiesta = async (nome, telefono, email, motivo, messaggio) => {
    const db = await getDB();
    const dataOdierna = new Date().toLocaleDateString('it-IT');
    await db.run(`
        INSERT INTO richieste (nome, telefono, email, motivo, messaggio, data)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [nome, telefono, email, motivo, messaggio, dataOdierna]);
};

exports.tutteLeRichieste = async () => {
    const db = await getDB();
    return await db.all('SELECT * FROM richieste ORDER BY id DESC');
};

exports.segnaComeLetta = async (id) => {
    const db = await getDB();
    await db.run('UPDATE richieste SET letta = 1 WHERE id = ?', [id]);
};

exports.eliminaRichiesta = async (id) => {
    const db = await getDB();
    await db.run('DELETE FROM richieste WHERE id = ?', [id]);
};