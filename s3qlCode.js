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

function itemStatInserted(stat, value, item, rule, button_id) {
   if(stat[0]['statement_id'])
   document.getElementById(button_id).innerHTML = value+'<br /><font color="#66CC00">inserted</font>';
   else {
   document.getElementById(button_id).innerHTML = value+'<br /><font color="#FF0000">NOT inserted: '+stat[0]['message']+'</font>';    
   }
}

function insertItemStat(item,value, rule, button_id) {
	var s3ql = new Array;
	s3ql['url']=document.getElementById('url').value;
	s3ql['key']=document.getElementById('key').value;
	s3ql['insert'] = 'statement';
	s3ql.where = new Array;
	s3ql['where']['item_id']=item;
	s3ql['where']['rule_id'] = rule;
	s3ql['where']['value'] = value;
	s3ql['format'] = 'json';
	var url = S3QLquery(s3ql);
	
	s3db_jsonpp_call(url,"itemStatInserted(ans, '" + value + "','" + item + "', '" + rule + "', '"+button_id+"')");   
}




function findItem(collection, notes, button_id,event)
{
if(event && event.keyCode==13 || event=='finditem'){
document.getElementById(button_id).innerHTML = 'processing ...';

if(!notes){
button_id.innerHTML = 'Please input some label';
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

item=s3db_jsonpp_call(url,"itemFound(ans, '" + notes + "','" + collection + "', '" + button_id + "')");
return item
}
}
}


function displayItemButton(item, collection , label, button_id) {
	
	//document.getElementById(button_id).innerHTML = '<input type="button" value="'+label+' (ID#'+item[0].item_id+')" onClick="window.open('+document.getElementById('url').value+'/item.php?key='+document.getElementById('key').value+'&item_id='+item[0].item_id+')"> <font color="#FF0000" item_id="'+item[0].item_id+'">inserted</font>';

}

function itemInserted(ans, label, collection, button_id) {
    
	
	if(ans[0].item_id)
	{
	document.getElementById(button_id).item_id =  ans[0].item_id;
	document.getElementById(button_id).innerHTML = label + '<input type="button" value="'+label+' (ID#'+ans[0].item_id+')" onClick="window.open(\''+document.getElementById('url').value+'/item.php?key='+document.getElementById('key').value+'&item_id='+ans[0].item_id+'\')" item_id="'+ans[0].item_id+'">';
	//We may at this point run through the statements pf the item, as it has been found
	itemStatementsInsert(ans[0].item_id,label, collection, button_id)
	
	}
	else {
	document.getElementById(button_id).innerHTML = '<font color="#FF0000">' +label + 'NOT INSERTED</font>';    
	}

	

}

function itemStatementsInsert(item,label, collection, button_id) {
     
	 //Go through the columns and identify the collection of the item
	data = document.getElementById(button_id).data;
	line = document.getElementById(button_id).line;
	
	sC = new Array ();
	sD = new Array ();
	sL = new Array ();
	for (col = 0; col < data.length; col++) {
	 rule= document.getElementById('rule_'+col).rule_id;
	 value =  data[col];

	 //based on the rule, determine whehter the subject of trhe rule is the same
	 //separate the data based on the subjects
	  subjectsData = new Array();
	 ruleData = document.getElementById('rule_'+col).info;
	 if(collection==ruleData['subject_id'])	 {
	 	stat_button_id = 'line_'+line+'_col_'+(col+1);
		insertItemStat(item,value, rule, stat_button_id);

	 }
	 else {
		//Find the item collection, find the data
		
		array_push(sC, ruleData['subject_id']);
		array_push(sD, data[col]);
		pat = /name|label|identification|ID/i;
		
		if(pat.test(ruleData['object']))
		array_push(sL, data[col]);
		else 
		array_push(sL, label);    
		
		} 
		
		 
	
	 
	}
		
	//Now go through all teh items that were discovered and create them
	
	//creating a new Item ofthe subject collections and finding the right rule in which to insert it.
		sFound = new Array();
		createdItems = new Array ();
		for (i = 0; i < sD.length; i++) {
		   if(array_search(sD[i], sFound)==''){
		   button_item = document.createElement('div');
		   button_item.id = sD[i];
		   document.body.appendChild(button_item);
		   stats[sD[i]] = new Array ();
		    
		   }
		   else {
		     array_push(stats[sD[i]], sD[i]);
		   }
		}
		//Item = document.createElement('div');
	
		//Item.id= 'line_'+line+'col_'+col+'_item';
		//findItem(ruleData['subject_id'], data[col], Item.id);
		 	
	 
}

function returnAns(ans,button_id) {
    document.getElementById(button_id).data = ans;
}

function insertItem(collection, label, button_id) {
     url=document.getElementById('url').value;
	 key=document.getElementById('key').value;
	 s3ql = new Array;
	    s3ql['url']=document.getElementById('url').value;
	    s3ql['key']=document.getElementById('key').value;
		s3ql['insert']='item';
	    s3ql['where'] = new Array;
	    s3ql['where']['collection_id']=collection;
	    s3ql['where']['notes']=label;
	   
		var url = S3QLquery(s3ql);

		//s3db_jsonpp_call(url,'displayItemButton(ans, \''+ collection +'\',\''+ label +'\', \''+ button_id +'\')');
		  s3db_jsonpp_call(url,'itemInserted(ans, \''+label+'\',\''+collection+'\',\''+button_id+'\')');
		 
	
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


function RuleFound(ans, rule,button_id) {
      //create a new cell for this rule in the rule line. This will identify the rule
	  //ruleLine = document.getElementById('ruleLine');
	  ruleDiv = document.getElementById(button_id);
	  
	  if(ans[0].rule_id){
	   ruleDiv.rule_id=rule;
	   ruleDiv.found=1;
	   ruleDiv.innerHTML ='<font color="#00CC33">'+ans[0].subject+'<br>'+ans[0].verb+'<br>'+ans[0].object+'<br> (R#'+rule+' found)</font>';
	  } else  {
	   ruleDiv.innerHTML ='<font color="#FF0000">(R#'+rule+' NOT found)<!-- <a href="#" onClick="createRule()"><br /><i>Create this rule</i></a> --></font>';
	   ruleDiv.found=0;
	  } 
	  //ruleLine.appendChild(ruleTd);
	  
	   ruleDiv.info=ans[0];


	  nrRules = explode(',',document.getElementById('items').getAttribute('rules')).length;
	 
	  
	  if(document.getElementById('rule_col_'+(nrRules-1)))
		{
	  	   
		   document.getElementById('items').innerHTML='<a href="#" onClick="readTheLines()" style="font-style: italic;color: #3300FF">Import the items</a>&nbsp;<a href="#" style="font-style: italic;color: #3300FF" onClick="window.location=window.location.pathname">Reset</a>';
		   //document.getElementById('items').innerHTML='<a href="#" style="font-style: italic;color: #3300FF" onClick="window.location=window.location.pathname">Reset</a>';
		   
		   //readTheLines();

		}
	  
}

function findRule(rule, url, key,button_id) {
    var s3ql = new Array();
	  
	  s3ql.url=url;
	  s3ql.key=key;
	  s3ql.from='rules';
	 
	  s3ql.where =new Array();
	  s3ql['where']['rule_id']=rule+'';	  
	  
	  var url = S3QLquery(s3ql);
	  
	   s3db_jsonpp_call(url,'RuleFound(ans, \''+ rule +'\', \''+button_id+'\')');
}



function findKey(url, username, pass, authority) {
     if(!authority){
	 q = url+'/apilogin.php?&username='+username+'&password='+pass+'&format=json';
	 }
	 else {
		 q = url+'/apilogin.php?authority='+authority+'&username='+username+'&password='+pass+'&format=json';
	 }
	
	 s3db_jsonpp_call(q,'keyFound(ans)');

}


function projectRulesFound(ans, button_id)
{

	//at this point, we have enough information to determine whether there is one subject or many subjects. so were can decide which subject must tbe introduced first
	  allRules = ans;
	  document.getElementById(button_id).allRules = allRules;
	  
	  for (r = 0; r < ans.length; r++) {
	   var rules = document.getElementById(button_id);   
	   if(rules.subjects){
	   rules.subjects = 	rules.subjects + ',' + ans[r].subject_id;
	   }
	   else {
	       rules.subjects = 	ans[r].subject_id;
	   }
	   
	   rules.rule_id = ans[r].rule_id;
	   if(ans[r].object_id)
		{
		  if(rules.objectIsCollection){
		  rules.objectIsCollection =  rules.objectIsCollection + ',' + '1';
		  }
		  else {
		  rules.objectIsCollection = '1';
		  }

		  if(rules.objects){
		  rules.objects = 	rules.objects + ',' + ans[r].object_id;
		  }
		  else {
		  rules.objects = 	ans[r].object_id;
		  }
		}
	  else {
	      if(rules.objectIsCollection){
		  rules.objectIsCollection =  rules.objectIsCollection + ',' + '0';
		  }
		  else {
		  rules.objectIsCollection =  '0';    
		  }
		  if(rules.objects){
		  //rules.objects = 	rules.objects + ',' + ans[r].object;
		  }
		  else {
		  //rules.objects = 	ans[r].object;    
		  }
	  }
	  }
	  
	  var nodes=explode(',',document.getElementById('rules').subjects+document.getElementById('rules').objects)
	  nodes = array_unique(nodes);
	  nodes = nodes.sort();
	  document.getElementById(button_id).nodes = nodes;

		//	  //M=Matrix.Zero(nodes.length,nodes.length) //make a matrix of zeros the size of the nr of nodes
		//	  for (r = 0; r < allRules.length; r++) {
		//	   
		//	   subInd=array_search(allRules[r].subject_id, nodes);   
		//	   if(allRules[r].object_id)
		//		  { objInd=array_search(allRules[r].object_id, nodes);}
		//	   else {
		//	      objInd=array_search(allRules[r].object, nodes);
		//		  } 
		//	   
		//		M.elements[subInd][objInd]=1;//after thi,matrix should contain the rules
		//
		//	  }
		//	  document.getElementById(button_id).M = M;
	 
	  
	  
}
function findProjectRules(url,key) {
   
	document.getElementById('collections').innerHTML = 'processing ...';
	var project = document.getElementById('project_id').value;
	var s3ql = new Array();
   s3ql.url=url;
   s3ql.key=key;
   s3ql.from='rules';
   s3ql.where = new Array();
   s3ql.where['project_id'] = project;
   s3ql.where['object'] = '!=\'UID\'';
   var q = S3QLquery(s3ql);
   s3db_jsonpp_call(q,'projectRulesFound(ans, \'rules\')');

   //To obtain a collection reference, display collections
   s3ql.url=url;
   s3ql.key=key;
   s3ql.from='collection';
   s3ql.where = new Array();
   s3ql.where['project_id'] = project;
   
   var q = S3QLquery(s3ql);
   s3db_jsonpp_call(q,'projectCollectionsFound(ans, \'collections\')');


}



function findProjects(url,key, button_id) {
   var s3ql = new Array();
   s3ql.url=url;
   s3ql.key=key;
   s3ql.from='projects';
   
   var q = S3QLquery(s3ql);
   s3db_jsonpp_call(q,'projectsFound(ans, \''+button_id+'\')');
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
  s3db_jsonpp_call(q,'lastIntertedItemFound(ans, \''+ collection +'\', \''+ url +'\', \''+ key +'\')'); 

}

