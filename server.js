"use strict";

// Importazione librerie
const express = require("express");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const flash = require("express-flash");
const { initDB } = require('./db/database');

// Importazione rotte
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const ordiniRouter = require('./routes/ordini');
const noleggiRouter = require('./routes/noleggi');

// Inizializzazione applicazione Express
const app = express();
// Uso la porta 3000 di default
const PORT = 3000;

// Configurazione EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Strumenti di base (Middleware)
app.use(morgan("dev")); // Morgan: stampa nel terminale le pagine visitate
app.use(express.static("public")); // Permette di caricare CSS, immagini e JS del frontend
app.use(express.json()); // Serve per leggere i dati JSON
app.use(express.urlencoded({ extended: true })); // Serve per leggere i dati inviati dai form

// Configurazione della Sessione (Per mantenere gli utenti loggati)
app.use(session({
  // Se non trova il file .env, usa una stringa di riserva per non far crashare il server
  secret: process.env.SECRET_SESSION || "chiave_segreta_bassi",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000 // La sessione scade dopo 1 ora (in millisecondi)
  }
}));

// Attivo Passport (per il login) e Flash (per i messaggi di errore/successo)
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Variabili Globali: rende disponibili le informazioni dell'utente in tutti i file .ejs
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  res.locals.isAuth = req.isAuthenticated();
  next();
});

// Configurazione rotte
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ordini', ordiniRouter);
app.use('/api/noleggi', noleggiRouter);

// Accensione del Server e del Database in sequenza
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Errore critico nell'avvio del database:", err);
});