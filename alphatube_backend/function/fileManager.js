var fs = require('fs');
var moment = require('moment');
let manager = {};

let rootPopularityPath = __dirname + "/../../DB";
let localPopularityPath = rootPopularityPath + "/localPopularity.json";
let relationsPath = rootPopularityPath + "/relations.json";

try{
    if (!fs.existsSync(rootPopularityPath)){
        fs.mkdirSync(rootPopularityPath);
    }
}catch(error){
    console.error(error);
}


manager.readRelationFile = function(){

    return new Promise((resolve,reject) =>{

        try{
            if (fs.existsSync(relationsPath)) {
                fs.readFile(relationsPath,'utf8',(err, data) =>{
        
                    if (err) {
                        reject( err );
                    }else{
                        try{
                            resolve(JSON.parse(data));
                        }catch(error){
                            console.error(error)
                            resolve([]);
                        }
                    }
                })
            }else{
                resolve([]);
            }
        }catch(error){
            console.error(error)
        }
    })
}
manager.readRelations = function (currentIdCheck) {
   return new Promise( resolve => {
       try{
           
        manager.readRelationFile().then(recommended => {
                
                let relations = [];    
                recommended.forEach(obj => {
                if(obj.sourceA == currentIdCheck || obj.sourceB == currentIdCheck){
            
                    let maxKey = Object.keys(obj.reasons).reduce((a, b) => 
                    obj.reasons[a] > obj.reasons[b] ? a : b
                    );
            
                    relations.push({
                    "videoId" : obj.sourceA == currentIdCheck ?  obj.sourceB :  obj.sourceA,
                    "timesWatched" : obj.count,
                    "lastSelected" : moment(obj.lastSelected),
                    "prevalentReason" : maxKey,          
                    })
                }      
                });
                resolve(relations);
            }) 
        }catch(error){
            console.error(error)
        }
    })

}
manager.readLocalPopularity = function(orderBy = "timesWatched"){

    return new Promise((resolve,reject) =>{

        try{

            if (fs.existsSync(localPopularityPath)) {
                fs.readFile(localPopularityPath,'utf8',(err, data) =>{
        
                    if (err) {
                        reject( err );
                    }else{
                        try{
                            let data_sorted = JSON.parse(data).sort( (a,b) =>   a[orderBy] > b[orderBy] ? -1 : 1);
                            data_sorted = data_sorted.splice(0,30);
                            resolve(data_sorted);
                        }catch(ex){
                            resolve([]);
                        }
                    }
                })
            }else{
                resolve([]);
            }
        }catch(error){
            console.error(error);
        }


    })
}




manager.writeLocalPopularity = function (data){


    fs.writeFile(localPopularityPath, JSON.stringify(data), { flag: 'w' }, function (err) {
        if (err) throw err;
    });
    
   
}
manager.updateRelations = function(relations){
    return new Promise((resolve) => {
        manager.readRelationFile().then(data => {
            let allRelations = data;
            if (data && data.length == 0) resolve() 
            relations.forEach((relation) => {

                let found = false;
                allRelations.forEach(obj =>{
                    if(obj.sourceA == relation.source && obj.sourceB == relation.target || obj.sourceA == relation.target && obj.sourceB == relation.source){
                        found = true;
                        obj.count ++;
                        obj.reasons[relation.reason] ++;
                        obj.lastSelected = Date.now();
                    }
                })
                if(!found){
                    allRelations.push({
                        sourceA : relation.source,
                        sourceB : relation.target,
                        reasons :  {[relation.reason] : 1},
                        count : 1,
                        lastSelected : Date.now()
                    })
                }
            })
            fs.writeFile(relationsPath, JSON.stringify(allRelations), { flag: 'w' }, function (err) {
                resolve()
            });
        })
    })
}
manager.updateLocalPopularity = function(updateVideo){
    return new Promise((resolve,reject) =>{
        let found = false;
        this.readLocalPopularity().then( (videoStored) => {
            
              videoStored.forEach(video => {
                if(video.videoID == updateVideo.videoID){
                    video.timesWatched ++;
                    //TODO - Dovrebbe fare una media sulle reasons...
                    video.reasons = updateVideo.recommender;
                    video.lastSelected = moment();
    
                    found=true;
                }
            });
    
            if(!found){
                videoStored.push({
                    videoID : updateVideo.videoID,
                    timesWatched : 1,
                    //TODO - Dovrebbe fare una media sulle reasons...
                    reasons: updateVideo.recommender,
                    lastSelected : moment()
                })
            }
            this.writeLocalPopularity(videoStored);
    

            resolve();
        })
    })

}

module.exports = manager;