'use strict';

const express = require('express');
const router = express.Router();

// Rotta Home Page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'RockNBass - Vendita e Noleggio Bassi Elettrici',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Prodotti
router.get('/prodotti', (req, res) => {
    res.render('prodotti', {
        title: 'RockNBass - Catalogo Bassi',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Scuole 
router.get('/scuole', (req, res) => {
    res.render('scuole',{
        title: 'RockNBass - Servizi Scuole',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Pagina Contatti
router.get('/contatti', (req, res) => {
    res.render('contatti', {
        title: 'RockNBass - Contatti',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

// Rotta Carrello
router.get('/carrello', (req, res) => {
    res.render('carrello', {
        title: 'RockNBass - Carrello',
        user: req.user || null,
        isAuth: req.isAuthenticated()
    });
});

module.exports = router;