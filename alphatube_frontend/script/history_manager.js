var current_view = {}
var at_history = Array()
var at_history_discarded = Array();



function addToHistory(value){

    //let tmpItem = JSON.parse(localStorage.getItem("recentVideo"));
    //if(tmpItem == null)tmpItem = [];
    //tmpItem.push(currentItem);
    //localStorage.setItem("recentVideo", JSON.stringify(tmpItem));


    at_history.push(value);
    window.history.pushState(value, null, null);

}

function mngHistory(currentItem){

    if(currentItem != null){
        if( currentItem.type == "videoView"){

        
            currentVideoInfo = currentItem.parameters.currentVideoInfo;
            videoComments = currentItem.parameters.videoComments;
            videoYTInfo = currentItem.parameters.videoYTInfo;
            videoWikiInfo = currentItem.parameters.videoWikiInfo;
            videoDBPediaInfo = currentItem.parameters.videoDBPediaInfo;
    
            loadYoutubeVideo(currentVideoInfo);  
            updateVideoUI();
        }
        if( currentItem.type == "recommenderLoad" ){
            mngVideoListPreview();
            createVideoPreview(currentItem.parameters.currentPlaylist);
        }
    }
 

}

jQuery(document).ready(function($) {

    if (window.history && window.history.pushState) {
  
    
  
      $(window).on('popstate', function(event) {
        mngHistory(history.state);
      });
 
  
   
    }
  });
