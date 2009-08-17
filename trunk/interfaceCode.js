
function interfaceCode() {
 //Remove the processing data line
 document.getElementById("items").innerHTML='looking for S3DB rules...';

 

//Start with creating a table which will take the data from the excel
table = document.createElement('table');
table.id = 'dataTable';
table.border=1;
line1= document.createElement('tr');
line1.id='ruleLine';
table.appendChild(line1);
document.body.appendChild(table);

//The first cell is reserved for the labels
cell1 =  document.createElement('td');
cell1.id='label';
line1.appendChild(cell1);

rules = explode(',',document.getElementById('items').getAttribute('rules'));


for (i = 0; i < rules.length; i++) {
    ruleTd = document.createElement('td');
	ruleTd.id='rule_col_'+i;
	line1.appendChild(ruleTd);  
	
	ruleDiv = document.createElement('div');
	ruleDiv.id = 'rule_'+i;
	ruleTd.appendChild(ruleDiv);
	if(rules[i]){
	findRule(rules[i], document.getElementById('items').getAttribute('url'), document.getElementById('items').getAttribute('key'), ruleDiv.id);
		
	}
	}
}

function readTheLines() {

//Find the data
//how many lines
table=document.getElementById('dataTable');
lineNr = parseInt(document.getElementById('items').getAttribute('lines'));

for (i = 0; i < lineNr; i++) {
     //create a Tr for this line
	 LineTr = document.createElement('tr');
	 LineTr.id = 'l'+(i+1);
	 table.appendChild(LineTr);
	 data=explode('\t',document.getElementById('item'+i).getAttribute('statements'));
	 
	 //Use the first column to identify the label for the reference collection
	 label = data[0];
	 Point = document.createElement('div');
	 Point.id='line_'+i+'_label';
	 createCell (i,0,'dataTable',Point);
	 if(document.getElementById('collection_id').value)
	 {
	 referenceCollection  = document.getElementById('collection_id').value;
	 }
	 else {
	 referenceCollection =  document.getElementById('rule_0').info['subject_id'];
	 }
	 document.getElementById(Point.id).collection = referenceCollection;
	 document.getElementById(Point.id).label = data[0];
	 document.getElementById(Point.id).data = data;
	 document.getElementById(Point.id).line = i;
	 
	  
	  //insertItem(referenceCollection, data[0], Point.id);
	  //It is not really the number of data items found but the number of rules taht will indeicate the number of data points
	  rules = explode(',',document.getElementById('items').getAttribute('rules'));
	  
	  itemData =new Array();
	  for (j = 1; j < rules.length; j++) {
	 //Create a td for this data point
	 Point = document.createElement('div');
	 Point.id='line_'+i+'_col_'+j;
	 createCell (i,j,'dataTable',Point);
	 
	 array_push(itemData, data[j]);

	 ruleInfo=document.getElementById('rule_'+(j-1));
	 subColl = ruleInfo.info['subject_id'];
	 rule = ruleInfo.rule_id;
	 
	 document.getElementById(Point.id).line = i;
	 document.getElementById(Point.id).rule_id = rule;
	 document.getElementById(Point.id).value = data[j];
	 document.getElementById(Point.id).innerHTML =data[j]; 

	 }
	 document.getElementById('line_'+i+'_label').data = itemData;
	 findItem(referenceCollection, data[0], 'line_'+i+'_label');
	
}


}


 



function createCell (i,j,tableId,newDiv){
			 newLine=document.getElementById('l'+i);
			 if(!newLine){
			 newLine = document.createElement('tr');
			 newLine.id = 'l'+i;
			 }
			 
			 //Of course, it will go into the cell, not the line
			 newCell = document.createElement('td');
			 newCell.id='l'+i+'_r'+j;
			 newCell.appendChild(newDiv);
			 
			 newLine.appendChild(newCell);
			 document.getElementById(tableId).appendChild(newLine);

}

function importdata() {
	
	window.location=window.location.href+'?url='+document.getElementById('url').value+'&key='+document.getElementById('key').value+'&project_id='+document.getElementById('project_id').value+'&collection_id='+document.getElementById('collection_id').value+'&file='+document.getElementById('file').value;    
}

function displayFileButton() {
  
   document.getElementById('fileDiv').innerHTML = '<input type="file" name="file" size="30" style="background-color: #FFFFCC" id="file"> <a href="../instructions.html">(instructions)</a>';
   document.getElementById('fileL').innerHTML = 'file';
  
}

function displayImport() {
   //document.getElementById('button').innerHTML = '<input type="submit" value="Import!" onClick="importdata()">' ;  
   document.getElementById('button').innerHTML = '<input type="submit" value="Import!">' ;  
}

function keyFound(key) {
    
	document.getElementById('key').value=key[0]['key_id'];
	if(key[0]['key_id']){
		findProjects(document.getElementById('url').value, document.getElementById('key').value, 'project');
	}
}

 function projectsFound(projects, button_id) {
	str = 'Choose a project: <br><select name="project_id" id="project_id" onChange="findProjectRules(\''+document.getElementById('url').value+'\', \''+document.getElementById('key').value+'\')">';
	str = str + '<option value=""></option>';
	for (i = 0; i < projects.length; i++) {
	   str = str + '<option value="'+projects[i].project_id+'">'+projects[i].name+' (P'+projects[i].project_id+')</option>';
	}
   str = str + '</select>'; 
   document.getElementById(button_id).innerHTML = str;
   displayFileButton();
}

function projectCollectionsFound(ans, button_id) {
    
	colStr = 'Choose a reference collection:<br><select id="collection_id" name="collection_id">';
	colStr += '<option value=""></option>';    
	for (i = 0; i < ans.length; i++) {
    colStr += '<option value="'+ans[i].collection_id+'">'+ans[i].name+' (C'+ans[i].collection_id+')</option>';    
    }
	colStr += '</select>';

	document.getElementById(button_id).innerHTML = colStr;

	//Now the button can be displayed
	displayImport();
	displayTemplateLink();
}

function displayTemplateLink(url,key,project_id) {
	//And the link to the file withthe rules
	var url = document.getElementById('url').value;
	var key = document.getElementById('key').value;
	var project_id = document.getElementById('project_id').value;
	document.getElementById('template').innerHTML = '<a href="ruleTemplate.php?url='+url+'&key='+key+'&project_id='+project_id+'">Dowload a template with the Rules</a>'   
}


