(function() {
	
	'use strict';
	
	let	actions	= [],
		looping	= false;
	
	
	function doStep( stepFn ) {
		
		let	stepFnRes	= stepFn();
		
		if ( stepFnRes ) {
			
			console.log( 'done' );
			
			actions.splice(
				actions.indexOf( stepFn ),
				1,
				false
			);
			
		}
		
	}
	
	
	
	function loop() {
		
		actions	= actions.filter( filterActions );
		
		if ( looping && actions.length ) {
			
			actions.forEach(
				doStep
			);
			
			requestAnimationFrame( loop );
			
		} else {
			
			stopAnimation();
			
		}
		
	}
	
	function filterActions( action ) {
		
		return	action;
		
	}
	
	
	
	function addAnimation( stepFn ) {
		
		actions.push( stepFn );
		
		if ( ! looping ) {
			
			startAnimation();
			
		}
		
	}
	
	window[ 'animate' ]	= addAnimation;
	
	
	
	function stopAnimation() {
		
		looping	= false;
		
	}
	
	window[ 'stopAnimation' ]	= stopAnimation;
	
	function startAnimation() {
		
		looping	= true;
		
		loop();
		
	}
	
	window[ 'startAnimation' ]	= startAnimation;
	
	
})();
