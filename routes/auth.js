'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userDao = require('../dao/userDao');

router.post('/register', async (req, res) => {
    try {
        const { userType, nome, username, email, password, partita_iva, sede_legale } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await userDao.creaUtente(nome, username, email, hashedPassword, userType, 
            userType === 'scuola' ? nome : null, 
            userType === 'scuola' ? partita_iva : null, 
            userType === 'scuola' ? sede_legale : null);

        res.status(201).json({ message: "Registrazione completata!" });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: "Username o Email già in uso." });
        res.status(500).json({ error: "Errore interno del server" });
    }
});

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await userDao.trovaPerUsername(username);
        if (!user) return done(null, false, { message: 'Username non trovato.' });
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: 'Password non corretta.' });
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userDao.trovaPerId(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: "Errore interno del server" });
        if (!user) return res.status(401).json({ error: info.message });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: "Errore durante la creazione della sessione" });
            return res.status(200).json({ message: "Login effettuato", user: { username: user.username, nome: user.nome, ruolo: user.ruolo } });
        });
    })(req, res, next);
});

module.exports = router;