<?php

header("Content-Type: application/json", true);
  
/**
* Private Methods
*/
function _getOneLocation($long, $lant)
{
	$DBhost = "localhost";
	$DBuser = "lyriacom_meo";
	$DBpass = "rhome123*";
	$DBname = "lyriacom_meobytes";

	$dbConnection = mysql_connect($DBhost, $DBuser, $DBpass) or die("Unable to connect to host $DBhost");
	@mysql_select_db("$DBname") or die("Unable to select database $DBname");

	if ($dbConnection)
	{	
		// Build our Query
		$query = "SELECT * FROM positions p JOIN events e ON p.eventId = e.eventId WHERE latitude = $long AND longitude = $lant LIMIT 1";

		// Perform Query
		$result = mysql_query($query);
	
		// Check result
		// This shows the actual query sent to MySQL, and the error. Useful for debugging.
		if (!$result) 
		{
			die("there was an error with the query");
		}
		
		// Use result
		// Attempting to print $result won't allow access to information in the resource
		// One of the mysql result functions must be used
		// See also mysql_result(), mysql_fetch_array(), mysql_fetch_row(), etc.
		$row = mysql_fetch_row($result);
		
		mysql_free_result($result);
		mysql_close($dbConnection);
		
		return $row;
	}
	else
	{
		return -1;
	}
}

if(isset($_POST))
{
	$long = $_POST["longitude"];
	$lant = $_POST["latitude"];
	
    $success = _getOneLocation($long, $lant);

	echo json_encode(array("success" => 1, "data" => $success));
}

?>