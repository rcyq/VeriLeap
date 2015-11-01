
var convertToXYZDirection = function(direction){
  var namedDirection = {};
  $.each(direction, function(i, v){
    if(i == 0){
      namedDirection["x"] = v;
    } else if (i == 1){
      namedDirection["y"] = v;
    } else if (i == 2){
     namedDirection["z"] = v; 
   }
 });

  return namedDirection;
};

var riggedHandPlugin;

var isConnected = false;

var onConnected = function (){
  console.log('onConnected');
  isConnected = true;
};

var onDisconnected = function(){
  console.log('onDisconnected');
  isConnected = false;
};

var startLeap = function() {
  window.isLeapAnimationRunning = true;

  window.leapController = Leap.loop({
    background: false,
    enableGesture: true,
    loopWhileDisconnected: false
  }, {

    hand: function(hand){

      // locate 'label' DOM element
      var label = hand.data('label');

      if (!label){
        // 'label' does not exists
        label = document.createElement('label');
        document.body.appendChild(label);

        label.innerHTML = hand.type + " hand";

        hand.data('label', label)
      }

      var handMesh = hand.data('riggedHand.mesh');

      var screenPosition = handMesh.screenPosition(
        hand.palmPosition,
        riggedHandPlugin.camera
        );

      label.style.left = screenPosition.x + 'px';
      label.style.bottom = screenPosition.y + 'px';

      // control connect leap img show/hide
      var canvas = $('canvas');
      var connectLeap = $('#connect-leap');
      if(connectLeap && canvas){
        
        if(!isConnected && $('div.overlay').hasClass('open')){
          connectLeap.removeClass('connect-leap-hide');
          connectLeap.addClass('connect-leap-show');
        }else{
          connectLeap.removeClass('connect-leap-show');
          connectLeap.addClass('connect-leap-hide');
        }
      }

      // control frame recording
      if(isConnected && false) {
        var handFingers = hand.fingers;
        var fingersData = {};

        $.each(handFingers, function(index,value){

          var fingerData = {
            direction : convertToXYZDirection(value.direction), 
            length : value.length,
            width : value.width, 
            segments: value.bones.map(function(value, index){return value.length})
          };  

          fingersData[index] = fingerData;

        });

        frames.push({
          confidence : hand.confidence,
          palm: convertToXYZDirection(hand.palmPosition),
          palmWidth : hand.palmWidth,
          fingers : fingersData
        });

        console.log("Recording");
      }
    }
  })
  .use('riggedHand')
  .use('handEntry')
  .use('handHold')

  .on('streamingStarted', onConnected)
  .on('streamingStopped', onDisconnected)
  .on('handLost', function(hand){
    var label = hand.data('label');
    if (label){
      document.body.removeChild(label);
      hand.data({label: undefined});
    }
  })
  .use('playback', {
    recording: './left-or-right-77fps.json.lz',
    timeBetweenLoops: 1000
  });

  riggedHandPlugin = Leap.loopController.plugins.riggedHand;

  window.leapController.on('riggedHand.meshAdded', function(handMesh, leapHand){
  });

  var lt = new LeapTrainer.Controller({controller: window.leapController});

  // after resume() this event will be called for each second count down
  lt.on('training-countdown', Record.onCountdown);

  lt.on('training-complete', Record.onCompleted);

  lt.on('training-started', function(gestureName) {
    var trainingGestureCount = window.leapTrainer.trainingGestures;
    console.log(trainingGestureCount + "  " + gestureName);  
  });

  lt.on('started-recording', function () { console.log("started-recording")});

  lt.on('gesture-detected', Record.onGestureDetected);

  window.leapTrainer = lt;
}


var Record = {

  startRegistration :function(username, round){
    window.leapTrainer.resume();
    window.leapTrainer.create(username+round); 
  },

  stopRegistration : function () {
    window.leapTrainer.pause();
  },

  onCountdown : function (countdown) {
  },

  onGestureDetected : function(gesture, frameCount) {
    data = {
      'gesture' : gesture,
      'frameCount': frameCount
    };
    // console.log(JSON.stringify(data));
    
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
    
    window.leapTrainer.pause();
  },

  onCompleted : function(gestureName, trainingSet, isPose) {

    console.log(gestureName + (isPose ? ' pose' : ' gesture') + ' learned!');
    // console.log(window.leapTrainer.toJSON(gestureName));
     
    window.leapTrainer.pause();
  }
};