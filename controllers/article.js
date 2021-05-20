'use strict'

var validator = require('validator');
var Article = require('../models/article');

var controller = {

    datosCurso: (req, res) => {
    
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Victor Robles WEB',
            url: 'victorroblesweb.es'
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        // Recoger parametros por post
        var params = req.body;

        // Validar datos (validator)
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                mensage: 'faltan datos por enviar!!!'
            });
        }

        if (validateTitle && validateContent){
            // Crear el objeto a guardar 
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null; 

            // Guardar el articulo
            article.save((err, articleStored) => {
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        mensage: 'El articulo no se ha guardado!!!'
                    });
                }

                // Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            }); 
            
        }else{
            return res.status(200).send({
                status: 'error',
                mensage: 'los datos no son validos!!!'
            });
        }       
    },

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }

        // Find
        query.sort('-_id').exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensage: 'Error al devolver los articulos!!!'
                }); 
            }

            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    mensage: 'No hay articulos para mostrar!!!'
                }); 
            }

            return res.status(200).send({
                status: 'success',
                articles
            }); 
        });
        
    },

    getArticle: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        // Comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                mensage: 'No existe el articulo!!!'
            });
        }

        // Buscar el articulo
        Article.findById(articleId, (err, article) => {
            
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    mensage: 'No existe el articulo!!!'
                });
            }
            
            // Devolverlo en json
            return res.status(200).send({
                status: 'success',
                article
            });
        });

    },

    update: (req, res) => {
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put 
        var params = req.body;
        
        // Validar datos 
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                status: 'error',
                mensage: 'Faltan datos por enviar!!!'
            });
        }

        if(validateTitle && validateContent){
            // Find and update
            Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        mensage: 'Error al actualizar!!!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        mensage: 'No existe el articulo!!!'
                    });
                }

                return res.status(500).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        }else{
            // Devolver respuesta
            return res.status(200).send({
                status: 'error',
                mensage: 'La validacion no es correcta!!!'
            });
        }
    }

};   //end controller

module.exports = controller;