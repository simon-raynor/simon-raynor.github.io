'use strict';



function Point( x, y, z ) {
	
	if ( x instanceof Point ) {
		
		this.x	= x.x;
		this.y	= y.x;
		this.z	= z.x;
		
	} else {
		
		// TODO	validate!
		
		this.x	= x || 0;
		this.y	= y || 0;
		this.z	= z || 0;
		
	}
	
}

// these simplify creating new Points from existing ones (means
// the constructor can stay the same)
Object.defineProperty( Point.prototype, 0, { get: function(){ return this.x; } } );
Object.defineProperty( Point.prototype, 1, { get: function(){ return this.y; } } );
Object.defineProperty( Point.prototype, 2, { get: function(){ return this.z; } } );

function rotatePoint( pitch, yaw, roll, cx, cy, cz ) {
	
	let	x, y, z,
		s, c
	
	cx	= cx || 0;
	cy	= cy || 0;
	cz	= cz || 0;
	
	x	= this.x - cx;
	y	= this.y - cy;
	z	= this.z - cz;
	
	if ( pitch ) { // rotate on x
		
		let	sinP	= Math.sin( pitch ),
			cosP	= Math.cos( pitch ),
			
			matrix	= [
						[ 1, 0, 0 ],
						[ 0, cosP, -sinP ],
						[ 0, sinP, cosP ]
					];
		
		matrix	= matrix.reduce(
					function( m, i ) {
						
						m.push(
							( i[ 0 ] * x )
							+
							( i[ 1 ] * y )
							+
							( i[ 2 ] * z )
						);
						
						return	m;
						
					},
					[]
				);
		
		x	= matrix[ 0 ];
		y	= matrix[ 1 ];
		z	= matrix[ 2 ];
		
	}
	
	if ( yaw ) {	// rotate on y
		
		let	sinY	= Math.sin( yaw ),
			cosY	= Math.cos( yaw ),
			
			matrix	= [
						[ cosY, 0, sinY ],
						[ 0, 1, 0 ],
						[ -sinY, 0, cosY ]
					];
		
		matrix	= matrix.reduce(
					function( m, i ) {
						
						m.push(
							( i[ 0 ] * x )
							+
							( i[ 1 ] * y )
							+
							( i[ 2 ] * z )
						);
						
						return	m;
						
					},
					[]
				);
		
		x	= matrix[ 0 ];
		y	= matrix[ 1 ];
		z	= matrix[ 2 ];
		
	}
	
	if ( roll ) {	// rotate on z
		
		let	sinR	= Math.sin( roll ),
			cosR	= Math.cos( roll ),
			
			matrix	= [
						[ cosR, -sinR, 0 ],
						[ sinR, cosR, 0 ],
						[ 0, 0, 1 ]
					];
		
		matrix	= matrix.reduce(
					function( m, i ) {
						
						m.push(
							( i[ 0 ] * x )
							+
							( i[ 1 ] * y )
							+
							( i[ 2 ] * z )
						);
						
						return	m;
						
					},
					[]
				);
		
		x	= matrix[ 0 ];
		y	= matrix[ 1 ];
		z	= matrix[ 2 ];
		
	}
	
	this.x	= x + cx;
	this.y	= y + cy;
	this.z	= z + cz;
	
}



function Face( points ) {
	
	if ( points instanceof Face ) {
		
		points	= points.points;
		
	}
	
	let	pts	= [];
	
	points.forEach(
		function( pt ) {
			
			// TODO	different inputs
			pts.push(
				new Point( pt[ 0 ], pt[ 1 ], pt[ 2 ] )
			);
			
		}
	);
	
	this.points	= pts;
	
	findCOfM.call( this );
	
}



function Solid( faces ) {
	
	if ( faces instanceof Solid ) {
		
		faces	= faces.faces;
		
	}
	
	let	fcs	= [];
	
	faces.forEach(
		function( fc ) {
			
			fcs.push(
				new Face( fc )
			);
			
		}
	);
	
	this.faces	= fcs;
	
	// TODO	abstract this
	// TODO consolidate points
	this.points	= fcs.reduce(
					function( pts, fc ) {
						
						return	pts.concat( fc.points );
						
					},
					[]
				);
	
	findCOfM.call( this );
	
}



function findCOfM() {
	
	let	xmax	= 0,
		ymax	= 0,
		zmax	= 0,
		xsum	= 0,
		ysum	= 0,
		zsum	= 0,
		count	= 0;
	
	this.points.forEach(
		function( pt ) {
			
			xmax	= Math.max( xmax, pt.x );
			ymax	= Math.max( ymax, pt.y );
			zmax	= Math.max( zmax, pt.z );
			
			xsum	+= pt.x;
			ysum	+= pt.y;
			zsum	+= pt.z;
			
			count++;
			
		}
	);
	
	/**/
	this.cx	= ( xsum / count );
	this.cy	= ( ysum / count );
	this.cz	= ( zsum / count );
	/*
	this.cx	= xmax;
	this.cy	= ymax;
	this.cz	= zmax;
	*/
	// TODO	find face centres of mass?
	
}



function movePoints( dx, dy, dz ) {
	
	if ( this.faces ) {
		
		this.faces.forEach(
			function( face ) {
				
				movePoints.call( face, dx, dy, dz );
				
			}
		);
		
	} else {
		
		this.points.forEach(
			function( point ) {
				
				point.x	+= dx;
				point.y	+= dy;
				point.z	+= dz;
				
			}
		);
		
	}
	
}

function scalePoints( factor ) {
	
	// TODO	separate factors (fx,fy,fz)?
	
	this.points.forEach(
		function( point ) {
			
			point.x	*= factor;
			point.y	*= factor;
			point.z	*= factor;
			
		}
	);
	
}

function rotatePoints( pitch, yaw, roll, cx, cy, cz ) {
	
	if (
		typeof cx === 'undefined'
		&&
		typeof cy === 'undefined'
		&&
		typeof cz === 'undefined'
	) {
		
		findCOfM.call( this );
		
		cx	= cx || this.cx;
		cy	= cy || this.cy;
		cz	= cz || this.cz;
		
	}
	
	this.points.forEach(
		function( point ) {
			
			rotatePoint.call( point, pitch, yaw, roll, cx, cy, cz );
			
		}
	);
	
	//	refind centre
	findCOfM.call( this );
	
}





function getSolidBasicProjection() {
	
	let	self	= this;
	
	findCOfM.call( this );
	
	return	this.faces.reduce(
				function( fcs, fc ) {
					
					findCOfM.call( fc );
					
					if ( true ) {
						
						fcs.push(
							fc.points.reduce(
								function( pts, pt ) {
									
									pts.push(
										[
											pt.x,
											pt.y,
											pt.z	// keep z so we can order
										]
									);
									
									return	pts;
									
								},
								[ fc.cz ] // add this here, we'll remove when sorting
							)
						);
						
					}
						
					return	fcs;
					
				},
				[]
			);
	
}

function getSolidPerspectiveProjection() {
	
	let	self	= this;
	
	findCOfM.call( this );
	
	// https://en.wikipedia.org/wiki/3D_projection#Perspective_projection
	
	//
	//	N.B.	assuming cx,cy,cz are 0,0,0
	//	N.B.	assuming camera has no angle
	//
	
	// projection plane distance (ez ; ex,ey assumed to be 0)
	let	ez	= -100;
	
	return	this.faces.reduce(
				function( fcs, fc ) {
					
					findCOfM.call( fc );
					
					if ( true ) {
						
						fcs.push(
							fc.points.reduce(
								function( pts, pt ) {
									
									pts.push(
										[
											( ez / pt.z ) * pt.x,
											( ez / pt.z ) * pt.y,
											pt.z	// keep z so we can order
										]
									);
									
									return	pts;
									
								},
								[ fc.cz ] // add this here, we'll remove when sorting
							)
						);
						
					}
						
					return	fcs;
					
				},
				[]
			);
	
}

function orderProjectionZ( projection ) {
	
	projection.sort(
		function( a, b ) {
			
			return	b[ 0 ] - a[ 0 ];
			
		}
	);
	
	projection.forEach(
		function( i ) {
			
			i.shift();
			
		}
	);
	
	return	projection;
	
	
}
