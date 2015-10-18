var isRecording = false;
var frames = [];

var recordStart = function(){
      isRecording = true;
      frames = [];
      console.log("Start");

    }

var recordStop = function(){
      isRecording = false;
      console.log(frames);
    }

var recordSend = function(){
      console.log("send");
      

      // uploading data
      //frames = {test: "123"};
      

      $.ajax({
        type: "POST",
        url: "/upload",
        data: JSON.stringify(frames),
        contentType: "application/json",
        success: function(data) {
          console.log(data);
        }

      });
      // end 
 }