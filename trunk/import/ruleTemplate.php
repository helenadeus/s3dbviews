<?php
#rule Template - a tab separated file with first line rule id
include('../S3QLgoodies.php');
$url = $_REQUEST['url'];
$key = $_REQUEST['key'];
$project_id = $_REQUEST['project_id'];

$s3ql=compact('url','key');
$s3ql['select']='rule_id,subject,verb,object';
$s3ql['from']='rules';
$s3ql['where']['project_id']=$project_id;
$s3ql['format']='php';
$rules = S3DBCall($s3ql);

foreach ($rules[1] as $rule_info) {
	$rule_ids[] = $rule_info['rule_id'];
	$subjects[] = $rule_info['subject'];
	$verb[] = $rule_info['verb'];
	$object[] = $rule_info['object'];
}
$str .= chr(9);

foreach ($rule_ids as $rule_id) {
	$str .= $rule_id;
	if($rule_id !=end($rule_ids))
		$str .= chr(9);
	
	
}

$str .= chr(10);
$str .= chr(9);
foreach ($subjects as $rule_id) {
	$str .= $rule_id;
	if($rule_id !=end($rule_ids))
		$str .= chr(9);
	
	
}
$str .= chr(10);
$str .= chr(9);
foreach ($verb as $rule_id) {
	$str .= $rule_id;
	if($rule_id !=end($rule_ids))
		$str .= chr(9);
	
	
}
$str .= chr(10);
$str .= chr(9);

foreach ($object as $rule_id) {
	$str .= $rule_id;
	if($rule_id !=end($rule_ids))
		$str .= chr(9);
	
	
}
$str .= chr(10);

// We'll be outputting a PDF
header('Content-type: application/excel');

// It will be called downloaded.pdf
header('Content-Disposition: attachment; filename="template'.$project_id.'.xls"');

echo $str;

?>