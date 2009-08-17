<?php

include_once('S3QLgoodies.php');

$url = 'http://ibl.mdanderson.org/edu';
$key= 'aOOJK3qQRS10gpg';
$project_id = 530;
$verbCollectionID = 534;
$filename = 'Antibiogramdatabase.txt';

insertRules($url,$key, $project_id,$verbCollectionID, $filename);

function insertRules($url,$key, $project_id,$verbCollectionID, $filename)
{
	

$s3ql = array('url'=>$url,'key'=>$key,'select'=>'*','from'=>'collections','where'=>array('project_id'=>$project_id),'format'=>'php');
list($urlQ,$collection) = S3DBcall($s3ql);

$allcollections=array();
$allids=array();
for ($j=0;$j<count($collection);$j++)
{
array_push($allcollections, $collection[$j]['name']);
array_push($allids, $collection[$j]['collection_id']);

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
for ($i=0; $i<=count($c); $i++) {
	
$d=explode(chr(9),$c[$i]);

if($d[0] && $d[1] && $d[2]){
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
	$s3ql = array('url'=>$url,'key'=>$key, 'insert'=>'rule','where'=>array('project_id'=>$project_id,'subject_id'=>$subject_id, 'object'=>trim($d[2])),'format'=>'php');
	}
else {
	$s3ql = array('url'=>$url,'key'=>$key, 'insert'=>'rule','where'=>array('project_id'=>$project_id,'subject_id'=>$subject_id, 'object_id'=>$object_id),'format'=>'php');

}
if($verb_id=='')
	{
	$s3ql['where']['verb']=$d[1];
}
else {
	$s3ql['where']['verb_id']=$verb_id;	
}
	  
list($url,$rules) = S3DBcall($s3ql);
}

}

}
?> 