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

    if( classie.has( overlay, 'open' ) ) {

      window.isLogin = false;

      resetForm();

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
      
      resetForm();

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

    if( classie.has( overlay, 'open' ) ) {

      window.isRegistration = false;

      resetForm();

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
      
      resetForm();

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
  
  // For registration 

  // hide all fieldset
  $('#msform fieldset').hide();

  if(window.isRegistration){
    // show first fieldset
    var firstFS = $('#msform fieldset#s0');
    firstFS.show();
    firstFS.css({'opacity':1});
    $('#msform fieldset#s0 .next').addClass('show').removeClass('hide');
  }
  // reset all progress
  $('#msform #progressbar li:first-of-type').addClass("active");

  // set first progress
  $("#msform #progressbar li:not(:first-of-type)").removeClass("active");
  
  // clear username
  $('#msform #username').val('');
  // clear email
  $('#msform #email').val('');
  // clear error
  $('.register.error-message').text('');

  // reset all fs title and subtitle
  $('#msform fieldset#s0 .fs-title').text('Information');
  $('#msform fieldset#s1 .fs-title').text('Gesture 1');
  $('#msform fieldset#s2 .fs-title').text('Gesture 2');
  $('#msform fieldset#s3 .fs-title').text('Gesture 3');
  $('#msform fieldset#s4 .fs-title').text('Confirmation');


  var allFS = '#msform fieldset .fs-subtitle';
  var infoFS = '#msform #s0 .fs-subtitle';
  var confirmFS = '#msform  #s4 .fs-subtitle';
  $(allFS+':not('+infoFS+','+confirmFS+')').text('Place your hand');
  $('#msform fieldset#s0 .fs-subtitle').text('Please enter the following information');
  $('#msform fieldset#s4 .fs-subtitle').text('You are ready to create an account');

  // disable all action buttons
  actionButton = $('#msform .action-button');
  actionButton.attr('disabled', false);


  // For login

  // hide all fieldset
  $('#msform-login fieldset').hide();

  if(window.isLogin){
    // show first fieldset
    var firstFS = $('#msform-login fieldset#l0');
    firstFS.show();
    firstFS.css({'opacity':1});
    $('#msform-login fieldset#l0 .next').addClass('show').removeClass('hide');    
  }

  // clear username
  $('#msform-login #username-login').val('');
  
  // reset all fs title and sub title
  $('#msform-login fieldset#l0 .fs-title').text('Enter username');
  $('#msform-login fieldset#l1 .fs-title').text('Gesture');
  $('#msform-login fieldset#l2 .fs-title').text('Result');
  
  $('#msform-login fieldset#l1 .fs-subtitle').text('Place your hand (may replace with OTP)');
  $('#msform-login fieldset#l2 .fs-subtitle').text('Your login has failed');

  // disable all action buttons
  actionButton = $('#msform-login .action-button');
  actionButton.attr('disabled', false);
  
  // clear gesture stored
  window.gestureStored = {};

  registration = {
      username : '',
      round : ''
  };

  login = {
    username : '',
    count : 0
  }

  if(window.leapTrainer){
    window.leapTrainer.gestures = {}; 
  }

  $('#msform .submit').attr({'disabled': true});
  $('#msform-login .submit').attr({'disabled': true});

  isValidated = false;
  isCreated = false;

  if(timeoutLogin){
    clearTimeout(timeoutLogin);
  }
  timeoutLogin = null;
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

var validateEmail = function(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

var isGestureStored = function(fieldsetId){
  var id = fieldsetId || 's1';
  
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
var isValidated;
var isCreated;

$("#msform .next").click(function(e){

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
  var usernameInput = $("#msform #username");
  var emailInput = $("#msform #email");
  var errorMessage = $('#msform .register.error-message');

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

    if(isValidFields){

      if(!isValidated){

        // check if username has been used
        $.ajax({
          type: "POST",
          url: "/checkExisting",
          data: usernameInput.val(),
          contentType: "text/plain", 
          success: function(response) {

            response = $.parseJSON(response);

            if (response.flag) {
              errorMessage.addClass('error');
              errorMessage.text('Username existed');
              animating = false;
              isValidated = false;
            }else{
              /// else do what it supposed to do next
              errorMessage.removeClass('error');
              errorMessage.text('');
              isValidated = true;
              animating = false;
              $("#msform .next").click();
            }
          },
          error: function(response){
            errorMessage.addClass('error');
            errorMessage.text('Please try again later');
            animating = false;
            isValidated = false;
          }
        });

        e.preventDefault();
        return false;
      }

    } else{
      errorMessage.addClass('error');
      errorMessage.text(errMsg);
      animating = false;
      isValidated = false;

      e.preventDefault();
      return false;
    }

  }else if(currentFieldsetId == 's4'){
    
    if(!isCreated){

      var dataToSubmit = {
        userName: $('#msform #username').val(),
        email: $("#msform #email").val(),
        gestures: window.gestureStored   
        // format {"first": trained gesture, "second": trained gesture, "last": trained gesture}
      }

      var fs_subtitle = $('#msform fieldset#'+currentFieldsetId+' .fs-subtitle');
      var nextBut = $('#msform #'+currentFieldsetId+' .action-button.next');
      var previousBut = $('#msform #'+currentFieldsetId+' .action-button.previous');

      fs_subtitle.text('You are ready to create an account');
      errorMessage.text('');
      $.ajax({
          type: "POST",
          url: "/register",
          data: JSON.stringify(dataToSubmit),
          contentType: "application/json",
          success: function(response) {
            
            response = $.parseJSON(response); 

            if (response.flag) {
              // account created
              errorMessage.removeClass('error');
              errorMessage.text(response.msg);
              animating = false;
              isCreated = true;

              previousBut.removeClass('show');
              previousBut.addClass('hide');

              nextBut.removeClass('show');
              nextBut.addClass('hide');

              fs_subtitle.text('Your account has been created');
            }else{
              errorMessage.addClass('error');
              errorMessage.text('');
              isCreated = false;
              animating = false;

              previousBut.removeClass('hide');
              previousBut.addClass('show');

              nextBut.removeClass('hide');
              nextBut.addClass('show');
            }
          },
          error: function(response){
            errorMessage.addClass('error');
            errorMessage.text('Please try again later');
            animating = false;
            isCreated = false;

            previousBut.removeClass('hide');
            previousBut.addClass('show');

            nextBut.removeClass('hide');
            nextBut.addClass('show');
          }
      });

      e.preventDefault();

      return false;
    }

  }else if(currentFieldsetId == 's3'){

    var fs_subtitle = $('#msform fieldset#'+nextFieldsetId+' .fs-title');
    fs_subtitle.text('You are ready to create an account');
    isValidated = false;
    isCreated = false;

  }else{
    isValidated = false;
    isCreated = false;
  }


  errorMessage.text('');

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
        Record.startRegistration(false, username, nextFieldsetId);
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

  $('#msform .submit').attr({'disabled': nextFieldsetId != "s4"});

  // show previous button
  previousButton.removeClass('hide');
  previousButton.addClass('show');

  registerMessage.removeClass('error');
  registerMessage.text('Registration');

  //activate next step on progressbar using the index of next_fs
  $("#msform #progressbar li").eq($("#msform fieldset").index(next_fs)).addClass("active");
  
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

$("#msform .previous").click(function(){
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
  var usernameInput = $("#msform #username");

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
        Record.startRegistration(false, username, previousFieldsetId);
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

  isValidated = false;
  isCreated = false;

  $('#msform .submit').attr({'disabled': previousFieldsetId != "s4"});

  registerMessage.removeClass('error');
  registerMessage.text('Registration');

  //de-activate current step on progressbar
  $("#msform #progressbar li").eq($("#msform fieldset").index(current_fs)).removeClass("active");
  
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

$("#msform .record").click(function(){

  Record.stopRegistration();
  Record.stopVerify();

  currentFSId = $('#msform fieldset:visible').attr('id');
  $('#msform fieldset#'+currentFSId+' .fs-subtitle').text('Place your hand');
  
  window.isRerecord = true;
  Record.startRegistration(true, username, currentFSId);

});

$("#msform .verify").click(function(){

  Record.stopRegistration();
  Record.stopVerify();

  var currentFSId = $('#msform fieldset:visible').attr('id');
  $('#msform fieldset#'+currentFSId+' .fs-subtitle').text('Place your hand');
  
  var usernameInput = $("#msform #username");
  Record.startVerify(true, usernameInput.val(), currentFSId);

});

$("#msform .submit").click(function(){
});





//jQuery time
var current_fs_login, next_fs_login, previous_fs_login; //fieldsets
var left_login, opacity_login, scale_login; //fieldset properties which we will animate
var animating_login; //flag to prevent quick multi-click glitches
var isLogin;
var timeoutLogin;

$("#msform-login .next").click(function(e){
  if(animating_login) return false;
  animating_login = true;
  
  current_fs_login = $(this).parent();
  next_fs_login = $(this).parent().next();
  
  var currentFieldsetId = current_fs_login.attr('id');
  var nextFieldsetId = next_fs_login.attr('id');

  var canvas = $('canvas');
  var nextButton = $('#msform-login #'+nextFieldsetId+' .action-button.next');
  var previousButton = $('#msform-login #'+nextFieldsetId+' .action-button.previous');
  var registerMessage = $('.register.register-message');
  var usernameInput = $("#msform-login #username-login");
  var errorMessage = $('#msform-login .register.error-message');

  // Check username
  if(currentFieldsetId == "l0"){
    var isValidFields = true;
    var errMsg = "";

    if(usernameInput.val() == ""){
      errMsg = "Username cannot be empty";
      isValidFields = false;
    }

    if(isValidFields){

      if(!isValidated){

        var nextBut = $('#msform-login #'+currentFieldsetId+' .action-button.next');
        nextBut.attr('disabled', true);

        errorMessage.removeClass('error');
        errorMessage.text("Login..");

        // check if username has been used
        $.ajax({
          type: "POST",
          url: "/startVerify",
          data: usernameInput.val(),
          contentType: "text/plain", 
          success: function(response) {

            response = $.parseJSON(response);
console.log('success');
console.log(response);
            if (response.flag) {
              errorMessage.removeClass('error');
              errorMessage.text(response.msg);
              

              timeoutLogin = setTimeout(function(){
console.log('timeout');
                animating_login = false;
                isValidated = true;

                $("#msform-login .next").click();
              }, 3000);
            }else{
              /// else do what it supposed to do next
              errorMessage.addClass('error');
              errorMessage.text(response.msg);
              isValidated = true;
              animating_login = false;
            }
          },
          error: function(response){
            errorMessage.addClass('error');
            errorMessage.text('Please try again later');
            animating_login = false;
            isValidated = false;
          }
        });

        e.preventDefault();
        return false;
      }

    }else{
      errorMessage.addClass('error');
      errorMessage.text(errMsg);
      animating_login = false;
      isValidated = false;

      e.preventDefault();
      return false;
    }
  }

  var onComplete;
  if(nextFieldsetId == "l1"){
    username = usernameInput.val();

    // reset gesture count and gesture name
    $('#msform-login fieldset#'+nextFieldsetId+' .fs-title').text('Gesture 1');
    login.count = 0;

    // show canvas
    canvas.removeClass('hide');
    canvas.addClass('show');
    
    // hide next button
    nextButton.removeClass('show');
    nextButton.addClass('hide');
    onComplete = function () {
      Record.startLogin(false, username, nextFieldsetId);
    };

  }else{

    // show next button
    nextButton.removeClass('hide');
    nextButton.addClass('show');
    
    // hide canvas
    canvas.removeClass('show');
    canvas.addClass('hide');

    onComplete = function () {
      Record.stopLogin();
    }

    errorMessage.removeClass('error');
    errorMessage.text('');
  }


  if(nextFieldsetId == 'l2'){
    // show previous button
    // finally submit the login gestures

     var dataToSubmit = {
        userName: $("#msform-login #username-login").val(),
        gestures: window.gestureStored   
      }
      console.log(dataToSubmit);

    $.ajax({
          type: "POST",
          url: "/verify",
          data: JSON.stringify(dataToSubmit),
          contentType: "application/json",
          success: function(response) {
              console.log(response);
          }
    });      


    previousButton.removeClass('show');
    previousButton.addClass('hide');
  }else{
    // show previous button
    previousButton.removeClass('hide');
    previousButton.addClass('show');
  }


  registerMessage.removeClass('error');
  registerMessage.text('Login');

  //show the next fieldset
  next_fs_login.show(); 
  //hide the current fieldset with style
  current_fs_login.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs_login reduces to 0 - stored in "now"
      //1. scale current_fs_login down to 80%
      scale_login = 1 - (1 - now) * 0.2;
      //2. bring next_fs_login from the right(50%)
      left_login = (now * 50)+"%";
      //3. increase opacity of next_fs_login to 1 as it moves in
      opacity_login = 1 - now;
      current_fs_login.css({'transform': 'scale('+scale_login+')'});
      next_fs_login.css({'left': left_login, 'opacity': opacity_login});
    }, 
    duration: 800, 
    complete: function(){
      current_fs_login.hide();
      animating_login = false;
      onComplete();
    }, 
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});


$("#msform-login .previous").click(function(){
  if(animating_login) return false;
  animating_login = true;
  
  current_fs_login = $(this).parent();
  previous_fs_login = $(this).parent().prev();

  var currentFieldsetId = current_fs_login.attr('id');
  var previousFieldsetId = previous_fs_login.attr('id');

  var canvas = $('canvas');
  var nextButton = $('#msform-login #'+previousFieldsetId+' .action-button.next');
  var previousButton = $('#msform-login #'+previousFieldsetId+' .action-button.previous');
  var registerMessage = $('.register.register-message');
  var usernameInput = $("#msform-login #username-login");

  var onComplete;
  if(previousFieldsetId != "l0"){
    // show previous button
    previousButton.removeClass('hide');
    previousButton.addClass('show');

    // show canvas
    canvas.removeClass('hide');
    canvas.addClass('show');

    username = usernameInput.val();

    // hide next button
    nextButton.removeClass('show');
    nextButton.addClass('hide');

    // reset gesture count and gesture name
    $('#msform-login fieldset#'+previousFieldsetId+' .fs-title').text('Gesture 1');
    login.count = 0;

    onComplete = function () {
      Record.startLogin(false, username, previousFieldsetId);
    };

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
      Record.stopLogin();
    };
  }

  isValidated = false;

  registerMessage.removeClass('error');
  registerMessage.text('Login');
  
  //show the previous fieldset
  previous_fs_login.show(); 
  //hide the current fieldset with style
  current_fs_login.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs_login reduces to 0 - stored in "now"
      //1. scale previous_fs_login from 80% to 100%
      scale_login = 0.8 + (1 - now) * 0.2;
      //2. take current_fs_login to the right(50%) - from 0%
      left_login = ((1-now) * 50)+"%";
      //3. increase opacity of previous_fs_login to 1 as it moves in
      opacity_login = 1 - now;
      current_fs_login.css({'left': left_login});
      previous_fs_login.css({'transform': 'scale('+scale_login+')', 'opacity': opacity_login});
    }, 
    duration: 800, 
    complete: function(){
      current_fs_login.hide();
      animating_login = false;
    }, 
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});