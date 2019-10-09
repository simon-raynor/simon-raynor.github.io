export function randomBetween( min, max ) {
	
	// TODO validate
	
	return	min + Math.round( Math.random() * ( max - min ) );
	
}

export function randomFactor( n = 1, scale = 1 ) {
	
	const	factor	= 1 + ( Math.random() * scale );
	
	return	n * factor;
	
}
