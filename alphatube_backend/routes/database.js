var express = require('express');
var router = express.Router();

var fileManager = require('../function/fileManager');


router.post('/',function(req,res,next){
    try{
        let params =req.body;
  
        let videoId = params.videoId;
        let recommender =params.recommender;
  
        fileManager.updateLocalPopularity({videoID:videoId,recommender:recommender}).then( (result) => {
            res.send({success:1})
        })
    }catch(error){
      console.error(error);
    }

});

router.post('/relation',function(req,res,next){
    try{
        let params =JSON.parse(req.body.relation);
        let lastItem = params[params.length - 1];
        let relationToStore = [];
    
        for(let cont = 0;cont < params.length - 1;cont ++){
            if(params[cont].videoID != lastItem.videoID){
                relationToStore.push({'source': params[cont].videoID,'target' : lastItem.videoID,'reason' : lastItem.reason});
            }
        }
    
        
    
        fileManager.updateRelations(relationToStore).then( (result) => {
            params[params.length - 1].stored = true;
            res.send(params);
        })

    }catch(error){
        console.error(error);
    }

});
module.exports = router;