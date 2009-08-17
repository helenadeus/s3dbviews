<script type="text/javascript" src="json_read.js"></script>
<script type="text/javascript" src="s3qlCode.js"></script>
<script type="text/javascript" src="arrayCode.js"></script>
<link rel="stylesheet" href="glossy.css" type="text/css" />
<body bgcolor="#F8FFDF">
<!-- <script type="text/javascript" src="dragdrop.js"></script> -->
<script type="text/javascript" src="interfaceBuilderCode.js"></script>

<?php

ini_set('display_errors',0);
if($_REQUEST['su3d'])
ini_set('display_errors',1);

include('S3QLgoodies.php');
echo "<font color='#339900' font='verdana'>S3DB Insert Form</font>";
##interfaceBuilder.php builds an interface for uploading data into S3DB rules. Because  some items need to be inserted first before tbey can be inserted in others, they are listed first so that data entry is more smooth


#order the collectiosn by order of _ numbre of collections connections
#$url = ($_REQUEST['url']=='')?'http://ibl.mdanderson.org/edu':$_REQUEST['url'];;
$url = $_REQUEST['url'];
if(substr($url, count($url), 1)!='/') $url.='/';

#$key=($_REQUEST['key']=='')?'serpoetaesermaisalto':$_REQUEST['key'];
$key=$_REQUEST['key'];
$project_id=$_REQUEST['project_id'];
if($url=='' || $key=='' || $project_id=='')
{
include('loginForm.php');


}
else 
	{
	


echo '<div id="fixeddiv"><a href="'.$_SERVER['PHP_SELF'].'">Logout</a>&nbsp;&nbsp;<a href="'.$_SERVER['PHP_SELF'].'?url='.$_REQUEST['url'].'&key='.$_REQUEST['key'].'&project_id='.$_REQUEST['project_id'].'">Reset</a>';
//echo '<table><tr>
//		<td style="width: 180px;"><a href="'.$_SERVER['PHP_SELF'].'">Logout</a></td><td style="width: 180px;"><a href="'.$_SERVER['PHP_SELF'].'?url='.$_REQUEST['url'].'&key='.$_REQUEST['key'].'&project_id='.$_REQUEST['project_id'].'">Reset</a></td></tr></table></div>';


echo '<input type="hidden" id="url" value="'.$url.'">';##For javascript
echo '<input type="hidden" id="key" value="'.$key.'">';##For javascript
echo '<input type="hidden" id="project_id" value="'.$project_id.'">';##For javascript

list($rules, $ruleSubs, $ruleVerbs, $ruleObjs, $ruleIds) = findRules($url,$key, $project_id);

#build a matrix of collections agains collection where the intersection is the rule
for ($i=1; $i < count($rules); $i++) {
	
	$subject_names[$rules[$i]['subject_id']] =  $rules[$i]['subject'];
	$subVerbs[$rules[$i]['subject_id']][]=$rules[$i]['verb'];
	$subObjects[$rules[$i]['subject_id']][]=$rules[$i]['object'];
	$litRules[$rules[$i]['subject_id']][]=$rules[$i]['rule_id'];
	$validation[$rules[$i]['subject_id']][]=$rules[$i]['validation'];

	if($rules[$i]['object_id']){
	 $relations[$rules[$i]['subject_id']][] =  $rules[$i]['object_id'];
	 $relationsName[$rules[$i]['subject_id']][] =  $rules[$i]['object'];
	 $relationsInverse[$rules[$i]['object_id']][]= $rules[$i]['subject_id'];
	 $relationsInverseRule[$rules[$i]['object_id']][]= $rules[$i]['rule_id'];
	 

	}
	else {
		$relations[$rules[$i]['subject_id']][] ='';
		
	}
	
}

#now count how many object_ids does each subject_id require

foreach ($relations as $sub=>$objs) {
	$ord[$sub] = count(array_filter($objs));
}



#sort the collections inverslly with the sum (that is, the largest the sum, the later in the sequence does the collection need to be inserted)
arsort($ord);
$sortedCols = array_keys($ord);

	  
for ($i=count($ord)-1; $i >=0 ; $i=$i-1)  {
	  $collection = $sortedCols[$i];
	  
	  #this section must be filled before moving on to the next as the next will rely on having this one exist
	   
	  if($relationsInverse[$collection])
		  $ruleObject = implode(',', $relationsInverseRule[$collection]);
	  else 
		$ruleObject='';
	  
	  
	  echo '<div id="'.$subject_names[$collection].'" style="position:relative;"><table width = "100%" id="'.$collection.'_table" border>
			<tr style="background-color:#D5EDB3">
				<td width="200">'.$subject_names[$collection].' (C'.$collection.') Label: </td>
				<td id="'.$collection.'_td"><input type="text" class="'.$collection.'_item" name="'.$subject_names[$collection].'" id="'.$collection.'" rules="'.$ruleObject.'" objectrules="'.$ruleObject.'" onkeydown="findItem(\''.$collection.'\',document.getElementById(\''.$collection.'\').value, \''.$collection.'_link\',event)"><a href="#" onclick="findItem(\''.$collection.'\',document.getElementById(\''.$collection.'\').value, \''.$collection.'_link\',\'finditem\')">Find it</a>
				<span id="'.$collection.'_lastItem">(Last inserted: processing...)</span><br />
				<span style="font-style: italic; color: #330066; text-decoration: underline" id="'.$collection.'_link" onClick="findItem(\''.$collection.'\',document.getElementById(\''.$collection.'\').value, \''.$collection.'_link\')" style="display:none"><br /></span>
				<span id="'.$collection.'_reset" onClick="clearItemInputs(\''.$collection.'\', \''.$collection.'_reset\')" style="font-style: italic; color: #330066; text-decoration: underline"></span></td>
				<td>
				</td>
			</tr>
			';
			#foreach ($subObjects[$collection] as $attr) {
			
			
			##start off with opening a div for encapsulating rules that use a particular collection
			$rulesColl = implode(',', $litRules[$collection]);
			echo '<div id="'.$collection.'_rules" rules="'.$rulesColl.'"></div>';
			
			
			for ($so=0; $so <count($subObjects[$collection]) ; $so++) {
			 
			 
			 
			 
			 $attr = $subVerbs[$collection][$so].'-'.$subObjects[$collection][$so];
			 $rule = $litRules[$collection][$so];
			 $valid =  $validation[$collection][$so];
			
			
			if(ereg('\[(.*)\]', $valid))
				{
					#do something to display numbers
					#$options=ereg('(\[.*\])*', $valid, $numbers);
					#echo '<pre>';print_r( $numbers);exit;
					
				}
			elseif(ereg('\|', $valid))
			$options=explode('|', $valid);
			else {
				$options='';
			}
			
			#if the rule points to an object_id, UID should be generated automatically, therefore the field must exist but be desabled
			
			if(is_array($relationsName[$collection]) && in_array($subObjects[$collection][$so], $relationsName[$collection]))
				$disabled = " disabled";
			else 
				$disabled = "";

			if(is_array($options) && !empty($options))
				{
				$input = '<select class="'.$collection.'_stat_value" id="'.$rule.'" name="'.$rule.'">';
				 $input .= '<option value=""></value>';
				foreach ($options as $opt=>$value) {
					   $input .= '<option value="'.$value.'">'.$value.'</value>';
				}
				$input.='</select>';
				}
				else {
					$input= '<input type="text" class="'.$collection.'_stat_value" id="'.$rule.'" name="'.$rule.'" '.$disabled.'>';
				}
			
			
			
			echo '<tr style="background-color: #F4FFE4">
					<td></td>
					<td>'.$attr.'</td> <td width="200">'.$input.'</td>
					<td><span class="message" style="color: #FF0000; font-size: small" id="'.$rule.'_div"></span></td>
				  </tr>';
			}
			

			echo '<tr>
					<td width="200"></td>
					<td></td>
					<td>
					<input type="submit" id="'.$collection.'_submit" value="Insert this item of '.$subject_names[$collection].'" onClick="insertStatementsInItem(\''.$collection.'\', \''.$collection.'_submit\')"></td>
				  </tr>';
			
			echo '</table></div>';

	 # echo "<br />Insert an item of ".$subject_names[$collection];
	 # echo "<br />For the item just created insert statements for : ".implode(',',$subObjects[$collection]);
	  
	  
	  
}


#Create the javascript code that will make div draggable



if(is_array($subject_names)){
echo '<script type="text/javascript">';
$drag .='SET_DHTML(SCROLL, '; 

foreach ($subject_names as $draggableDiv) {
	
	$drag .= '"'.$draggableDiv.'"+VERTICAL+TRANSPARENT+SCALABLE';
	
	if($draggableDiv != end($subject_names))
	{ $drag .= ', ';   						 
	
	}
}
 $drag .= ')';
echo  'if (window.navigator.appName!="Microsoft Internet Explorer"){'.$drag.'}';
echo '</script>';
}
else {
	echo "<br />No Rules were Found;";
}


echo '<script type="text/javascript">';
#Now add to each collection a button for the last inserted item

foreach ($subject_names as $Cid=>$subName) {
	  echo 'findLastInsertedItem(\''.$Cid.'\', \''.$url.'\',\''.$key.'\');';
}
echo '</script>';

}
?>

</body>