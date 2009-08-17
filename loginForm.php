<head>
<script type="text/javascript" src="json_read.js"></script>
<script type="text/javascript" src="s3qlCode.js"></script>
<script type="text/javascript" src="arrayCode.js"></script>
<script type="text/javascript">
function projects()
		{
			
			if(document.getElementById('url').value)
				var url = document.getElementById('url').value;
			if(document.getElementById('key').value)
				var key= document.getElementById('key').value;
			
			findProjects(url,key, "project_select"); 
			
		}

</script>

</head>
<body>
<form enctype="multipart/form-data" action=" <?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
    <input type="hidden" name="MAX_FILE_SIZE" value="100000" />
    <table style="font-style: italic; color: #0033FF">
<tr>
	<td>
	url
	</td>
	<td>
	<input type="text" name="url" style="background-color: #FFFFCC" size="30" id="url" value="http://ibl.mdanderson.org/gcc">
	<td>
</tr>
<tr>
	<td>
	authority
	</td>
	<td>
	<select name="authority" id="authority">
		<option value="">Use your S3DB account</option>
		<option value="google">Use your Google account</option>
		<option value="MD Anderson">Use your MD Anderson account</option>
	</select>
	<td>
</tr>
<tr>
	<td>
	username
	</td>
	<td>
	<input type="text" style="background-color: #FFFFCC" size="30" name="username" id="username">
	<td>
</tr>
<tr>
	<td>
	password
	</td>
	<td>
	<input type="password" style="background-color: #FFFFCC" size="30" name="password" id="password" onkeydown="if(event.keyCode==13 || event.keyCode==9) {findKey(document.getElementById('url').value, document.getElementById('username').value, document.getElementById('password').value, document.getElementById('authority').value)};">
	<td>
</tr>
<tr>
	<td>
	
	</td>
	<td>
	<input type="button" value="Go!" onClick="findKey(document.getElementById('url').value, document.getElementById('username').value, document.getElementById('password').value, document.getElementById('authority').value)"><input type="hidden" style="background-color: #FFFFCC" size="30" name="key" id="key">
	<td>
</tr>
<tr>
	<td>
	<div id="fileL">
	</div>
	</td>
	<td>
	<div id="fileDiv">
	<div>
	<td>
</tr>
<tr>
	<td>
	</td>
	<td>
	<div id="project">
	<div>
	<td>
</tr>
	<td>
	</td>
	<td>
	<div id="template">
	<div>
	<td>
</tr>
<tr>
	<td>
	</td>
	<td>
	<div id="rules">
	<div>
	<td>
</tr>
<tr>
	<td>
	</td>
	<td>
	<div id="collections">
	</div>
	<td>
</tr>
<tr>
	<td>
	</td>
	<td>
	<div id="button">
	</div>
	<td>
</tr>
<tr>
	<td>
	</td>
	<td>
	<td>
</tr>
</table>
</form>
</body>