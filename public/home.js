// Overlay for Login button
(function() {
  var triggerBttn = document.getElementById( 'trigger-overlay' ),
  overlay = document.querySelector( 'div.overlay' ),
  closeBttn = overlay.querySelector( 'button.overlay-close' );
  transEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
  },
  transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
  support = { transitions : Modernizr.csstransitions };

  function toggleOverlay() {

    var registerMessage = $('.register.register-message');
    var connectLeap = $('#connect-leap');

    resetForm();

    if( classie.has( overlay, 'open' ) ) {

      window.isLogin = false;

      classie.remove( overlay, 'open' );
      classie.add( overlay, 'close' );
      $('canvas').addClass('hide').removeClass('show');

      // hide leap connect img
      connectLeap.removeClass('connect-leap-show');
      connectLeap.addClass('connect-leap-hide');

      var onEndTransitionFn = function( ev ) {
        if( support.transitions ) {
          if( ev.propertyName !== 'visibility' ) return;
          this.removeEventListener( transEndEventName, onEndTransitionFn );
        }
        classie.remove( overlay, 'close' );
      };
      
      if( support.transitions ) {
        overlay.addEventListener( transEndEventName, onEndTransitionFn );
      }
      else {
        onEndTransitionFn();
      }
    }
    else if( !classie.has( overlay, 'close' ) ) {
      
      window.isLogin = true;
      
      if(isConnected){
        registerMessage.removeClass('error');
        registerMessage.text("Login");

        // hide leap connect img
        connectLeap.removeClass('connect-leap-show');
        connectLeap.addClass('connect-leap-hide');
      }else{

        registerMessage.addClass('error');
        registerMessage.text("Please connect leap motion device");

        // show leap connect img
        connectLeap.removeClass('connect-leap-hide');
        connectLeap.addClass('connect-leap-show');
      }

      classie.add( overlay, 'open' );

      if (!window.isLeapAnimationRunning){
        startLeap();
      }
      
    }
  }

  triggerBttn.addEventListener( 'click', toggleOverlay );
  closeBttn.addEventListener( 'click', toggleOverlay );


})();

// Overlay for Register button 
(function() {
  var triggerBttn = document.getElementById( 'trigger-overlay-register' ),
  overlay = document.querySelector( 'div.overlay.overlay-register' ),
  closeBttn = overlay.querySelector( 'button.overlay-close' );
  transEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
  },
  transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
  support = { transitions : Modernizr.csstransitions };

  function toggleOverlay() {

    var registerMessage = $('.register.register-message');
    var connectLeap = $('#connect-leap');

    resetForm();

    if( classie.has( overlay, 'open' ) ) {

      window.isRegistration = false;

      registerMessage.removeClass('error');
      registerMessage.text("");

      // hide leap connect img
      connectLeap.removeClass('connect-leap-show');
      connectLeap.addClass('connect-leap-hide');

      classie.remove( overlay, 'open' );
      classie.add( overlay, 'close' );
      $('canvas').addClass('hide').removeClass('show');
      
      var onEndTransitionFn = function( ev ) {
        if( support.transitions ) {
          if( ev.propertyName !== 'visibility' ) return;
          this.removeEventListener( transEndEventName, onEndTransitionFn );
        }
        classie.remove( overlay, 'close' );
      };

      if( support.transitions ) {
        overlay.addEventListener( transEndEventName, onEndTransitionFn );
      }
      else {
        onEndTransitionFn();
      }
    }
    else if( !classie.has( overlay, 'close' ) ) {
      
      window.isRegistration = true;

      if(isConnected){
        
        registerMessage.removeClass('error');
        registerMessage.text("Registration");

        // hide leap connect img
        connectLeap.removeClass('connect-leap-show');
        connectLeap.addClass('connect-leap-hide');
      }else{

        registerMessage.addClass('error');
        registerMessage.text("Please connect leap motion device");

        // show leap connect img
        connectLeap.removeClass('connect-leap-hide');
        connectLeap.addClass('connect-leap-show');
      }

      classie.add( overlay, 'open' );

      if (!window.isLeapAnimationRunning){
        startLeap();
      }
      
    }
  }

  triggerBttn.addEventListener( 'click', toggleOverlay );
  closeBttn.addEventListener( 'click', toggleOverlay );
})();

var resetForm =function () {
  // hide all fieldset
  $('fieldset').hide();

  // show first fieldset
  var firstFS = $('fieldset#s0');
  firstFS.show();
  firstFS.css({'opacity':1});
  $('fieldset#s0 .next').addClass('show').removeClass('hide');
  
  // reset all progress
  $('#progressbar li:first-of-type').addClass("active");

  // set first progress
  $("#progressbar li:not(:first-of-type)").removeClass("active");
  
  // clear username
  $('#username').val('');
  // clear email
  $('#email').val('');

  // reset all registerMessage
  var allFS = 'fieldset .fs-subtitle';
  var infoFS = '#s0 .fs-subtitle';
  var confirmFS = '#s4 .fs-subtitle';
  $(allFS+':not('+infoFS+','+confirmFS+')').text('Place your hand');

  // enable all action buttons
  actionButton = $('#msform .action-button');
  actionButton.attr('disabled', false);

  // clear gesture stored
  window.gestureStored = {};

  registration = {
      username : '',
      round : ''
  };

  if(window.leapTrainer){
    window.leapTrainer.gestures = {}; 
  }

  $('.submit').attr({'disabled': true});
}

// Upon triggering Login / Register button, hides / displays login and register
// and VeriLeap logo
function swap(a,b){
  document.getElementById(a).style.display = 'none';
  document.getElementById(b).style.display = 'block';
}

document.getElementById('trigger-overlay').addEventListener("click", function(){
  swap('homeButtons', 'empty');
  swap('verileapHeader', 'empty');
});

document.getElementById('overlay-close-button').addEventListener("click", function(){
  swap('empty','homeButtons');
  swap('empty', 'verileapHeader');
});

document.getElementById('trigger-overlay-register').addEventListener("click", function(){
  swap('homeButtons', 'empty');
  swap('verileapHeader', 'empty');
});

document.getElementById('overlay-register-close-button').addEventListener("click", function(){
  swap('empty','homeButtons');
  swap('empty', 'verileapHeader');
});

// Create account functions
document.getElementById('createAccountButton').addEventListener("click", function(){
  console.log("Create account!");
  console.log($('#user').val());

  // $.ajax({
 //      type: "POST",
 //      url: "/register",
 //      data: trainer.toJSON(gestureName),
 //      contentType: "text/plain",  //"application/json",
 //      success: function(data) {
 //        console.log("have successfully submitted registering request");
 //        console.log("return message is " + data);
 //      }
 //  });
});

var validateEmail = function(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

var isGestureStored = function(fieldsetId){
  var id = fieldsetId || 'first';
  
  try{
    return window.gestureStored[id].data.length;
  }catch(e){
    return false;
  }
}

//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$(".next").click(function(){
  if(animating) return false;
  animating = true;
  
  current_fs = $(this).parent();
  next_fs = $(this).parent().next();
  
  var currentFieldsetId = current_fs.attr('id');
  var nextFieldsetId = next_fs.attr('id');

  var canvas = $('canvas');
  var nextButton = $('#msform #'+nextFieldsetId+' .action-button.next');
  var previousButton = $('#msform #'+nextFieldsetId+' .action-button.previous');
  var recordButton = $('#msform #'+nextFieldsetId+' .action-button.record');
  var verifyButton = $('#msform #'+nextFieldsetId+' .action-button.verify');
  var registerMessage = $('.register.register-message');
  var usernameInput = $("#username");
  var emailInput = $("#email");

  // Check username
  if(currentFieldsetId == "s0"){
    var isValidFields = true;
    var errMsg = "";

    if(usernameInput.val() == ""){
      errMsg = "Username cannot be empty";
      isValidFields = false;
    }else if(!validateEmail(emailInput.val())){
      errMsg = "Invalid email";
      isValidFields = false;
    }

    if(!isValidFields){
      registerMessage.addClass('error');
      registerMessage.text(errMsg);
      animating = false;
      return false;
    }
  }

  // check gesture stored
  var isStored = isGestureStored(nextFieldsetId);
  
  if(isStored){
    
    recordButton.removeClass('hide');
    recordButton.addClass('show');

    verifyButton.removeClass('hide');
    verifyButton.addClass('show');

  }else {

    if(recordButton){
      recordButton.removeClass('show');
      recordButton.addClass('hide');
    }

    if(verifyButton){
      verifyButton.removeClass('show');
      verifyButton.addClass('hide');
    }
  }

  var onComplete;
  if(nextFieldsetId != "s4"){
    username = usernameInput.val();

    // show canvas
    canvas.removeClass('hide');
    canvas.addClass('show');
    
    if(isStored){
      // show next button
      nextButton.removeClass('hide');
      nextButton.addClass('show');

      onComplete = function(){};
    }else{
      // hide next button
      nextButton.removeClass('show');
      nextButton.addClass('hide');

      onComplete = function () {
        Record.startRegistration(username, nextFieldsetId);
      };
    }

  }else{

    // show next button
    nextButton.removeClass('hide');
    nextButton.addClass('show');
    
    // hide canvas
    canvas.removeClass('show');
    canvas.addClass('hide');

    onComplete = function () {
      Record.stopRegistration();
    }
  }

  $('.submit').attr({'disabled': nextFieldsetId != "s4"});

  // show previous button
  previousButton.removeClass('hide');
  previousButton.addClass('show');

  registerMessage.removeClass('error');
  if(window.isRegistration){
    registerMessage.text('Registration');
  }else if(window.isLogin){
    registerMessage.text('Login');
  }else{
    registerMessage.text('');
  }

  //activate next step on progressbar using the index of next_fs
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
  
  //show the next fieldset
  next_fs.show(); 
  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale current_fs down to 80%
      scale = 1 - (1 - now) * 0.2;
      //2. bring next_fs from the right(50%)
      left = (now * 50)+"%";
      //3. increase opacity of next_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({'transform': 'scale('+scale+')'});
      next_fs.css({'left': left, 'opacity': opacity});
    }, 
    duration: 800, 
    complete: function(){
      current_fs.hide();
      animating = false;
      onComplete();
    }, 
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

$(".previous").click(function(){
  if(animating) return false;
  animating = true;
  
  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();

  var currentFieldsetId = current_fs.attr('id');
  var previousFieldsetId = previous_fs.attr('id');

  var canvas = $('canvas');
  var nextButton = $('#msform #'+previousFieldsetId+' .action-button.next');
  var previousButton = $('#msform #'+previousFieldsetId+' .action-button.previous');
  var recordButton = $('#msform #'+previousFieldsetId+' .action-button.record');
  var verifyButton = $('#msform #'+previousFieldsetId+' .action-button.verify');
  var registerMessage = $('.register.register-message');
  var usernameInput = $("#username");

// check gesture stored
  var isStored = isGestureStored(previousFieldsetId);
  
  if(isStored){

    recordButton.addClass('show');
    recordButton.removeClass('hide');

    verifyButton.addClass('show');
    verifyButton.removeClass('hide');

  }else {

    if(recordButton){
      recordButton.addClass('hide');
      recordButton.removeClass('show');
    }

    if(verifyButton){
      verifyButton.addClass('hide');
      verifyButton.removeClass('show');
    }
  }

  var onComplete;
  if(previousFieldsetId != "s0"){
    // show previous button
    previousButton.removeClass('hide');
    previousButton.addClass('show');

    // show canvas
    canvas.removeClass('hide');
    canvas.addClass('show');

    username = usernameInput.val();

    if(isStored){
      // hide next button
      nextButton.removeClass('hide');
      nextButton.addClass('show');

      onComplete = function(){};
    }else{
      // hide next button
      nextButton.removeClass('show');
      nextButton.addClass('hide');

      onComplete = function () {
        Record.startRegistration(username, previousFieldsetId);
      };
    }
  }else{
    // hide previous button
    previousButton.removeClass('show');
    previousButton.addClass('hide');

    // show next button
    nextButton.removeClass('hide');
    nextButton.addClass('show');
    
    // hide canvas
    canvas.removeClass('show');
    canvas.addClass('hide');

    onComplete = function () {
      Record.stopRegistration();
    };
  }

  $('.submit').attr({'disabled': previousFieldsetId != "s4"});

  registerMessage.removeClass('error');
  if(window.isRegistration){
    registerMessage.text('Registration');
  }else if(window.isLogin){
    registerMessage.text('Login');
  }else{
    registerMessage.text('');
  }
  //de-activate current step on progressbar
  $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
  
  //show the previous fieldset
  previous_fs.show(); 
  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale previous_fs from 80% to 100%
      scale = 0.8 + (1 - now) * 0.2;
      //2. take current_fs to the right(50%) - from 0%
      left = ((1-now) * 50)+"%";
      //3. increase opacity of previous_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({'left': left});
      previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
    }, 
    duration: 800, 
    complete: function(){
      current_fs.hide();
      animating = false;
    }, 
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

$(".record").click(function(){

  Record.stopRegistration();

  currentFSId = $('fieldset:visible').attr('id');
  $('fieldset#'+currentFSId+' .fs-subtitle').text('Place your hand');
  
  Record.startRegistration(username, currentFSId);

});

$(".verify").click(function(){

  Record.stopRegistration();

  var currentFSId = $('fieldset:visible').attr('id');
  $('fieldset#'+currentFSId+' .fs-subtitle').text('Place your hand');
  
  var usernameInput = $("#username");
  Record.startVerify(usernameInput.val(), currentFSId);

});

$(".submit").click(function(){
  return false;
});

