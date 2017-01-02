var resultDiv;

document.addEventListener("deviceready", init, false);
function init() {
	document.querySelector("#startScan").addEventListener("touchend", startScan, false);
	resultDiv = document.querySelector("#results");
}

function startScan() {
	
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			//var s = "Result: " + result.text + "<br/>" +
			//"Format: " + result.format + "<br/>" +
			//"Cancelled: " + result.cancelled;
			//resultDiv.innerHTML = s;
			  alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
			getBookDetails(result.text,false,function(){$.mobile.changePage('#first')});			
		}, 
		function (error) {
			alert("Scanning failed: " + error);
		}
	);

}