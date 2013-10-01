$(function() {
    function getUsedSpace(container) {
        var sdcard = navigator.getDeviceStorage('sdcard');

        var request = sdcard.usedSpace();

        request.onsuccess = function () {

            // The result is expressed in bytes, lets turn it into megabytes
            var size = request.result / 1048576;

            var message = "(" + Math.round(size) + " MB used)";

            $(container).text(message);

            console.log("The space used is " + size.toFixed(2) + "MB.");
        };

        request.onerror = function () {

            $(container).text('Error');

            console.warn("Unable to get the used space: " + this.error);
        };
    }

    getUsedSpace("#header-info");
});