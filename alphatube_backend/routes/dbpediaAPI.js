var express = require('express');
var router = express.Router();
var request = require('request');

var dbpedia = require('../function/dbpedia');

router.post('/song_lookup', function(req, res, next) {
  try{
    let qString = req.body.qString;
    dbpedia.getSongInfo( qString).then( (data) => {
      res.send(data);
    }) 
  }catch(error){
    console.error(error);
  }
  
});


router.post('/artist/bandMembers', function(req, res, next) {
  try{
    let qString = req.body.qString;
    dbpedia.getBandMembersFromBandName(qString).then( data => {
      res.send(data);
    })
  }catch(error){
    console.error(error);
  }
});

router.post('/artist/album', function(req, res, next) {
  try{
    let qString = req.body.qString;
    dbpedia.getAlbumFromBandName(qString).then( data => {
      res.send(data);
    })
  }catch(error){
    console.error(error);
  }
});


module.exports = router;
