import { cssTransition, animate, bouncyTiming } from './modules/animate.js';
import { buildCanvas, createSVGElement } from './modules/svg.js';

export default class Slide {
	
	constructor( sectionEl ) {
		
		this.sectionEl	= sectionEl;
		this.stdClasses	= sectionEl.className.split( ' ' );
		this.sectionEl.classList.add( 'slide' );
		/*
		this.canvas	= buildCanvas();
		this.canvas.setAttribute( 'class', 'canvas' );
		this.sectionEl.appendChild( this.canvas );
		*/
	}
	
	show() {
		
		document.body.appendChild( this.sectionEl );
		
		const	topDoor	= document.createElement( 'div' ),
				btmDoor	= document.createElement( 'div' );
		
		topDoor.classList.add( 'door', 'top' );
		btmDoor.classList.add( 'door', 'bottom' );
		
		this.sectionEl.insertBefore( topDoor, this.sectionEl.children[ 0 ] );
		this.sectionEl.insertBefore( btmDoor, this.sectionEl.children[ 0 ] );
		
		return	animate(
			( t, resolve ) => {
				
				topDoor.setAttribute( 'style', '--t:' + bouncyTiming( t, 0.4 ) );
				btmDoor.setAttribute( 'style', '--t:' + bouncyTiming( t, 0.4 ) );
				
				/*if ( t > 0.5 ) {
					
					resolve();
					
				}*/
				
			},
			10000
		)
		.then(() => { return cssTransition( this.sectionEl, 'show' ); })
		.then(() => {
			
			this.sectionEl.classList.remove( 'in' );
			
			this.sectionEl.removeChild( topDoor );
			this.sectionEl.removeChild( btmDoor );
			
			return	this;
			
		});
		
	}
	
	hide() {
		
		this.sectionEl.classList.remove( 'show', 'out' );
		document.body.removeChild( this.sectionEl );
		
		return	Promise.resolve( this );
		
	}
	
}
