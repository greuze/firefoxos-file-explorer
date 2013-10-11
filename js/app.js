function getUsedSpace(containerId) {
    var sdcard = navigator.getDeviceStorage('sdcard');

    var request = sdcard.usedSpace();

    request.onsuccess = function () {

        // The result is expressed in bytes, lets turn it into megabytes
        var size = request.result / 1048576;

        var message = "(" + Math.round(size) + " MB used)";

        $('#' + containerId).text(message);

        console.log("The space used is " + size.toFixed(2) + "MB.");
    };

    request.onerror = function () {

        $('#' + containerId).text('Error');

        console.warn("Unable to get the used space: " + this.error);
    };
}

function getDirectoryContents(root, next) {
    next(
        [
            {'name': 'new Dir'},
            {'name': 'File_with_no_icon.xxx'},
            {'name': 'My Document.doc'},
            {'name': 'My Document.pdf'}
        ]
    );

//    var sdcard = navigator.getDeviceStorage('sdcard');
//
//// Let's retrieve files from last week.
//    var param = {
//        since: new Date((+new Date()) - 7*24*60*60*1000)
//    }
//
//    var cursor = sdcard.enumerate(param);
//
//    cursor.onsuccess = function () {
//
//        if (!this.result) {
//            var file = this.result;
//            console.log("File updated on: " + file.lastModifiedDate);
//
//            // Once we found a file we check if there are other results
//            // Then we move to the next result, which calls the cursor
//            // success possibly with the next file as result.
//            this.continue();
//        }
//    }
}

function printDirectoryContents(containerId, contents) {
    var container = $('#' + containerId);
    container.text(''); // NICE: Better way to delete element

    for (var i in contents) {
        container.append(
            $(document.createElement('li')).append(
                $(document.createElement('a')).append(
                        $(document.createElement('p')).append(
                            $(document.createTextNode(contents[i].name))
                        )
                    ).append(
                        $(document.createElement('p')).append(
                            $(document.createTextNode('file'))
                        )
                    )
            )
        );
    }
}
