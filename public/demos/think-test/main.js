'use strict';

document.addEventListener( 'DOMContentLoaded', ready );

function ready() {
	
	// DEPRECATED user interaction (click handler)
	/*
	const	ctrls	= document.getElementById( 'ringctrls' ),
			kids	= Array.prototype.slice.call( ctrls.childNodes );	// cast to array so we can .indexOf()
	
	ctrls.addEventListener( 'click', evt => {
		
		const	target	= evt.target;
		
		if ( target.nodeName.toUpperCase() === 'BUTTON' ) {
			
			const	idx	= kids.indexOf( target.parentNode );
			
			select( idx, target.getAttribute( 'data-img' ) );
			
		}
		
	} );
	*/
	
	// simple infinite loop on a timer
	const	count	= document.getElementById( 'ringctrls' ).childNodes.length,
			loopfn	= loop( count );
	
	function loop( count ) {
		
		let	i	= 0;
		
		return	() => {
			
			select( i );
			
			i	= ( i + 1 ) % count;
			
			setTimeout( () => {
				
				loopfn();
				
			}, 2500 );
			
		}
		
	}
	
	setTimeout( loopfn, 2500 );
	
}



function select( idx ) {
	
	// highlight the button
	const	ctrls	= document.getElementById( 'ringctrls' ),
			selctrl	= ctrls.querySelector( '.selected' );	// currently selected
	
	selctrl && selctrl.classList.remove( 'selected' );
	ctrls.querySelector( `li:nth-child(${ idx + 1 }) button` ).classList.add( 'selected' );
	
	// select the icon, arrow & image
	const	ring	= document.getElementById( 'ring' ),
			selitem	= ring.querySelector( `.ringitem--icon.selected` ),	// currently selected
			arrow	= ring.querySelector( `.ringitem--arrow:nth-child(${ idx + 1 })` ),
			icon	= ring.querySelector( `.ringitem--icon:nth-child(${ idx + 1 })` );
	
	let	chain	= Promise.resolve();
	
	if ( selitem ) {
	
		chain	= Promise.all([
					animateOut( selitem ),
					animateIn( arrow )
				]);
		
	}
				
	return	chain.then( () => {
				
				if ( selitem ) {
					
					return	Promise.all([
						arrowOut( arrow ),
						Promise.all([
							animateIn( icon ),
							swapImages( ring, idx )
						])
					]);
					
				} else {
					
					return	Promise.all([
								animateIn( icon ),
								swapImages( ring, idx )
							]);
					
				}
				
			} );
	
}


function arrowOut( arrow ) {
	
	return	new Promise( resolve => {
				
				requestAnimationFrame( resolve );
				
			} )
			.then( () => {
				
				return	animateIn( arrow, 'selected--out' );
				
			} )
			.then( () => {
				return	animateOut( arrow, 'selected selected--out' );
				
			} );
	
}


function swapImages( ring, idx ) {
	
	return	new Promise( () => {
				
				ring.querySelector( 'image.selected' ).removeAttribute( 'class' );
				
				const	target	= ring.querySelector( `.ringimages :nth-child(${ idx + 1 })` );
				
				return	animateIn( target );
				
			} );
	
}


function transitionEnd( el ) {
	
	// use a promise so we can chain animations
	return new Promise( resolve => {
		
		try {
			
			// self-destructing event
			const	te	= evt => {
				
				el.removeEventListener( 'transitionend', te );
				
				resolve( el );
				
			};
			
			el.addEventListener( 'transitionend', te );
			
		} catch ( ex ) {
			
			reject( ex );
			
		}
		
	} );
	
}



function animateIn( el, classname = 'selected' ) {
	
	if ( ! el ) return	Promise.reject();
	
	// promise & transitionend events
	const	p	= transitionEnd( el );
	
	// add the "selected" class
	el.setAttribute( 'class', el.getAttribute( 'class' ) + ' ' + classname );
	
	return	p;
	
}

function animateOut( el, classname = 'selected' ) {
	
	if ( ! el ) return	Promise.reject();
	
	// promise & transitionend events
	const	p	= transitionEnd( el );
	
	// remove the "selected" class
	// N.B.	use .replace() instead of .classList.remove() so it will work
	//		with SVG elements too
	el.setAttribute( 'class', el.getAttribute( 'class' ).replace( ' ' + classname, '' ) );
	
	return	p;
	
}
