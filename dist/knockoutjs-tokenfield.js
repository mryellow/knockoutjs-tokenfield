define(["jquery","knockout"], function($,ko) {
console.log('include');

ko.tokenfield = {};

/**
 * Tokenfield custom binding
 */
ko.bindingHandlers.tokenField = {

	/**
     * ko binding init
     */
    init: function(element, valueAccessor, allBindingsAccessor, deprecated, bindingContext) {
    	console.log('--INIT:'+element.id);

		var observable = valueAccessor() || { };
		//var bindings = new tokenFieldUtils().processBindings(allBindingsAccessor);

		/**
		 * Setup config for element in global namespace.
		 */
		ko.tokenfield[element.id] = {};
		ko.tokenfield[element.id].handlerEnabled = true;

		ko.tokenfield[element.id].bindings = {};

		ko.tokenfield[element.id].bindings['Remote']		= allBindingsAccessor().tokenFieldRemote;
		ko.tokenfield[element.id].bindings['Method']		= allBindingsAccessor().tokenFieldMethod;
		ko.tokenfield[element.id].bindings['Datatype']		= allBindingsAccessor().tokenFieldDatatype;
		ko.tokenfield[element.id].bindings['Query']			= allBindingsAccessor().tokenFieldQuery;
		ko.tokenfield[element.id].bindings['KeyIndex']		= allBindingsAccessor().tokenFieldKeyIndex;
		ko.tokenfield[element.id].bindings['KeyDisplay']	= allBindingsAccessor().tokenFieldKeyDisplay;
		ko.tokenfield[element.id].bindings['Delimiter']		= allBindingsAccessor().tokenFieldDelimiter;

		if (ko.tokenfield[element.id].bindings['Remote']	=== undefined) throw('Tokenfield remote server required.');
		if (ko.tokenfield[element.id].bindings['Method']	=== undefined) ko.tokenfield[element.id].bindings['Method']		= 'GET';
		if (ko.tokenfield[element.id].bindings['Datatype']	=== undefined) ko.tokenfield[element.id].bindings['Datatype']	= 'json';
		if (ko.tokenfield[element.id].bindings['Query']		=== undefined) ko.tokenfield[element.id].bindings['Query']		= 'q';
		if (ko.tokenfield[element.id].bindings['KeyIndex']	=== undefined) ko.tokenfield[element.id].bindings['KeyIndex']	= 'value';
		if (ko.tokenfield[element.id].bindings['KeyDisplay']=== undefined) ko.tokenfield[element.id].bindings['KeyDisplay']	= 'label';
		if (ko.tokenfield[element.id].bindings['Delimiter']	=== undefined) ko.tokenfield[element.id].bindings['Delimiter']	= ',';

		/**
		 * Destroy tokenfield
		 *
		 * Handle disposal (if KO removes by the template binding)
		 */
		ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
			console.log('Destroy tokenfield');
			$(element).tokenfield('destroy');
			// TODO: Destroy tokenFieldModel.
		});

		/**
		 * Create token
		 *
		 * Push into observableArray().items
		 */
		 /*
		ko.utils.registerEventHandler(element, 'tokenfield:createtoken', function (e) {
			console.log('tokenfield:createtoken:'+this.id);
			//e.attrs.tokenfieldFromUi = true;
			console.log(JSON.stringify(e.attrs));
		});
		*/

		
		ko.utils.registerEventHandler(element, 'tokenfield:createdtoken', function (e) {
			console.log('tokenfield:createdtoken:'+this.id);
			console.log(JSON.stringify(e.attrs));

		    // Detect private token created.
			if (e.attrs[ko.tokenfield[element.id].bindings['KeyDisplay']].indexOf("_") === 0) {
				console.log('tt-private');
				$(e.relatedTarget).addClass('tt-private');
			}

			// Allow `update` to temporarily disable pushing back when this event fires.
			if (ko.tokenfield[element.id].handlerEnabled === true) observable.push(e.attrs);

		});

		/**
		 * Remove token
		 *
		 * Remove from observableArray().items
		 */
		ko.utils.registerEventHandler(element, 'tokenfield:removedtoken', function (e) {
			console.log('tokenfield:removedtoken:'+e.id);
			console.log(JSON.stringify(e.attrs));

			var peeked = observable.peek();
			var item;
			// Find item using tokenfield default values, other values are not in tokenfield meta-data.
			ko.utils.arrayForEach(peeked, function(x) {
				if (ko.unwrap(x.id) === e.attrs.id) {
					item = x;
				} else if (ko.unwrap(x.label) === e.attrs.label && ko.unwrap(x.value) === e.attrs.value) {
					item = x;
				}
			});

			observable.remove(item);
		});

		/**
		 * Typeahead only, no tokenfield
		 *
		 * @todo: If delimiter isn't set only Typeahead is needed.
		  */
		/*
		ko.utils.registerEventHandler(element, 'typeahead:selected typeahead:autocompleted', function (e) {
			console.log('typeahead:selected typeahead:autocompleted');
			console.log(e);
			valueAccessor().value = e.attrs.value;	
		});
		*/

		/**
		 * Initalise tokenfield.
		 */
		$(element).tokenfield({
			delimiter: ko.tokenfield[element.id].bindings['Delimiter'], 
			allowEditing: false, 
			createTokensOnBlur: true, 
			typeahead: [null, {
				name: element.id,
				displayKey: ko.tokenfield[element.id].bindings['KeyDisplay'],
				source: (function() {
					var xhr;
					return function(request, response) {
						if (xhr) {
							xhr.abort();
						}

						// Split and get last token entered.
						request = request.split(",").reverse()[0].trim();
						req_data = {};
						req_data[ko.tokenfield[element.id].bindings['Query']] = request;
						
						xhr = $.ajax({
							url: ko.tokenfield[element.id].bindings['Remote'],
							data: req_data,
							type: ko.tokenfield[element.id].bindings['Method'],
							dataType: ko.tokenfield[element.id].bindings['Datatype'],
							success: function(data) {
								response(data);
							},
							error: function() {
								response([]);
							}
						});
					};
				})(),
			}]
		});	

		//return { controlsDescendantBindings: true };

    },

    /**
     * ko binding update
     */
    update: function(element, valueAccessor, allBindingsAccessor, deprecated, bindingContext) {
        console.log('--UPDATE:'+element.id);
        var observable = valueAccessor() || { };
        var peeked = ko.unwrap(observable.peek());
        console.log(JSON.stringify(peeked));

        ko.tokenfield[element.id].handlerEnabled = false;

		$(element).tokenfield('setTokens',peeked);

		/*
		Optional loop through, set tokens and adjust values.
		$(element).tokenfield('setTokens',[]);
        if (peeked.length > 0) {
    		console.log('Create tokens from array');
    		$.each(peeked, function(index, value) {
    			console.log('item:'+JSON.stringify(value));
    			value.foobar = true;
    			$(element).tokenfield('createToken', value);
    		});
    	}
    	*/

		ko.tokenfield[element.id].handlerEnabled = true;
    }

};
});