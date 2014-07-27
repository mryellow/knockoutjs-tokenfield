knockoutjs-tokenfield
=====================

Bootstrap-tokenfield KnockoutJS custom binding.

The whole object returned by AJAX is added as a new token, then saved in your model where it can then be processed with computed observables.

Tokens beginning with `_` are styled as private, with close button hidden.

* [Stackoverflow explaination](http://stackoverflow.com/a/24976740/2438830)

### TODO ###

* When only an autocomplete is needed typeahead should be used without tokenfield.
* Bloodhound suggestion engine integration.
	+ [Typeahead Bloodhound Docs](https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md)

I'll be happy without Bloodhound until the rest of my current project comes along, fork it if needed and I'll pull in any changes that gracefully handle each case.

### Install ###

`bower install knockoutjs-tokenfield`

### Links ###

* [KnockoutJS](http://knockoutjs.com/)
* [Bootstrap Tokenfield](http://sliptree.github.io/bootstrap-tokenfield/)
* [Twitter Typeahead](https://twitter.github.io/typeahead.js/)
    + Used as engine behind autocomplete for token selection.
    + Can likely be used as straight autocomplete without tokenfield (todo).

##### Related field in apps KnockoutJS #####
Link the tokenfield to your own model.

`tokenField: fooModel.bar`

##### AJAX URI for tag lookup #####
Request AJAX to fill auto-complete dropdown.

`tokenFieldRemote: '../tags/search'`

##### HTTP Method #####
`tokenFieldMethod: 'GET'`
* default: 'GET'

##### jQuery AJAX datatype option #####
* [jQuery - AJAX docs](http://api.jquery.com/jquery.ajax/)
* `(xml|html|json|jsonp|text)`

`tokenFieldDatatype: 'json'`
* default: 'json'

##### Querystring key for remote #####
`tokenFieldQuery: 'q'`
* default: 'q'

##### Object key to extract and pass to related field #####
This doesn't really do anything. Could be used to control CSV construction.

`tokenFieldKeyIndex: 'id'`
* default: 'value'

##### Object key to display in tokenfield #####
`tokenFieldKeyDisplay: 'label'`
* default: 'label'

##### CSV Delimiter #####
`tokenFieldDelimiter: ','`
* default: ','

### Examples ###

##### Auto-complete tags #####
```
<div class="form-group">
	<label class="control-label" for="tags1">Tags</label>
	<input 
		data-bind="tokenField: fooModel.bar1, tokenFieldRemote: '../remote/json/query'" 
		type="text" 
		id="tags1" 
		name="tags1" 
		value="_default" 
		class="form-group" placeholder="">
	<span class="help-block"></span>
</div>
```
Output `fooModel`:
```
{
	"bar1": [
		{
			"value": "_default",
			"label": "_default"
		},
		{
			"field": "extra data"
			"value": "uniqueid",
			"label": "tag pushed from model"
		},
		{
			"id": "id from AJAX"
			"field": "field from AJAX"
			"value": "tag added from server",
			"label": "tag added from server"
		}
	]
}
```

##### Parent application #####
```
<script language="javascript" type="text/javascript">
// Test parent model
var fooModel = {};

$(function() {
	console.log('main');

	fooModel = {
		bar1: ko.observableArray([])
	}

	ko.applyBindings(fooModel);
	ko.applyBindings(fooModel, document.getElementById('debug'));

});
</script>

<hr />
<h2>Debug</h2>
<pre id="debug" data-bind="text: ko.toJSON($data, null, 2)"></pre>
```

##### CSS to enable '_private' tokens #####
```
.token.tt-private {
  background-color: #428bca;
  color: #fff;
}

.token.tt-private a.close {
  visibility: hidden;
}
```

##### CSV computed observable #####

This will take an array of tokens and transform it into a CSV of IDs or display keys depending on what is available.

```
var _dummyObservable = ko.observable();
this.product_ids = ko.computed({
	/**
	 * Construct CSV from array of objects
	 */
    read: function () {
    	console.log('computed.read');
    	var self = this;

		// Retrieve and ignore the value, thus giving computed subscription to itself.
    	_dummyObservable();

        var csv = '';
		ko.utils.arrayForEach(ko.unwrap(self.products), function(item) {
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
```

Same thing again as an `observableArray` reusable `fn`. Returns a computed for use in another field.

Usage: `self.product_ids = self.products.computeCsv();`.
```
ko.observableArray['fn'].computeCsv = function() {
	console.log('observableArray.computeCsv');
	var self = this;		

	return ko.computed({
        read: function () {
        	console.log('computed.read');

            var csv = '';
			ko.utils.arrayForEach(ko.unwrap(self), function(item) {
				console.log('item:'+JSON.stringify(item));
				if (csv != '') csv += ',';
				// Our ID from AJAX response.
				if (item.id !== undefined) {
					csv += item.id;
				// Tokenfield's ID form `value` attrs.
				} else if (item.value !== undefined) {
					csv += item.value;
				// The label, no ID available.
				} else {
					csv += item.label;
				}					
			});

	        return csv;
        },
		write: function (value) {
        	console.log('computed.write');

        	ko.utils.arrayForEach(value.split(','), function(item) {
        		self.push({
        			label: item,
        			value: item
        		});
        	});

        }
	});
};
```
