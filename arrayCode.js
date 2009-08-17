function is_array(mixed_var)
{	// see http://kevin.vanzonneveld.net/techblog/article/phpjs_licensing/
	//copyright 2008 Kevin van Zonneveld.
	return(mixed_var instanceof Array);
}

function is_string(mixed_var)
{  // see http://kevin.vanzonneveld.net/techblog/article/phpjs_licensing/
	//copyright 2008 Kevin van Zonneveld.
	return(typeof(mixed_var)=='string');

}

function is_numeric( mixed_var ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: David
    // *     example 1: is_numeric(186.31);
    // *     returns 1: true
    // *     example 2: is_numeric('Kevin van Zonneveld');
    // *     returns 2: false
    // *     example 3: is_numeric('+186.31e2');
    // *     returns 3: true
 
    return !isNaN( mixed_var );
}
function explode( delimiter, string, limit ) {
    // http://kevin.vanzonneveld.net
    // +     original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: kenneth
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: d3x
    // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: explode(' ', 'Kevin van Zonneveld');
    // *     returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}
    // *     example 2: explode('=', 'a=bc=d', 2);
    // *     returns 2: ['a', 'bc=d']
 
    var emptyArray = { 0: '' };
    
    // third argument is not required
    if ( arguments.length < 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined' )
    {
        return null;
    }
 
    if ( delimiter === ''
        || delimiter === false
        || delimiter === null )
    {
        return false;
    }
 
    if ( typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object' )
    {
        return emptyArray;
    }
 
    if ( delimiter === true ) {
        delimiter = '1';
    }
    
    if (!limit) {
        return string.toString().split(delimiter.toString());
    } else {
        // support for limit argument
        var splitted = string.toString().split(delimiter.toString());
        var partA = splitted.splice(0, limit - 1);
        var partB = splitted.join(delimiter.toString());
        partA.push(partB);
        return partA;
    }
}

function sleep(naptime){
      naptime = naptime * 1000;
      var sleeping = true;
      var now = new Date();
      var alarm;
      var startingMSeconds = now.getTime();
      
      while(sleeping){
         alarm = new Date();
         alarmMSeconds = alarm.getTime();
         if(alarmMSeconds - startingMSeconds > naptime){ sleeping = false; }
      }      
      
   }

  function array_push ( array ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_push(['kevin','van'], 'zonneveld');
    // *     returns 1: 3
 
    var i, argv = arguments, argc = argv.length;
 
    for (i=1; i < argc; i++){
        array[array.length++] = argv[i];
    }
 
    return array.length;
}

function array_unique( array ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +      input by: duncan
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_unique(['Kevin','Kevin','van','Zonneveld','Kevin']);
    // *     returns 1: ['Kevin','van','Zonneveld']
    // *     example 2: array_unique({'a': 'green', 0: 'red', 'b': 'green', 1: 'blue', 2: 'red'});
    // *     returns 2: {'a': 'Kevin', 0: 'van', 1: 'Zonneveld'}
 
    var p, i, j, tmp_arr = array;
    for(i = tmp_arr.length; i;){
        for(p = --i; p > 0;){
            if(tmp_arr[i] === tmp_arr[--p]){
                for(j = p; --p && tmp_arr[i] === tmp_arr[p];);
                i -= tmp_arr.splice(p + 1, j - p).length;
            }
        }
    }
 
    return tmp_arr;
}
function array_search( needle, haystack, strict ) {
    // Searches the array for a given value and returns the corresponding key if
    // successful
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_search/
    // +       version: 804.1712
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_search('zonneveld', {firstname: 'kevin', middle: 'van', surname: 'zonneveld'});
    // *     returns 1: 'surname'

    var strict = !!strict;

    for(var key in haystack){
        if( (strict && haystack[key] === needle) || (!strict && haystack[key] == needle) ){
            return key;
        }
    }

    return false;
}// }}}

  function array_combine( keys, values ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_combine([0,1,2], ['kevin','van','zonneveld']);
    // *     returns 1: {0: 'kevin', 1: 'van', 2: 'zonneveld'}
   
    var new_array = {}, keycount=keys.length, i;
 
    // input sanitation
    if( !keys || !values || keys.constructor !== Array || values.constructor !== Array ){
        return false;
    }
 
    // number of elements does not match
    if(keycount != values.length){
        return false;
    }
 
    for ( i=0; i < keycount; i++ ){
        new_array[keys[i]] = values[i];
    }
 
    return new_array;
}

function array_keys( input, search_value, strict ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
    // *     returns 1: {0: 'firstname', 1: 'surname'}

    var tmp_arr = new Array(), strict = !!strict, include = true, cnt = 0;

    for ( key in input ){
        include = true;
        if ( search_value != undefined ) {
            if( strict && input[key] !== search_value ){
                include = false;
            } else if( input[key] != search_value ){
                include = false;
            }
        }

        if( include ) {
            tmp_arr[cnt] = key;
            cnt++;
        }
    }

    return tmp_arr;
}