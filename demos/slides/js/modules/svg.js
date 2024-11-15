export const SVG_NS		= 'http://www.w3.org/2000/svg';
export const XLINK_NS	= 'http://www.w3.org/1999/xlink';

export function createSVGElement( elementName = 'svg' ) {
	
	return	document.createElementNS( SVG_NS, elementName );
	
}

export function fetchSVG( path, then ) {
	
	return	fetch( path ).then( res.text );
	
}
/*
export function loadIcons( path ) {
	
	getSVG(
		path,
		function( svgStr ) {
			
			document.body.dispatchEvent(
				new CustomEvent(
					'iconsLoaded',
					{
						detail	: {
							str	: svgStr
						},
						bubbles	: true
					}
				)
			);
			
		}
	);
	
}
*/

function getWindowSize() {
	
	try {
		
		return	{
					height	: window.innerHeight,
					width	: window.innerWidth
				};
		
	} catch ( ex ) {
		
		console.error( 'Unable to determine window size' );
		
		throw( ex );
		
	}
	
}

export function getWindowDimensions( size ) {
	
	//
	//	if size was not passed in we should get it
	//
	if ( ! size ) {
		
		size	= getWindowSize();
		
	}
	
	
	return	{
				width	: size.width,
				height	: size.height,
				centreX	: Math.floor( size.width / 2 ),
				centreY	: Math.floor( size.height / 2 )
			};
	
}


export function buildCanvas( canvas, dims ) {
	
	//
	//	if canvas was not passed in we should create it
	//
	if ( ! canvas ) {
		
		canvas	= createSVGElement();
		
	}
	
	//
	//	if dimensions were not passed in we should get them
	//
	if ( ! dims ) {
		
		dims	= getWindowDimensions();
		
	}
	
	
	canvas.setAttribute( 'height', dims.height );
	canvas.setAttribute( 'width', dims.width );
	
	
	return	canvas;
	
}


function addCanvasToDocument( canvas, dims, prepend = false ) {
	
	//
	//	if dimensions were not passed in we should get them
	//
	if ( ! dims ) {
		
		dims	= getWindowDimensions();
		
	}
	
	//
	//	if (valid) canvas was not passed in we should create & size it
	//
	if ( ! canvas || ! canvas.appendChild ) {
		
		canvas	= buildCanvas( null, dims );
		
	}
	
	if ( prepend && document.body.children[ 0 ] ) {
		
		document.body.insertBefore( canvas, document.body.children[ 0 ] );
		
	} else {
		
		document.body.appendChild( canvas );
		
	}
	
	
	// debounced resize/rotate handler
	let		debounce		= null;
	const	handleResize	= () => {
		
		if ( debounce ) clearTimeout( debounce );
		
		setTimeout(
			() => {
				
				debounce	= null;
				
				dims	= getWindowDimensions();
				
				canvas	= buildCanvas( canvas, dims );
				
				canvas.dispatchEvent(
					new CustomEvent(
						'canvasresize',
						{
							bubbles	: true,
							detail	: { dims, canvas }
						}
					)
				);
				
			},
			100
		);
		
	}
	
	window.addEventListener(
		'resize',
		handleResize
	);
	
	window.addEventListener(
		'orientationchange',
		handleResize
	);
	
	return	{ canvas, dims };
	
}

export function appendCanvas( canvas, dims /* allow this to be passed thru to buildCanvas() */ ) {
	
	return	new Promise(
		( resolve, reject ) => {
			
			resolve( addCanvasToDocument( canvas, dims ) );
			
		}
	);
	
}

export function prependCanvas( canvas, dims /* allow this to be passed thru to sizeCanvas() */ ) {
	
	return	new Promise(
		( resolve, reject ) => {
			
			resolve( addCanvasToDocument( canvas, dims, true ) );
			
		}
	);
	
}


export function clearCanvas( canvas ) {
	
	// for now
	canvas.innerHTML	= '';
	
}
