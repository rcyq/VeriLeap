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
		var canvas = $('canvas');

		if( classie.has( overlay, 'open' ) ) {
			canvas.removeClass('hand-canvas-show');
			canvas.addClass('hand-canvas-hide');

			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
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

			if (window.isLeapAnimationRunning) {
				canvas.removeClass('hand-canvas-hide');
				canvas.addClass('hand-canvas-show');
			} else {
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
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
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

});

// $(document.getElementById('createAccountButton')).addEvent("click", function(){
//   var SM = new SimpleModal({"btn_ok":"Alert button"});
//       SM.show({
//         "title":"Title",
//         "contents":"Your message..."
//       });
// });