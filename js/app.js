'use strict';

var app = (function() {

    function init(containerId) {
        var contentList = document.getElementById(containerId);
        contentList.addEventListener('click', _listHandler);
    }

    function _listHandler(e) {
        alert('Hola');
        var target = e.target;

        var liElement = target.parentNode;
        if (liElement) {
            var id = liElement.dataset.id;
            if (id) {
                alert('Se le dio en ' + id);
            }
        }
    }

    function getUsedSpace(containerId) {
        var sdcard = navigator.getDeviceStorage('sdcard');

        var request = sdcard.usedSpace();

        request.onsuccess = function () {
            // The result is expressed in bytes, lets turn it into megabytes
            var size = request.result / 1048576;
            var message = "(" + size.toFixed(2) + " MB used)";

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
        var cursor = sdcard.enumerate(root);

        cursor.onsuccess = function () {
            // Once we found a file we check if there are other results
            // Then we move to the next result, which calls the cursor
            // success possibly with the next file as result.
            if (!this.done) {
                var file = this.result;
                console.log("File %s of type '%s' was last modified on %s", file.name, file.type, file.lastModifiedDateDate);

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
            $('<a>',{href: '#'}).append(
                    $('<p>', {text: element.name})
                ).append(
                    $('<p>', {text: _printFileType(element)})
                );
        var li = $('<li>', {'data-id': element.name});
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
        init: init,
        getUsedSpace: getUsedSpace,
        printDirectory: printDirectory
    }
})();
