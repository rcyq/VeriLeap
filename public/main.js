
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

var ctrl = Leap.loop({
  background: true,
  enableGesture: true,
  loopWhileDisconnected: true
  },{

    hand: function(hand){
    
    var label = hand.data('label');

    if (!label){

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

    if(ctrl.connected() && isRecording) {
      var handFingers = hand.fingers;
      var fingersData = {};

      $.each(handFingers, function(index,value){

        var fingerData = {
          confidence : hand.confidence,
          direction : convertToXYZDirection(value.direction), 
          length : value.length,
          width : value.width, 
          segments: value.bones.map(function(value, index){return value.length})
        };  

        fingersData[index] = fingerData;

      });

      frames.push({
        palm: convertToXYZDirection(hand.palmPosition),
        fingers : fingersData
      });

      console.log("Recording");

    }
  }

})
.use('riggedHand')
.use('handEntry')
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
})
.connect();

riggedHandPlugin = Leap.loopController.plugins.riggedHand;