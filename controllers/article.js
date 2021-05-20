'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var Article = require('../models/article');
const { exists } = require('../models/article');

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
    },

    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensage: 'Error al borrar!!!'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    mensage: 'No se ha borrado el articulo, posiblemente no existe!!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
        });
    },

    upload:(req, res) => {
        // Configurar el modulo del conect multiparty router/article.js (hecho)
        
        // Recojer el fichero de la peticion
        var fileName = 'imagen no subida...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: fileName
            });
        }

        // Conseguir el nombre y la extencion del archivo
        var filePath = req.files.file0.path;
        var fileSplit = filePath.split('\\');

        //  *ADVERTENCIA EN LINUX O MAC*
        // var fileSplit = filePath.split('/');

        // Nombre del archivo
        var fileName = fileSplit[2];

        // Extencion del fichero

        var extensionSplit = fileName.split('\.');
        var fileExt = extensionSplit[1];

        // Comprobar la extencion, solo imagenes, si es valida borrar el fichero
        if(fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif'){
            // Borrar el archivo subido
            fs.unlink(filePath, (err) => {
                return res.status(200).send({
                    status: 'error',
                    mensage: 'La extencion de la imagen no es valida!!!'
                });
            })
        }else{
            // Si todo es valido, sacando id de la url 
            var articleId = req.params.id;

            // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
            Article.findOneAndUpdate({_id: articleId}, {image: fileName}, {new:true}, (err, articleUpdated) => {
                if(err || !articleUpdated){
                    return res.status(200).send({
                        status: 'error',
                        mensage: 'Error al guardar la imagen de articulo!!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    articleUpdated
                });
            });
        }        
    },

    getImage: (req, res) => {
        var file = req.params.image;
        var filePath = './upload/articles/'+file;

        fs.exists(filePath, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(filePath));

            }else{
                return res.status(200).send({
                    status: 'error',
                    message: 'La imagen no existe!!!'
                });
            }
        })

        
    }

};   //end controller

module.exports = controller;