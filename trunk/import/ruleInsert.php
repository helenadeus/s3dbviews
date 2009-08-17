<script type="text/javascript" src='../json_read.js'></script>
<script type="text/javascript" src='../s3qlCode.js'></script>
<script type="text/javascript" src='../arrayCode.js'></script>
<script type="text/javascript" src="../ruleBuilder.js"></script>
<script type="text/javascript" src="sylvester.src.js"></script>

<body bgcolor="#F8FFDF">
<?php
ini_set('display_errors','0');
if($_REQUEST['su3d'])
ini_set('display_errors','1');

##script to import statements given a line header of rules and items as the remaining lines
##Helena F Deus (helenadeus@gmail.com)

include_once('../S3QLgoodies.php');
echo "<font color='#339900' font='verdana' style='bold'>S3DB Rule Insert From</font>";

if($_REQUEST['url']=='' || $_REQUEST['key']=='' || $_REQUEST['project_id']==''){

include('../loginForm.php');

}

else{


$url = $_REQUEST['url'];
$key= $_REQUEST['key'];
$project_id = $_REQUEST['project_id'];
$filename=	$_FILES['file']['name'];

#$filename = 'Antibiogramdatabase.txt';
if(!@copy($_FILES['file']['tmp_name'], $filename))
	{
	echo "File was NOT imported. Please <a href='".$_SERVER['PHP-SELF']."'>try again</a>.";
	exit;
	}
insertRules($url,$key, $project_id,$verbCollectionID, $filename);
}
function insertRules($url,$key, $project_id,$verbCollectionID=null, $filename)
	{
		

	$s3ql = array('url'=>$url,'key'=>$key,'select'=>'*','from'=>'collections','where'=>array('project_id'=>$project_id),'format'=>'php');
	list($urlQ,$collection) = S3DBcall($s3ql);

	$allcollections=array();
	$allids=array();
	for ($j=0;$j<count($collection);$j++)
	{
	array_push($allcollections, $collection[$j]['name']);
	array_push($allids, $collection[$j]['collection_id']);
    if(!$verbCollectionID &&  $collection[$j]['name']=='s3dbVerb')
	{$verbCollectionID = $collection[$j]['collection_id'];}

	}

	$s3ql = array('url'=>$url,'key'=>$key,'select'=>'*','from'=>'items','where'=>array('collection_id'=>$verbCollectionID),'format'=>'php');

	list($urlQ,$verbs) = S3DBcall($s3ql);
	$allverbs = array();
	$allverbIds=array();
	for ($k=0;$k<count($verbs);$k++)
	{
	array_push($allverbs, $verbs[$k]['notes']);
	array_push($allverbIds, $verbs[$k]['item_id']);

	}

	$c=file($filename);

	
	###A little bit of html .. to amke it prettier
	echo "<table>";
	for ($i=0; $i<=count($c); $i++) {
		
	$d=explode(chr(9),$c[$i]);

	if(trim($d[0])!='' && trim($d[1])!='' && trim($d[2])!=''){
	if(!in_array($d[0],$allcollections)) {


	$s3ql = array('url'=>$url,'key'=>$key, 'insert'=>'collection','where'=>array('project_id'=>$project_id,'name'=>urlencode($d[0])),'format'=>'php');

	list($urlQ,$collection_inserted) = S3DBcall($s3ql);
	array_push($allcollections, $collection_inserted['collection_id']);
	array_push($allids, $d[0]);
	}
	$subject_id=$allids[array_search($d[0], $allcollections)];
	$object_id='';
	#$object_id=$allids[array_search($d[3], $allcollections)];
	
	if(in_array($d[2], $allcollections))
	{
	$object_id=$allids[array_search($d[2], $allcollections)];
	}
	if(in_array($d[1], $allverbs)){
	$verb_id = $allverbIds[array_search($d[1], $allverbs)];
	}
	if($object_id=='')
		{
		$s3ql = array('url'=>$url,'key'=>$key, 'insert'=>'rule','where'=>array('project_id'=>$project_id,'subject_id'=>$subject_id, 'object'=>trim(urlencode($d[2]))),'format'=>'php');
		}
	else {
		$s3ql = array('url'=>$url,'key'=>$key, 'insert'=>'rule','where'=>array('project_id'=>$project_id,'subject_id'=>$subject_id, 'object_id'=>$object_id),'format'=>'php');

	}
	if($verb_id=='')
		{
		$s3ql['where']['verb']=urlencode($d[1]);
	}
	else {
		$s3ql['where']['verb_id']=$verb_id;	
	}
	
	list($url,$rule_inserted) = S3DBcall($s3ql);
	#$rule_inserted = unserialize($rule_inserted);
	#echo $url;
	#echo '<pre>';print_r($rule_inserted);exit;
	echo "<tr style='background-color: #F2FFFF'>";
		echo '<td>'.$d[0].'</td><td>'.$d[1].'</td><td>'.$d[2].'</td>';
		if($rule_inserted[0]['error_code']=='0')
			echo '<td style="color: green">INSERTED</td>';
		else {
			echo '<td style="color: red">NOT INSERTED (S3DB Reports: '.$rule_inserted[0]['message'].')</td>';
		}
	echo "</tr>";
	}

	}
	echo "</table>";
	}
?> 