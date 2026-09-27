'use strict';
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function getDB() {
    return await sqlite.open({ filename: './db/rocknbass.sqlite', driver: sqlite3.Database });
}

exports.creaUtente = async (nome, username, email, hashedPassword, ruolo, ragione_sociale, partita_iva, sede_legale) => {
    const db = await getDB();
    await db.run(`
        INSERT INTO users (nome, username, email, password, ruolo, ragione_sociale, partita_iva, sede_legale)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [nome, username, email, hashedPassword, ruolo, ragione_sociale, partita_iva, sede_legale]);
};

exports.trovaPerUsername = async (username) => {
    const db = await getDB();
    return await db.get('SELECT * FROM users WHERE username = ?', [username]);
};

exports.trovaPerId = async (id) => {
    const db = await getDB();
    return await db.get('SELECT id, nome, username, email, ruolo FROM users WHERE id = ?', [id]);
};