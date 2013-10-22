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
            {'name': 'My text file.txt'},
            {'name': 'My text file2.txt'},
            {'name': 'My text file3.txt'},
            {'name': 'My Document2.doc'},
            {'name': 'My Document.pdf'},
            {'name': 'My text file4.txt'},
            {'name': 'My text file5.txt'},
            {'name': 'My text file6.txt'}
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
        printDirectoryElement(container, contents[i]);
    }
}

function printDirectoryElement(container, element) {
    var a =
        $('<a>').append(
            $('<p>', {text: element.name})
        ).append(
            $('<p>', {text: printFileType(element)})
        );
    var li = $('<li>');
    var icon = printIcon(element);
    if (icon) {
        li.append(icon);
    }
    li.append(a);
    container.append(li);
}

function printIcon(file) {
    var fileExtension = getFileExtension(file.name);
    switch (fileExtension) {
        case 'doc':
        case 'pdf':
            return $('<aside>', {class: 'pack-end'}).append(
                $('<img>', {alt: 'placeholder', src: 'img/' + fileExtension + '_16.png'})
            );
        default:
            return false;
    }
}

function printFileType(file) {
    switch(getFileExtension(file.name)) {
        case 'doc':
            return 'Word document';
        case 'pdf':
            return 'PDF file';
        default:
            return 'Unknown file'
    }
}

function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1);
}
