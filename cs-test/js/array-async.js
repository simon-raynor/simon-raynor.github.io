(function() {
	
	'use strict';
	
	function forEachAsync( input, rowFn ) {
		
		let	self	= this;
		
		// clone the input array so we dont break it
		input	= input.slice();
		
		return	new Promise(
					function( resolve, reject ) {
						
						batch.call( self, input, rowFn, resolve, reject );
						
					}
				);
		
	}
	
	window.forEachAsync	= forEachAsync;
	
	
	function reduceAsync( input, output, rowFn ) {
		
		let	self	= this;
		
		// clone the input array so we dont break it
		input	= input.slice();
		
		return	new Promise(
					function( resolve, reject ) {
						
						batch.call(
							self,
							input,
							function( val ) {
								
								return	rowFn( output, val );
								
							},
							function() {
								
								resolve( output );
								
							},
							reject
						);
						
					}
				);
		
	}
	
	window.arrayReduceAsync	= reduceAsync;
	
	
	function batch( input, rowFn, resolve, reject ) {
		
		const	COUNT	= 500;
		
		try {
			
			let	i 	= COUNT > input.length
						? input.length
						: COUNT;
			
			while ( i-- > 0 ) {
				
				let	val	= input.shift();
				
				rowFn( val );
				
			}
			
			if ( input.length ) {
				
				setTimeout(
					function() {
						
						batch( input, rowFn, resolve, reject );
						
					}
				);
				
			} else {
				
				resolve();
				
			}
			
		} catch ( ex ) {
			
			reject( ex );
			
		}
		
	}
	
})();
