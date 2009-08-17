function keyFound(key) {
    
	document.getElementById('key').value=key[0]['key_id'];
	if(key[0]['key_id']){
		findProjects(document.getElementById('url').value, document.getElementById('key').value, 'project');
	}
	
}

function projectsFound(projects, button_id) {
	var str = 'Choose a project: <br><select name="project_id" id="project_id" onChange="displayAfterLogin()">';
	str += '<option value=""></option>';
	for (i = 0; i < projects.length; i++) {
	   var str = str + '<option value="'+projects[i].project_id+'">'+projects[i].name+' (P'+projects[i].project_id+')</option>';
	}
   var str = str + '</select>'; 
   document.getElementById(button_id).innerHTML = str;
   displayFileButton();
}

function displayAfterLogin() {
  
   
	var key=document.getElementById('key').value;
	var url=document.getElementById('url').value;
	var project_id=document.getElementById('project_id').value;
	var file=document.getElementById('file').value;

	//Now let the user choose a file
	document.getElementById('button').innerHTML = '<input id="login" value="login" type="submit" onClick="document.location.href=\''+document.location.href+'?key='+key+'&url='+url+'&project_id='+project_id+'&file='+file+'\';">'

}

function displayFileButton() {
  
   document.getElementById('fileDiv').innerHTML = '<input type="file" name="file" size="30" style="background-color: #FFFFCC" id="file"> <a href="../instructions.html">(instructions)</a>';
   document.getElementById('fileL').innerHTML = 'file';
  
}