var request = require('request');
var fileManager = require('./fileManager');
var generalFunction = require('./general');


let popularity = {};

let allRecommender = [
    "1829",
    "1828",
    "1838",
 //   "1839",
 //   "1846",
 //   "1847",
 //   "1831",
 //   "1827",
 //   "1848",
 //   "1830",
 //   "1836",
 //   "1850",
 //   "1849",
 //   "1851", 
]


popularity.loadPopularityGlobalAbsolute = function(idVideo){
    try{
        return new Promise((resolve,reject) => {
    
            let allPromises = [];
            for(let i = 0;i < allRecommender.length;i++){
        
                allPromises.push(
                    new Promise((resolve,reject) =>{
                        try{
                            if(idVideo != undefined){
                                params = "?id=" + idVideo;
                            }else{
                                params = "";
                            }
                            request.get('http://site'+allRecommender[i]+'.tw.cs.unibo.it/globpop' + params,function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    try{
                                        resolve(JSON.parse(body))
                                    }catch(ex){
                                        //Risposta non in JSON
                                        resolve({});
                                    };
                                }else{
                                    resolve({});
                                }
                            });
                        }catch(ex){
                            resolve({});
                        }
        
        
                    })
                )
            }
     
            Promise.all(allPromises).then( (results) => {
    
                let allResults = [];
                results.forEach( (recommender) => {
                    if(recommender.recommended != undefined){
                        recommender.recommended.forEach((video) => {
                            let found = false;
                            allResults.forEach((resultMerge) => {
                                if(resultMerge.videoId == video.videoId){
                                    resultMerge.timesWatched = video.timesWatched;
                                    found = true;
                                }
                            })  
                            if(!found){
                                allResults.push({
                                    videoId : video.videoId,
                                    timesWatched : video.timesWatched,
                                    prevalentReason : video.prevalentReason
                                })
                            }
                        })
                    }
                })
    
                allResults = allResults.sort( (a,b) =>   a.timesWatched > b.timesWatched ? -1 : 1)
    
                resolve(allResults.slice(0,30));
            });
        });   
    }catch(error){
      console.error(error);
    }
}

popularity.loadPopularityLocalAbsolute = function(){
  return fileManager.readLocalPopularity();
}

popularity.loadPopularityLastView = function(){
    return fileManager.readLocalPopularity("lastSelected");
  }

popularity.loadPopularityLocalRelative = function(idVideo) {
    try{
        return new Promise((resolve,reject) => {
            fileManager.readRelations(idVideo).then( (localVideo) => {
                resolve(localVideo);
            })
            
        })
    }catch(error){
      console.error(error);
    }
    
}

popularity.loadPopularityGlobalRelative = function(idVideo) {
    try{
        return new Promise((resolve,reject) => {
            this.loadPopularityGlobalAbsolute(idVideo).then( (globalVideo) => {
    
                
                resolve(globalVideo);
               
            })
        })
    }catch(error){
      console.error(error);
    }
}

module.exports = popularity;