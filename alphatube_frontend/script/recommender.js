var SERVER_PATH = "";


function loadRecommenderByType(type,params = {}){
    $('#video_preview_title').html("Recommender " + type);
    $("#"+type+"List").addClass("active").siblings().removeClass('active');

    currentRecommender = type;

    return new Promise( (resolve) => {
        mngVideoListPreview();
        $("#video_preview_content").append($('<div class="loader"></div>'))
        $.post( SERVER_PATH + "/recommender/" + type, params,function(data) { 
            $("#video_preview_content").empty();
            
            currentPlaylist = data;
           

            addToHistory({
                type : "recommenderLoad",
                typeRecommender : type,
                parameters : {
                    currentPlaylist : currentPlaylist
                }
            })


            resolve(data);
        });

    })
}


function getVideoInformation(videoInfo){
    currentVideoInfo = videoInfo;
    videoCommentsPromise = new Promise((resolve) => {
            $.get(SERVER_PATH + "/youtube/info/" + videoInfo.videoId + "/comments",function(req,res){
            videoComments = req;
            resolve();
        });
    });
    videoInfoPromise = new Promise((resolve) => {
        $.get(SERVER_PATH + "/youtube/info/" + videoInfo.videoId + "",function(req,res){
            if(req.title == undefined){
                resolve();
            }else{
                videoYTInfo = req;
                $.post(SERVER_PATH + "/wiki/info",{qString:req.title,channelName:req.channelTitle},function(req,res){
                  videoWikiInfo = req;
                  var songTitle = req.songTitle != undefined ? req.songTitle : req.title;
    
                    $.post(SERVER_PATH + "/dbpedia/song_lookup",{qString:songTitle},function(req,res){
                        videoDBPediaInfo = req;
                        resolve();
                    });
                });
            }
        });
    });


    Promise.all([videoCommentsPromise,videoInfoPromise]).then( function () {

        if(!currentVideoInfo ||  !videoYTInfo || !videoWikiInfo || !videoDBPediaInfo)return;
       //Pushare nell'history();
       addToHistory({
           type : "videoView",
           idVideo : currentVideoInfo.videoId,
           parameters : {
             currentVideoInfo : currentVideoInfo,
             videoComments: videoComments,
             videoYTInfo : videoYTInfo,
             videoWikiInfo : videoWikiInfo,
             videoDBPediaInfo : videoDBPediaInfo
           }
       })


       updateVideoUI();

    })

}


