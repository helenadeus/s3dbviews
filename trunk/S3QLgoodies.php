<?php
#Use this script to make a call on S3DB with a simple structured array:
#Helena F Deus (helenadeus@gmail.com), Aug 13 2007
#This script is distributed under the GNU general public license (http://www.gnu.org/copyleft/gpl.html)

//$s3ql = array('url'=>'http://ibl.mdanderson.org/s3dbdemo3','key'=>'6OhmdK6M5KNVScq','select'=>'*','from'=>'projects','format'=>'php');
//$data = S3DBcall($s3ql); 
//var_dump($data);
ini_set('memory_limit','300M');
set_time_limit(30000);
function S3DBcall($s3ql)
{#S3DBcall takes in an array formatted in S3QL terms (for exmaple, $s3ql = array('url','http://ibl.mdanderson.org/s3db','key','xxxxxx','select','*','from','projects');)
#and return the output from s3db parsed in an array
if($s3ql['format']!='php') $s3ql['format']='php';
$url = S3QLquery($s3ql);
#echo $url;
$h = fopen($url,'r');
while(!$h){
	$h = fopen($url,'r');
}
$data = stream_get_contents($h);
return (array($url,unserialize($data)));
	
}
function S3QLquery($s3ql)

	{
	#Function S3QLquery builds the S3QL query for any remote uri
	#INPUT: $s3ql is an array with at least key
	#OUTPUT: a string, containing the URI with the information on the input element UID 
	#Helena F Deus

	if($s3ql['url']=='')
	if ($_SERVER['HTTP_X_FORWARDED_HOST'] != '') 
		$s3ql['url'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
	else $s3ql['url'] = $_SERVER['HTTP_HOST'];


	$wrap .= $s3ql['url'].'/S3QL.php';
	
	if ($s3ql['user_id']!='') {
		$wrap .= '?user_id='.$s3ql['user_id'];
	}
	if ($s3ql['format']!='') {
		$wrap .= (($s3ql['user_id']!='')?'&':'?').'format='.$s3ql['format'];
			
	}
	
	$wrap .= (($s3ql['user_id']=='' && $s3ql['format']=='')?'?':'&').'query=<S3QL>';
	$wrap .= '<key>'.$s3ql['key'].'</key>';

	#remove the elements already used to build the query, keep the rest
	$s3ql = array_diff_key($s3ql, array('url'=>'', 'key'=>'', 'db'=>'','user_id'=>'','format'=>''));

	foreach($s3ql as $field=>$value)
		{
		if(!is_array($s3ql[$field])) #if is not an array, just build the simple xml
		$wrap .= '<'.$field.'>'.$s3ql[$field].'</'.$field.'>';
		else #for arrays, build the nested xml
		{$wrap .= '<'.$field.'>';
		foreach($value as $subfield=>$subvalue)
			{
			$wrap .= '<'.$subfield.'>'.$subvalue.'</'.$subfield.'>';
			}
		$wrap .= '</'.$field.'>';
		}
		}
	$wrap .= '</S3QL>';
	
	


	return $wrap;
	}
 function html2cell($html)
	{
	#Parse what's inside the table in $html into a nice PHP array
	#Helena F Deus
	
	if (eregi('<TABLE>(.*)</TABLE>', $html, $table_contents)) {
		#parse teh lines
		
		if (eregi('<TR>(.*)</TR>',$table_contents[1], $row_contents)) {
			
			
			
			#$row = explode('<TR>', $row_contents[0]);
			$row = spliti('<TR>', $row_contents[0]);
			
			$row = array_filter($row);#explode has this annoying habit of adding empty values
			
			
			
			foreach ($row as $rowi=>$a_row) {
			#remove </tr>
			
			$a_row = str_ireplace('</TR>', '', $a_row);
			
			
			#parse teh cells
			if (eregi('<TD>(.*)</TD>', $a_row, $cell_contents)) {
				
				
				$cells[$rowi] = spliti('<TD>', $cell_contents[1]);
				
				#remove emptyes
				$cells[$rowi] = array_filter($cells[$rowi]);

				
				#remove the /td
				$cells[$rowi] = array_filter($cells[$rowi]);
				
				foreach ($cells[$rowi] as $col=>$a_cell) {
					
					$a_cell = str_ireplace('</TD>', '', $a_cell);
					$cells[$rowi][$col] = $a_cell;
					if ($rowi>1) {
						$cells[$rowi][trim($cells[1][$col])] = $a_cell;
					}
				}
				
				
			}
			else {
				return ('No cells');
			}
			}
			
		}
		else {
				return ('No rows');
			}
	}
	else {
		'No html tables found';
	}

	
	return ($cells);
	}

function move2s3db($file, $url,$key,$rule_id,$item_id)
	{
	#move2s3db reads a file, breaks it in pieces, sends teh individual pieces to S3DB and insert the file on S3DB through a statement.
	$s3ql=compact('url','key');	

	$time=time();
	$size = filesize($file);
	$name= basename($file);
	#now let s3db now that a file is coming
	$url = $s3ql['url'].'/uploads.php?key='.$s3ql['key'].'&filename='.$name.'&filesize='.$size.'&format=php';
	$now=date('His');

	#Try open for 3 sec
	while (!$c &&  date('His')-$now<3) {
		$c = @stream_get_contents(@fopen($url,'r'));	
	}

	$filekey=unserialize($c);
	$filekey = $filekey[0]['filekey'];
	$a = @fopen($file,'r');
	$Mb = 5000;
	#$Mb=200;
	$f=0;
	$fraNr=1;
	$fragTotal =  ceil($size/$Mb);

	while ($f<$size) {
		#open and read the file up to 1Mb
		
		$frag = urlencode(base64_encode(fread($a, $Mb)));
		$url = $s3ql['url'].'/uploads.php?filekey='.$filekey.'&fragNr='.$fraNr.'/'.$fragTotal.'&encode=2&fileStr='.$frag.'&format=php';
		
		
		$now=date('His');
		unset($d);
		while (!$d &&  date('His')-$now<3) {
			$d = @stream_get_contents(@fopen($url,'r'));
		}
			
		$success= unserialize($d);
		#echo $url;
		#echo '<pre>';print_r($success);
		if($success[0]['error_code']=='0'){
		$f = $f+$Mb;
		$fraNr++;
		}
		else {
			echo "Could not upload file ".$filename.". It may be corrupted or non-accessible";
			exit;
		}
		
	}

	#Now insert a statement

	$s3ql['insert']='file';
	$s3ql['where']['rule_id']=$rule_id;
	$s3ql['where']['item_id']=$item_id;
	$s3ql['where']['filekey']=$filekey;

	list($url, $data)=S3DBcall($s3ql);
	#echo '<pre>';print_r($data);
	return ($data);

	}

function findCollections($url,$key, $project_id)
	{
		
	$s3ql=compact('url','key');
	$s3ql['select']='*';
	$s3ql['from']='collections';
	$s3ql['where']['project_id']=$project_id;
	list($url, $collections)=S3DBCall($s3ql);
	foreach ($collections as $collections_info) {
		$collection_names[] =  strtolower($collections_info['name']);
		$collection_ids[] =  $collections_info['collection_id'];

	}
	return (array($collections, $collection_names, $collection_ids));
	}

function findRules($url,$key, $project_id)
	{
		

	$s3ql=compact('url','key');
	$s3ql['select']='*';
	$s3ql['from']='rules';
	$s3ql['where']['project_id']=$project_id;

	list($q, $rules) = S3DBCall($s3ql);

	#Now make a list of rule subject, verbs, object and rule_ids
	foreach ($rules as $rule_info) {
		 $ruleSubs[] = strtolower($rule_info['subject']);
		 $ruleVerbs[] = strtolower($rule_info['verb']);
		 $ruleObjs[] = strtolower($rule_info['object']);
		 $ruleIds[] = $rule_info['rule_id'];
	}
	 return(array($rules, $ruleSubs, $ruleVerbs, $ruleObjs, $ruleIds));
	}

function findRulesBySubject($subject, $rules)
	{
	foreach ($rules as $rule_info) {
		if($rule_info['subject_id']==$subject){
		$atbRule[] =$rule_info['rule_id'];
		$atbVerb[] =strtolower($rule_info['verb']);
		$atbObj[] =strtolower($rule_info['object']);
		}
	}
	return (array($atbRule, $atbVerb, $atbObj));
	}

function insertItem($url, $key, $collection_id, $notes, $repeat=False)
	{
	##First let's check if item with these notes already exists
	if(!$repeat){
	$s3ql=compact('url','key');
	$s3ql['format']='php';
	$s3ql['from']='items';
	$s3ql['where']['notes']=$notes;
	$s3ql['where']['collection_id']=$collection_id;
	list($u, $item_info) = S3DBcall($s3ql);
	
	if($item_info[0]['item_id']!='') 
		$Item_id = $item_info[0]['item_id'];
	}
	
	if($Item_id ==''){
	$s3ql=compact('url','key');
	$s3ql['format']='php';
	$s3ql['insert']='item';
	$s3ql['where']['notes']=$notes;
	$s3ql['where']['collection_id']=$collection_id;

	list($u, $Inserted) = S3DBcall($s3ql);
	
	$Item_id = $Inserted[0]['item_id'];
	}
	
	return ($Item_id);
	}

function insertStatement($url, $key, $item_id, $rule_id, $value)
	{
	##First let's check if item with these notes already exists
	
	$s3ql=compact('url','key');
	$s3ql['format']='php';
	$s3ql['insert']='statement';
	$s3ql['where']['item_id']=$item_id;
	$s3ql['where']['rule_id']=$rule_id;
	$s3ql['where']['value']=$value;
	
	list($u, $inserted) = S3DBcall($s3ql);
	 
	 
	if( $inserted[0]['statement_id']!='') 
		$statement_id= $inserted[0]['statement_id'];
		return (true);
	}
?>