(function() {
	
	'use strict';
	
	function Graphics( settings ) {
		
		this._settings	= settings;
		
		if ( settings.svg ) {
			
			this.svgEl	= document.createElementNS( this.SVG_NS, 'svg' );
			
		}
		
		if ( settings.canvas ) {
			
			this.canvasEl	= document.createElement( 'canvas' );
			
		}
		
	}
	
	window.Graphics	= Graphics;
	
	Graphics.prototype.SVG_NS		= 'http://www.w3.org/2000/svg';
	Graphics.prototype.XLINK_NS	= 'http://www.w3.org/1999/xlink';
	
	
	function appendGraphicsToContainer( container ) {
		
		this.container	= container;
		this.wrap		= document.createElement( 'div' );
		
		this.wrap.className	= 'graphics ' + this._wrapclass;
		
		this.container.appendChild( this.wrap );
		
		
		scaleGraphics.call( this );
		
		
		//
		//	put canvas under SVG as svg is more likely
		//	to have interactions
		//
		if ( this._settings.canvas ) {
			
			this.wrap.appendChild( this.canvasEl );
			
		}
		
		if ( this._settings.svg ) {
			
			this.wrap.appendChild( this.svgEl );
			
		}
		
		
		setLoading.call( this, true );
		
	}
	
	Graphics.prototype.appendTo	= appendGraphicsToContainer;
	
	
	Object.defineProperty(
		Graphics.prototype,
		'dimensions',
		{
			get	: function() {
				
				if ( ! this._dims ) {
					
					this._dims	= getGraphicsDimensions.call( this );
					
				}
				
				return	this._dims;
				
			}
		}
	);
	
	
	Object.defineProperty(
		Graphics.prototype,
		'canvasCtx',
		{
			get	: function() {
				
				if ( ! this._ctx ) {
					
					this._ctx	= this.canvasEl.getContext( '2d' );
					
				}
				
				return	this._ctx;
				
			}
		}
	);
	
	//
	//	this function allows us to get the default
	//	font colour of the body tag. This means the
	//	colour defined in the CSS can be used by
	//	<canvas>
	//
	//	TODO	could be expanded to other els/props?
	//			parent el's padding could be useful to get?
	//
	Object.defineProperty(
		Graphics.prototype,
		'defaultColor',
		{
			get	: function() {
				
				if ( ! this._defaultColor ) {
					
					let	cs	= window.getComputedStyle( document.body );
					
					this._defaultColor	= cs[ 'color' ];
					
				}
				
				return	this._defaultColor
				
			}
		}
	);
		
	
	function getGraphicsDimensions() {
		
		let	dims	= {};
		
		if ( this._settings.size ) {
			
			dims.x	= settings.size.x;
			dims.y	= settings.size.y;
			
		} else {
			
			dims	= getGraphicsContainerSize.call( this );
			
		}
		
		dims.x	= Math.round( dims.x );
		dims.y	= Math.round( dims.y );
		
		return	dims;
		
	}
	
	function getGraphicsContainerSize() {
		
		return	{
					x	: this.wrap && this.wrap.clientWidth,
					y	: this.wrap && this.wrap.clientHeight
				};
		
	}
	
	
	function scaleGraphics() {
		
		let	height	= this.dimensions.y,
			width	= this.dimensions.x;
		
		if ( this._settings.svg ) {
			
			this.svgEl.setAttribute( 'height', height );
			this.svgEl.setAttribute( 'width', width );
			
			this.svgEl.setAttribute( 'viewBox', '0 0 ' + width + ' ' + height );
			
		}
		
		if ( this._settings.canvas ) {
			
			this.canvasEl.setAttribute( 'height', height * 2 );
			this.canvasEl.setAttribute( 'width', width * 2 );
			
			this.canvasEl.setAttribute( 'style', 'transform:scale( 0.5 )' );
			
		}
		
	}
	
	
	function setLoading( on ) {
		
		if ( on ) {
			
			this.wrap.classList.add( 'loading' );
			
		} else {
			
			this.wrap.classList.remove( 'loading' );
			
		}
		
	}
	
	Graphics.prototype.setLoading	= setLoading;
	
	
	function clearGraphics() {
		
		//
		//	TODO	unbind any events first (will need to
		//			store any handlers that get bound)
		//
		
		if ( this._settings.svg ) {
			
			this.clearSVG();
			
		}
		
		if ( this._settings.canvas ) {
			
			this.clearCanvas();
			
		}
		
	}
	
	Graphics.prototype.clear	= clearGraphics;
	
	function clearGraphicsSVG() {
		
		let	svgEl	= this.svgEl;
		
		while ( svgEl.children.length ) {
			
			//
			//	TODO	recurse to remove ALL children?
			//
			svgEl.removeChild( svgEl.children[ 0 ] );
			
		}
		
	}
	
	Graphics.prototype.clearSVG	= clearGraphicsSVG;
	
	function clearGraphicsCanvas() {
		
		this.canvasCtx.clearRect( 0, 0, this.canvasEl.height, this.canvasEl.width );
		
	}
	
	Graphics.prototype.clearCanvas	= clearGraphicsCanvas;
	
})();
