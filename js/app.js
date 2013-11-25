'use strict';

var app = (function() {

    var BYTES_PER_KILOBYTE = 1024;
    var BYTES_PER_MEGABYTE = 1048576;
    var BYTES_PER_GIGABYTE = 1073741824;

    var CONTENT_LIST_ID = 'content-list';
    var HEADER_INFO_ID = 'header-info';
    var ACTION_HEADER_ID = 'action-header';
    var ACTION_FORM_ID = 'action-form';
    var MENU_ID = 'menu';
    var STORAGE_FORM_ID = 'storage-form';
    var STORAGE_MENU_ID = 'storage-menu';

    var availableStorages;
    var currentStorage;
    var currentDir;
    var currentFile;

    // Initialize application, executen only once
    function init() {
        availableStorages = navigator.getDeviceStorages('sdcard');
        currentStorage = availableStorages[0];

        var contentList = document.getElementById(CONTENT_LIST_ID);
        contentList.addEventListener('click', _listHandler);

        var menuButton = document.getElementById(MENU_ID);
        menuButton.addEventListener('click', _menuHandler);

        var returnFalse = function() {
            return false;
        };

        document.getElementById(ACTION_FORM_ID).onsubmit = returnFalse;
        document.getElementById(STORAGE_FORM_ID).onsubmit = returnFalse;
    }

    // Handle main menu (in the top right corner) events
    function _menuHandler(e) {
        // Loop through every device storage
        var menu = $('#' + STORAGE_MENU_ID);
        menu.text('');
        for (var i = 0; i < availableStorages.length; i++) {
            var element =
                $('<button>', {'data-id': availableStorages[i].storageName, text: availableStorages[i].storageName});
            menu.append(element);
        }
        var cancelElement = $('<button>', {text: 'Cancel'});
        menu.append(cancelElement);
        $('#' + STORAGE_FORM_ID).on('click', _selectStorage).show();
    }

    function _selectStorage(e) {
        $('#' + STORAGE_FORM_ID).unbind('click').hide();
        var targetId = e.target.dataset.id;
        if (targetId) {
            for (var i = 0; i < availableStorages.length; i++) {
                if (targetId === availableStorages[i].storageName) {
                    currentStorage = availableStorages[i];
                    printDirectoryContent("");
                    break;
                }
            }
        }
    }

    // Handler for clicks on file list
    function _listHandler(e) {
        var target = e.target;

        var liElement = target.parentNode;
        if (liElement) {
            var id = liElement.dataset.id;
            if (id) {
                if (liElement.dataset.type === 'folder') {
                    printDirectoryContent(_getRelativePath(id, '/' + currentStorage.storageName + '/'));
                } else {
                    _selectAction(id);
                }
            }
        }
    }

    function _selectAction(fileName) {
        currentFile = fileName; // NICE: A better way to pass the file name
        $('#' + ACTION_HEADER_ID).text('Action for ' + fileName);
        $('#' + ACTION_FORM_ID).on('click', _doAction).show();
    }

    function _doAction(e) {
        $('#' + ACTION_FORM_ID).unbind('click').hide();
        var targetNode = e.target.nodeName.toLowerCase();
        if (targetNode === 'button') {
            switch(e.target.id) {
                case 'open':
                    _openFile(currentFile);
                    break;
                case 'share':
                    _shareFile(currentFile);
                    break;
                case 'delete':
                    _deleteFile(currentFile);
                    break;
                default:
                    // Cancel
            }
        }
    }

    function _openFile(fileName) {
        console.log('Will try to open %s', fileName);
        var request = currentStorage.get(fileName);

        // TODO: Message for unimplemented formats

        request.onsuccess = function () {
            var file = this.result;

            var activity = new MozActivity({
                name: 'open',
                data: {
                    type: file.type,
                    blob: file,
                    filename: file.name
                }
            });

            activity.onsuccess = function() {
                console.log('File %s successfully opened', file.name);
            };

            activity.onerror = function() {
                console.error('Unable to open the file: ', this.error);
            };
        };

        request.onerror = function () {
            console.error('Unable to get the file: ', this.error);
        };
    }

    function _shareFile(fileName) {
        console.log('Will try to share %s', fileName);
        var request = currentStorage.get(fileName);

        request.onsuccess = function () {
            var file = this.result;

            var activity = new MozActivity({
                name: 'share',
                data: {
                    blobs: [file],
                    filenames: [file.name]
                }
            });

            activity.onsuccess = function() {
                console.log('File %s successfully shared', file.name);
            };

            activity.onerror = function() {
                console.error('Unable to share the file: ', this.error);
            };
        };

        request.onerror = function () {
            console.error('Unable to get the file: ', this.error);
        };
    }

    function _deleteFile(fileName) {
        console.log('Will try to delete %s', fileName);
        var request = currentStorage.delete(fileName);

        request.onsuccess = function () {
            console.log('File %s successfully deleted', fileName);
            printDirectoryContent(currentDir);
        };

        request.onerror = function () {
            console.error('Unable to delete the file: ', this.error);
            alert('The file ' + fileName + ' could not be deleted');
        };
    }

    function printDirectoryContent(root) {
        var container = $('#' + CONTENT_LIST_ID);
        container.text(''); // NICE: Better way to delete element

        currentDir = root;
        var currentPath = '/' + currentStorage.storageName + (root == '' ? '' : '/' + root);

        $('#' + HEADER_INFO_ID).text(currentPath + '/');

        console.log("Will print folder '%s' from storage '%s'", root, currentStorage.storageName);
        console.log("Will filter everything out '%s'", currentPath);

        var cursor = currentStorage.enumerate(currentDir);

        if (root !== '') {
            var parentPath = _getParentFolder(currentPath);
            console.log("Parent folder is '%s'", parentPath);
            _printDirectory(container, parentPath, 'Parent folder');
        }

        var folderList = [currentPath];
        var fileList = [];

        cursor.onsuccess = function () {
            // Once we found a file we check if there are other results
            // Then we move to the next result, which calls the cursor
            // success possibly with the next file as result.
            if (!this.done) {
                var file = this.result;
                var relativeFileName = _getRelativePath(file.name, currentPath);

//                console.log("Found file %s of type '%s'", file.name, file.type);

                // Check if the file is in current folder and print it
                if (_isInCurrentDirectory(relativeFileName)) {
                    fileList.push({name: file.name, type: file.type, size: file.size});
                }
                // Check if the relative root of the file has been already printed
                else if (_getRelativeRoot(relativeFileName)) {
                    //Check if the folder has been already printed
                    var relativeRootPath = currentPath + '/' + _getRelativeRoot(relativeFileName);
                    if (folderList.indexOf(relativeRootPath) === -1) {
                        folderList.push(relativeRootPath);
                    }
                }

                this.continue();
            }
            // Executed after every result have been processed, then print them
            if (this.done) {
                // Sort folders case insensitive
                folderList.sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                // Sort files case insensitive
                fileList.sort(function (a, b) {
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                });

                folderList.forEach(function(folderName, i) {
                    // Skip the first element (current dir)
                    if (i !== 0) {
                        _printDirectory(container, folderName);
                    }
                });
                fileList.forEach(function(file) {
                    _printFile(container, file);
                });
            }
        };

        cursor.onerror = function () {
            container.text('Error');
            console.warn('Unable to get sd card cursor: ' + this.error.name);
        };
    }

    function _printDirectory(container, directoryName, description) {
        var a =
            $('<a>',{href: '#'}).append(
                    $('<p>', {text: directoryName + '/'})
                ).append(
                    $('<p>', {text: description || 'Folder'})
                );
        var li = $('<li>', {'data-id': directoryName, 'data-type': 'folder'});
        var icon = $('<aside>', {class: 'pack-end'}).append(
            $('<img>', {alt: 'placeholder', src: 'img/folder.png'})
        );
        li.append(icon);
        li.append(a);
        container.append(li);
    }

    function _printFile(container, file) {
        var a =
            $('<a>',{href: '#'}).append(
                    $('<p>', {text: file.name})
                ).append(
                    $('<p>', {text: _printFileDescription(file)})
                );
        var li = $('<li>', {'data-id': file.name, 'data-type': 'file'});
        var icon = _printIcon(file);
        if (icon) {
            li.append(icon);
        }
        li.append(a);
        container.append(li);
    }

    function _printIcon(file) {
        var fileExtension = _getFileExtension(file.name);
        var iconName;
        switch (fileExtension) {
            case 'aac':
            case 'avi':
            case 'bmp':
            case 'css':
            case 'doc':
            case 'exe':
            case 'flv':
            case 'gif':
            case 'html':
            case 'jpg':
            case 'mp3':
            case 'mp4':
            case 'mpg':
            case 'odt':
            case 'pdf':
            case 'png':
            case 'ppt':
            case 'rar':
            case 'tga':
            case 'tiff':
            case 'txt':
            case 'wav':
            case 'xls':
            case 'xml':
            case 'zip':
                iconName = fileExtension;
                break;
            case 'docx':
                iconName = 'doc';
                break;
            case 'm4a':
                iconName = 'mp4';
                break;
            default:
                iconName = '_blank';
        }

        return $('<aside>', {class: 'pack-end'}).append(
            $('<img>', {alt: 'placeholder', src: 'img/' + iconName + '.png'})
        );
    }

    function _printFileDescription(file) {
        return _printFileType(file) + ' - ' + _printFileSize(file.size);
    }

    function _printFileType(file) {
        if (file.type) {
            return file.type;
        }

        switch(_getFileExtension(file.name)) {
            case 'doc':
                return 'Word document';
            case 'pdf':
                return 'PDF file';
            default:
                return 'File'
        }
    }

    function _printFileSize(size) {
        if (size < BYTES_PER_KILOBYTE) {
            return size + ' bytes';
        } else if (size < BYTES_PER_MEGABYTE) {
            return (size / BYTES_PER_KILOBYTE).toFixed(1) + ' KB';
        } else if (size < BYTES_PER_GIGABYTE) {
            return (size / BYTES_PER_MEGABYTE).toFixed(1) + ' MB';
        } else {
            return (size / BYTES_PER_GIGABYTE).toFixed(1) + ' GB';
        }
    }

    function _getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    function _getParentFolder(fullName) {
        if (fullName == '') {
            return null;
        }
        var lastSlash = fullName.lastIndexOf('/');
        // Should not happen, would mean a path without slashes
        if (lastSlash === -1) {
            return '';
        }
        // If the slash is trailing
        if (lastSlash == fullName.length - 1) {
            lastSlash = fullName.substring(0, fullName.length - 1).lastIndexOf('/');
        }
        return fullName.substring(0, lastSlash);
    }

    // Precondition: the fullName will always be relative to relativeTo
    function _getRelativePath(fullName, relativeTo) {
        var relativePath = fullName.substring(fullName.indexOf(relativeTo) + relativeTo.length);
        if (relativePath.indexOf('/') === 0) {
            return relativePath.substring(1);
        } else {
            return relativePath;
        }
    }

    // Precondition: the relative name cannot start by '/' and must have at least one parent folder
    function _getRelativeRoot(relativeName) {
        return relativeName.substring(0, relativeName.indexOf('/'));
    }

    function _isInCurrentDirectory(relativeName) {
        return relativeName.lastIndexOf('/') === -1;
    }

    function _getFolderPath(fullName) {
        return fullName.substring(0, fullName.lastIndexOf('/'));
    }

    return {
        init: init,
        printDirectory: printDirectoryContent
    }
})();
