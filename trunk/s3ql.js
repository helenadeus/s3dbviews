function S3QLquery(s3ql)
	{
	/*Function S3QLQuery builds the S3QL query for any remote uri
	#INPUT: s3ql is an array with at least key and url
	#OUTPUT: a string, containing the URI with the information on the input element UID 
	s3ql = new Array();s3ql['url'] = 'http://ibl.mdanderson.org/TCGA/';s3ql['key'] = 'mudamseostempos';s3ql['where'] = new Array();s3ql['from'] = 'statements';s3ql['where']['rule_id']='191';
	*/
	
	var wrap='';
	
	wrap = s3ql['url'] + '/S3QL.php';
	
	if (s3ql['user_id']!=null) {
		wrap += '?user_id=' + s3ql['user_id'];
	}
	if (s3ql['format']!=null) {
		( s3ql['user_id']==null)? r = '?': r = '&';
		wrap +=  r + 'format=' + s3ql['format'];
	}
	
	( s3ql['user_id']==null && s3ql['format']==null )? r = '?': r = '&';
	wrap += r  + 'query=<S3QL>'; 
	wrap += '<key>' + s3ql['key'] + '</key>';

	//remove the elements already used to build the query, keep the rest
	delete s3ql['url'];	delete s3ql['key']; delete s3ql['user_id']; delete s3ql['format'];
	 
	for (var i in s3ql) {
	       var field = i;
		   var val = s3ql[i];
		   var go = (is_array(val) || is_string(val));
		   if(go){
		   if(!is_array(s3ql[field])) //if is not an array, just build the simple xml
			wrap += '<' + field + '>' + s3ql[field] + '</' + field + '>';
			else //for arrays, build the nested xml
			{wrap += '<' + field + '>';
			for (var j in val)
				{
				
				var subfield = j;
				var subvalue = val[subfield];
				var go = (is_array(subvalue) || is_string(subvalue));
				if (go) {
				wrap += '<' + subfield + '>' + subvalue + '</' + subfield + '>';
				}
				}
			wrap += '</' + field + '>';
			}
			}
		}
		wrap += '</S3QL>';
		
	 return (wrap);
	
		
	}

function is_array(mixed_var)
{	// see http://kevin.vanzonneveld.net/techblog/article/phpjs_licensing/
	//copyright 2008 Kevin van Zonneveld.
	return(mixed_var instanceof Array);
}

function is_string(mixed_var)
{  // see http://kevin.vanzonneveld.net/techblog/article/phpjs_licensing/
	//copyright 2008 Kevin van Zonneveld.
	return(typeof(mixed_var)=='string');

}

function findItem(collection, notes, button_id)
{
document.getElementById(button_id).innerHTML = 'processing ...';

if(!notes){
alert('Please input some Label');
}
else {
 
var s3ql = new Array;
s3ql['url']=document.getElementById('url').value;
s3ql['key']=document.getElementById('key').value;
s3ql['select'] = '*';
s3ql['from'] = 'items';
s3ql.where = new Array;
s3ql['where']['collection_id'] = collection;
s3ql['where']['notes'] = notes;
s3ql['format'] = 'json';
var url = S3QLquery(s3ql);

s3db_jsonpp_call(url,"itemFound(ans, " + collection + ", '" + button_id + "')");
}
}

function clearItemInputs(collection, button_id) {
   
	
	document.getElementById(collection).removeAttribute('disabled');
	document.getElementById(collection).item_id = '';
	document.getElementById(collection + '_reset').innerHTML='';
	document.getElementById(collection + '_link').innerHTML='Find it';
	//Now find the rules that have values and clean up those too
	CollectionRules = explode(',',document.getElementById(collection + '_rules').getAttribute('rules'));

	
	for (i = 0; i < CollectionRules.length; i++) {
	    document.getElementById(CollectionRules[i]).removeAttribute('disabled');  
		document.getElementById(CollectionRules[i]).value='';
		document.getElementById(CollectionRules[i] + '_div').innerHTML='';
	}

	//Now remove the item_id from those rules where it is used as object
	 objectrules=explode(',',document.getElementById(collection).getAttribute('objectrules'));
	 for (i = 0; i < objectrules.length; i++) {
	     document.getElementById(objectrules[i]).value = '';
	 }
}


function itemFound(items, collection,  button_id)
{

if(items[0])
	{
	
	
	document.getElementById(button_id).innerHTML = 'found';
	document.getElementById(collection + '_reset').innerHTML = '(reset)';
	document.getElementById(collection).disabled = 'on';
	document.getElementById(collection).item_id ='"'+items[0]['item_id']+'"';

	//Now insert this item in rules that use it as object
	 if(document.getElementById(collection).getAttribute('rules'))
			{
	 		rulesObj = document.getElementById(collection).getAttribute('rules');
			document.getElementById(rulesObj).value = items[0]['item_id'];
			}
	//Since we have the item in hand, now wew can discover its statements and fill out the right fields
	collectionRules = explode(',',document.getElementById(collection + '_rules').rules);
	findAllItemStatements(items[0]['item_id'], document.getElementById('url').value, document.getElementById('key').value, collection, collectionRules);
	
	}
else {
		alert('Could not find an Item, you may go ahead and insert a new one.');
		document.getElementById(button_id).innerHTML = 'Find it';
	}

}

function returnItemId(ans, collection, button_id) {
    var item_id =ans[0]['item_id'];
	
	if(item_id)
	{
	document.getElementById(collection).item_id = item_id;
	document.getElementById(collection).disabled='on';
	
	insertStatementsInItem(collection, button_id);
	
	//Set the button back to its original state
	
	}
}


function insertStatementsInItem(collection, button_id)
{
	 //document.getElementById(button_id).oldvalue = document.getElementById(button_id).value;
	 //document.getElementById(button_id).value = "Inserting data, please wait...";
	 document.getElementById(button_id).disabled = 'on';
	 rules=explode(',',document.getElementById(collection + '_rules').getAttribute('rules'));
	 //collEntries = document.getElementsByClassName(collection + '_stat_value');

	 //Item needs to be checked first
	 if(!document.getElementById(collection).item_id)
		{
	 	
		s3ql = new Array;
	    s3ql['url']=document.getElementById('url').value;
	    s3ql['key']=document.getElementById('key').value;
		s3ql['insert']='item';
	    s3ql['where'] = new Array;
	    s3ql['where']['collection_id']=collection;
	    s3ql['where']['notes']=document.getElementById(collection).value;
	   
		var url = S3QLquery(s3ql);
		
		s3db_jsonpp_call(url,'returnItemId(ans, \''+ collection +'\', \''+ button_id +'\')');
		
	
		}
		else if(document.getElementById(collection).item_id) {
		item_id = document.getElementById(collection).item_id+'';
		
		for (i = 0; i < rules.length; i++) {
	    
		tmp = document.getElementById(rules[i]);
		rule_id = tmp.name;
	    value = tmp.value;
	  	
	  if(value && item_id && rule_id){
	  
	  var s3ql = new Array();
	  
	  s3ql.url=document.getElementById('url').value;
	  s3ql.key=document.getElementById('key').value;
	  s3ql.insert='statement';
	 
	  s3ql.where =new Array();
	  s3ql['where']['rule_id']=rule_id+'';	  
	  s3ql['where']['item_id']=item_id;
      s3ql['where']['value']=value;

	  var url = S3QLquery(s3ql);
	 
	   s3db_jsonpp_call(url,'promptInserted(ans, \''+ collection +'\', \''+ rule_id +'\')');
	   //s3db_jsonpp_call(url,'promptInserted(ans)');

	  }
	 }
	  if(document.getElementById(collection).getAttribute('rules'))
			{
	 		rulesObj = document.getElementById(collection).getAttribute('rules');
			rulesObj = explode(',', rulesObj);
			for (r = 0; r < rulesObj.length; r++) {
			       document.getElementById(rulesObj[r]).value = item_id;
			}
			
			}
	 
	 }
	   document.getElementById(collection+'_reset').innerHTML = ' (reset)';
	   document.getElementById(collection+'_submit').removeAttribute('disabled'); 
	   //Update the button with the last inserted
	   findLastInsertedItem(collection, document.getElementById('url').value,document.getElementById('key').value);

}

function resetItem(collection, button_id) {
     //document.getElementById(button_id).value = document.getElementById(button_id).oldvalue;
	 //document.getElementById(button_id).oldvalue='';
	 
	 
	 rules=explode(',',document.getElementById(collection + '_rules').getAttribute('rules'));

	 for (i = 0; i < rules.length; i++) {
	   inserts = document.getElementById(rules[i]);
	   if(inserts.inserted) {
	   inserts.value = ''; 
	   document.getElementById(inserts.id + '_div').innerHTML='';

	   }
	 }
	 
	 

}

function promptInserted(ans, collection, rule_id)
{

if(ans[0]['error_code']=='0')
	{
	document.getElementById(rule_id).inserted = 1;
	document.getElementById(rule_id+'_div').innerHTML = 'inserted';
	item_id = ans[0]['item_id'];
	}
else {
	document.getElementById(rule_id+'_div').innerHTML = ans[0]['message'];
}
}

function explode( delimiter, string, limit ) {
    // http://kevin.vanzonneveld.net
    // +     original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: kenneth
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: d3x
    // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: explode(' ', 'Kevin van Zonneveld');
    // *     returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}
    // *     example 2: explode('=', 'a=bc=d', 2);
    // *     returns 2: ['a', 'bc=d']
 
    var emptyArray = { 0: '' };
    
    // third argument is not required
    if ( arguments.length < 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined' )
    {
        return null;
    }
 
    if ( delimiter === ''
        || delimiter === false
        || delimiter === null )
    {
        return false;
    }
 
    if ( typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object' )
    {
        return emptyArray;
    }
 
    if ( delimiter === true ) {
        delimiter = '1';
    }
    
    if (!limit) {
        return string.toString().split(delimiter.toString());
    } else {
        // support for limit argument
        var splitted = string.toString().split(delimiter.toString());
        var partA = splitted.splice(0, limit - 1);
        var partB = splitted.join(delimiter.toString());
        partA.push(partB);
        return partA;
    }
}

function writeLastItemOnSpan(ans, collection, url,key) {
   	if(ans[0].item_id)
	document.getElementById(collection + '_lastItem').innerHTML =  '&nbsp;Last inserted: <input type="button" value="'+ ans[0].notes +' (ID#'+ans[0].item_id+')" onClick="window.open(\''+url+'item.php?key='+key+'&item_id='+ans[0].item_id+'\');">';
	else
	document.getElementById(collection + '_lastItem').innerHTML =  '&nbsp;Last inserted: NA';
}
function findLastInsertedItem(collection, url,key) {
  
  //Build an array to query last inserted item on collceton
  s3ql = new Array();
  s3ql['url'] = url;
  s3ql['key'] = key;
  s3ql['from'] = 'items';
  s3ql['where'] = new Array();
  s3ql['where']['collection_id']=collection;
  s3ql['order_by']='created_on desc';
  s3ql['limit']='1';
  q = S3QLquery(s3ql);
  s3db_jsonpp_call(q,'writeLastItemOnSpan(ans, \''+ collection +'\', \''+ url +'\', \''+ key +'\')'); 

}


function writeAllItemStatementsOnText(ans, item, url, key, collectionRules) {
      for (i = 0; i < ans.length; i++) {
         document.getElementById(ans[i].rule_id).value =  ans[i].value;
		 document.getElementById(ans[i].rule_id).disabled =  'on';
      }
}


function findAllItemStatements(item, url, key, collection, collectionRules) {
   //Build an array to query last inserted item on collceton
  s3ql = new Array();
  s3ql['url'] = url;
  s3ql['key'] = key;
  s3ql['from'] = 'statements';
  s3ql['where'] = new Array();
  s3ql['where']['item_id']=item;
  q = S3QLquery(s3ql);
  s3db_jsonpp_call(q,'writeAllItemStatementsOnText(ans, \''+ item +'\', \''+ url +'\', \''+ key +'\', \''+collectionRules+'\')'); 

}