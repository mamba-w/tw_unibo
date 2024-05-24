var express = require('express');
var router = express.Router();
var fileManager = require('../function/fileManager');
var moment = require('moment');
const path = require('path');




/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../', 'alphatube_frontend/index.html'))
});


router.get('/globpop',function(req,res,next){
    try{
      let currentIdCheck = req.query.id;
      
      new Promise((resolve) => {

          if(currentIdCheck != undefined){
            fileManager.readRelations(currentIdCheck).then( relations =>{
              resolve(relations);
            })     
          } else{
            fileManager.readLocalPopularity().then(recommended => {
              resolve(recommended);
            })
          }
        
      }).then( data => {
        res.send({
          site: req.get('host'),
          recommender: "brufil",
          lastWatched: moment(),
          recommended: data.sort( (a,b) =>   a.timesWatched > b.timesWatched ? -1 : 1)
        })
      })
    }catch(error){
      console.error(error);
      resolve([])
    }
});


module.exports = router;
