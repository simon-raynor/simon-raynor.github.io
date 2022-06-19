import { randomBetween } from './random.js';
import { SVG_NS } from './svg.js';

class Leaf {
	
	constructor ( x = 0, y = 0, height = 20, width = 10, left, down ) {
		
		// root position
		this.x	= x;
		this.y	= y;
		
		this._height	= height && height.hasOwnProperty && height.hasOwnProperty( 'min' ) && height.hasOwnProperty( 'max' )
						? height
						: {
							min	: height,
							max	: height
						};
		this._width	= width && width.hasOwnProperty && width.hasOwnProperty( 'min' ) && width.hasOwnProperty( 'max' )
						? width
						: {
							min	: width,
							max	: width
						};
		
		this.left	= !! left;
		this.down	= !! down;
		
		grow.call( this );
		
	}
	
	get height() {
		
		if ( ! this._height.hasOwnProperty( 'actual' ) ) {
			
			this._height.actual = randomBetween( this._height.min, this._height.max );
			
		}
		
		return	this._height.actual;
		
	}
	
	get width() {
		
		if ( ! this._width.hasOwnProperty( 'actual' ) ) {
			
			this._width.actual = randomBetween( this._width.min, this._width.max );
			
		}
		
		return	this._width.actual;
		
	}
	
	get dimensions() {
		
		if ( ! this._dimensions ) {
			
			const	left	= this.left
								? this.x - this.width
								: this.x,
					right	= this.left
								? this.x
								: this.x + this.width,
					top		= this.y - this.height - ( this.width / 2 ),
					bottom	= this.y,
					
					length	= this.pathEl.getTotalLength();
			
			this._dimensions	= { left, right, top, bottom, length };
			
		}
		
		return	this._dimensions;
		
	}
	
	get pathStr() {
		
		if ( ! this._pathStr ) {
			
			const	{ x, y, height, width, left, down }	= this;
			
			let	pathStr	= 'M' + x + ' ' + y
						+ 'v' + ( down ? '' : '-' ) + height;
			
			const	loops	= 4;
			
			for ( let i = loops; i > 0; i-- ) {
				
				const	radius	= width * ( i / loops ) / 2,
						dir		= left
									? i % 2 ? 1 : -1
									: i % 2 ? -1 : 1;
				
				pathStr	+= 'a' + [ radius, radius, 0, 0, 1 - left, dir * radius * 2, 0 ].join( ' ' );
				
			}
			
			this._pathStr	= pathStr;
			
		}
		
		return	this._pathStr;
		
	}
	
	get pathEl() {
		
		if ( ! this._pathEl ) {
			
			const	path	= document.createElementNS( SVG_NS/* TODO */, 'path' );
			
			path.setAttribute( 'd', this.pathStr );
			path.setAttribute( 'class', 'leaf' );
			
			this._pathEl	= path;
			
		}
		
		return	this._pathEl;
		
	}
	
}

export default Leaf;


function grow() {
	
}


