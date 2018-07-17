var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectId;
var multiparty = require('connect-multiparty');
var fs = require('fs');

var app = express();
var banco = process.env.NOME_BANCO || 'mongodb://hudso_hip.hop12@hotmail.com:Starwark11!@ds235431.mlab.com' ;
var nomedobanco = process.env.BANCO || 'instagran' ;
var portaBanco  = process.env.PORTA_BANCO || 27017 ;

var db = new mongodb.Db(nomedobanco,new mongodb.Server(banco,35431,{}));
//var db = new mongodb.Db(nomedobanco,new mongodb.Server(banco,portaBanco,{}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(multiparty())

app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers","content-type");
    res.setHeader("Access-Control-Allow-Credentials",true);

    next();
})

app.get('/',function(req,res){

    res.send({msg:'olá'})
});

app.post('/api',function(req,res){


    var date = new Date();
    var time_stamp = date.getTime();
  
    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;
    
    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/'+ url_imagem;


    fs.rename(path_origem,path_destino,function(err){
        if(err){
            res.status(500).json({error:err});
            return;
        }

        var dados = {
            url_imagem:url_imagem,
            titulo:req.body.titulo
        }
    

    db.open(function(err,mongoclient){
        mongoclient.collection('postagens',function(err,collection){
             collection.insert(dados,function(err,records){
                if(err){
                    res.json({'status' : 'erro'});
                 }else{
                     res.json({'status' : 'inclusão realizada com sucesso'});
                }
                 mongoclient.close();
                });
            });
        });
    });
});
         

app.get('/',function(req,res){
   res.send({menssagem:'olá mundo'})
 });
  


app.get('/api',function(req,res){

    res.setHeader("Access-Control-Allow-Origin","*");

    db.open(function(err,mongoclient){
        mongoclient.collection('postagens',function(err,collection){
            collection.find().toArray(function(err,results){
                if(err){
                    res.json(err)
                }else{
                    res.json(results)
                }
                mongoclient.close();
            });
        });
    });
});

app.get('/api/:id',function(req,res){
    db.open(function(err,mongoclient){
        mongoclient.collection('postagens',function(err,collection){
            collection.find(objectId(req.params.id)).toArray(function(err,results){
                if(err){
                res.status(200).json(err)
                }else{
                res.status(500).json(results)
                }
                mongoclient.close();
            });
        });
    });
});

app.get('/imagens/:imagem',function(req,res){

    var img = req.params.imagem

    fs.readFile('./uploads/'+img,function(err,content){
        if(err){
        res.status(400).json(err)
        }else{
        
        res.writeHead(200,{'Content-Type':'image/jpg'})
        res.end(content)
        }
    })

})

app.put('/api/:id',function(req,res){
  
    db.open(function(err,mongoclient){
        mongoclient.collection('postagens',function(err,collection){
            if(req.body.comentario==""){
                res.status(404)
            }else{
                collection.update(
                {_id:objectId(req.params.id)},
                {$push : {comentarios:
                                    {
                                    id_comentario:new objectId(),
                                    comentario:req.body.comentario
                                     }
                        }
                },
                {},
                function(err,records){
                    if(err){
                        res.json(err);
                    }else{
                        res.json(records);
                    }
                })  
                mongoclient.close();
            }
            });
        });
    
    });

    app.delete('/api/:id',function(req,res){
        db.open(function(err,mongoclient){
            mongoclient.collection('postagens',function(err,collection){
                collection.update(
                    {},
                    {$pull: {
                                comentarios:{id_comentario : objectId(req.params.id)}
                            }
                    },
                    {multi:true},
                    function(err,records){
                        if(err){
                            res.json(err);
                        }else{
                            res.json(records);
                        }
                    mongoclient.close();
                    }
                );
            });
        });
    });

var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
