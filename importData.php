<script type="text/javascript" src='../json_read.js'></script>
<script type="text/javascript" src='../s3qlCode.js'></script>
<script type="text/javascript" src='../arrayCode.js'></script>
<script type="text/javascript" src="../interfaceCode.js"></script>
<script type="text/javascript" src="sylvester.src.js"></script>

<body bgcolor="#F8FFDF">
<?php
##Import data imports data from a tabular text file into S3DB by parsing and translating it to S3QL queries
#Helena Deus (helenadeus@gmail.com)

ini_set('display_errors','0');
if($_REQUEST['su3d'])
ini_set('display_errors','1');

##script to import statements given a line header of rules and items as the remaining lines
include_once('../S3QLgoodies.php');
echo "<font color='#339900' font='verdana' style='bold'>S3DB Express Insert</font>";

if($_REQUEST['url']=='' || $_REQUEST['key']=='' || $_REQUEST['project_id']=='' || $_REQUEST['collection_id']==''){

include('../loginForm.php');

}
else{
//echo "<body onload=\"interfaceCode()\">";
$url = ($_REQUEST['url']=='')?'http://ibl.mdanderson.org/central':$_REQUEST['url'];
$key= ($_REQUEST['key']=='')?'serpoetaesermaisalto':$_REQUEST['key'];
$project_id = ($_REQUEST['project_id']=='')?'530':$_REQUEST['project_id'];
$collection_id=$_REQUEST['collection_id'];

$file=	$_FILES['file']['name'];
#$file=	'test';
 
 
if(!@copy($_FILES['file']['tmp_name'], $file))
	{
	echo "File was NOT imported. Please <a href='".$_SERVER['PHP-SELF']."'>try again</a>.";

	}



$data = read_excel($file);
$lines = array_filter($data);

#The line of literal rules will be calculated based on the first fully numeric, largest line

#Bystepping PHP, pass every cell to javascript
$rules = array_filter($data[0]);
$ruleString = implode(',',$rules);

#get all rules
$s3ql=compact('url','key');
$s3ql['from']='rules';
$s3ql['where']['project_id']=$project_id;
$Prules = S3DBcall($s3ql);
$Prules=$Prules[1];

$subjects = array();
$objects = array();
$ruleIds = array();
$subjectAsObjects = array();
foreach ($Prules as $ruleData) {
	 
	
	
		
		$ruleIds[$ruleData['rule_id']] = $ruleData;

		if(!is_array($subjects[$ruleData['subject_id']])){
		  $subjects[$ruleData['subject_id']] = array();
		  $objects[$ruleData['subject_id']]=array();
		}
		
			array_push($subjects[$ruleData['subject_id']],$ruleData['rule_id']);
			array_push($objects[$ruleData['subject_id']],$ruleData['object']);
			
		
		//if($ruleData['object_id']){
			if(!is_array($subjectAsObjects[$ruleData['subject_id']])) {
			$subjectAsObjects[$ruleData['subject_id']] = array();
			$subjectAsObjectsRefRule[$ruleData['subject_id']]=array();
			
			}

			if(!is_array($subjectAsObjectsInverse[$ruleData['object_id']]))
			{
				$subjectAsObjectsInverse[$ruleData['object_id']]=array();
				$subjectAsObjectsInverseRule[$ruleData['object_id']]=array();
			}

			array_push($subjectAsObjects[$ruleData['subject_id']],$ruleData['object_id']);
			array_push($subjectAsObjectsRefRule[$ruleData['subject_id']],$ruleData['rule_id']);
			array_push($subjectAsObjectsInverse[$ruleData['object_id']],$ruleData['subject_id']);
			array_push($subjectAsObjectsInverseRule[$ruleData['object_id']], $ruleData['rule_id']);
		
		//}
		
}

$subject_ids = array_keys($subjects);
$subject_names = array_keys($objects);
echo "<a href=".$_SERVER['PHP-SELF']."?url=".$url."&key=".$key." style='font-style: italic;color: #3300FF'>Reset</a>";
echo "<table border=1>";

echo "<tr>";
echo "<td>Reference Item</td>";
foreach ($rules as $rule_id) {
	
	
	if(in_array($rule_id, array_keys($ruleIds)))
	{	$ruleStr = "<font color='green'>R".$rule_id.' found</font><br />'.$ruleIds[$rule_id]['subject'].'<br />'.$ruleIds[$rule_id]['verb'].'<br />'.$ruleIds[$rule_id]['object'];
	}
	else {
		$ruleStr = "<font color='red'>R".$rule_id.' NOT found</font>';
	}
	echo "<td>".$ruleStr."</td>";
}


echo "</tr>";
foreach ($data as $line=>$lineData) {
	if($line>=4)
	{

		$referenceCollectionLabel = trim($lineData[0], '"');
		// $col = 1;
		 $ind = 0;
		 $ind1= 0;
		
		foreach ($subjects as $sub=>$partnerInfo) {
			$object_names = $objects[$sub];
			
			
			
			foreach ($partnerInfo as $partnerInfoDetail) {
				
				$col=array_search($partnerInfoDetail, $rules);
				if($col)
				{
				$value = trim($lineData[$col], '"');
				$Info[$line][$subject_ids[$ind]][$rules[$col]]=$value;
				
				if(eregi('name|label',$data[3][$col]))
				{
				$Info[$line][$subject_ids[$ind]]['label'] =  trim($lineData[$col], '"');
				
				}
				
				}
				
				
				
				
			
				
				
				

			$ind1++;
		}
		
		if($Info[$line][$subject_ids[$ind]]['label']=='')
		{
		
		$Info[$line][$subject_ids[$ind]]['label']=$referenceCollectionLabel;
				
		}
		
		
		
		
		$ind++; 
	} 
	
	
	}
	
}

#create starting from the one with the least amount of object_ids 
foreach ($subjectAsObjects as $subjectObject=>$tmp) {
	$subjectAsObjectsCount[$subjectObject] = count(array_filter($tmp));
}

asort($subjectAsObjectsCount, SORT_NUMERIC);
 
 #echo '<pre>';print_r($Info);exit;
foreach ($Info as $line=>$tmp) {
	
foreach ($subjectAsObjectsCount as $subject_id=>$count) {
	
	//echo '<pre>';print_r($Info[$subject_id]);exit;
	//create item
	
	if(count($Info[$line][$subject_id])>1){
	$item_id = insertItem($url, $key, $subject_id, urlencode($Info[$line][$subject_id]['label']), $repeat=False);
	
	$Info[$line][$subject_id]['item_id']=$item_id;
	
	//create the statements
	foreach ($Info[$line][$subject_id] as $rule_id=>$value) {
	if($rule_id!='label')
		{
		
		$statement_id = insertStatement($url, $key, $item_id, $rule_id, urlencode($value));
		
		
		if($statement_id)
		$Info[$line][$subject_id][$rule_id.'_statement_id']=$statement_id;
		}
	}
	
	
	
	//If this collection is used elsewhere as object, add the appropriate rule_id and value to each of the subject where she is used
	if($subjectAsObjectsInverse[$subject_id]){
	foreach ($subjectAsObjectsInverse[$subject_id] as $tmp=>$collectionHolder) {
		
		$rule_id = $subjectAsObjectsInverseRule[$subject_id][$tmp];
		$value = $item_id;
		$Info[$line][$collectionHolder][$rule_id] = $value;
	}
	}
	}

}
echo "<tr>";
echo '<td><input type="button" onClick="window.open(\''.$url.'/item.php?key='.$key.'&item_id='.$Info[$line][$collection_id]['item_id'].'\')" value="'.$Info[$line][$collection_id]['label'].' (ID#'.$Info[$line][$collection_id]['item_id'].')"></td>';


foreach ($data[$line] as $col=>$value){
 if($col!=0 && $rules[$col]){
 
 $rule_id = $rules[$col];
 $subject_id = $ruleIds[$rule_id]['subject_id'];

	if($Info[$line][$subject_id][$rule_id.'_statement_id'] && $value) $ins = "<br /><font color='green'>inserted</font>";
	elseif($value)  $ins = "<br /><font color='red'>NOT inserted</font>";

	echo '<td>'.$value.$ins.'</td>';
}
}

echo '</tr>';

}				 
echo "</table>";
}
?>

</body>

<?php

function read_excel($file, $lowerize=TRUE)
	{
	
	$lines = file($file);
	
	for ($row=0; $row < count($lines); $row++) {
		 $rowdata = trim($lines[$row]);
		 if(!empty($rowdata))
		 $cells[$row] = explode(chr(9), $lines[$row]);
		 

	}
	if($lowerize)
			{foreach ( $cells[0] as $tmp) {
				
				$lowercells[0][] = strtolower(trim($tmp));
			 }
			
			$cells[0] = array_filter($lowercells[0]);
			}

	return ($cells);	
	}

function itemReference($collection, $notes, $url, $key, $repeat=FALSE)
{
	if(!$repeat){
	$s3ql=compact('url','key');
	$s3ql['from']='items';
	$s3ql['where']['collection_id']=$collection;
	$s3ql['where']['notes']=$notes;
	$item_data = S3DBCall($s3ql);
	if($item_data[0]['item_id'])
		$item_id = $item_data['item_id'];
	}
	
	 if(!$item_id){
		$s3ql=compact('url','key');
		$s3ql['insert']='item';
		$s3ql['where']['collection_id']=$collection;
		$s3ql['where']['notes']=$notes;
		$item_data = S3DBCall($s3ql);
		if($item_data[0]['item_id'])
		 {$item_id = $item_data[0]['item_id'];}
	
	 }
	 if($item_id)
		 return ($item_id);
	 else {
		return (False);
	 }
}

function ruleReference($rule,$url, $key, $repeat=FALSE)
{
	$s3ql=compact('url','key');
	$s3ql['from']='rules';
	$s3ql['where']['rule_id']=$rule;
	
	$rule_data = S3DBCall($s3ql);
	if($rule_data)
		return ($rule_data);
	else {
		return (False);
	}
	
}
?>

</body>