knockoutjs-tokenfield
=====================

Bootstrap-tokenfield KnockoutJS custom binding.

Implements it's own KnockoutJS models for storing extra data associated with tokens, then passes this to your external model.

Tokens beginning with `_` are styled as private, can't be removed etc.

* [Stackoverflow explaination](http://stackoverflow.com/a/24946651/2438830)

### TODO ###

Each field added to a page has it's own model for keeping track of selections, they are intern stored in an array of fields. This meta-data already exists in the DOM attached to each token and the duplication could be done away with by extending the tokenfield DOM to be observable.

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

##### jQuery AJAX datatype option #####
* [jQuery - AJAX docs](http://api.jquery.com/jquery.ajax/)
* `(xml|html|json|jsonp|text)`

`tokenFieldDatatype: 'json'`

##### Querystring key for remote #####
`tokenFieldQuery: 'q'`

##### Object key to extract and pass to related field #####
This will be passed if the related field is `observable`, for `observableArray` the whole object is returned.

`tokenFieldKey: 'id'`

##### Object key to display in tokenfield #####
`tokenFieldValue: 'value'`

##### CSV Delimiter #####
`tokenFieldDelimiter: ','`

### Examples ###

```
<div class="form-group">
	<label class="control-label" for="tags1">Tags as array of full objects</label>
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
			"id": "uniqueid"
			"value": "tag added from server",
			"label": "tag added from server"
		}
	]
}
```

```
<div class="form-group">
	<label class="control-label" for="tags2">Tags as CSV of field specified by `tokenFieldKey` only</label>
	<input 
		data-bind="tokenField: fooModel.bar2, tokenFieldRemote: '../remote/json/query', 
		tokenFieldKey: 'id', // The key to be CSV'd and sent to related model if it isn't an array.
		tokenFieldVal: 'value'" // The key to displayed in autocomplete.
		type="text" 
		id="tags2" 
		name="tags2" 
		value="_default" 
		class="form-group" placeholder="">
	<span class="help-block"></span>
</div>
```
Output `fooModel`:
```
{
	"bar2": "_default,tagid:23583353,tag added without id from server (pressed tab, created new tag without match in drop-down) ready for creation when server detects it isn't an ID"
}
```

The type of output is triggered by the type of related field.

* `observableArray` gets an array of objects
* `observable` gets a CSV of `tokenFieldKey` index key.
