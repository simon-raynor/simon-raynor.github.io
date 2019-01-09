(function() {
	
	'use strict';
	
	
	function Chart( config, settings ) {
		
		Graphics.call(
			this,
			{
				svg	: true
			}
		);
		
		this.config		= config;
		
		this.settings	= settings || {};
		
		parseChartConfig.call( this );
		
	}
	
	Chart.prototype	= Object.create( Graphics.prototype );
	
	Chart.prototype._wrapclass	= 'chart';
	
	window.Chart	= Chart;
	
	
	function parseChartConfig() {
		
		this.is2D	= !!this.config.slice2;
		
	}
	
	
	
	
	function setChartDataset( data ) {
		
		let	self	= this;
		
		return	getChartData.call( this, data ).then(
					function( data ) {
						
						self.data	= data;
						
					}
				);
		
	}
	
	Chart.prototype.setDataset	= setChartDataset;
	
	//
	//	TODO	this is heinous and should be rewritten
	//
	//
	//	TODO	can I have an asynchronous getter? It think
	//			I can with promises...
	//
	function getChartData( data ) {
		
		let	slice1	= this.config.slice1,
			slice2	= this.config.slice2 || null,
			
			vTypes	= data.traffic.indices.vehicleData;
		
		return	arrayReduceAsync(
					data.traffic.rows,
					{},
					function( output, datum ) {
						
						if ( slice1 === 'vehicleData' ) {
							
							vTypes.forEach(
								function( type ) {
									
									let	o	= output[ type ],
										val	=  datum[ 'vehicleData' ][ type ];
									
									if ( slice2 ) {
										
										if ( ! o ) {
											
											o	= output[ type ]	= {
																		txt	: type,
																		val	: {}
																	};
											
										}
										
										
										let	y	= datum[ slice2 ];
										
										if ( ! o.val[ y ] ) {
											
											o.val[ y ]	= {
															txt	: y,
															val	: val
														};
											
										} else {
											
											o.val[ y ].val	+= val;
											
										}
										
									} else {
										
										if ( ! o ) {
											
											o	= output[ type ]	= {
																		txt	: type,
																		val	: val
																	};
											
										} else {
											
											o.val	+= val;
											
										}
										
									}
									
								}
							);
							
						} else {
							
							let	val	= datum[ slice1 ],
								o	= output[ val ];
							
							//
							// ignore falsey keys (usually dodgy data)
							//
							if ( ! val ) {
								
								return;
								
							}
							
							//
							//	slice
							//
							if ( slice2 ) {
								
								if ( ! o ) {
									
									o	= output[ val ]	= {
																txt	: val,
																val	: {}
															};
									
								}
								
								if ( slice2 === 'vehicleData' ) {
									
									vTypes.forEach(
										function( type ) {
											
											if ( ! o.val[ type ] ) {
												
												o.val[ type ]	= {
																	txt	: type,
																	val	: datum[ 'vehicleData' ][ type ]
																};
												
											} else {
												
												o.val[ type ].val	+= datum[ 'vehicleData' ][ type ];
												
											}
											
										}
									);
									
								} else {
									
									
									let	y	= datum[ slice2 ];
									
									if ( ! o.val[ y ] ) {
										
										o.val[ y ]	= {
														txt	: y,
														val	: val
													};
										
									} else {
										
										o.val[ y ].val	+= val;
										
									}
									
								}
								
							} else {
								
								if ( ! o ) {
									
									o	= output[ val ]	= {
																txt	: val,
																val	: 1
															};
									
								} else {
									
									o.val	+= 1;
									
								}
							}
							
						}
						
					}
				).then(
					function( data ) {
						
						return	_.toArray( data ).map(
									function( datum ) {
										
										if ( datum.val !== datum.val * 1 ) {
											
											datum.val	= _.toArray( datum.val ).sort( sortChartData );
											
										}
										
										return	datum;
										
									}
								).sort(
									sortChartData
								);
						
					}
				);
		
	}
	
	function sortChartData( a, b ) {
		
		return	a.txt - b.txt;
		
	}
	
	
	
	function drawChart() {
		
		this.clear();
		
		let	height	= this.dimensions.y,
			width	= this.dimensions.x,
			
			top		= 0,
			left	= 0,
			
			title, axes;
		
		
		if ( this.settings.title ) {
			
			let	title	= createChartTitle.call( this );
			
			this.svgEl.appendChild( title );
			
			let	size	= title.getBoundingClientRect();
			
			top		+= size.height + size.top;
			height	-= size.height + size.top;
			
		}
		
		
		if ( this.settings.axes ) {
			
			
			
		}
		
		
		let	graphic		= createChartGraphic.call( this, this.data, width, height );
		
		if ( top || left ) {
			
			// N.B.	have to use translate to move <g>s
			graphic.setAttribute( 'transform', 'translate(' + left + ' ' + top + ')' );
			
		}
		
		this.svgEl.appendChild( graphic );
		
		
		this.setLoading( false );
		
	}
	
	Chart.prototype.draw	= drawChart;
	
	
	
	function createChartTitle() {
		
		let	g	= document.createElementNS( this.SVG_NS, 'g' ),
			txt	= document.createElementNS( this.SVG_NS, 'text' );
		
		g.setAttribute( 'class', 'title' );
		
		g.appendChild( txt );
		
		
		txt.setAttribute( 'x', Math.round( this.dimensions.x / 2 ) );
		txt.setAttribute( 'y', 24 );	// TODO
		
		txt.textContent	= this.config.title;
		
		return	g;
		
	}
	
	
	
	function createChartGraphic( data, width, height ) {
		
		let	self		= this,
			
			frag		= document.createElementNS( this.SVG_NS, 'g' ),
			
			colcount	= data.length,
			// add the below number to set if there's
			// space around the columns
			colmod		= this.settings.axes
							? 1
							: -1,
			xstep		= width / ( ( colcount * 2 ) + colmod ),
			
			is2dim		= data[ 0 ].val.join,
			
			maxVal, ystep;
		
		if ( is2dim ) {
			
			data.forEach(
				function( datum ) {
					
					if ( datum.val.join ) {
						
						datum.total	= datum.val.reduce(function(sum,v){return sum + v.val;},0);
						
					}
					
				}
			);
			
			maxVal	= Math.max.apply(
						null,
						_.pluck( data, 'total' )
					);
			
		} else {
			
			maxVal		= Math.max.apply(
							null,
							_.pluck( data, 'val' )
						);
			
		}
		
		ystep		= height / maxVal;
		
		
		data.forEach(
			function( datum, idx ) {
				
				let	val	= datum.val,
					
					left	= Math.round( xstep * idx * 2 ),
					top		= height,
					
					col		= document.createElementNS( self.SVG_NS, 'g' );
				
				if ( self.settings.axes ) {
					
					left	+= xstep;
					
				}
				
				col.setAttribute( 'class', 'zebra' );
				
				if ( val === val * 1 ) {
					
					let	y	= getBarChartBlockY( ystep, val );
					
					col.appendChild(
						createBarChartBlock.call(
							self,
							xstep,
							left,
							y,
							top - y
						)
					);
					
					top	-= y;
					
				} else {
					
					val.forEach(
						function( v, idx ) {
							
							let	y		= getBarChartBlockY( ystep, v.val ),
								block	= createBarChartBlock.call(
											self,
											xstep,
											left,
											y,
											top - y
										);
							
							col.appendChild(
								block
							);
							
							top	-= y;
							
						}
					);
					
				}
				
				frag.appendChild(
					col
				);
				
			}
		);
		
		
		return	frag;
		
	}
	
	function createBarChartBlock( width, left, height, top ) {
		
		let	rect	= document.createElementNS( this.SVG_NS, 'rect' );
		
		rect.setAttribute( 'x', Math.floor( left ) );
		rect.setAttribute( 'width', Math.floor( width ) );
		
		rect.setAttribute( 'y', Math.ceil( top ) );
		rect.setAttribute( 'height', Math.ceil( height ) );
		
		rect.setAttribute( 'class', 'block' );
		
		return	rect;
		
	}
	
	function getBarChartBlockY( ystep, val ) {
		
		return	ystep * val;
		
	}
	
	
	
})();
