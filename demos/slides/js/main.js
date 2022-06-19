import { animate, animateBounce, bouncyTiming } from './modules/animate.js';
import { waitTick } from './modules/wait.js';

import Slide from './Slide.js';

document.addEventListener( 'DOMContentLoaded', domLoaded );

function domLoaded() {
	
	const	sections	= Array.prototype.slice.call( document.querySelectorAll( 'body > section' ) ),
			slides		= sections.map(
							( section, idx ) => {
								
								// TODO this better
								if ( idx % 2 ) { section.classList.add( 'alt' ); }
								
								const	slide	= new Slide( section );
								
								Slide.prototype.hide.call( slide );
								
								return	slide;
								
							}
						);
	
	document.body.classList.add( 'init' );
	
	document.body.addEventListener( 'click', getOnClick( slides ) );
	
	document.body.appendChild( slides[ 0 ].sectionEl );
	waitTick().then(() => { slides[ 0 ].sectionEl.classList.add( 'show' ) });
	
}

function getOnClick( slides ) {
	
	let	idx	= 0;
	
	return	evt => {
		
		const	current	= slides[ idx ];
		
		idx	= ( idx + 1 ) % slides.length;
		
		const	next	= slides[ idx ];
		
		waitTick().then(() => {
			
			current.sectionEl.classList.add( 'out' );
			
			return	next.show();
			
		}).then(() => { return current.hide() });
		
	}
	
}
