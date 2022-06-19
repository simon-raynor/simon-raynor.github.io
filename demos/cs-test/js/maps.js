(function() {
	
	'use strict';
	
	
	function Roadmap( config ) {
		
		Graphics.call(
			this,
			{
				svg		: true,
				canvas	: true
			}
		);
		
		this.config	= config;
		
		//parseRoadmapConfig.call( this );
		
	}
	
	Roadmap.prototype	= Object.create( Graphics.prototype );
	
	Roadmap.prototype._wrapclass	= 'roadmap';
	
	window.Roadmap	= Roadmap;
	
	
	function setRoadmapBounds( bounds ) {
		
		this.bounds	= bounds;
		
		this.bounds.dx	= bounds.maxX - bounds.minX;
		this.bounds.dy	= bounds.maxY - bounds.minY;
		
		calculateRoadmapDefaultScale.call( this );
		
	}
	
	Roadmap.prototype.setBounds	= setRoadmapBounds;
	
	function calculateRoadmapDefaultScale() {
		
		let	xScale	= this.dimensions.x / this.bounds.dx,
			yScale	= this.dimensions.y / this.bounds.dy,
			
			scale	= Math.min( xScale, yScale );
		
		this.scale	= {
						factor	: scale
					};
		
		//
		//	work out offsets to centre the thing
		//
		if ( scale === xScale ) { // need a y offset
			
			this.scale.offsets	= {
									x	: 0,
									y	: Math.round( ( this.dimensions.y - ( this.bounds.dy * scale ) ) / 2 )
								};
			
		} else {	// need an x offset
			
			this.scale.offsets	= {
									x	: Math.round( ( this.dimensions.x - ( this.bounds.dx * scale ) ) / 2 ),
									y	: 0
								};
			
		}
		
	}
	
	
	function getRoadmapCoordsFromRaw( x, y, double ) {
		
		let	multiplier	= double ? 2 : 1;	// multiplier allows us to draw
											// canvas at douple res for retina
		
		return	[
					multiplier * ( this.scale.offsets.x + Math.round( ( x - this.bounds.minX ) * this.scale.factor ) ),
					multiplier * (
						// invert Y so it's right way up
						this.dimensions.y -
							( this.scale.offsets.y + Math.round( ( y - this.bounds.minY ) * this.scale.factor ) )
					)
				];
		
	}
	
	
	
	function drawRoadmap( roadData, trafficRows ) {
		
		let	self	= this;
		
		this.setLoading( true );
		
		this.clear();
		
		Promise.all(
			[
				drawRoadsOnCanvas.call( this, roadData ),
				drawMarkersOnSVG.call( this, trafficRows )
			]
		).then(
			function() {
				
				self.setLoading( false );
				
			}
		);
		
	}
	
	Roadmap.prototype.draw	= drawRoadmap;
	
	
	function drawRoadsOnCanvas( roadData ) {
		
		let	self	= this,
			
			ctx		= this.canvasCtx;
		
		return	Promise.all(
					_.toArray( roadData ).map(
						function( datum ) {
							
							return	forEachAsync(
								datum.points,
								function( segment ) {
									
									if ( segment.length > 1 ) {
										
										let	started	= false;
										
										ctx.beginPath();
										
										segment.forEach(
											function( pt ) {
												
												let	coords	= getRoadmapCoordsFromRaw.call(
																self,
																pt[ 0 ],
																pt[ 1 ],
																true
															);
												
												if ( ! started ) {
													
													ctx.moveTo( coords[ 0 ], coords[ 1 ] );
													 
												} else {
													
													ctx.lineTo( coords[ 0 ], coords[ 1 ] );
													
												}
												
												started	= true;
												
											}
										);
										
										ctx.strokeStyle	= self.defaultColor;
										ctx.stroke();
										
										ctx.closePath();
										
									}
									
								}
							);
							
						}
					)
				);
		
	}
	
	Roadmap.prototype.drawRoads	= drawRoadsOnCanvas;
	
	
	
	function drawMarkersOnSVG( trafficRows ) {
		
		let	self	= this,
			g		= document.createDocumentFragment();
		
		//
		//	clear SVG here as it's just the markers on
		//	the SVG layer (simplifies redrawing them)
		//
		this.clearSVG();
		
		return	forEachAsync(
					trafficRows,
					function( datum ) {
						
						let	coords	= getRoadmapCoordsFromRaw.call( self, datum.x, datum.y ),
							mark	= createMarkerAtCoords.call( self, coords[ 0 ], coords[ 1 ], 4 );
						
						g.appendChild(
							mark
						);
						
						mark.addEventListener( 'click', function() { console.log( datum ); });
						
					}
				).then(
					function() {
						
						self.svgEl.appendChild( g );
						
					}
				);
		
	}
	
	Roadmap.prototype.drawMarkers	= drawMarkersOnSVG;
	
	function createMarkerAtCoords( x, y, r ) {
		
		let	mark	= document.createElementNS( this.SVG_NS, 'rect' );
		
		mark.setAttribute( 'x', Math.round( x - r ) );
		mark.setAttribute( 'y', Math.round( y - r ) );
		
		mark.setAttribute( 'height', r * 2 );
		mark.setAttribute( 'width', r * 2 );
		
		mark.setAttribute( 'class', 'roadmap--marker' );
		
		mark.setAttribute( 'stroke-dasharray', r + ' ' + r );
		mark.setAttribute( 'stroke-dashoffset', r / 2 );
		
		return	mark;
		
	}
	
	
})();
