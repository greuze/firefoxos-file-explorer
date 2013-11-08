$(function() {
    getUsedSpace("header-info");
    getDirectoryContents("/", function(contents) {
        printDirectoryContents("content-list", contents);
    });
});