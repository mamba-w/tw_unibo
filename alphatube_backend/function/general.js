var request = require('request');
general = {};

general.getWikiPage = function(qString,optionalString){
    try{
        return new Promise( (resolve,reject) => {
            request.get('https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=' + encodeURI(qString),function (error, response, body) {
                
                if (!error && response.statusCode == 200) {
                    let response = JSON.parse(body);
                    
                    if(response.query == undefined || response.query.search.length == 0){
                        if(optionalString == undefined) {
                            resolve({pageid:-1});
                        }else{
                            general.getWikiPage(optionalString).then((data) => {
                                resolve(data);
                            });
                        }
                    }else{
                        resolve(response.query.search[0]);
                    }
                }else{
                    resolve({pageid:-1});   
                }
            });
        });
   
    }catch(error){
      console.error(error);
    }
}

general.getMissingData = function (obj) {
    try{
        let allPromises = [];
    
        obj.forEach((video) =>{
            if(video.title == ""){
                allPromises.push(
                    new Promise((resolve,reject) => {
                        //Todo Integrare API youtube e fillare la variabile "video", dopo di che resolve();
                    })
    
                    
                )
            }
        })
        return Promise.all(allPromises);
    }catch(error){
      console.error(error);
    }


}



general.getDefaultVideo = function () {
    try{
        return new Promise ((resolve,reject) => {
            request.get('http://site1825.tw.cs.unibo.it/video.json',function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        resolve(JSON.parse(body));
                    }
            })
        })
    }catch(error){
      console.error(error);
    }
    
        
}

module.exports = general;