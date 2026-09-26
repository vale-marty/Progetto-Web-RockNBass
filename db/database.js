'use strict';

// Librerie per usare SQLite
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

// Funzione per avviare il database
async function initDB() {
    // Apre la connessione al database
    const db = await sqlite.open({
        filename: './db/rocknbass.sqlite',
        driver: sqlite3.Database
    });

    // Creazione della tabella 'users' (Utenti)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            ruolo TEXT DEFAULT 'privato', 
            ragione_sociale TEXT,
            partita_iva TEXT,
            sede_legale TEXT
        )
    `);

    // Creazione della tabella 'prodotti'
    await db.exec(`
        CREATE TABLE IF NOT EXISTS prodotti (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marca TEXT NOT NULL,
            modello TEXT NOT NULL,
            prezzo REAL NOT NULL,
            descrizione TEXT,
            immagine TEXT,
            macro_categoria TEXT,
            categoria TEXT, 
            tags TEXT,      
            disponibilita INTEGER DEFAULT 1,
            prezzo_noleggio_mensile REAL,
            specifiche TEXT 
        )
    `);

    // Creazione Tabella Ordini
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ordini (
            id_ordine INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            data TEXT NOT NULL,
            totale REAL NOT NULL,
            stato TEXT DEFAULT 'In lavorazione',
            prodotti TEXT NOT NULL -- Salveremo il carrello in formato JSON stringa
        )
    `);

    // Creazione Tabella Noleggi
    await db.exec(`
        CREATE TABLE IF NOT EXISTS noleggi (
            id_noleggio INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            id_prodotto INTEGER NOT NULL,
            data_inizio TEXT NOT NULL,
            data_fine TEXT NOT NULL,
            canone_mensile REAL NOT NULL,
            stato TEXT DEFAULT 'Attivo',
            FOREIGN KEY (id_prodotto) REFERENCES prodotti (id)
        )
    `);

    // Creazione Tabella Richieste Contatto
    await db.exec(`
        CREATE TABLE IF NOT EXISTS richieste (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefono TEXT NOT NULL,
            email TEXT NOT NULL,
            motivo TEXT NOT NULL,
            messaggio TEXT NOT NULL,
            data TEXT NOT NULL,
            letta INTEGER DEFAULT 0
        )
    `);

    console.log("✅ Database SQLite inizializzato. Tabelle 'users', 'prodotti', 'ordini', 'noleggio' pronte.");
    return db;
}

// Esportazione della funzione per poterla usare in server.js
module.exports = { initDB };