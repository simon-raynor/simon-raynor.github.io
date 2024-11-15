import { getWindowDimensions, multMatrices3x3 } from './utils.js';
import Shape from './Shape.js';
import solids from './solid-defs.js';
import { animateBasic, animate, bouncyTiming, elasticTiming } from './animate.js';


let	spinning	= false,
	flat		= null;

const SIZE_FACTOR = 2;
const SIZE_FACTOR2 = 4;

document.addEventListener( 'DOMContentLoaded', evt => {
	
	// TODO	resize handler
	const	dimensions	= getWindowDimensions(),
			{ min }	= dimensions;
	
	
	const	canvas	= document.createElement( 'canvas' ),
			ctx		= canvas.getContext( '2d' );
	
	canvas.width	= ( min / SIZE_FACTOR );
	canvas.height	= ( min / SIZE_FACTOR );
	document.body.appendChild( canvas );
	
	canvas.style.border			= '2px solid deeppink';
	canvas.style.borderRadius	= "50%";
	
	const centre = min / SIZE_FACTOR2

	
	const	shape	= new Shape(
						solids.trianglePrism1
					);
	
	shape.scale( 100 );
	shape.translate( [ 0, 0, 1000 ] );
	
	flat	= shape.flat.slice();
	
	drawShape( shape, { ctx, centre } );
	
	canvas.addEventListener( 'click', evt => {
		
		if ( ! spinning ) {
			
			spinning	= true;
			
			const	[ nx
					, ny ]	= getNormalisedVector(
								evt, 
								canvas.offsetLeft,
								canvas.offsetTop,
								centre,
								centre
							);
			
			animate( t => {
				
				const	theta		= 2 * Math.PI * elasticTiming( t ),
						sinTheta2	= Math.sin( theta / 2 ),
						quaternion	= [ Math.cos( theta / 2 ), sinTheta2 * -ny, sinTheta2 * -nx, 0 ]
				
				shape.quaternionRotate( quaternion );
				
				drawShape( shape, { ctx, centre } );
				
				shape.flat	= flat.slice();
				
			}, 1000 ).then( t => spinning = false );
			
		}
		
	});
	
} );


function getNormalisedVector( evt, offsetX, offsetY, cx, cy ) {
	
	const	x	= ( ( evt.pageX - offsetX ) - cx ),
			y	= ( cy - ( evt.pageY - offsetY ) ),
			mag	= Math.sqrt( ( x * x ) + ( y * y ) );
	
	return	[ x / mag, y / mag ];
	
}


function drawShape( shape, canvas ) {
	// TODO	svg output would be easier to style
	
	const	proj		= shape.get2dProjection( 800/*650*/ ), // TODO calculate the zoom factor
			{ ctx
			, centre }	= canvas;
	
	ctx.clearRect( 0, 0, centre * 2, centre * 2 );
	
	proj.forEach( face => {
		
		const	first	= face.shift(),
				fCentre	= face.pop(),
				fNormal	= face.pop();
		
		ctx.beginPath();
		ctx.moveTo( first[ 0 ] + centre, first[ 1 ] + centre );
		
		face.forEach( pt => {
			
			ctx.lineTo( pt[ 0 ] + centre, pt[ 1 ] + centre );
			
		} );
		
		ctx.closePath();
		
		ctx.fillStyle	= 'white';
		ctx.fill();
		
		ctx.strokeStyle	= 'deeppink';
		ctx.lineWidth	= 2;
		ctx.lineJoin	= 'round';
		ctx.stroke();
		
		/*
		ctx.beginPath();
		ctx.moveTo( fCentre[ 0 ] + centre, fCentre[ 1 ] + centre );
		ctx.lineTo( fNormal[ 0 ] + centre, fNormal[ 1 ] + centre );
		
		ctx.strokeStyle	= fCentre[ 2 ] > fNormal[ 2 ] ? 'red' : 'blue';//'deepskyblue';
		ctx.lineWidth	= 1;
		ctx.lineJoin	= 'round';
		ctx.stroke();
		*/
	} );
	
}
