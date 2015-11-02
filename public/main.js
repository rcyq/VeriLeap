
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
      var msform = $('#msform');
      var registerMessage = $('#registerMessage');
      if(connectLeap && canvas){
        
        var isOverlayOpen = $('div.overlay').hasClass('open');
        if(!isConnected && isOverlayOpen){
          // leap not connected
          // and overlay is opened
          connectLeap.removeClass('connect-leap-hide');
          connectLeap.addClass('connect-leap-show');

          msform.removeClass('show');
          msform.addClass('hide');

          registerMessage.text('Please connect leap motion device');
        }else{

          // leap is connected or overlay is closed
          connectLeap.removeClass('connect-leap-show');
          connectLeap.addClass('connect-leap-hide');

          if(isOverlayOpen){
            msform.removeClass('hide');
            msform.addClass('show');   
          }else{
            msform.removeClass('show');
            msform.addClass('hide');  
          }
          registerMessage.text('');
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

  lt.on('training-started', Record.onStarted);

  lt.on('started-recording', Record.onRecording);

  lt.on('gesture-detected', Record.onGestureDetected);

  window.leapTrainer = lt;
}

window.isTrackingStart = false;
window.gestureStored = {};

var Record = {

  startRegistration :function(username, round){
    window.isTrackingStart = true;
    window.leapTrainer.resume();
    window.leapTrainer.create(username+round); 
  },

  stopRegistration : function () {
    window.isTrackingStart = false;
    window.leapTrainer.pause();
  },

  onCountdown : function (countdown) {
    if(!window.isTrackingStart){
      return false;
    }

    actionButton = $('#msform .action-button');
    actionButton.attr('disabled', true);

    currentFSId = $('fieldset:visible').attr('id');
    if(currentFSId != "zero" && currentFSId != "confirm"){
      $('fieldset#'+currentFSId+' .fs-subtitle').text('Ready in '+countdown);
    }
  },

  onStarted: function () { 
    if(!window.isTrackingStart){
      return false;
    }

    console.log("training-recording");

    currentFSId = $('fieldset:visible').attr('id');
    if(currentFSId != "zero" && currentFSId != "confirm"){
      $('fieldset#'+currentFSId+' .fs-subtitle').text('Analysing...');
    }
  },

  onRecording: function () {
    if(!window.isTrackingStart){
      return false;
    }

    console.log('started-recording');
  },

  onGestureDetected : function(gesture, frameCount) {

    if(!window.isTrackingStart){
      return false;
    }

    data = {
      'gesture' : gesture,
      'frameCount': frameCount
    };
    console.log('Gesture Detected');
    console.log(data);

    currentFSId = $('fieldset:visible').attr('id');
    $('fieldset#'+currentFSId+' .fs-subtitle').text('Done');
    $('fieldset#'+currentFSId+' .next').addClass('show').removeClass('hide');

    actionButton = $('#msform .action-button');
    actionButton.attr('disabled', false);

    Record.stopRegistration();
  },

  onCompleted : function(gestureName, trainingSet, isPose) {
    if(!window.isTrackingStart){
      return false;
    }

    console.log(gestureName + (isPose ? ' pose' : ' gesture') + ' learned!'); 
    Record.stopRegistration();
  }
};