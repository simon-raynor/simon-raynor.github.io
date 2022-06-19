export function wait( t = 1000, ...args ) {
	
	return	new Promise(
		( resolve, reject ) => {
			
			setTimeout( resolve, 1000 );
			
		}
	);
	
}

export function waitTick() {
	
	return	new Promise(
		( resolve, reject ) => {
			
			requestAnimationFrame
			&& requestAnimationFrame( resolve )
			|| setTimeout( resolve, 1 );
			
		}
	);
	
}
