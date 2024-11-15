function parseCSV( str ) {
	
	//
	//	split into rows first
	//
	//	TODO	remove any blanks?
	//
	let	rows	= str.split( '\n' );
	
	//
	//	for now we assume that the first row is headings
	//
	//	TODO	pass a setting or autodetect somehow
	//
	//	TODO	check the headings don't have (escaped) comma's in them
	//
	let	headings		= rows.shift().split( ',' ),
		headingCount	= headings.length;
	
	//
	//	strip quotes from headings
	//
	headings	= headings.map(
					function( hd ) {
						
						return	hd[ 0 ]	=== '"'
									? stripFirstLastChar( hd )
									: hd;
						
					}
				);
	
	//
	//	do this "asynchronously" so that it doesn't
	//	make the UI unresponsive
	//
	return	arrayReduceAsync(
				rows,
				[],
				function( parsed, row ) {
					
					let	cells	= row.split( ',' );
					
					if ( cells.length !== headingCount ) {
						
						//
						//	wrong cellcount, go through comma by comma
						//
						//
						//	TODO	this is not a proper parser,
						//			just a "good enough" one
						//
						let	actualCells	= [],
							openQuote	= false;
						
						cells.forEach(
							function( cell ) {
								
								if (
									openQuote
								) {
									
									if (
										cell[ cell.length - 1 ]	=== '"'
										&&
										cell[ cell.length - 2 ] !== '\\'
									) {
										
										actualCells.push(
											openQuote + ',' + cell
										);
										
										openQuote	= false;
										
									} else if (
										cell[ 0 ]	=== '"'
									) {
										
										throw ( 'Invalid input: ' + row );
										
									} else {
										
										openQuote	+= ',' + cell;
										
									}
									
								} else if (
									cell[ 0 ]	=== '"'
								) {
									
									openQuote	= cell;
									
									if (
										cell[ cell.length - 1 ]	=== '"'
										&&
										cell[ cell.length - 2 ] !== '\\'
									) {
										
										actualCells.push( cell );
										
										openQuote	= false;
										
									}
									
								} else {
									
									actualCells.push( cell );
									
								}
								
							}
						);
						
						cells	= actualCells;
						
					}
					
					//
					//	check that the cell count's correct now,
					//	if so strip any quotation marks that have
					//	snuck in and try to cast to number
					//
					//	otherwise bug out
					//
					//	TODO	detect other datatypes?
					//
					if ( cells.length === headings.length ) {
						
						cells	= cells.map(
									function( cell ) {
										
										if ( cell[ 0 ]	=== '"' ) {
											
											cell	= stripFirstLastChar( cell );
											
										}
										
										// N.B. weak equality check
										if ( cell == cell * 1 ) {
											
											cell	= cell * 1;
											
										}
										
										return	cell;
										
									}
								);
						
					} else if ( row.trim() ) {
						
						throw( 'Couldn\'t parse row: ' + row );
						
					}
					
					//
					//	transpose the data into a more useful
					//	format
					//
					//	TODO	allow for passing in of a map to
					//			get nicer object keys from the
					//			get-go
					//
					let	datum	= {};
					
					headings.forEach(
						function( hd, hdIdx ) {
							
							datum[ hd ]	= cells[ hdIdx ];
							
						}
					);
					
					parsed.push( datum );
					
				}
			).then(
				function( parsed ) {
					
					return	{
								headings	: headings,
								rows		: parsed
							};
					
				}
			);
	
}

function stripFirstLastChar( str ) {
	
	return	str.substring( 1, str.length - 1 );
	
}
