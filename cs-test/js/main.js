(function() {
	
	'use strict';
	
	const	CHARTS	= [
				{
					title	: 'total per year',
					slice1	: 'year'
				},
				{
					title	: 'total per year sliced by type',
					slice1	: 'year',
					slice2	: 'vehicleData'
				},
				
				{
					title	: 'total per road',
					slice1	: 'roadName'
				},
				{
					title	: 'total per road sliced by type',
					slice1	: 'roadName',
					slice2	: 'vehicleData'
				},
				
				{
					title	: 'total per type',
					slice1	: 'vehicleData'
				},
				{
					title	: 'total per type sliced by year',
					slice1	: 'vehicleData',
					slice2	: 'year'
				},
				{
					title	: 'total per type sliced by road',
					slice1	: 'vehicleData',
					slice2	: 'roadName'
				}
			];
	
	
	document.addEventListener(
		'DOMContentLoaded',
		onReady
	);
	
	function onReady() {
		
		let	layout	= generateFALayout( CHARTS.length ),
			charts	= [];
		
		document.getElementById( 'chartwrap' ).appendChild( layout );
		
		CHARTS.forEach(
			function( config, idx ) {
				
				var	chart	= new Chart( config );
				
				chart.appendTo( layout.children[ idx ].children[ 0 ].children[ 0 ] );
				
				charts.push( chart );
				
			}
		);	
		
		
		let	map	= new Roadmap( {} );
		
		map.appendTo(
			document.getElementById( 'mapwrap' )
		);
		
		
		fetchData().then(
			function( data ) {
				
				map.setBounds( data.traffic.bounds );
				map.draw( data.roads, data.traffic.rows );
				
				charts.forEach(
					function( chart ) {
						
						chart.setDataset( data ).then(
							function() {
								console.log( chart );
								
								chart.draw();
								
								chart.wrap.addEventListener(
									'click',
									function() {
										
										let	bigChart	= new Chart(
															chart.config,
															{
																title	: true,
																axes	: true
															}
														);
										
										//
										//	N.B.	is this dodgy? it feels dodgy...
										//
										bigChart.data	= chart.data;
										
										openChartPop( bigChart ).then(
											function() {
												
												bigChart.draw();
												
											}
										);
										
									}
								);
								
							}
						)
						
					}
				);
				
			}
		).catch(
			function( e ) {
				
				console.error( e );
				
			}
		);
		
	}
	
	
	function openChartPop( chart ) {
		
		return	new Promise(
					function ( resolve, reject ) {
						
						let	outer	= document.createElement( 'div' ),
							inner	= document.createElement( 'div' );
						
						outer.className	= 'chartpop';
						
						outer.appendChild( inner );
						document.body.appendChild( outer );
						
						//
						//	TODO	animate it?
						//
						chart.appendTo( inner );
						
						resolve( outer );
						
						//
						//	TODO	handle closing it, probably
						//			need a popup fn.
						//
						
					}
				);
		
	}
	
	
	//
	//	the fixed aspect ratio layouts need an extra
	//	div so do this, then append it so it can be
	//	measured
	//
	function generateFALayout( count ) {
		
		let	wrap	= document.createElement( 'div' ),
			cols	= count % 3
						? count % 2
							? 3
							: 2
						: 3;
		
		wrap.className	= 'cols-' + cols;
		
		for ( count; count--; ) {
			
			let	d1	= document.createElement( 'div' ),
				d2	= document.createElement( 'div' ),
				d3	= document.createElement( 'div' );
			
			d2.appendChild( d3 );
			d1.appendChild( d2 );
			
			wrap.appendChild( d1 );
			
		}
		
		return	wrap;
		
	}
	
	
	function filterData( data, filters ) {
		
		_.each(
			filters,
			function( filter ) {
				
				data	= data.filter(function(d){return d[ filter.name ] == filter.value;});
				
			}
		);
		
		return	data;
		
	}
	
	
	/*
	const	DROPDOWNS	= [
							'year',
							'roadName'
						];
	
	function createControls( data, mapper ) {
		
		let	placeholder	= document.querySelector( '#controlwrap' ),
			frag		= document.createDocumentFragment(),
			
			filters		= {};
		
		DROPDOWNS.forEach(
			function( key ) {
				
				let	dd	= new Dropdown(
							key,
							data.traffic.indices[ key ].slice().concat( [ 'ANY' ] ),
							'ANY'
						);
				
				frag.appendChild( dd.element );
				
			}
		);
		
		
		placeholder.addEventListener(
			'change',
			function( evt ) {
				
				evt	= evt.detail;
				
				mapper.clearSVG();
				
				filters[ evt.name ]	= evt;
				
				mapper.drawCountPoints(
					filterData( data.traffic.rows, filters )
				);
				
			}
		);
		
		
		placeholder.appendChild( frag );
		
	}
	*/
})();
