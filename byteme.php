<?php

header("Content-Type: application/json", true);
  
/**
* Private Methods
*/
function _saveLocation($long, $lant, $alt)
{
	$DBhost = "qs4356.pair.com";
	$DBuser = "gbpdp_9";
	$DBpass = "RZNBdpcL";
	$DBname = "gbpdp_gbd";


	$dbConnection = mysqli_connect($DBhost, $DBuser, $DBpass) or die("Unable to connect to host $DBhost");
	@mysqli_select_db($dbConnection, $DBname) or die("Unable to select database $DBname");

	if ($dbConnection)
	{	
		$a = (float) $long;
		$b = (float) $lant;
		$c  = (integer) $alt;

		$results = array();
		$query = "INSERT INTO positions (userId, latitude, longitude, altitude, positionTimeStamp) VALUES (1, $b, $a, $c, CURRENT_TIMESTAMP);";
		
		mysqli_query($dbConnection, $query);

		mysqli_close($dbConnection);
		
		return 1;
	}
	else
	{
		return -1;
	}
}

if(isset($_POST) && !empty($_POST) && is_array($_POST))
{
	$data = $_POST["mydata"];
	$geoPosition = $data["coords"];

	$long = $geoPosition["longitude"];
	$lant = $geoPosition["latitude"];
	$altitude = $geoPosition["altitude"];

	//Do something with the accuracy. If not accurate enough it could wait for a better one..
	$accuracy = $geoPosition["accuracy"];

	//if($accuracy <= 15)
	//{
		$success = _saveLocation($long, $lant, $altitude);
	//}
	//else
	//{
	//	$success = -1;
	//}

	echo json_encode($success);
}

else { echo 'no post'; }

?>
