import Leaf from './modules/plant.js';
import { randomBetween } from './modules/random.js';
import { SVG_NS, prependCanvas, clearCanvas } from './modules/svg.js';
import { waitTick } from './modules/wait.js';
import { cssTransition } from './modules/animate.js';


//document.addEventListener(
//	'DOMContentLoaded',
window.addEventListener(
	'load',
	function() {
		
		prependCanvas()
		.then( draw );
		
		window.addEventListener(
			'canvasresize',
			( evt ) => {
				
				evt.detail.canvas.removeAttribute( 'class' );
				clearCanvas( evt.detail.canvas );// TODO promiseify
				
				waitTick()
				.then( () => {
					
					draw( evt.detail );
					
					
				});
				
			}
		);
		
	}
);

function draw( { dims, canvas } ) {
	
	const	avoidEl	= document.querySelector( 'section' ),
			avoid	= avoidEl.getBoundingClientRect();
	console.log( avoid );
	return	new Promise(
		( resolve, reject ) => {
			
			const	plants	= doPlants( dims, -20 );
			const	grp		= document.createElementNS( SVG_NS, 'g');

			plants.forEach( ( plant ) => {
				
				const	dim	= plant.dimensions;
				
				const	xIntersect	= (
										dim.left > avoid.left - 16
										&&
										dim.left < avoid.right + 16
									)
									||
									(
										dim.right > avoid.left - 16
										&&
										dim.right < avoid.right + 16
									);
				const	yIntersect	= (
										dim.top < avoid.bottom + 16
										&&
										dim.top > avoid.top - 16
									)
									||
									(
										dim.bottom < avoid.bottom + 16
										&&
										dim.bottom > avoid.top - 16
									);
				
				if ( ! xIntersect || ! yIntersect ) {
					
					grp.appendChild( plant.pathEl );
					
				}
				
			} );

			grp.setAttribute( 'class', 'plants' );
			
			canvas.appendChild( grp );
			
			return	waitTick()
					.then( () => cssTransition( canvas, 'go', transitionsFinished( Array.prototype.slice.call( grp.children ) ) ) )
					.then( () => {
						
						return	{ dims, canvas, plants };
						
					})
					//.then( () => cssTransition( canvas, 'go', transitionsFinished( plants.slice() ) ) );
			
		}
	);
	
}

function transitionsFinished( plants ) {
	
	return	( evt ) => {
		
		plants.pop();
		
		return	! plants.length;
		
	}
	
}

function doPlants( dims, startX = 0 ) {
	
	let	plants	= [],
		row		= null,
		prevRow	= null,
		
		y		= Infinity;
	
	do {
		
		row	= doPlantsRow( dims, prevRow, startX );
		
		y	= row.reduce( ( min, plant ) => Math.min( min, plant.dimensions.top ), y );
		
		prevRow	= row;
		
		plants	= plants.concat( row );
		
	} while ( y > 100 );
	
	return	plants;
	
}

function doPlantsRow( dims, prevRow, startX = 0 ) {
	
	const	row	= [];
	
	let	i		= 0;
	
	do {
		
		// work out where we should be drawing
		const	prev	= row[ 0 ],
				
				shorter	= ( i + 1 ) % 4 > 1,
				left	= i % 2,
				px		= prev ? prev.x : 0,
				x0		= prev ? prev.dimensions.right : startX;
		
		let	x, y;
		
		if ( prevRow ) {
			
			// this shouldnt happen but it does :shrug:
			if ( ! prevRow[ i ] ) break;//console.log( prevRow, i );
			
			x	= prevRow[ i ].x;
			y	= prevRow[ i ].dimensions.top;
			
		} else {
			
			x	= left	? randomBetween( x0 + 30, x0 + 40 )
						: x0 + 6;
			y	= dims.height;// for now
			
		}
		
		let	height	= ! prevRow && shorter 
						? randomBetween( 40, 55 )
						: randomBetween( 80, 95 );
		let	width	= randomBetween( 20, 35 );
		
		//
		//	actually get round to creating the plant
		//
		const	plant	= new Leaf( x, y, height, width, left );
		
		plant.growDelay	= left || ! prev
							? prevRow
								? prevRow[ i ].growDelay + ( 0.5 * Math.random() )
								: 0.5 + ( 0.5 * Math.random() )
							: prev.growDelay;
		
		plant.pathEl.setAttribute( 'stroke-dasharray', plant.dimensions.length + ' ' + plant.dimensions.length );
		plant.pathEl.setAttribute( 'stroke-dashoffset', plant.dimensions.length );
		
		plant.pathEl.setAttribute(
			'style',
			'transition:stroke-dashoffset '
			+ ( .5 + Math.random() ) + 's '
			+ plant.growDelay + 's'
		);
		
		
		row.unshift( plant );
		
		i++;
		
	} while ( row[ 0 ].dimensions.left < dims.width );
	
	return	row.reverse();
	
}
