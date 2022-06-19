import { createSVGElement } from '../svg.js';

export default class Section {
	
	constructor( dims ) {
		
		this.el	= createSVGElement( 'path' );
		
		this.setDimensions( dims );
		
	}
	
	setDimensions( dims ) {
		
		const	{ x, y, w, h }	= dims;
		
		this.x	= x;
		this.y	= y;
		this.w	= w;
		this.h	= h;
		
	}
	
	get pathString() {
		
		const	{ x, y, w, h }	= this;
		
		return	[ 'M', x, y, 'h', w, 'v', h, 'h', -1 * w, 'z' ].join( ' ' );
		
	}
	
	render() {
		
		this.el.setAttribute( 'd', this.pathString );
		
	}
	
}
