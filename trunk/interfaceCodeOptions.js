 function infoInterfaceBuilder() {
     if(parent.main.display.document.getElementById('url'))
		url = parent.main.display.document.getElementById('url').value;
	 if(parent.main.display.document.getElementById('key'))
	 key = parent.main.display.document.getElementById('key').value;
	 
	 project_id = parent.main.display.document.getElementById('project_id').value;
	 toOpen = "interfaceBuilder.php?url=" +url+ "&key=" +key+ "&project_id=" + project_id;
	return toOpen;
 } 
  
function infoImportData() {
    if(parent.main.display.document.getElementById('url'))
	url = parent.main.display.document.getElementById('url').value;
	if(parent.main.display.document.getElementById('key'))
	key = parent.main.display.document.getElementById('key').value;
	if(parent.main.display.document.getElementById('project_id'))
	project_id = parent.main.display.document.getElementById('project_id').value;
	if(parent.main.display.document.getElementById('collection_id'))
	collection_id = parent.main.display.document.getElementById('collection_id').value;
	
	if(url || key || project_id || collection_id)
	toOpen = "import/importData.php?url=" +url+ "&key=" +key+ "&project_id=" + project_id '&collection_id'+collection_id;

}    
  