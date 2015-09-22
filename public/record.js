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
    }