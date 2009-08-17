<?php
include('S3QLgoodies.php');

$cells =  read_excel('DFT_test.txt');
$header=$cells[0];


##Now that excel has been read, make the connection to S3DB

$project_id = '530';
$url = 'http://ibl.mdanderson.org/edu';
$key='olafarrusco';


##Find ALL collections
list($collections, $collection_names, $collection_ids) = findCollections($url,$key, $project_id);

#Find ALL the rules
list($rules, $ruleSubs, $ruleVerbs, $ruleObjs, $ruleIds) = findRules($url,$key, $project_id);


##INSERTING ANTIBIOGRAM FIRST
#Now, for each rule, find all those that concern antibiotic, this means find the rules where the subject_id is the same as the one for collection_id of antibiotic

#Find antibiogram collection id
$atbCollection=$collection_ids[array_search('antibiogram database', $collection_names)];

#Find sample collection id
$splCollection = $collection_ids[array_search('sample',$collection_names)];

#Find isolate collection id
$isoltCollection = $collection_ids[array_search('isolate',$collection_names)];

#Find rules of antibiogram
list($atbRule, $atbVerb, $atbObj) = findRulesBySubject($atbCollection, $rules);
$atbList = array_unique($atbObj);

#Find rules of Sample
list($splRule, $splVerb, $splObj) = findRulesBySubject($splCollection, $rules);

#Find rules of Isolate
list($isltRule, $isltVerb, $isltObj) = findRulesBySubject($isoltCollection, $rules);


#Now find the equivalent data on Excel
#Find the cols with data on antibiotics
$atbCols = array_intersect($header, $atbList);

##Find cols with data on species
$speciesCol = excelFindColl('species', $header);

##Find the isolate cols on excel - because this value wil lbe used as not for the antibiogram
$isolateCol = excelFindColl('isolate', $header);

#Find the Sample on Excel
$sampleCol =  excelFindColl('sample', $header);

#Find the PFGE on Excel
$pfgeCol =  excelFindColl('pfge type', $header);

#Find the CC on Excel
$ccCol =  excelFindColl('cc', $header);

#Now for the attributes (Rules)
#findd the col for date of sampling in excel
$dateSamplingCol = excelFindColl('date of sampling', $header);

$report='<table border=2>';

###
##line 1 start the lines loop 

$line=1;

for ($line=1; $line <count($cells)-1 ; $line++) {
	
##################################################################################
##Insert item for antibiogram
$isolateLabel = $cells[$line][$isolateCol];
$atbItem_id = insertItem($url, $key, $atbCollection, $isolateLabel);

if($atbItem_id!='')
$report .= '<tr style="color: #99CC00"><td>antibiogram '.$isolateLabel.' inserted with ID '.$atbItem_id.'</td></tr>';
else
$report .= '<tr style="color: #FF0909"><td>antibiogram '.$isolateLabel.' NOT INSERTED</td></tr>';

##To know the rules where to insert the attributes for antibiogram, we need to knwo the species
$speciesLabel=$cells[$line][$speciesCol];

##Find atb for this species
$atbSpecies = array_intersect($atbVerb, array(strtolower($speciesLabel)));


##Find and insert the antibiogram Rules
foreach ($atbCols as $excelCol=>$atbName) {
	#find the rule based on the object(antibiotic)
	foreach ($atbSpecies as $atbInd=>$speciesName) {
	 if($atbObj[$atbInd]==$atbName)
		{
	 	$rule_id = $atbRule[$atbInd];
		}
	   
	}
	
	##Insert the statement for this rule in the antibiogram
	if($rule_id!=''){
	$statInserted = insertStatement($url, $key, $atbItem_id, $rule_id, $cells[$line][$excelCol]);
	}
}
#############################################################################
##ANTIBIOGRAM DONE!!! YES!!!

#####################
#Now insert Sample

#Insert an Item for Sample
$itemSampleId = insertItem($url, $key, $splCollection, $cells[$line][$sampleCol]);

##Find the rule for date of sampling based on object
$dateSamplingRuleId= $ruleIds[array_search('date of sampling', $ruleObjs)];
$dateSamplingValue = $cells[$line][$dateSamplingCol];

#Insert statement for Sample date of Sampling
 $dateSamplingInserted = insertStatement($url, $key, $itemSampleId,$dateSamplingRuleId,$cells[$line][$dateSamplingCol]); 

#Now find the rule for sample id
$codeRuleId= $splRule[array_search('code', $splObj)];
$codeValue = $cells[$line][$sampleCol];

#Insert statement for Sample code of Sample
$dateSamplingInserted = insertStatement($url, $key, $itemSampleId,$codeRuleId,$codeValue); 

##############################################################################
##Sample Done
##Insert Isolate
#Insert an Item for Isolate
$itemIsolateId = insertItem($url, $key, $isoltCollection, $cells[$line][$isolateCol]);

#Find the rule for isolate species
$isltSpeciesRuleId = $isltRule[array_search('species', $isltObj)];
$isltSpeciesValue = $cells[$line][$speciesCol];

#Insert statement for isolate species
$isltSpeciesInserted = insertStatement($url, $key, $itemIsolateId,$isltSpeciesRuleId, $isltSpeciesValue);

#Find the rule for isolate PFGE Type
$isltPFGERuleId = $isltRule[array_search('pfge type', $isltObj)];
$isltPFGEValue =  $cells[$line][$pfgeCol];

#Insert statement for isolate pfge
$isltPFGEInserted = insertStatement($url, $key, $itemIsolateId,$isltPFGERuleId, $isltPFGEValue);

#Find the rule for isolate CC
$isltCCRuleId = $isltRule[array_search('mlst cc', $isltObj)];
$isltCCValue =  $cells[$line][$ccCol];

#Insert statement for isolate cc
$isltCCInserted = insertStatement($url, $key, $itemIsolateId,$isltCCRuleId, $isltCCValue);

#Find the rule for isolate Sample
$isltSampleRuleId = $isltRule[array_search('sample', $isltObj)];
$isltSampleValue =  $itemSampleId;

#Insert statement for isolate Sample
$isltSampleInserted = insertStatement($url, $key, $itemIsolateId,$isltSampleRuleId , $isltSampleValue);

#Find the rule for isolate Antibiogram Database
$isltAtbRuleId = $isltRule[array_search('antibiogram database', $isltObj)];
$isltAtbValue =  $atbItem_id;

#Insert statement for isolate Antibiogram Database
$isltSampleInserted = insertStatement($url, $key, $itemIsolateId,$isltAtbRuleId , $isltAtbValue);


}
$report .= '</table>';
echo $report;

function read_excel($file, $lowerize=TRUE)
	{
	
	$lines = file($file);
	
	for ($row=0; $row < count($lines); $row++) {
		 
		 $cells[$row] = explode(chr(9), $lines[$row]);
		 

	}
	if($lowerize)
			{foreach ( $cells[0] as $tmp) {
				$lowercells[0][] = strtolower($tmp);
			 }
			$cells[0] = $lowercells[0];
			}

	return ($cells);	
	}

function insertStatement($url, $key, $item_id, $rule_id, $value)
	{
	if($item_id!='' && $rule_id!='' && $value!=''){
	$s3ql=compact('url','key');
	$s3ql['format']='php';
	$s3ql['insert']='statement';
	$s3ql['where']['item_id']=$item_id;
	$s3ql['where']['rule_id']=$rule_id;
	$s3ql['where']['value']=trim($value);
	
	$statementInserted = S3DBCall($s3ql);
	return ($statementInserted);
	}
	else {
		return (False);
	}
	  
	}

function excelFindColl($needle, $haystack)
	{
		$col = array_search($needle, $haystack);
		return ($col);
	}


?>