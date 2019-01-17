(function() {
	
	'use strict';
	
	const	PHI	= ( 1 + Math.sqrt( 5 ) ) / 2;
	
	
	let	solids	= {};
	
	window[ 'SOLIDS' ]	= solids;
	
	
	solids[ 'tetrahedron' ]	= [
		[
			// one
			[ Math.sqrt(8/9), 0, -1/3 ],
			// two
			[ -Math.sqrt(2/9), Math.sqrt(2/3), -1/3 ],
			// three
			[ -Math.sqrt(2/9), -Math.sqrt(2/3), -1/3 ]
		],
		[
			// two
			[ -Math.sqrt(2/9), Math.sqrt(2/3), -1/3 ],
			// three
			[ -Math.sqrt(2/9), -Math.sqrt(2/3), -1/3 ],
			// four
			[ 0, 0, 1 ]
		],
		[
			// three
			[ -Math.sqrt(2/9), -Math.sqrt(2/3), -1/3 ],
			// four
			[ 0, 0, 1 ],
			// one
			[ Math.sqrt(8/9), 0, -1/3 ]
		],
		[
			// four
			[ 0, 0, 1 ],
			// one
			[ Math.sqrt(8/9), 0, -1/3 ],
			// two
			[ -Math.sqrt(2/9), Math.sqrt(2/3), -1/3 ]
		]
	];
	
	solids[ 'cube' ]	= [
		[
			// one
			[ 0.5, 0.5, 0.5 ],
			// two
			[ -0.5, 0.5, 0.5 ],
			// three
			[ -0.5, -0.5, 0.5 ],
			// four
			[ 0.5, -0.5, 0.5 ]
		],
		[
			// five
			[ 0.5, 0.5, -0.5 ],
			// six
			[ -0.5, 0.5, -0.5 ],
			// seven
			[ -0.5, -0.5, -0.5 ],
			// eight
			[ 0.5, -0.5, -0.5 ]
		],
		[
			// one
			[ 0.5, 0.5, 0.5 ],
			// two
			[ -0.5, 0.5, 0.5 ],
			// six
			[ -0.5, 0.5, -0.5 ],
			// five
			[ 0.5, 0.5, -0.5 ]
		],
		[
			// two
			[ -0.5, 0.5, 0.5 ],
			// three
			[ -0.5, -0.5, 0.5 ],
			// seven
			[ -0.5, -0.5, -0.5 ],
			// six
			[ -0.5, 0.5, -0.5 ]
		],
		[
			// three
			[ -0.5, -0.5, 0.5 ],
			// four
			[ 0.5, -0.5, 0.5 ],
			// eight
			[ 0.5, -0.5, -0.5 ],
			// seven
			[ -0.5, -0.5, -0.5 ]
		],
		[
			// four
			[ 0.5, -0.5, 0.5 ],
			// one
			[ 0.5, 0.5, 0.5 ],
			// five
			[ 0.5, 0.5, -0.5 ],
			// eight
			[ 0.5, -0.5, -0.5 ]
		]
	];
	
	solids[ 'octahedron' ]	= [
		[
			[ 1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 0, 1 ]
		],
		[
			[ -1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 0, 1 ]
		],
		[
			[ -1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 0, -1 ]
		],
		[
			[ 1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 0, -1 ]
		],
		[
			[ 1, 0, 0 ],
			[ 0, -1, 0 ],
			[ 0, 0, 1 ]
		],
		[
			[ -1, 0, 0 ],
			[ 0, -1, 0 ],
			[ 0, 0, 1 ]
		],
		[
			[ -1, 0, 0 ],
			[ 0, -1, 0 ],
			[ 0, 0, -1 ]
		],
		[
			[ 1, 0, 0 ],
			[ 0, -1, 0 ],
			[ 0, 0, -1 ]
		]
	];
	
	solids[ 'icosahedron' ]	= (function(){
		
		let	points	= [],
			north	= [ 0, 1, 0 ],
			south	= [ 0, -1, 0 ],
			
			atanHalf	= Math.atan( 0.5 );
		
		for ( let i = 0, n = 10; i < n; i++ ) {
			
			let	yaw		= 2 * Math.PI * i / n,
				pitch	= i % 2
							? -atanHalf
							: atanHalf;
			
			points.push(
				[
					Math.cos( pitch ) * -1 * Math.sin( yaw ),
					Math.sin( pitch ),
					Math.cos( pitch ) * Math.cos( yaw )
				]
			);
			
		}
		
		
		let	shape	= [];
		
		points.forEach(
			function( pt, idx ) {
				
				let	pole	= pt[ 1 ] < 0
								? south
								: north,
					other1	= ( points[ ( ( idx + 2 ) % 10 /* points.length is 10 */ ) ] ),
					other2	= ( points[ ( ( idx + 1 ) % 10 /* points.length is 10 */ ) ] );
				
				shape.push(
					[ pole, other1, pt ],
					[ other1, pt, other2 ]
				);
				
			}
		);
		
		return	shape;
		
	})();
	
	solids[ 'dodecahedron' ]	= (function(){
		
		//	+-1, +-1, +-1
		//	0, +-PHI, +-1/PHI
		//	+-1/PHI, 0, +-PHI
		//	+-PHI, +-1/PHI, 0
		//
		//	N.B. 20 vertices, 12 faces
		//	N.B. must divide all by PHI to fit in unit sphere
		let	points	= [
				[
					[ 0, PHI, 1/PHI ],
					[ 1, 1, 1 ],
					[ 1/PHI, 0, PHI ],
					[ -1/PHI, 0, PHI ],
					[ -1, 1, 1 ]
				],
				[
					[ 0, -PHI, 1/PHI ],
					[ 1, -1, 1 ],
					[ 1/PHI, 0, PHI ],
					[ -1/PHI, 0, PHI ],
					[ -1, -1, 1 ]
				],
				[
					[ 0, PHI, -1/PHI ],
					[ 1, 1, -1 ],
					[ 1/PHI, 0, -PHI ],
					[ -1/PHI, 0, -PHI ],
					[ -1, 1, -1 ]
				],
				[
					[ 0, -PHI, -1/PHI ],
					[ 1, -1, -1 ],
					[ 1/PHI, 0, -PHI ],
					[ -1/PHI, 0, -PHI ],
					[ -1, -1, -1 ]
				],
				
				[
					[ 0, PHI, 1/PHI ],
					[ 1, 1, 1 ],
					[ PHI, 1/PHI, 0 ],
					[ 1, 1, -1 ],
					[ 0, PHI, -1/PHI ]
				],
				[
					[ 0, -PHI, 1/PHI ],
					[ 1, -1, 1 ],
					[ PHI, -1/PHI, 0 ],
					[ 1, -1, -1 ],
					[ 0, -PHI, -1/PHI ]
				],
				[
					[ 0, PHI, 1/PHI ],
					[ -1, 1, 1 ],
					[ -PHI, 1/PHI, 0 ],
					[ -1, 1, -1 ],
					[ 0, PHI, -1/PHI ]
				],
				[
					[ 0, -PHI, 1/PHI ],
					[ -1, -1, 1 ],
					[ -PHI, -1/PHI, 0 ],
					[ -1, -1, -1 ],
					[ 0, -PHI, -1/PHI ]
				],
				
				[
					[ PHI, 1/PHI, 0 ],
					[ 1, 1, 1 ],
					[ 1/PHI, 0, PHI ],
					[ 1, -1, 1 ],
					[ PHI, -1/PHI, 0 ]
				],
				[
					[ -PHI, 1/PHI, 0 ],
					[ -1, 1, 1 ],
					[ -1/PHI, 0, PHI ],
					[ -1, -1, 1 ],
					[ -PHI, -1/PHI, 0 ]
				],
				[
					[ PHI, 1/PHI, 0 ],
					[ 1, 1, -1 ],
					[ 1/PHI, 0, -PHI ],
					[ 1, -1, -1 ],
					[ PHI, -1/PHI, 0 ]
				],
				[
					[ -PHI, 1/PHI, 0 ],
					[ -1, 1, -1 ],
					[ -1/PHI, 0, -PHI ],
					[ -1, -1, -1 ],
					[ -PHI, -1/PHI, 0 ]
				]
			];
		
		return	points.map(	
			function( face ) {
				
				return	face.map(
					function( pt ) {
						
						return	pt.map(function( v ) { return	v/PHI; });
						
					}
				);
				
			}
		);
		
	})();
	
	solids[ 'globe' ]	= (function(){
		
		let	polarAngles	= (function() {
				
				let	angles	= [];
				
				for ( let i = 0, n = 16; i < n; i++ ) {
					
					angles.push(
						2 * Math.PI * i / n
					);
					
				}
				
				return	angles;
				
			})(),
			lattitudes	= (function() {
				
				let	angles	= [];
				
				for ( let i = 0, n = 9; i <= n; i++ ) {
					
					angles.push(
						Math.PI / 2 - ( Math.PI * i / n )
					);
					
				}
				
				return	angles;
				
			})();
		
		
		let	shape	= [];
		
		polarAngles.forEach(
			function( angle1, idx1 ) {
				
				let	nextAngle1	= polarAngles[ idx1 + 1 ] || polarAngles[ 0 ];
				
				lattitudes.forEach(
					function( angle2, idx2 ) {
						
						if ( idx2 ) {	// can skip first
							
							let	prevAngle2	= lattitudes[ idx2 - 1 ];
							
							
							let	xa	= -Math.sin( angle1 ),
								za	= Math.cos( angle1 ),
								
								xb	= -Math.sin( nextAngle1 ),
								zb	= Math.cos( nextAngle1 ),
								
								cos1	= Math.cos( angle2 ),
								sin1	= Math.sin( angle2 ),
								
								x1	= ( cos1 * xa ),
								z1	= ( cos1 * za ),
								y1	= sin1,
								
								x4	= ( cos1 * xb ),
								z4	= ( cos1 * zb ),
								y4	= sin1,
								
								cos2	= Math.cos( prevAngle2 ),
								sin2	= Math.sin( prevAngle2 ),
								
								x2	= ( cos2 * xa ),
								z2	= ( cos2 * za ),
								y2	= sin2,
								
								x3	= ( cos2 * xb ),
								z3	= ( cos2 * zb ),
								y3	= sin2;
							
							shape.push(
								[
									[ x1, y1, z1 ],
									[ x2, y2, z2 ],
									[ x3, y3, z3 ],
									[ x4, y4, z4 ]
								]
							);
							
						}
						
					}
				);
				
			}
		);
		
		return	shape;
		
	})();
	
})();
