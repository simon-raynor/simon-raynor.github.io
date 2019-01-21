(function() {
	
	'use strict';
	
	
	const	PHI	= ( 1 + Math.sqrt( 5 ) ) / 2;
	
	
	// set this once Graphics initialises so it's
	// more easily accessable in this file but is
	// only defined one time
	let	SVG_NS;
	
	
	// some settings for scaling the thingy
	//
	// N.B.	these numbers are fairly arbitrary, tweak
	//		em as needed
	//
	// TODO	needs to respond to screen/canvas size
	//		probably
	let	radius		= 16,
		distance	= 320,
		zoom		= 15;
	
	
	document.addEventListener(
		'DOMContentLoaded',
		function() {
			
			let	placeholder	= document.querySelector( '.JS_main' ),
				
				graphics	= new Graphics( 'svg' ),
				shape		= SOLIDS.icosahedron,
				shape2		= SOLIDS.dodecahedron,
				shape3		= SOLIDS.globe,//SOLIDS.octahedron,
				shape4		= SOLIDS.cube,
				shape5		= SOLIDS.tetrahedron;
							//SOLIDS.dodecahedron;
							//SOLIDS.icosahedron;
							//SOLIDS.octahedron;
							//SOLIDS.cube;
							//SOLIDS.tetrahedron;
			
			// set this now
			SVG_NS	= graphics.SVG_NS;
			
			graphics.appendTo( placeholder );
			
			// once appended we can find the centre
			let	cx	= Math.round( graphics.dimensions.x / 2 ),
				cy	= Math.round( graphics.dimensions.y / 2 );
			
			
			// create the shape thingy
			let	thing	= new Thingy( shape );
			
			/*
			thing.centreShape	= document.createElementNS( SVG_NS, 'circle' );
			
			thing.centreShape.setAttribute( 'cx', cx );
			thing.centreShape.setAttribute( 'cy', cy );
			thing.centreShape.setAttribute( 'r', radius * 2 );
			*/
			
			// TODO	add child method
			thing.child	= new Thingy( shape2 );
			
			thing.child.child	= new Thingy( shape3 );
			
			/*
			thing.child.child.child	= new Thingy( shape4 );
			
			thing.child.child.child.child	= new Thingy( shape5 );
			*/
			
			//console.log( thing );
			
			scaleThingy.call( thing, radius );
			translateThingy.call( thing, [ 0, 0, distance ] );
			
			scaleThingy.call( thing.child, radius / Math.SQRT2 );
			translateThingy.call( thing.child, [ 0, 0, distance ] );
			
			scaleThingy.call( thing.child.child, radius / 2 );
			translateThingy.call( thing.child.child, [ 0, 0, distance ] );
			
			/*
			scaleThingy.call( thing.child.child.child, radius / 2 * Math.SQRT2 );
			translateThingy.call( thing.child.child.child, [ 0, 0, distance ] );
			
			scaleThingy.call( thing.child.child.child.child, radius / 4 );
			translateThingy.call( thing.child.child.child.child, [ 0, 0, distance ] );
			*/
			
			
			graphics.svgEl.appendChild(
				buildThingyElements.call( thing )
			);
			
			
			animate(
				function( time ) {
					
					let	pitch	= time * Math.PI / 20000,
						yaw		= time * Math.PI / 10000;
					
					rotateThingy.call( thing, [ pitch, yaw ] );
					rotateThingy.call( thing.child, [ yaw, - pitch ] );
					rotateThingy.call( thing.child.child, [ pitch, - time * Math.PI / 5000 ] );
					/*rotateThingy.call( thing.child.child.child, [ - yaw, - pitch ] );
					rotateThingy.call( thing.child.child.child.child, [ yaw, pitch ] );*/
					
					graphics.svgEl.appendChild(
						drawThingy.call( thing, cx, cy )
					);
					
					//return	true;
					
				}
			);
			
		}
	);
	
	
	
	function Thingy( shape ) {
		
		this.faces	= [];
		
		for (
			let	n	= shape.data.length,
				i	= 0,
				d	= shape.dimensionality,
				p	= shape.pointsPerFace,
				pd	= d * p;
			i < n;
			i += pd
		) {
			
			let	face	= {},
				points	= shape.data.slice( i, i + pd ),
				centre	= findShapeCentre(
							points,
							3
						);
			
			face.num	= i / pd;
			
			face.normal	= find3DPolygonNormal( points );
			
			// set the first and second points to be the face's
			// centre and a normal/orthogonal/perpendicular point
			//
			// we need these later so might as we transform them
			// alongside the other points rather than recalculating
			// each time
			
			face.points	= Array.prototype.concat.call(
							[],
							centre,
							[
								0,//centre[ 0 ] - face.normal[ 0 ],
								0,//centre[ 1 ] - face.normal[ 1 ],
								0//centre[ 2 ] - face.normal[ 2 ]
							],
							points
						);
			
			this.faces.push( face );
			
		}
		
	}
	
	Object.defineProperty(
		Thingy.prototype,
		'points',
		{
			get	: function() {
				
				return	Array.prototype.concat.apply(
							[],
							this.faces.map(
								function( face ) {
									
									return	face.points;
									
								}
							)
						);
				
			}
		}
	);
	
	Object.defineProperty(
		Thingy.prototype,
		'centre',
		{
			get	: function() {
				
				return	findShapeCentre( this.points, 3 );
				
			}
		}
	);
	
	
	
	function rotateThingy( theta, centre ) {
		
		if ( ! centre ) {
			
			centre	= this.centre;
			
		}
		
		
		this.faces.forEach(
			function( face ) {
				
				let	matrix	= rotate3DShape( face.points, theta, centre );
				
				face.normal	= [
								( face.normal[ 0 ] * matrix[ 0 ][ 0 ] )
								+ ( face.normal[ 1 ] * matrix[ 1 ][ 0 ] )
								+ ( face.normal[ 2 ] * matrix[ 2 ][ 0 ] ),
								( face.normal[ 0 ] * matrix[ 0 ][ 1 ] )
								+ ( face.normal[ 1 ] * matrix[ 1 ][ 1 ] )
								+ ( face.normal[ 2 ] * matrix[ 2 ][ 1 ] ),
								( face.normal[ 0 ] * matrix[ 0 ][ 2 ] )
								+ ( face.normal[ 1 ] * matrix[ 1 ][ 2 ] )
								+ ( face.normal[ 2 ] * matrix[ 2 ][ 2 ] )
							];
							//find3DPolygonNormal( face.points.slice( 2 ) );
				
				face.z	= calc3dViewlineDistance( face.points[ 0 ], face.points[ 1 ], face.points[ 2 ] );
				
			}
		);
		
	}
	
	
	function translateThingy( distances ) {
		
		this.faces.forEach(
			function( face ) {
				
				translateShape( face.points, 3, distances );
				
				face.z	= calc3dViewlineDistance( face.points[ 0 ], face.points[ 1 ], face.points[ 2 ] );
				
			}
		);
		
	}
	
	
	function scaleThingy( scaleFactor ) {
		
		this.faces.forEach(
			function( face ) {
				
				scaleShape( face.points, scaleFactor );
				
				//face.normal	= find3DPolygonNormal( face.points );
				
				face.z	= calc3dViewlineDistance( face.points[ 0 ], face.points[ 1 ], face.points[ 2 ] );
				
			}
		);
		
	}
	
	
	
	function spreadThingy( amount ) {
		
		amount	= amount || 1;
		
		this.faces.forEach(
			function( face ) {
				
				translateShape(
					face.points,
					3,
					[
						face.normal[ 0 ] * amount,
						face.normal[ 1 ] * amount,
						face.normal[ 2 ] * amount
					]
				);
				
				face.z	= calc3dViewlineDistance( face.points[ 0 ], face.points[ 1 ], face.points[ 2 ] );
				
			}
		);
		
	}
	
	
	
	function buildThingyElements( element ) {
		
		let	self	= this;
		
		
		this.element	= document.createElementNS( SVG_NS, 'g' );
		
		this.faces.forEach(
			function( face ) {
				
				face.element	= document.createElementNS( SVG_NS, 'path' );
				face.normalLine	= document.createElementNS( SVG_NS, 'path' );
				
			}
		);
		
		
		if ( this.child ) {
			
			this.element.appendChild(
				buildThingyElements.call( this.child )
			);
			
			// bind this now
			//
			// TODO	better
			
			let	totalSpread	= 0;
			
			this.element.addEventListener(
				'click',
				function() {
					
					animate(
						function( time ) {					
							
							let	spread	= time / 33;
							
							totalSpread	+= spread;
							
							if ( totalSpread < radius ) {
								
								spreadThingy.call( self, spread );
								
							} else {
								
								return	true;
								
							}
							
						}
					);
					
				}
			);
			
		}
		
		// TODO	add a class to manage styles for each "layer" here or later?
		
		return	this.element;
		
	}
	
	
	
	function drawThingy( cx, cy ) {
		
		let	wrap		= this.element,
			child		= this.child;
			//centreShape	= this.centreShape;
		
		// hide it so that we (should) only get
		// one repaint
		//
		// TODO	would removing it from the DOM be better?
		wrap.setAttribute( 'style', 'display:none' );
		
		
		let	centreDist	= calc3dViewlineDistance.apply(
							null,
							this.centre
						);
		
		
		// TODO	optimise
		let	faces	= this.faces.sort(
						function( a, b ) {
							
							return	b.z - a.z;
							
						}
					);
		
		// use this to determine when to show the
		// "inside" circle
		let	behind	= true;
		
		this.faces.forEach(
			function( face, idx ) {
				
				let	projection	= get3d2dProjection(
									face.points
								),
					centre		= projection.shift(),
					normal		= projection.shift();
				
				// add the normal line (for now)
				/*if ( normalDy >= 0 ) {
					
					wrap.appendChild(
						drawThingyNormalLine( face, centre, normal, '#' + face.num, cx, cy )
					);
					
				}*/
				
				// build up the main path
				let	path	= face.element,
					str		= '';
				
				projection.forEach(
					function( point ) {
						
						str	+= str
								? 'L'
								: 'M';
						
						str	+= ( ( point[ 0 ] * zoom ) + cx )
							+ ' '
							+ ( ( point[ 1 ] * zoom ) + cy );
						
					}
				);
				
				str	+= 'Z';
				
				path.setAttribute( 'd', str );
				
				
				if ( face.z > centreDist ) {
					
					path.setAttribute( 'class', 'inside' );
					
				} else {
					
					path.setAttribute( 'class', 'outside' );
					
					// append the centre circle now so that it's
					// at the correct z position
					if ( behind ) {
						
						//wrap.appendChild( centreShape );
						if ( child ) {
							
							wrap.appendChild( child.element );
							
							drawThingy.call(	
								child,
								cx,
								cy
							);
							
						}
						
						behind	= false;
						
					}
					
				}
				
				
				wrap.appendChild( path );
				
			}
		);
		
		// show it again and trigger the repaint
		//
		// TODO	would removing/reappending it from the DOM be better?
		wrap.removeAttribute( 'style' );
		
		return	wrap;
		
	}
	
})();
