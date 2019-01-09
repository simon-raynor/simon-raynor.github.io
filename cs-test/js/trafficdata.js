(function() {
	
	'use strict';
	
	const	ROAD_FILES	= [
							'data/os-road-data/ss.json',
							'data/os-road-data/st.json',
							'data/os-road-data/sx.json',
							'data/os-road-data/sy.json'
							//'/data/os-road-data/all.json',
						],
			
			//
			//	N.B.	I've done this as I'm not sure which columns I'll want later,
			//			but ultimately this would be better rolled into the tidier
			//			function as direct `object.property` assignations rather than
			//			using `object[ propery ]` like we are here
			//
			TRAFFIC_COLUMNS	= [
								[ 'AADFYear'					, 'year' ],
								[ 'CP'							, 'id' ],
								[ 'Estimation_method'			, 'estMethod' ],
								[ 'Estimation_method_detailed'	, null ],
								[ 'Region'						, null ],
								[ 'LocalAuthority'				, null ],
								[ 'Road'						, 'roadName' ],
								[ 'RoadCategory'				, 'roadCategory' ],
								[ 'Easting'						, 'x' ],
								[ 'Northing'					, 'y' ],
								[ 'StartJunction'				, null ],
								[ 'EndJunction'					, null ],
								[ 'LinkLength_km'				, null ],
								[ 'LinkLength_miles'			, null ],
								[ 'PedalCycles'					, '_pedalCycles' ],
								[ 'Motorcycles'					, '_motorcycles' ],
								[ 'CarsTaxis'					, '_carsTaxis' ],
								[ 'BusesCoaches'				, '_busesCoaches' ],
								[ 'LightGoodsVehicles'			, '_lgv' ],
								[ 'V2AxleRigidHGV'				, null ],//'_hgv2' ],
								[ 'V3AxleRigidHGV'				, null ],//'_hgv3' ],
								[ 'V4or5AxleRigidHGV'			, null ],//'_hgv45' ],
								[ 'V3or4AxleArticHGV'			, null ],//'_hgv34' ],
								[ 'V5AxleArticHGV'				, null ],//'_hgv5a' ],
								[ 'V6orMoreAxleArticHGV'		, null ],//'_hgv6a' ],
								[ 'AllHGVs'						, '_hgv' ],
								[ 'AllMotorVehicles'			, '_allMotors' ]
							],
			
			ROAD_CATS		= {
								'PM'	: 'M or Class A Principal Motorway',
								'PR'	: 'Class A Principal road in Rural area',
								'PU'	: 'Class A Principal road in Urban area',
								'TM'	: 'M or Class A Trunk Motorway',
								'TR'	: 'Class A Trunk road in Rural area',
								'TU'	: 'Class A Trunk road in Urban area',
								'BR'	: 'Class B road in Rural area',
								'BU'	: 'Class B road in Urban area',
								'CR'	: 'Class C road in Rural area',
								'CU'	: 'Class C road in Urban area',
								'UR'	: 'Class U road in Rural area',
								'UU'	: 'Class U road in Urban area'
							};

	
	
	function fetchData() {
		
		return	Promise.all(
					[
						fetchTrafficData(),
						fetchRoadGeometry()
					]
				).then(
					function( values ) {
						
						return	{
									traffic		: tidyTrafficData( values[ 0 ], values[ 1 ] ),
									roads		: values[ 1 ]
								};
						
					}
				);
		
	}
	
	window[ 'fetchData' ]	= fetchData;
	
	
	function fetchTrafficData() {
		
		return	fetch(
					'data/src/Devon.csv'
				).then(
					function( res ) {
						
						return	res.text();
						
					}
				).then(
					parseCSV
				);
		
	}
	
	
	function tidyTrafficData( traffic, roads ) {
		
		//
		//	N.B.	most of these operations could be rolled into a single loop,
		//			but as that could get messy I'll leave it for now
		//
		traffic.rows	= traffic.rows.map(
							tidyTrafficDatum
						);
		
		traffic.bounds	= getTrafficDataBounds( traffic );
		
		traffic.indices	= getTrafficDataIndexes( traffic );
		
		//
		//	TODO	in reality this would be a good spot to request road
		//			geometry, or even better sort all that out on the
		//			server like I've done manually for this dataset
		//
		
		return	traffic;
		
	}
	
	
	function tidyTrafficDatum( datum ) {
		
		let	obj	= {};
		
		TRAFFIC_COLUMNS.forEach(
			function( col ) {
				
				let	oldVal	= datum[ col[ 0 ] ],
					newKey	= col[ 1 ];
				
				if ( newKey !== null ) {
					
					if ( newKey[ 0 ] === '_' ) {
						
						obj.vehicleData	= obj.vehicleData || {};
						
						obj.vehicleData[ newKey.substr( 1 ) ]	= oldVal;
						
					} else {
						
						obj[ newKey ]	= oldVal;
						
					}
					
				}
				
			}
		);
		
		return	obj;
		
	}
	
	
	function getTrafficDataIndexes( traffic ) {
		
		let	ret	= {};
		
		TRAFFIC_COLUMNS.forEach(
			function( col ) {
				
				let	key	= col[ 1 ];
				
				if (
					key
					&&
					key[ 0 ] !== '_'
				) {
					
					ret[ key ]	= _.unique(
									_.pluck(
										traffic.rows,
										key
									)
								).sort();
					
				}
				
			}
		);
		
		ret.vehicleData	= _.keys( traffic.rows[ 0 ].vehicleData );
		
		return	ret;
		
	}
	
	
	function getTrafficDataBounds( traffic ) {
		
		let	minX	= Infinity,
			maxX	= -Infinity,
			minY	= Infinity,
			maxY	= -Infinity;
		
		traffic.rows.forEach(
			function( datum ) {
				
				let x	= datum.x;
				
				if ( x === x * 1 ) {
					
					minX	= Math.min( minX, x );
					maxX	= Math.max( maxX, x );
					
				}
				
				
				let	y	= datum.y;
				
				if ( y === y * 1 ) {
					
					minY	= Math.min( minY, y );
					maxY	= Math.max( maxY, y );
					
				}
				
			}
		);
		
		let	dx		= maxX - minX,
			xPad	= dx / 18,	// should give us 5% either side
			dy		= maxY - minY,
			yPad	= dy / 18;	// should give us 5% either side;
		
		
		
		return	{
					minX	: minX - xPad,
					maxX	: maxX + xPad,
					minY	: minY - yPad,
					maxY	: maxY + yPad
				};
		
	}
	
	
	
	
	//
	//	fetch and combine the relevant road geometries
	//
	function fetchRoadGeometry() {
		
		return	Promise.all(
					ROAD_FILES.slice().map(
						function( file ) {
							
							return	fetch(
										file
									).then(
										function( res ) {
											
											return	res.json();
											
										}
									);
							
						}
					)
				).then(
					function( values ) {
						
						let	combined	= {};
						
						values.forEach(
							function( obj ) {
								
								for ( let key in obj ) {
									
									//
									//	if it's already there just add the points
									//
									if ( combined[ key ] ) {
										
										combined[ key ].points	= combined[ key ].points.concat( obj[ key ].points );
										
									} else {
										
										combined[ key ]	= obj[ key ];
										
									}
									
								}
								
							}
						);
						
						return	combined
						
					}
				);
		
	}
	
})();
