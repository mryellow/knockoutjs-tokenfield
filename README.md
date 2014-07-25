knockoutjs-tokenfield
=====================

Bootstrap-tokenfield KnockoutJS custom binding.

Implments it's own models for storing extra data associated with tokens, then passes this to your external model.

Tokens beginning with `_` are styled as private, can't be removed etc.

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
		data-bind="tokenField: fooModel.bar1, tokenFieldRemote: '../remove/json/query'" 
		type="text" 
		id="tags1" 
		name="tags1" 
		value="_default" 
		class="form-group" placeholder="">
	<span class="help-block"></span>
</div>
```

```
<div class="form-group">
	<label class="control-label" for="tags2">Tags as CSV of field specified by `tokenFieldKey` only</label>
	<input 
		data-bind="tokenField: fooModel.bar2, tokenFieldRemote: '../remove/json/query', tokenFieldKey: 'id', tokenFieldVal: 'value'" 
		type="text" 
		id="tags2" 
		name="tags2" 
		value="_default" 
		class="form-group" placeholder="">
	"data-bind" => "tokenField: fooModel.bar2, tokenFieldRemote: '../remove/json/query', tokenFieldKey: 'id', tokenFieldVal: 'value'"
	<span class="help-block"></span>
</div>
```

The type of output is triggered by the type of related field.

* `observableArray` gets an array of objects
* `observable` gets a CSV of `tokenFieldKey` index key.
