(function() {
	
	'use strict';
	
	function Dropdown( name, options, initialValue ) {
		
		this.name	= name;
		
		this.options	= options.slice();
		
		this.value	= initialValue;
		
		
		this.element	= document.createElement( 'button' );
		
		this.element.className		= 'dropdown';
		
		
		displayDropdownValue.call( this );
		
		bindDropdownEvents.call( this );
		
	}
	
	window.Dropdown	= Dropdown;
	
	
	function displayDropdownValue() {
		
		let	html	= this.name;
		
		if ( this.value ) {
			
			html	+= ': ' + this.value;
			
		}
		
		this.element.innerHTML	= html;
		
	}
	
	
	function bindDropdownEvents() {
		
		this.onClick	= this.onClick || handle_DropdownClick.bind( this );
		
		this.element.addEventListener(
			'click',
			this.onClick
		);
		
	}
	
	function handle_DropdownClick( evt ) {
		
		evt.preventDefault();
		
		openDropdown.call( this );
		
	}
	
	
	
	function openDropdown() {
		
		this.drop	= generateDropdownDrop.call( this );
		
		positionDropdownDrop.call( this );
		
		bindDropdownOpenEvents.call( this );
		
		document.body.appendChild( this.drop );
		
	}
	
	function bindDropdownOpenEvents() {
		
		this.onBodyClick	= this.onBodyClick || handle_DropdownBodyClick.bind( this );
		this.onOutsideClick	= this.onOutsideClick || handle_outsideDropdownClick.bind( this );
		this.onChange		= this.onChange || handle_DropdownChange.bind( this );
		
		this.drop.addEventListener(
			'click',
			this.onBodyClick
		);
		
		this.drop.addEventListener(
			'change',
			this.onChange
		);
		
		document.body.addEventListener(
			'click',
			this.onOutsideClick
		);
		
	}
	
	function handle_DropdownBodyClick( evt ) {
		
		evt.stopPropagation();
		
	}
	
	function handle_DropdownChange( evt ) {
		
		evt.stopPropagation();
		
		this.value	= evt.target.value;
		
		displayDropdownValue.call( this );
		
		this.element.dispatchEvent(
			new CustomEvent(
				'change', 
				{
					bubbles	: true,
					detail	: {
						name	: this.name,
						value	: this.value
					}
				}
			)
		);
		
	}
	
	function handle_outsideDropdownClick( evt ) {
		
		if ( evt.target !== this.element ) {
			
			closeDropdown.call( this );
			
		}
		
	}
	
	
	
	function generateDropdownDrop() {
		
		let	self	= this,
			
			list	= document.createElement( 'ul' ),
			
			options	= this.options.map(
						function( opt ) {
							
							if ( opt ) {
								
								let	txt	= opt,
									val	= opt;
								
								if (
									opt.hasOwnProperty( 'label' )
									&&
									opt.hasOwnProperty( 'value' )
								) {
									
									txt	= obj.label;
									val	= obj.value;
									
								}
								
								let	row	= generateDropdownRow.call( self, txt, val );
								
								list.appendChild( row );
								
							}
							
						}
					);
		
		list.className	= 'dropdown--drop';
		
		return	list;
		
	}
	
	function generateDropdownRow( txt, val ) {
		
		let	row		= document.createElement( 'li' ),
			input	= document.createElement( 'input' ),
			label	= document.createElement( 'label' ),
			
			id		= 'dd' + Math.round( Math.random() * 100000 ) + Math.round( Math.random() * 100000 );
		
		input.setAttribute( 'id', id );
		input.setAttribute( 'type', 'radio' );
		input.setAttribute( 'name', this.name );
		input.setAttribute( 'value', val );
		
		if ( val == this.value ) {
			
			input.setAttribute( 'checked', 'checked' );
			
		}
		
		
		label.setAttribute( 'for', id );
		label.textContent	= val;
		
		row.appendChild( input );
		row.appendChild( label );
		
		
		return	row;
		
	}
	
	function positionDropdownDrop() {
		
		this.drop.style.position	= 'absolute';
		
		let	parentPos	= this.element.getBoundingClientRect();
		
		this.drop.style.top			= ( parentPos.y + parentPos.height ) + 'px';
		this.drop.style.left		= Math.round( parentPos.x + ( parentPos.width / 2 ) ) + 'px';
		
	}
	
	
	
	function closeDropdown() {
		
		unbindDrownOpenEvents.call( this );
		
		document.body.removeChild( this.drop );
		
	}
	
	function unbindDrownOpenEvents() {
		
		this.drop.removeEventListener(
			'click',
			this.onBodyClick
		);
		
		this.drop.removeEventListener(
			'change',
			this.onChange
		);
		
		document.body.removeEventListener(
			'click',
			this.onOutsideClick
		);
		
	}
	
})();
