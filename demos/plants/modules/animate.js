import { waitTick } from './wait.js';

export function cssTransition( element, classToggle, doneFn ) {
	
	// TODO	validate `element`
	
	return	new Promise(
		( resolve, reject ) => {
			
			// TODO	check `window.computedStyle` to resolve instantly
			//		if no transition? allow flag to override in case
			//		transition is on a child node?
			element.addEventListener(
				'transitionend',
				( evt ) => {
					
					// return value of `doneFn` should tell us whether this
					// is the correct event to resolve on (if it doesn't
					// exist just assume we're good)
					if ( ! doneFn || doneFn() ) {
						
						resolve( element );
						
					}
					
				}
			);
			
			// wait so that transitions will fire even if the element
			// was only just appended
			//
			// TODO	handle multiple classes properly (esp. for css)
			waitTick()
			.then( () => {
				
				if ( element.hasOwnProperty( 'classList' ) ) {
					
					element.classList.toggle( classToggle );
					
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
				
			} );
			
		}
	);
	
}
