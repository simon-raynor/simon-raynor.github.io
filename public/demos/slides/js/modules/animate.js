import { waitTick } from './wait.js';

export function animateBasic( tickFn ) {
	
	return	new Promise(
		( resolve, reject ) => {
			
			const	recurse	= dt => {
				
				if ( ! tickFn( dt, resolve, reject ) ) {
					
					requestAnimationFrame( recurse );
					
				} else {
					
					resolve();
					
				}
				
			};
			
			recurse( 0 );
			
			// TODO	timeout?
			
		}
	);
	
}

export function animate( tickFn, time = 10000 ) {
	
	let	now		= performance.now(),
		tTot	= 0,
		t		= 0;
	
	return	animateBasic(
		( dt, resolve, reject ) => {
			
			dt	= Math.max( dt - now, 0 );
			
			tTot	+= dt;
			
			t	= tTot / time;
			
			if ( tTot >= time ) {
				//console.log( t );
				
				// run one last time with t = 1
				tickFn( 1, resolve, reject );
				
				return	true;
				
			} else return tickFn( t, resolve, reject );
			
		}
	);
	
}

export function bouncyTiming( t, bounciness = 0.5 ) {
	
	bounciness	= bounciness < 0
					? 0
					: bounciness;
	
	const	a	= ( Math.PI / 2 ) + ( ( Math.PI * bounciness ) / 2 );
	
	t	= Math.sin( t * a ) / Math.sin( a );
	
	if ( t > 1 ) {
		
		t	= 2 - t;
		
	}
	
	return	t;
	
}

export function animateBounce( tickFn, time = 10000, bounciness ) {
	
	let	now		= performance.now(),
		tTot	= 0,
		t		= 0;
	
	return	animateBasic(
		( dt, resolve, reject ) => {
			
			dt	= Math.max( dt - now, 0 );
			
			tTot	+= dt;
			
			t	= tTot / time;
			
			if ( tTot >= time ) {
				
				return	true;
				
			} else return tickFn( bouncyTiming( t, bounciness ), resolve, reject );
			
		}
	);
	
}





export function cssTransition( element, classToggle, doneFn ) {
	
	// TODO	validate `element`
	
	// validate classToggle (allow 'one two' to be passed)
	if ( classToggle.split && classToggle.indexOf( ' ' ) > -1 ) {
		
		classToggle	= classToggle.split( ' ' );
		
	}
	
	return	new Promise(
		( resolve, reject ) => {
			
			// define handler *then* set it so it is available to
			// unbind within itself
			let	handler;
			
			handler = ( evt ) => {
				
				// return value of `doneFn` should tell us whether this
				// is the correct event to resolve on (if it doesn't
				// exist just assume we're good)
				//
				// `doneFn === true` is a special case where we resolve
				// instantly (don't wait for a transitionend event)
				if ( doneFn !== true && ! doneFn || doneFn.call && doneFn( evt ) ) {
					
					element.removeEventListener( 'transitionend', handler );
					
					resolve( element );
					
				}
				
			};
			
			// TODO	check `window.computedStyle` to resolve instantly
			//		if no transition? allow flag to override in case
			//		transition is on a child node?
			element.addEventListener(
				'transitionend',
				handler
			);
			
			// wait so that transitions will fire even if the element
			// was only just appended
			//
			// TODO	handle multiple classes properly (esp. for css)
			waitTick()
			.then( () => {
				
				// TODO	make this work with SVG
				
				const	classList		= element.classList;
				
				if ( classToggle.split ) {
					
					if ( classList ) {
						
						classList.toggle( classToggle );
						
					} else {
						
						let	classes	= element.getAttribute( 'class' );
						classes		= classes && classes.split( ' ' ) || [];
						
						const	index	= classes.indexOf( classToggle );
						
						if ( index > -1 ) {
							
							classes.splice( index, 1 );
							
						} else {
							
							classes.push( classToggle );
							
						}
						
						element.setAttribute( 'class', classes.join( ' ' ) );
						
					}
					
				} else if ( classToggle.join ) {
					
					// TODO	make this work with SVG elements
					
					const	classListProto	= classList.constructor.prototype,
							
							add		= classToggle.filter( clss => ! classList.contains( clss ) ),
							remove	= classToggle.filter( clss => classList.contains( clss ) );
					
					classListProto.add.apply( classList, add );
					classListProto.remove.apply( classList, remove );
					
				} else {
					
					throw( 'Error' );
					
				}
				
				
				// `doneFn === true` is a special case where we resolve
				// instantly (don't wait for a transitionend event)
				if ( doneFn === true ) {
					
					resolve( element );
					
				}
				
			} );
			
		}
	);
	
}
