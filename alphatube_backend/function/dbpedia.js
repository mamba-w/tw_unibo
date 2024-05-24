var request = require('request');

dbpedia = {};
dbpedia.getSongInfo = function (qString){
  try{
   
    return new Promise( (resolve,reject) => {

        qString = qString.split(" ").join("_");
        // Steps: check if the video title is a song, if true get artist name, if false i assume it is an artist or a band. Then try to get the songs of the artist, if doesn't work try with the $
        
        var songQuery = "SELECT ?song_name,?artist_name,?genre_name WHERE { \
                            ?song a dbo:Song . \
                            ?song rdfs:label ?song_name . \
                            ?song <http://dbpedia.org/ontology/artist> ?artist .  \
                            ?song <http://dbpedia.org/ontology/genre> ?genre . \
                            ?genre rdfs:label ?genre_name . \
                            ?artist rdfs:label ?artist_name . \
                            ?song_name bif:contains \""+ qString +"\" . \
                            FILTER (lang(?artist_name ) = 'en') \
                            FILTER (lang(?song_name ) = 'en') \
                        }";
        /*
        var songQuery = "SELECT *\
                                WHERE { \
                                  ?song a <http://dbpedia.org/class/yago/Music107020895> . \
                                  ?song rdfs:label ?song_name . \
                                  ?song a dbo:Single .\
                                  ?song_name bif:contains \""+ qString +"\" .\
                                  OPTIONAL{\
                                    ?song <http://dbpedia.org/ontology/musicalArtist> ?artist .\
                                    ?artist rdfs:label ?artist_name . \
                                    FILTER (lang(?artist_name ) = 'en') \
                                  }\
                                  OPTIONAL{\
                                    ?song <http://dbpedia.org/ontology/artist> ?artist_2 .\
                                    ?artist_2 rdfs:label ?artist_name_2 . \
                                    FILTER (lang(?artist_name_2 ) = 'en') \
                                  }\
                                  OPTIONAL{\
                                    ?song  <http://dbpedia.org/ontology/musicalBand> ?band.\
                                    ?band rdfs:label ?band_name\
                                    FILTER (lang(?band_name ) = 'en') \
                                  }\
                                  OPTIONAL{\
                                    ?song 	<http://dbpedia.org/class/yago/MusicGenre107071942> ?genre .\
                                    ?genre rdfs:label ?genre_name . \
                                    FILTER (lang(?genre_name ) = 'en') \
                                  }\
                                  OPTIONAL{\
                                    ?song <http://dbpedia.org/ontology/genre> ?genre_dbo . \
                                    ?genre_dbo rdfs:label ?genre_dbo_name . \
                                    FILTER (lang(?genre_dbo ) = 'en') \
                                  }\
                                }";
*/
        request('http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=' + encodeURIComponent(songQuery) + '&output=json', function (error, response, body){
            try{
              body = JSON.parse(body)
              if (!error && response.statusCode == 200 && body.results.bindings.length > 0) {


                resolve({
                  "artist": body.results.bindings[0].artist_name != undefined ?  body.results.bindings[0].artist_name.value : body.results.bindings[0].artist_name_2  != undefined ? body.results.bindings[0].artist_name_2.value : "" ,
                  "song" : body.results.bindings[0].song_name != undefined ? body.results.bindings[0].song_name.value : "",
                  "genre" :  body.results.bindings[0].genre_name != undefined ?  body.results.bindings[0].genre_name.value : body.results.bindings[0].genre_dbo  != undefined ? body.results.bindings[0].genre_dbo.value : "" ,
                  "query" : songQuery,
                });
              }else{
                resolve({
                  "error": "-1",
                  "description" : "not found",
                  "query" : songQuery,
                });
              }
            }catch(error){
                console.error(error);
                resolve({error:-1,text:body,"query" : songQuery});
            }
        })

    })
  }catch(error){
    console.error(error);
  }
}

dbpedia.getBandMembersFromBandName = function (qString) {
  try{
   
    return new Promise ((resolve,reject ) => {
        qString = qString.split(" ").join("_");

        var songQuery = "SELECT ?band_name , ?member_name WHERE { \
                              ?band a dbo:Band . \
                              ?band rdfs:label ?band_name . \
                              ?band rdf:type <http://dbpedia.org/ontology/Band> . \
                              ?band <http://dbpedia.org/ontology/formerBandMember> ?member . \
                              ?member rdfs:label ?member_name . \
                              ?band_name bif:contains \""+qString+"\" .\
                              FILTER( lang(?member_name) = 'en' ) \
                              FILTER( lang(?band_name ) = 'en' ) \
                        }";
        request('http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=' + encodeURIComponent(songQuery) + '&output=json', function (error, response, body){
            try{
              body = JSON.parse(body);
              let response_array = [];
              if (!error && response.statusCode == 200 && body.results.bindings.length > 0) {

                body.results.bindings.forEach( (obj) => {
                    response_array.push({
                        "band_name" : obj.band_name.value,
                        "member_name" : obj.member_name.value
                    })
                })

                resolve(response_array);
              }else{
                resolve({
                 
                });
              }
            }catch(error){
              console.error(error);
              resolve({error:-1,text:body});
            }
        })
    })
  }catch(error){
    console.error(error);
  }

}

dbpedia.getAlbumFromBandName = function (qString) {
  try{
    return new Promise ((resolve,reject ) => {
        qString = qString.split(" ").join("_");

        var songQuery = "SELECT ?band_name , ?member_name WHERE { \
                              ?band a dbo:Band . \
                              ?band rdfs:label ?band_name . \
                              ?band rdf:type <http://dbpedia.org/ontology/Band> . \
                              ?band <http://dbpedia.org/ontology/formerBandMember> ?member . \
                              ?member rdfs:label ?member_name . \
                              ?band_name bif:contains \""+qString+"\" .\
                              FILTER( lang(?member_name) = 'en' ) \
                              FILTER( lang(?band_name ) = 'en' ) \
                        }";
        request('http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=' + encodeURIComponent(songQuery) + '&output=json', function (error, response, body){
            try{
              body = JSON.parse(body);
              let response_array = [];
              if (!error && response.statusCode == 200 && body.results.bindings.length > 0) {

                body.results.bindings.forEach( (obj) => {
                    response_array.push({
                        "band_name" : obj.band_name.value,
                        "member_name" : obj.member_name.value
                    })
                })

                resolve(response_array);
              }else{
                resolve({
                 
                });
              }
            }catch(ex){
              resolve({error:-1,text:body});
            }
        })
    })
   
  }catch(error){
    console.error(error);
  }

}


module.exports = dbpedia;