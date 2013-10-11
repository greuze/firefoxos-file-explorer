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
    container.text(contents); // NICE: Better way to delete element

//    var li = document.createElement('li');
//    container.appendChild(li);
//
//    var a = document.createElement('a');
//    li.appendChild(a);
//
//    var p1 = document.createElement('p');
//    var text1 = document.createTextNode('aaa.xxx');
//    p1.appendChild(text1);
//    a.appendChild(p1);
//
//    var p2 = document.createElement('p');
//    var text2 = document.createTextNode('xxx file');
//    p2.appendChild(text2);
//    a.appendChild(p2);
}
