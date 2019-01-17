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
		
		if ( actions.length ) {
			
			actions.forEach(
				doStep
			);
			
			requestAnimationFrame( loop );
			
		} else {
			
			looping	= false;
			
		}
		
	}
	
	function filterActions( action ) {
		
		return	action;
		
	}
	
	
	
	function addAnimation( stepFn ) {
		
		actions.push( stepFn );
		
		if ( ! looping ) {
			
			looping	= true;
			
			loop();
			
		}
		
	}
	
	window[ 'animate' ]	= addAnimation;
	
	
})();
