var express = require('express');
var router = express.Router();
var request = require('request');

var mykey='AIzaSyCO9-_B0K9v--MyJ1avz-DbrbBTc9EkKv0'


/* GET home page. */
router.get('/info/:id/comments', function(req, res, next) {
    try{
        request.get(
            'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=10&order=relevance&videoId=' + req.params.id + '&key=' + mykey,
            function (error, response, body) {
                 if (!error && response.statusCode == 200) {
    
                    let comments = [];
                    JSON.parse(body).items.forEach(obj => {
                        comments.push({
                            authorProfileImageUrl : obj.snippet.topLevelComment.snippet.authorProfileImageUrl,
                            authorDisplayName : obj.snippet.topLevelComment.snippet.authorDisplayName,
                            textDisplay: obj.snippet.topLevelComment.snippet.textDisplay,
                            publishedAt: obj.snippet.topLevelComment.snippet.publishedAt
                        })
                    })
    
                    res.send(comments);
                }else{
                    res.send([]);
                }
            }
        );
   
    }catch(error){
      console.error(error);
    }
});
router.get('/info/:id', function(req, res, next) {
    try{
        request.get('https://www.googleapis.com/youtube/v3/videos?id=' +  req.params.id + '&key=' + mykey + '&part=snippet,contentDetails,statistics,topicDetails',
            function (error, response, body) {
                try{
                    if (!error && response.statusCode == 200) {
                        let videoInfo = JSON.parse(body).items[0];
                        if(videoInfo != undefined){
                            res.send({
                                'title': videoInfo.snippet.title,
                                'id': videoInfo.id,
                                'channelId': videoInfo.snippet.channelId,
                                'description' : videoInfo.snippet.description,
                                'channelTitle': videoInfo.snippet.channelTitle,
                                'duration': videoInfo.contentDetails.duration,
                                'description': videoInfo.snippet.description,
                                'dimension': videoInfo.contentDetails.dimension,
                                'definition': videoInfo.contentDetails.definition,
                                'commentCount': videoInfo.statistics.commentCount,
                                'viewCount': videoInfo.statistics.viewCount,
                                'likeCount': videoInfo.statistics.likeCount,
                                'dislikeCount': videoInfo.statistics.dislikeCount,
                                'tags': videoInfo.snippet.tags,
                                'topicCategories':videoInfo.topicDetails.topicCategories
                            });

                        }else{
                            res.send({});        
                        }
                    }
                }catch(error){
                    console.log(error);
                    res.send({});
                }
            }
        );
   
    }catch(error){
      console.error(error);
    }
   

    
});



module.exports = router;
