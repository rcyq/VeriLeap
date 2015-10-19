
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

var isLoginClick = false;
var onLoginClick = function(){
  isLoginClick = true;

}

var riggedHandPlugin;

var isConnected = false;

var onConnected = function (){
  isConnected = true;
};

var onDisconnected = function(){
  isConnected = false;
};

var ctrl = Leap.loop({
  background: true,
  enableGesture: true,
  loopWhileDisconnected: true
  }, {

    hand: function(hand){

    var label = hand.data('label');
    if(isLoginClick === false){
      return;
    }

    if (!label){
      console.log("creating label");
      label = document.createElement('label');
      document.body.appendChild(label);


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

      if(ctrl.connected()){

      }else{

      }

      if(isConnected && isRecording) {
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
  }
})



.on('streamingStarted', onConnected)
.on('streamingStopped', onDisconnected)

.use('riggedHand')
.use('handEntry')
.use('handHold')
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
ctrl.on('riggedHand.meshAdded', function(handMesh, leapHand){
  var canvas = document.querySelector('canvas');
  canvas.style.display = 'none';
  canvas.style['z-index'] = 100;
});
