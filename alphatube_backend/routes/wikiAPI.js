
var express = require('express');
var router = express.Router();
var request = require('request');
const getArtistTitle = require('get-artist-title');

var generalFunction = require('../function/general');


router.post('/pageid', function(req, res, next) {

    try{
        let qString = req.body.qString;
       
    
        generalFunction.getWikiPage(qString).then( (page) => {
            
                res.send({
                    page : page
                });
        })
    }catch(error){
      console.error(error);
    }

    
});

router.post('/info', function(req, res, next) {
    try{
        
            let qString = req.body.qString;

            if(qString == undefined){
                res.send({
                    title : "",
                    extract : ""
                });
            }else{

                let channelName = req.body.channelName != undefined ? req.body.channelName : "";
                
            
                const [ artist, title ] = getArtistTitle(qString, {
                    defaultArtist: channelName
                })
                let queryString ="";
                if(title == undefined) {
                    queryString = qString;
                }else{
                    
                    queryString = "intitle:" + title + "_(song) of " + artist ;
                }
            
                generalFunction.getWikiPage(queryString,qString).then( (page) => {
                    if(page.pageid == -1){
                        res.send({
                            title : "No data found on wiki :/",
                            extract : ""
                        });
                    }else{
                        request.get('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&redirects=1&pageids=' + page.pageid,function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                               
                                let objResponse = JSON.parse(body).query.pages;
                                let element = objResponse[Object.keys(objResponse)[0]]
                
                                res.send({
                                    title : element.title,
                                    extract : element.extract,
                                    songTitle: title
                                });
                            }
                        })
                    }
                })
       
            }

    }catch(error){
      console.error(error);
    }
});



module.exports = router;