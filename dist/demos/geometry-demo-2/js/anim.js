(function() {
	
	'use strict';
	
	let	actions	= [],
		t		= 0,
		dt		= 0,
		looping	= false;
	
	
	function doStep( stepFn ) {
		
		let	stepFnRes	= stepFn( dt );
		
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
		
		let	time	= new Date();
		
		dt	= time - t;
		t	= time;
		
		
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
		
		t	= new Date();
		
		requestAnimationFrame( loop );
		
	}
	
	window[ 'startAnimation' ]	= startAnimation;
	
	
})();
