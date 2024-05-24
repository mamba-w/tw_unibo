var player, timer, timeSpent = [];
session_relations = [];
currentVideoInfo = undefined;

var YTErrors = {
    "2" : "Parameters error (length not 11 character or invalid charaters)",
    "5" : "Error on HTML5 element",
    "100" : "Video not found",
    "101" : "Video is not embeddable",
    "150" : "Video is not embeddable"
}

function generateCommentView(commentInfo){

    

    return $('<table class="comment_record"></table>').append(
        $('<tr/>').append(
            $('<td/>').append($('<img class="rounded"  src="'+commentInfo.authorProfileImageUrl+'" />')),
            $('<td/>').append(
                $('<p/>').append(
                    '<span class="comment_record_author_name">'+ commentInfo.authorDisplayName + "</span> (" + commentInfo.publishedAt + " )",
                    "<br>",
                    '<span class="comment_record_text">' + commentInfo.textDisplay + '</span>'
                )
            ),

        )
    );
}
function createRecordVideoPreview(videoInfo){

    videoInfo.title = videoInfo.title != "" ? videoInfo.title : "ID: " + videoInfo.videoId;

    var div = $('<div class="card float-left card-video" style="max-height:400px;height:400px;width: 18rem;"/>').append('\
                <img class="card-img-top" src="//img.youtube.com/vi/'+ videoInfo.videoId + '/0.jpg">\
                <div class="card-body">\
                    <h5 class="card-title">'+videoInfo.title+'</h5>\
                    <p class="card-text">'+videoInfo.recommender+'</p>\
                </div>\
            ')


    div.click(function(){  


        mngVideoDetailsLoad($(this));

        
    })
    $(div).data({videoInfo:videoInfo})

    return div
}

function goToByScroll(id) {
    // Remove "link" from the ID
    id = id.replace("link", "");
    // Scroll
    
}

function mngVideoListPreview(){
    $("#video_preview_content").empty();
    $('html,body').animate({
        scrollTop: $("#video_preview").offset().top
    }, 'slow');

}
function mngVideoDetailsLoad(divContainer){

    $("#video_details").fadeIn();

    $('html,body').animate({
        scrollTop: 0
    }, 'slow');



    loadYoutubeVideo($(divContainer).data().videoInfo);  
   // updateCurrentVideo($(divContainer).data().videoInfo);

    getVideoInformation($(divContainer).data().videoInfo);
}

function loadYoutubeVideo(videoInfo){       
    
    var videoContainer = $('#displayVideoContainer').empty();

    videoContainer.append($('<div id="player"/>'));

  
    function onPlayerReady(event) {
        event.target.playVideo();
    }
    function onPlayerError(data ) {
        $('#vider_on_error').fadeIn().html("Error ->" + YTErrors[data.data]);
        setTimeout(function() {$('#vider_on_error').fadeOut()},5000);  
    }
    

    var player = new YT.Player('player', {height: '400',width: '100%',videoId:  videoInfo.videoId,events: {
                                                    'onStateChange': onPlayerStateChange,
                                                    'onReady': onPlayerReady,
                                                    'onError' : onPlayerError
                                                }
                                            });
     
    videoContainer.append(player);

    videoContainer.data({"player":player,'videoInfo': videoInfo});

   // player.playVideo()
}


function startRealTimeAnalysis(){
    var playerDiv = $("#displayVideoContainer").data().player;
    var videoInfo = $("#displayVideoContainer").data().videoInfo;


    var timeEllapsed = playerDiv.getCurrentTime();
    var percentage = playerDiv.getDuration() / 100 * timeEllapsed;

    //TODO - Cercare di capire come fare l'update del video corrente per aggiornare la % di visualizzazione
    if(timeEllapsed > 15){
        
        var params = {'videoId':videoInfo.videoId,recommender:videoInfo.recommender,timeEllapsed:timeEllapsed,percentage:percentage};

        $.post(SERVER_PATH + "/store",params,function(req,res){
           // window.alert("OK");
        });

        session_relations.push({
            videoID : videoInfo.videoId,
            reason : currentRecommender,
            stored: false
        })

        $.post(SERVER_PATH + "/store/relation",{relation : JSON.stringify(session_relations)},function(req,res){
            session_relations = req;
        });


    }else{
        setTimeout(function() { startRealTimeAnalysis() },500);
    }


    
}

function onPlayerStateChange(event) {
    if(event.data === 1) { // Started playing
        startRealTimeAnalysis();
    } 
}



function createVideoPreview(jsonData){

    if(jsonData.length == 0){
        $("#video_preview_content").append("No video to recommend :/");
    }else{
        $.each(jsonData, function() {
            $("#video_preview_content").append(createRecordVideoPreview(this));            
        });
    }
}

function updateVideoUI(videoInfo){
    $("#wikipediaContainer").empty();
    $("#infoContainer").empty();
    $("#descriptionContainer").empty();
    $("#descriptionContainer").empty();


    
  
    $("#commentsContainer").empty();    
    videoComments.forEach((obj) => {
        $("#commentsContainer") .append(generateCommentView(obj));
    })
   
    videoYTInfo.duration =  videoYTInfo.duration.replace("PT","").replace("H",":").replace("M",":").replace("S","");
    $("#infoContainer").empty().append(
        $('<h3/>').append(videoYTInfo.title),
        $('<p/>').append(videoYTInfo.description),
        $('<p/>').append(
            "Channel: " + videoYTInfo.channelTitle + "<br>",
            "Duration: " + videoYTInfo.duration + "<br>",
            "Dimension: " + videoYTInfo.dimension + "<br>",
            "Definition: " + videoYTInfo.definition + "<br>",
            $('<div class="absolute-bottom px-3 no-border"></div>').append(
                "<div class=\"mx-2 d-inline-block no-border\"><i class='material-icons'>thumb_up</i> " + videoYTInfo.likeCount + "</div>",
                "<div class=\"mx-2 d-inline-block no-border\"><i class='material-icons'>thumb_down</i> " + videoYTInfo.dislikeCount + "</div>",
                "<div class=\"mx-2 d-inline-block no-border\"><i class='material-icons'>comment</i> " + videoYTInfo.viewCount + "</div>",
            )

        )
    )

    if(videoWikiInfo.extract == ""){
        $("#wikipediaContainer").empty().append("Nothing found on Wikipedia :/");
    }else{
        $("#wikipediaContainer").empty().append(videoWikiInfo.extract);
    }

   /* $("#descriptionContainer").empty().append(
        $('<h3/>').append(videoWikiInfo.title),
        $("<p/>").append(videoWikiInfo.description)
    )
    */

    if(videoDBPediaInfo.error == -1){
        $("#authorContainer").empty().append("Nothing found on DBPedia :/");
    }else{        

        var span_genre = $("<span/>").append("dbpedia - Genre: <a href='/#'>" + videoDBPediaInfo.genre +"</a><br>").click(function(){
            loadRecommenderByType("search",{qString:videoDBPediaInfo.genre}).then( (jsonData) => {
                createVideoPreview(jsonData);
            })
        })
        var span_artist = $("<span/>").append("<i class='material-icons'>face</i> Author : <a href='/#'>" + videoDBPediaInfo.artist +"</a><br>").click(function(){
            loadRecommenderByType("search",{qString:videoDBPediaInfo.artist}).then( (jsonData) => {
                createVideoPreview(jsonData);
            })
        })
        $('#authorContainer').empty().append(
            span_artist,"<br>",
            span_genre,"<br>",
            "<i class='material-icons'>music_note</i> Song: "+ videoDBPediaInfo.song +"<br>",
        )
    }

}

function showRelativeError(){
    $('#no_video_selected_for_relative').fadeIn();
    setTimeout(function() {$('#no_video_selected_for_relative').fadeOut()},5000);
}


function uiInitLists(){


    $('#searchInput').bind("enterKey",function(e){
        $('#video_preview_popularity').fadeOut();
        loadRecommenderByType("search",{qString:$(this).val()}).then( (jsonData) => {
                $("#video_preview_content").append(createVideoPreview(jsonData));            
        })
    });
    $('#searchInput').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });


    $('#vitaliList').click(function() {   
        $('#video_preview_popularity').fadeOut();
        loadRecommenderByType("vitali").then( (jsonData) => {
       
            $("#video_preview_content").append(createVideoPreview(jsonData));            
        
        })
    })


    $('#popularityList').click(function() {
        $('#video_preview_popularity').fadeIn();
        $('#localAbsoluteTab').trigger('click');
    })

    $('#randomList').click(function() {    
        $('#video_preview_popularity').fadeOut();
        loadRecommenderByType("random").then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })

    $('#defaultList').click(function() {
        $('#video_preview_popularity').fadeOut();
        loadRecommenderByType("default").then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })
    

    $('#relatedTab').click(function(){
        if(currentVideoInfo == undefined){
            $('#error_related_no_video_selected').fadeIn();
            setTimeout(function() {$('#error_related_no_video_selected').fadeOut()},5000);
            return;
        }

        $('#video_preview_popularity').fadeOut();


        loadRecommenderByType("related",{request:currentVideoInfo.videoId}).then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })

    $('#localAbsoluteTab').click(function(){
        loadRecommenderByType("popularity",{type:"local_absolute"}).then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })
    $('#localRelativeTab').click(function(){
        if(currentVideoInfo == undefined){
            showRelativeError();
            return;
        }
        loadRecommenderByType("popularity",{type:"local_relative",videoId:currentVideoInfo.videoId}).then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })
    $('#localRecentlyTab').click(function(){
        loadRecommenderByType("popularity",{type:"local_last_view"}).then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })    
    $('#globalAbsoluteTab').click(function(){
        loadRecommenderByType("popularity",{type:"global_absolute"}).then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })
    $('#globalRelativeTab').click(function(){
        if(currentVideoInfo == undefined){
            showRelativeError();
            return;
        }
        loadRecommenderByType("popularity",{type:"global_relative",videoId:currentVideoInfo.videoId}).then( (jsonData) => {
            createVideoPreview(jsonData);
        })
    })


    $('#defaultList').trigger("click");
}


