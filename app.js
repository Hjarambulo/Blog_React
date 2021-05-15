'use strict'
// Cargar modulos  de node para crear el servidor 
var express = require('express');
var boddyParser = require('body-parser');

// Ejecutar express (http)
var app = express();

// Cargar ficheros rutas

var articleRouter = require('./routes/article');

// Cargar Middelwares
app.use(boddyParser.urlencoded({ extended: false }));
app.use(boddyParser.json());

// CORS

// Añadir prefijos a rutas 
app.use('/api', articleRouter);

// Exportar modulo (fichero actual)
module.exports = app;