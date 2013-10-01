$(function() {
    $("#get-battery").click(function() {
    	var sdcard = navigator.getDeviceStorage('sdcard');

		var request = sdcard.usedSpace();

		request.onsuccess = function () {
		  // The result is express in bytes, lets turn it into megabytes
		  var size = this.result / 1000000;

          $("#battery-pct").text(Math.round(size));

		  console.log("The videos on your device use a total of " + size.toFixed(2) + "Mo of space.");
		}

		request.onerror = function () {
          $("#battery-pct").text('Error');

		  console.warn("Unable to get the space used by videos: " + this.error);
		}
    });
});