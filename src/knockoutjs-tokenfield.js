/**
 * TokenField binder for KnockoutJS.
 *
 * Implments it's own models for storing extra data associated with tokens.
 *
 * data-bind="
 * 	tokenField: fooModel.bar,			Related field in apps KnockoutJS.
 * 	tokenFieldRemote: '../tags/search',	AJAX URI for tag lookup.
 * 	tokenFieldMethod: 'GET',			HTTP Method.
 * 	tokenFieldDatatype: 'json',			jQuery AJAX datatype option.
 * 	tokenFieldQuery: 'q',				Querystring key.
 * 	tokenFieldKey: 'id',				JSON key to pass.
 * 	tokenFieldValue: 'value',			JSON value to display.
 * 	tokenFieldDelimiter: ','"			Delimiter.
 *
 * @author: Mr-Yellow <mr-yellow@mr-yellow.com>
 */

/**
 * Utils global namespace.
 */
var tokenFieldUtils = function tokenFieldUtils() {
	/**
	 * Bind a new tokenfield.
	 */
	this.addTokenField = function(element) {
		console.log('element:');
		console.log(element);
		tokenBaseModel.fields[element.id] = new tokenFieldModel();
		ko.applyBindings(tokenBaseModel.fields[element.id], element);
	};

	/**
	 * Retrieve tokenfield options from binding
	 */
	this.processBindings = function(bindingAccessor) {
		var bindings = {};

		bindings['Remote']		= bindingAccessor().tokenFieldRemote;
		bindings['Method']		= bindingAccessor().tokenFieldMethod;
		bindings['Datatype']	= bindingAccessor().tokenFieldDatatype;
		bindings['Query']		= bindingAccessor().tokenFieldQuery;
		bindings['FieldKey']	= bindingAccessor().tokenFieldKey;
		bindings['FieldVal']	= bindingAccessor().tokenFieldValue;
		bindings['Delimiter']	= bindingAccessor().tokenFieldDelimiter;

		if (bindings['Remote']		=== undefined) throw('Tokenfield remote server required.');
		if (bindings['Method']		=== undefined) bindings['Method']		= 'GET';
		if (bindings['Datatype']	=== undefined) bindings['Datatype']		= 'json';
		if (bindings['Query']		=== undefined) bindings['Query']		= 'q';
		if (bindings['FieldKey']	=== undefined) bindings['FieldKey']		= 'id';
		if (bindings['FieldVal']	=== undefined) bindings['FieldVal']		= 'value';
		if (bindings['Delimiter']	=== undefined) bindings['Delimiter']	= ',';

		return bindings;
	};
};



/**
 * tokenBaseModel hasMany tokenFieldModel
 *
 * Giving each tokenfield it's own items observableArray.
 */
var tokenBaseModel = {
	fields: []
};

/**
 * tokenFieldModel hasMany tokenItemModel
 */
var tokenFieldModel = function tokenFieldModel() {
	var self = this;
	this.items = ko.observableArray([]);

	this.addItem = function(attrs) {
		console.log('addItem');
		self.items.push(new tokenItemModel(attrs));
	};

	this.removeItem = function(attrs) {
		console.log('removeItem');
		var item;
		if (attrs.id != null) {
			ko.utils.arrayForEach(this.items(), function(x) {
				if(x.id === attrs.id && ko.unwrap(x.value) == attrs.value) item = x;
			});
		} else {
			ko.utils.arrayForEach(this.items(), function(x) {
				// TODO: Use allBindingsAccessor().tokenFieldDisplay
				if(ko.unwrap(x.value) === attrs.value) item = x;
			});
		}
		//console.log(ko.unwrap(this.items()));
		self.items.remove(item);
	};
};

/**
 * tokenItemModel stores the associated id for each value.
 *
 * Copy whole object returned by tokenfield, all keys included.
 *
 * @param string id
 * @param string value
 */
var tokenItemModel = function(obj) {
	$.extend(this, obj);
};

/**
 * refreshAll utility function for arrays.
 *
 * Fill array with new data and inform related field of update.
 *
 * @param array valuesToPush
 * @param string delimiter Unused, match signature for non-arrays.
 * @param string key Unused, match signature for non-arrays.
 */
ko.observableArray['fn'].refreshAll = function(valuesToPush, delimiter, key) {
    var underlyingArray = this();
    this.valueWillMutate();
    this.removeAll();
    ko.utils.arrayPushAll(underlyingArray, valuesToPush);
    this.valueHasMutated();
    return this;
};

/**
 * refreshAll utility function for strings
 *
 * Fill field with CSV data and inform related field of update.
 */
ko.observable['fn'].refreshAll = function(valuesToPush, delimiter, key) {
	this.valueWillMutate();
	var csv = '';
	ko.utils.arrayForEach(valuesToPush,	function(item) {
		if (csv != '') csv += delimiter;
		if (item[key] === undefined) {
			csv += item['value'];
		} else {
			csv += item[key];
		}
	});
	this(csv);
	this.valueHasMutated();
    return this;
};

/**
 * Tokenfield custom binding
 */
ko.bindingHandlers.tokenField = {

	/**
     * ko binding init
     */
    init: function(element, valueAccessor, allBindingsAccessor, bindingContext) {

		var bindings = new tokenFieldUtils().processBindings(allBindingsAccessor);
		

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
		ko.utils.registerEventHandler(element, 'tokenfield:createdtoken', function (e) {
			console.log('tokenfield:createdtoken');
			console.log(e);

		    // Detect private token created.
			if (e.attrs.value.indexOf("_") === 0) {
				console.log('tt-private');
				$(e.relatedTarget).addClass('tt-private');
			}

			tokenBaseModel.fields[element.id].addItem(e.attrs);
		});

		/**
		 * Remove token
		 *
		 * Remove from observableArray().items
		 */
	ko.utils.registerEventHandler(element, 'tokenfield:removedtoken', function (e) {
		console.log('tokenfield:removedtoken');
		console.log(e);

		tokenBaseModel.fields[element.id].removeItem(e.attrs);
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
			delimiter: bindings['Delimiter'], 
			allowEditing: false, 
			createTokensOnBlur: true, 
			typeahead: [null, {
				name: element.id,
				displayKey: bindings['FieldVal'],
				source: (function() {
					var xhr;
					return function(request, response) {
						if (xhr) {
							xhr.abort();
						}
						
						// Split and get last token entered.
						request = request.split(",").reverse()[0].trim();
						req_data = {};
						req_data[bindings['Query']] = request;
						
						xhr = $.ajax({
							url: bindings['Remote'],
							data: req_data,
							type: bindings['Method'],
							dataType: bindings['Datatype'],
							success: function(data) {
								response(data);
							},
							error: function() {
								response([]);
							}
						});
					}
				})(),
			}]
		});	

    },

    /**
     * ko binding update
     */
    update: function(element, valueAccessor, allBindingsAccessor, bindingContext) {
        console.log('update');
        var observable = valueAccessor() || {};

        // Does validation on allBindingsAccessor and sets defaults.
        var bindings = new tokenFieldUtils().processBindings(allBindingsAccessor);

        // An `fn` util function extending both `observableArray` and `observable` to accept arrays and sort them out.
       	observable.refreshAll(ko.unwrap(tokenBaseModel.fields[element.id].items),bindings['Delimiter'],bindings['FieldKey']);

    }
};

/*
http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html
    (function() {
      var existing = ko.bindingProvider.instance;

        ko.bindingProvider.instance = {
            nodeHasBindings: existing.nodeHasBindings,
            getBindings: function(node, bindingContext) {
                var bindings;
                try {
                   bindings = existing.getBindings(node, bindingContext);
                }
                catch (ex) {
                   if (window.console && console.log) {
                       console.log("binding error", ex.message, node, bindingContext);
                   }
                }

                return bindings;
            }
        };

    })();
*/

