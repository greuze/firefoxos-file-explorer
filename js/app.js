'use strict';

var app = (function() {

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
            console.warn("Unable to get the used space: " + this.error.name);
        };
    }

    function printDirectory(root, containerId) {

        var container = $('#' + containerId);
        container.text(''); // NICE: Better way to delete element

        var sdcard = navigator.getDeviceStorage('sdcard');
        var cursor = sdcard.enumerate();

        cursor.onsuccess = function () {
            // Once we found a file we check if there are other results
            // Then we move to the next result, which calls the cursor
            // success possibly with the next file as result.
            if (!this.done) {
                var file = this.result;
                console.log("File " + file.name + " last modified " + file.lastModifiedDate);

                _printDirectoryElement(container, file);

                this.continue();
            }
        };

        cursor.onerror = function () {
            $('#' + containerId).text('Error');
            console.warn("Unable to get sd card cursor: " + this.error.name);
        };
    }

    function _printDirectoryElement(container, element) {
        var a =
            $('<a>',{href: "javascript:openElement('" + element.name + "');"}).append(
                    $('<p>', {text: element.name})
                ).append(
                    $('<p>', {text: _printFileType(element)})
                );
        var li = $('<li>');
        var icon = _printIcon(element);
        if (icon) {
            li.append(icon);
        }
        li.append(a);
        container.append(li);
    }

    function _printIcon(file) {
        var fileExtension = _getFileExtension(file.name);
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

    function _printFileType(file) {
        switch(_getFileExtension(file.name)) {
            case 'doc':
                return 'Word document';
            case 'pdf':
                return 'PDF file';
            default:
                return 'Unknown file'
        }
    }

    function _getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    function _isDirectory(file) {
        return file === '..' || file.lastIndexOf('.') === -1;
    }

    // TODO: Better effort
    function openElement(element) {
        if (_isDirectory(element)) {
            getDirectoryContents(element, function(contents) {
                printDirectoryContents("content-list", contents);
            });
        } else {
            alert('Clicked file ' + element);
        }
    }

    return {
        getUsedSpace: getUsedSpace,
        printDirectory: printDirectory
    }
})();
