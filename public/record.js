var controller = new Leap.Controller();
var trainer = new LeapTrainer.Controller({controller: controller});
var verify = false;
var round = 1;

var client_register = function() {
  client_register_in_round(round);
}

var client_register_in_round = function(round) {
  verify = false;
  this.round = round;
  username = $("#username").val();
  trainer.resume();
  trainer.create(username+round); 
}

var client_verify = function() {
  trainer.resume();
  console.log("about to verify");
  verify = true;
}



trainer.on('training-countdown', function(countdown) {
  training = true;
  console.log('Starting training in ' + countdown + ' second' + (countdown > 1 ? 's' : ''));
});



trainer.on('training-complete', function(gestureName, trainingSet, isPose) {
  training = false;   
  console.log(gestureName + (isPose ? ' pose' : ' gesture') + ' learned!');
  console.log(trainer.toJSON(gestureName));
  $.ajax({
      type: "POST",
      url: "/register",
      data: trainer.toJSON(gestureName),
      contentType: "text/plain",  //"application/json",
      success: function(data) {
        console.log("have successfully submitted registering request");
        console.log("return message is " + data);
      }
  });
   
  if(round>=3) {
    trainer.pause();
  } else {
    round++;
    client_register_in_round(round);
  }
  
});

trainer.on('training-started', function(gestureName) {
  var trainingGestureCount = trainer.trainingGestures;
  console.log(trainingGestureCount + "  " + gestureName);  
});

//trainer.on('started-recording', function () { console.log("start")});


trainer.on('gesture-detected', function(gesture, frameCount) {
  if (verify == true) {
        verify = false;
        data = {
          'gesture' : gesture,
          'frameCount': frameCount
        };
        console.log(JSON.stringify(data));
        $.ajax({
          type: "POST",
          url: "/verify",
          data: JSON.stringify(data),
          contentType: "application/json",
          success: function(data) {
            console.log("have successfully submitted verification request");
            console.log("result is " + data);
          }
        });
        trainer.pause();
  }
});






/*
var isRecording = false;
var frames = [];

var recordStart = function(){
      isRecording = true;
      frames = [];
      console.log("Start");
      trainer.resume();
      trainer.create("something", true);

    }

var submitToServer = function(gesture) {
      $.ajax({
        type: "POST",
        url: "/upload",
        data: gesture,
        contentType: "application/json",
        success: function(data) {
          console.log(data);
        }
      });

}

trainer.on('gesture-created', function(gestureName, trainingSkipped) {
  console.log("gesture-create   " +  gestureName + "  " + trainingSkipped);
});

trainer.on('training-countdown', function(countdown) {
  
  training = true;
  
  console.log('Starting training in ' + countdown + ' second' + (countdown > 1 ? 's' : ''));
});



trainer.on('training-started', function(gestureName) {

  
  var trainingGestureCount = trainer.trainingGestures;
  console.log(trainingGestureCount + "  " + gestureName);
  trainer.toJSON(gestureName); 

});

trainer.on('training-gesture-saved', function(gestureName, trainingSet) {
  console.log("training-gesture-saved");
});

trainer.on('training-complete', function(gestureName, trainingSet, isPose) {

  training = false;   
  

  console.log(gestureName + (isPose ? ' pose' : ' gesture') + ' learned!');
  console.log("trainer paused");

  
  submitToServer(trainer.toJSON(gestureName));

  trainer.pause();
  
});

trainer.on('gesture-detected', function(gesture, frameCount) {
  console.log(gesture)
})


  trainer.on('gesture-recognized', function(hit, gestureName, allHits) {

    var hitPercentage = Math.min(parseInt(100 * hit), 100);

    console.log(gestureName + "  " + hitPercentage);
    console.log("trainer paused");
    trainer.pause();
  }); 


var recordStop = function(){
      trainer.resume();
      trainer.create("something_else");
      isRecording = false;
      console.log(frames);
    }



var recordSend = function(){
      console.log("send");


      trainer.resume();


      

      // uploading data
      //frames = {test: "123"};
      
/*
      $.ajax({
        type: "POST",
        url: "/upload",
        data: JSON.stringify(frames),
        contentType: "application/json",
        success: function(data) {
          console.log(data);
        }
      });
*/


      // end 
// }

controller.connect();


