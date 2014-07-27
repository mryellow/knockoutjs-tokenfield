http://stackoverflow.com/a/24976740/2438830

I've created a KnockoutJS binding for bootstrap-tokenfield.

https://github.com/mryellow/knockoutjs-tokenfield


First up lets look at `update`s coming in from the `valueAccessor()`.

    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var observable = valueAccessor() || { };
        var peeked = ko.unwrap(observable.peek());

        ko.tokenfield[element.id].handlerEnabled = false;

		$(element).tokenfield('setTokens',peeked);

		ko.tokenfield[element.id].handlerEnabled = true;
    }

Here we create tokens for any incoming data from the model. All the tokens, as `valueAccessor()` gives us the complete object. This however will trigger `tokenfield:createdtoken` which is on the `init` side of our binding. So to avoid re-saving these tokens to the model we set a variable `handlerEnabled` to control the events flow.

Now for any user interaction, HTML `value` attributes, or model changes this event will be triggered:

	ko.utils.registerEventHandler(element, 'tokenfield:createdtoken', function (e) {
	    // Detect private token created.
		if (e.attrs[ko.tokenfield[element.id].bindings['KeyDisplay']].indexOf("_") === 0) {
			console.log('tt-private');
			$(e.relatedTarget).addClass('tt-private');
		}

		// Allow `update` to temporarily disable pushing back when this event fires.
		if (ko.tokenfield[element.id].handlerEnabled == true) observable.push(e.attrs);

	});

Note the `handlerEnabled` global to block re-adding to the `valueAccessor()`.

When removing tokens the extra meta-data that came from our AJAX autocomplete is missing from tokenfield. Thus we must look it up based on the attributes that do exist:

	ko.utils.registerEventHandler(element, 'tokenfield:removedtoken', function (e) {
		var peeked = observable.peek();
		var item;
		// Find item using tokenfield default values, other values are not in tokenfield meta-data.
		ko.utils.arrayForEach(peeked, function(x) {
			if (ko.unwrap(x.label) === e.attrs.label && ko.unwrap(x.value) === e.attrs.value) item = x;
		});

		observable.remove(item); // Validation of `item` likely needed
	});

So that about covers the internals of the binder. Now we're saving everything directly into the bound model as KnockoutJS would expect, without the duplication of data or sync issues. Lets get that CSV field back, using a computed observable puts this code in it's proper place and exposes the ability to throttle the calculations if needbe.

	var _dummyObservable = ko.observable();
	this.tags_csv = ko.computed({
		/**
		 * Construct CSV from array of objects
		 */
	    read: function () {
	    	console.log('computed.read');
	    	var self = this;

			// Retrieve and ignore the value, thus giving computed subscription to itself.
	    	_dummyObservable();

	        var csv = '';
			ko.utils.arrayForEach(ko.unwrap(self.tags), function(item) {
				console.log('item:'+JSON.stringify(item));
				if (csv != '') csv += ',';
				// Our ID from AJAX response.
				if (item.id !== undefined) {
					csv += item.id;
				// Tokenfield's ID from `value` attrs.
				} else if (item.value !== undefined) {
					csv += item.value;
				// The label, no ID available.
				} else {
					csv += item.label;
				}					
			});

	        return csv;
	    },

	    /**
	     * Push set CSV into array of objects.
	     */
	    write: function (value) {
	    	console.log('computed.write');
	    	var self = this;

	    	ko.utils.arrayForEach(value.split(','), function(item) {
	    		self.areas.push({
	    			label: item,
	    			value: item
	    		});
	    	});

	    	_dummyObservable.notifySubscribers();
	    },
	    owner: this,
	});

Now we have an array of objects and a CSV representation in our model, ready to be mapped or manipulated before sending to server.

	"tags": [
		{
			"label": "tag1",
			"value": "tag1"
		},
		{
			"id": "id from AJAX",
			"field": "field from AJAX",
			"label": "tag2",
			"value": "tag2"
		}
	],
	"tags_csv": "tag1,id from AJAX"
