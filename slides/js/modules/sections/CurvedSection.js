import Section from './Section.js';

export default class CurvedSection extends Section {
	
	constructor( dims ) {
		
		super( dims );
		console.log( this );
	}
	
	setDimensions( dims ) {
		
		super.setDimensions( dims );
		
		const	{ a, f = 3 }	= dims;
		
		this.a	= a;
		this.f	= f;
		
	}
	
	get pathString() {
		
		const	{ x, y, w, h, a, f }	= this;
		
		const	arr	= [ 'M', x, y - 1 ];
		
		let	w1	= ( w / 2 ) / f,
			w2	= ( w / 2 ) / f,
			w3	= w / f,
			h1	= a / -2,
			h2	= a / 2;
		
		arr.push( 'c', w1, h1, w2, h2, w3, 0 );
		
		for ( let i = 1; i < f; i++ ) {
			
			//h2	= i % 2 ? a / -2 : a / 2;
			
			arr.push( 's', w2, h2, w3, 0 );
			
		}
		
		
		arr.push( 'v', h + 2 );
		
		
		w1	*= -1;
		w2	*= -1;
		w3	*= -1;
		
		arr.push( 'c', w1, h2, w2, h1, w3, 0 );
		
		for ( let i = 1; i < f; i++ ) {
			
			//h2	= i % 2 ? a / -2 : a / 2;
			
			arr.push( 's', w2, h1, w3, 0 );
			
		}
		
		
		arr.push( 'z' );
		
		
		return	arr.join( ' ' );
		
	}
	
}
