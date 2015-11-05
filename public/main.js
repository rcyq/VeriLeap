
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

  // control connect leap img show/hide
  var canvas = $('canvas');
  var connectLeap = $('#connect-leap');
  var msform = $('#msform');
  var registerMessage = $('.register.register-message');
  if(connectLeap && canvas){
    
    var isOverlayOpen = $('div.overlay').hasClass('open');

    // leap is connected or overlay is closed
    connectLeap.removeClass('connect-leap-show');
    connectLeap.addClass('connect-leap-hide');

    if(isOverlayOpen){

      registerMessage.removeClass('error');
      if(window.isRegistration){
        registerMessage.text('Registration');
      }else if(window.isLogin){
        registerMessage.text('Login');
      }else{
        registerMessage.text('');
      }
      
      msform.removeClass('hide');
      msform.addClass('show');   
    }else{
      msform.removeClass('show');
      msform.addClass('hide');  
    }
  }
};

var onDisconnected = function(){
  console.log('onDisconnected');
  isConnected = false;

  // connect leap img show/hide
  var canvas = $('canvas');
  var connectLeap = $('#connect-leap');
  var msform = $('#msform');
  var registerMessage = $('.register.register-message');
  if(connectLeap && canvas){
    
    var isOverlayOpen = $('div.overlay').hasClass('open');
    if(isOverlayOpen){
      // leap not connected
      // and overlay is opened
      connectLeap.removeClass('connect-leap-hide');
      connectLeap.addClass('connect-leap-show');

      msform.removeClass('show');
      msform.addClass('hide');

      registerMessage.addClass('error');
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

      registerMessage.removeClass('error');
      registerMessage.text('');
    }
  }
};

var isValidTracking = function(){
  var currentFSId = $('fieldset:visible').attr('id');
  if(!window.isTrackingStart ||  isPlayback() ||
    (currentFSId != "s1" && currentFSId != "s2" && 
    currentFSId != "s3")){
    return false;
  }
  return true;
}

var onHandFound = function(hand){

  var currentFSId = $('fieldset:visible').attr('id');
  if(!window.isTrackingStart || 
    (currentFSId != "s1" && currentFSId != "s2" && 
    currentFSId != "s3")){
    return false;
  }

  if(isConnected && !isPlayback() && 
    window.isTrackingStart && !window.leapTrainer.recordingPose){
    Record.start(registration.username, registration.round);
  }

  if(!isPlayback()){
    console.log('real hand found');
  }else{
    console.log('playback hand found');
  }
};

var onHandLost = function(hand){

  var currentFSId = $('fieldset:visible').attr('id');
  if(!window.isTrackingStart || 
    (currentFSId != "s1" && currentFSId != "s2" && 
    currentFSId != "s3")){
    return false;
  }
  
  // On real hand lost,
  // playback will play right away, hence it is real hand lost
  // On play hand lost,
  // playback will stop before this event fired, hence it is playback hand lost
  if(isPlayback()){
    console.log('real hand lost');

    var msg = 'Place your hand';
    if(!window.isTrackingStart){
      msg= 'Done';
    }
    currentFSId = $('fieldset:visible').attr('id');
    $('fieldset#'+currentFSId+' .fs-subtitle').text(msg);

    actionButton = $('#msform .action-button');
    actionButton.attr('disabled', false);    

    Record.stop();
  }else{
    console.log('playback hand lost');
  }
};

var startLeap = function() {
  window.isLeapAnimationRunning = true;

  window.leapController = Leap.loop({
    background: false,
    enableGesture: true,
    loopWhileDisconnected: false
  }, {

    hand: function(hand){

      // not in use
      return;

      // locate 'label' DOM element
      var label = hand.data('label');

      if (!label){
        // 'label' does not exists
        label = document.createElement('label');
        document.body.appendChild(label);

        /**
         * Here we set the label to show the hand type
         */
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
    }
  })
  .use('riggedHand')
  .use('handEntry')
  .use('handHold')
  .use('playback', {
    recording: './left-or-right-77fps.json.lz',
    pauseOnHand: true,
    timeBetweenLoops: 1000
  })

  .on('streamingStarted', onConnected)
  .on('streamingStopped', onDisconnected)
  .on('handFound', onHandFound)
  .on('handLost', onHandLost);

  riggedHandPlugin = Leap.loopController.plugins.riggedHand;

  window.leapController.on('riggedHand.meshAdded', function(handMesh, leapHand){

    var isOverlayOpen = $('div.overlay').hasClass('open');
    if(!isConnected && isOverlayOpen){
      // show leap connect img
      var connectLeap = $('#connect-leap');
      connectLeap.removeClass('connect-leap-hide');
      connectLeap.addClass('connect-leap-show');
    }
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
window.isVerify= false;
window.isRegistration = false;
window.isLogin = false;
window.gestureStored = {};

var isPlayback = function(){
  try{
    return window.leapController.plugins.playback.player.state != 'idle';
  }catch(e){
    return true; 
  }
}

var registration = {
  username : '',
  round : ''
};

var Record = {

  startVerify :function(username, round){
    window.isTrackingStart = true;
    window.isVerify = true;

    registration.username = username;
    registration.round = round;

    if(!isPlayback()){
      Record.start(username, round);
    }
  },

  startRegistration :function(username, round){
    window.isTrackingStart = true;
    registration.username = username;
    registration.round = round;

    if(!isPlayback()){
      Record.start(username, round);
    }
  },

  start: function(username, round){
    console.log('start:'+username+'-'+round);

    window.leapTrainer.resume();
    
    if(!window.isVerify){
      console.log('not verify');
      window.leapTrainer.create(username+round);   
    }
  },

  stopVerify : function () {
    window.isTrackingStart = false;
    window.isVerify = false;
    Record.stop();
  },

  stopRegistration : function () {
    window.isTrackingStart = false;
    Record.stop();
  },

  stop: function(){
    window.leapTrainer.pause();
  },

  onCountdown : function (countdown) {
    if(!isValidTracking()){
      return false;
    }

    var currentFSId = $('fieldset:visible').attr('id');
    var actionButton = $('#msform .action-button');
    actionButton.attr('disabled', true);
    $('fieldset#'+currentFSId+' .fs-subtitle').text('Ready in '+countdown);
  },

  onStarted: function () { 
    if(!isValidTracking()){
      return false;
    }
    
    console.log("training-started");

    var currentFSId = $('fieldset:visible').attr('id');
    $('fieldset#'+currentFSId+' .fs-subtitle').text('Analysing...');
  },

  onRecording: function () {
    if(!isValidTracking()){
      return false;
    }
    console.log('started-recording');
  },

  onGestureDetected : function(gesture, frameCount) {
    if(!isValidTracking()){
      return false;
    }

    console.log('Gesture Detected');

    if(window.isRegistration && window.isVerify){
      // local verification
      console.log('local verification');
      var hit = 0.0;
      if((gesture.pose && frameCount == 1) || !gesture.pose){

        var currentFSId = $('fieldset:visible').attr('id');
        var gestureName = registration.username + currentFSId;
        var previousGesture = window.gestureStored[currentFSId];
        hit = window.leapTrainer.correlate(gestureName, previousGesture.data, gesture);
      }
      console.log('hit:'+hit);
      Record.stopVerify();

    }else if(window.isLogin){
      // login

      // data = {
      //   'id': $("#username").val()+round,
      //   'gesture' : gesture,
      //   'frameCount': frameCount
      // };
    }
  },

  onCompleted : function(gestureName, trainingSet, isPose) {

    if(!isValidTracking()){
      console.log('onCompleted invalid');
      return false;
    }

    console.log(gestureName + (isPose ? ' pose' : ' gesture') + ' learned!'); 

    if(window.isRegistration && !window.isVerify){

      // registration
      var currentFSId = $('fieldset:visible').attr('id');
      $('fieldset#'+currentFSId+' .fs-subtitle').text('Done');
      $('fieldset#'+currentFSId+' .next').addClass('show').removeClass('hide');


      var JSONobj = JSON.parse(window.leapTrainer.toJSON(gestureName));
      gestureStored[currentFSId] = JSONobj;

      var actionButton = $('#msform .action-button');
      actionButton.attr('disabled', false);

      var recordButton = $('#msform #'+currentFSId+' .action-button.record');
      if(recordButton){
        recordButton.removeClass('hide');
        recordButton.removeClass('show');
      }

      var verifyButton = $('#msform #'+currentFSId+' .action-button.verify');
      if(verifyButton){
        verifyButton.removeClass('hide');
        verifyButton.removeClass('show');
      }


      Record.stopRegistration();
    }
  }
};