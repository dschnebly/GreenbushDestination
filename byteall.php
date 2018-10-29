<?php

header("Content-Type: application/json", true);
  
/**
* Private Methods
*/
function _allMarkers()
{
	$DBhost = "qs4356.pair.com";
	$DBuser = "gbpdp_9";
	$DBpass = "RZNBdpcL";
	$DBname = "gbpdp_gbd";

	$dbConnection = mysqli_connect($DBhost, $DBuser, $DBpass) or die("Unable to connect to host $DBhost");
	@mysqli_select_db($dbConnection, $DBname) or die("Unable to select database $DBname");

	if ($dbConnection)
	{	
		// Build our Query
		$query = "SELECT * FROM positions p JOIN events e ON p.eventId = e.eventId;";
	
		// Perform Query
		$result = mysqli_query($dbConnection, $query);
	
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
		$positions = array();
		while ($row = mysqli_fetch_assoc($result)) 
		{
			$positions [] = $row;
		}
		
		mysqli_free_result($result);
		mysqli_close($dbConnection);
		
		return $positions;
	}
	else
	{
		return -1;
	}
}

if(isset($_POST))
{

	$success = _allMarkers();
	
	if($success > 0)
	{	
		echo json_encode(array("success" => 1, "data" => $success));
	}
	else
	{
		echo json_encode(array("success" => -1,));
	}
}

else { echo 'no post'; }

?>
