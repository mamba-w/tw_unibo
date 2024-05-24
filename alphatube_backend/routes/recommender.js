var express = require('express');
var router = express.Router();
var request = require('request');

var dbpedia = require('../function/dbpedia');
var popularity = require('../function/popularity');
var generalFunction = require('../function/general');


var url = 'https://www.googleapis.com/youtube/v3/search?'
var part = 'part=snippet'
var mykey='&key=AIzaSyCO9-_B0K9v--MyJ1avz-DbrbBTc9EkKv0'
var type ='&type=video'
var videoCategoryID = '&videoCategoryId=10'
var videoEmbeddable = '&videoEmbeddable=true'
var videoLicense = '&videoLicense=any'
var videoSyndicated = "&videoSyndicated=true"
var randomNumber = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
var maxResult= '&maxResults='+randomNumber;
var order = '&order=relevance';



//Playlist di vitali
router.post('/vitali', function(req, res, next) {

    try{
        request.get(
            'http://site1825.tw.cs.unibo.it/TW/globpop',
            function (error, response, body) {
                let respConverted = [];
                JSON.parse(body).recommended.forEach(obj => {
                    respConverted.push({
                        category: "",
                        videoId:obj.videoID,
                        artist: "",
                        title : "",
                        recommender: "vitali",
                    })
                });
                res.send(respConverted);
            }
        );
   
    }catch(error){
      console.error(error);
    }
    
});

//50 video selezionati dal corso
router.post('/default', function(req, res, next) {
    try{
   
        generalFunction.getDefaultVideo().then(data => {
            let respConverted = [];
            data.forEach(obj => {
                respConverted.push({
                    category: obj.category,
                    videoId:obj.videoID,
                    artist: obj.artist,
                    title : obj.title,
                    recommender: "default",
                })
            });
            res.send(respConverted);
        })
    }catch(error){
      console.error(error);
    }
});



router.post('/random',function(req,res,next){        
    try{   
        var text="";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
        for (var i = 0; i < 2; i++){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
    
        site = url+part+maxResult+order+"&q="+text+type+videoCategoryID+videoEmbeddable+mykey;
        request.get(
            site,function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let respConverted = [];
                    JSON.parse(body).items.forEach(obj => {
                        respConverted.push({
                            category:"" ,
                            videoId:obj.id.videoId,
                            artist: "",
                            title : obj.snippet.title,
                            recommender: "random",
                        })
                    });
                    res.send(respConverted);
                }
            }
        );  
    }catch(error){
      console.error(error);
    }
});

router.post('/search',function(req,res){
    try{
        site = url+part+maxResult+order+"&q="+req.body.qString+type+videoSyndicated+videoEmbeddable+videoLicense+mykey;
    
        request.get(
            site,function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let respConverted = [];
                    let response = JSON.parse(body);
                    
                    if(response.items[0].id.videoId == req.body.qString){
                        response.items = response.items.slice(0,1);
                    }
                    response.items.forEach(obj => {
                        respConverted.push({
                            category:"" ,
                            videoId:obj.id.videoId,
                            artist: "",
                            title : obj.snippet.title,
                            recommender: "search",
                        })
                    });
                    res.send(respConverted);
                }
            }
        );  
        
    }catch(error){
      console.error(error);
    }
});


  
router.post('/related', function(req, res) {
    try{
   
        releatedToVideoId ='&relatedToVideoId='+req.body.request;
        site = url+part+maxResult+order+releatedToVideoId+type+videoSyndicated+videoEmbeddable+videoLicense+mykey;
    
        request.get(
            site,function (error, response, body) {
                
                if (!error && response.statusCode == 200) {
                    let respConverted = [];
                    JSON.parse(body).items.forEach(obj => {
                        respConverted.push({
                            category:"" ,
                            videoId:obj.id.videoId,
                            artist: "",
                            title : obj.snippet.title,
                            recommender: "related",
                        })
                    });
                    res.send(respConverted);
                }
            }
        );  
    }catch(error){
      console.error(error);
    }
});


router.post('/popularity',function(req,res) {
    try{
   
        let type = req.body.type;
        
        new Promise((resolve) => {
            switch(type){
                //I video più visti	dagli utenti di tutti i progetti del corso
                case 'global_absolute': {
                    popularity.loadPopularityGlobalAbsolute().then( (data) => {
                        resolve(data);
                    })
                }
                break;
                //I video più visti dagli utenti del progetto
                case 'local_absolute': {
                    popularity.loadPopularityLocalAbsolute().then( (data) => {
                        resolve(data);
                    })
                }
                break;
                 case 'local_last_view': {
                    popularity.loadPopularityLastView().then( (data) => {
                        resolve(data);
                    })
                }
                break;               
                case 'local_relative': {
                    popularity.loadPopularityLocalRelative(req.body.videoId).then( (data) => {
                        resolve(data);
                    })
                }
                case 'global_relative': {
                    popularity.loadPopularityGlobalRelative(req.body.videoId).then( (data) => {
                        resolve(data);
                    })
                }
                break;
            }
        }).then( (data) => {
    
            let respConverted = [];
            data.forEach(obj => {
                if(obj.videoId != undefined) obj.videoID = obj.videoId;
    
                respConverted.push({
                    category:"" ,
                    videoId:obj.videoID,
                    artist: "",
                    title : "",
                    recommender: type,
                })
            });
    
            
    
            res.send(respConverted);
        })
    }catch(error){
      console.error(error);
    }
});

module.exports = router;


