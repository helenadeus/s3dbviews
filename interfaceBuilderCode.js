function projectsFound(projects, button_id) {
	var str = 'Choose a project: <br><select name="project_id" id="project_id" onChange="displayAfterLogin()">';
	str += '<option value=""></option>';
	for (i = 0; i < projects.length; i++) {
	   var str = str + '<option value="'+projects[i].project_id+'">'+projects[i].name+' (P'+projects[i].project_id+')</option>';
	}
   var str = str + '</select>'; 
   document.getElementById(button_id).innerHTML = str;
}

function displayAfterLogin() {
  
   	
	var key=document.getElementById('key').value;
	var url=document.getElementById('url').value;
	var project_id=document.getElementById('project_id').value;

	document.getElementById('button').innerHTML = '<input id="login" value="login" type="button" onClick="document.location.href=\''+document.location.href+'?key='+key+'&url='+url+'&project_id='+project_id+'\';">'

}

function keyFound(key) {
    
	document.getElementById('key').value=key[0]['key_id'];
	if(key[0]['key_id']){
		findProjects(document.getElementById('url').value, document.getElementById('key').value, 'project');
	}
	
}
function lastIntertedItemFound(ans, collection, url,key) {
   	if(ans[0])
	document.getElementById(collection + '_lastItem').innerHTML =  '&nbsp;Last inserted: <input type="button" value="'+ ans[0].notes +' (ID#'+ans[0].item_id+')" onClick="window.open(\''+url+'item.php?key='+key+'&item_id='+ans[0].item_id+'\');">';
	else
	document.getElementById(collection + '_lastItem').innerHTML =  '&nbsp;Last inserted: NA';
}

function itemFound(items, notes, collection,  button_id)
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
	 		rulesObj = explode(',',document.getElementById(collection).getAttribute('rules'));
			for (i = 0; i < rulesObj.length; i++) {
			  document.getElementById(rulesObj[i]).value = items[0]['item_id'];  
			}
			


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

function writeAllItemStatementsOnText(ans, item, url, key, collectionRules) {
      for (i = 0; i < ans.length; i++) {
         document.getElementById(ans[i].rule_id).value =  ans[i].value;
		 document.getElementById(ans[i].rule_id).disabled =  'on';
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
