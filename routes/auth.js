'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Funzione rapida per collegarsi al DB
async function getDB() {
    return await sqlite.open({
        filename: './db/rocknbass.sqlite',
        driver: sqlite3.Database
    });
}

// Rotta POST per la registrazione
router.post('/register', async (req, res) => {
    try {
        // 1. Estraiamo i dati che il tuo file registrazione.js ha inviato
        const { userType, nome, username, email, password, partita_iva, sede_legale } = req.body;

        // 2. Criptiamo la password (il numero 10 è il "costo" della cifratura, standard e sicuro)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Apriamo il DB e inseriamo il nuovo utente
        const db = await getDB();
        await db.run(`
            INSERT INTO users (nome, username, email, password, ruolo, ragione_sociale, partita_iva, sede_legale)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nome,
            username,
            email,
            hashedPassword,
            userType,
            userType === 'scuola' ? nome : null, // Se è scuola, usiamo il nome come ragione sociale
            userType === 'scuola' ? partita_iva : null,
            userType === 'scuola' ? sede_legale : null
        ]);

        // 4. Rispondiamo al frontend che è andato tutto bene
        res.status(201).json({ message: "Registrazione completata!" });

    } catch (error) {
        console.error("Errore registrazione:", error);
        // Controlliamo se l'errore è dovuto a username o email già esistenti
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: "Username o Email già in uso." });
        }
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// --- CONFIGURAZIONE PASSPORT.JS ---
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const db = await getDB();
            // 1. Cerca l'utente nel database
            const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
            
            if (!user) {
                return done(null, false, { message: 'Username non trovato.' });
            }
            
            // 2. Confronta la password inserita con quella criptata nel database
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Password non corretta.' });
            }
            
            // 3. Login valido! Restituisce l'utente
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Salva l'ID dell'utente nella sessione (crea il cookie)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Recupera i dati dell'utente dal DB a ogni cambio pagina usando l'ID della sessione
passport.deserializeUser(async (id, done) => {
    try {
        const db = await getDB();
        const user = await db.get('SELECT id, nome, username, email, ruolo FROM users WHERE id = ?', [id]);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// --- ROTTA POST PER IL LOGIN ---
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: "Errore interno del server" });
        if (!user) return res.status(401).json({ error: info.message }); // Password errata o utente non trovato
        
        // Stabilisce la sessione effettiva
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: "Errore durante la creazione della sessione" });
            
            // Risponde al frontend con i dati base dell'utente (senza inviare la password!)
            return res.status(200).json({ 
                message: "Login effettuato", 
                user: { 
                    username: user.username, 
                    nome: user.nome, 
                    ruolo: user.ruolo 
                } 
            });
        });
    })(req, res, next);
});

module.exports = router;