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

		$('#registerMessage').text("");

		if( classie.has( overlay, 'open' ) ) {

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

		$('#registerMessage').text("");

		if( classie.has( overlay, 'open' ) ) {

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
			classie.add( overlay, 'open' );

			if (!window.isLeapAnimationRunning){
				startLeap();
			}
			
		}
	}

	triggerBttn.addEventListener( 'click', toggleOverlay );
	closeBttn.addEventListener( 'click', toggleOverlay );
})();

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

//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var gestureArray = {};

$(".next").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
	currentFieldsetId = current_fs.attr('id');
	nextFieldsetId = next_fs.attr('id');

	var canvas = $('canvas');
	var nextButton = $('#msform .action-button.next');
	var previousButton = $('#msform .action-button.previous');
	var registerMessage = $('#registerMessage');
	var usernameInput = $("#username");

	// Check username
	if(currentFieldsetId == "zero"){
		if(usernameInput.val() == ""){
			registerMessage.text("Username cannot be empty");
			animating = false;
			return false;
		}
	}

	if(nextFieldsetId != "confirm"){
	  username = usernameInput.val();

	  // hide next button
	  nextButton.removeClass('show');
	  nextButton.addClass('hide');

	  // show canvas
	  canvas.removeClass('hide');
	  canvas.addClass('show');
	  
	  Record.startRegistration(username, nextFieldsetId);
	}else{

		// show next button
	  nextButton.removeClass('hide');
	  nextButton.addClass('show');
		
	  // hide canvas
	  canvas.removeClass('show');
	  canvas.addClass('hide');

		Record.stopRegistration();
	}

	// show previous button
	previousButton.removeClass('hide');
	previousButton.addClass('show');

	registerMessage.text("");

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

	currentFieldsetId = current_fs.attr('id');
	previousFieldsetId = previous_fs.attr('id');

	var canvas = $('canvas');
	var nextButton = $('#msform .action-button.next');
	var previousButton = $('#msform .action-button.previous');
	var registerMessage = $('#registerMessage');

	if(previousFieldsetId != "zero"){
		// show previous button
	  previousButton.removeClass('hide');
	  previousButton.addClass('show');

	  // hide next button
	  nextButton.removeClass('show');
	  nextButton.addClass('hide');

	  // show canvas
	  canvas.removeClass('hide');
	  canvas.addClass('show');

	  username = usernameInput.val();
	  Record.startRegistration(username, previousFieldsetId);
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

		Record.stopRegistration();
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

$(".submit").click(function(){
	return false;
})

