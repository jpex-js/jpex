$require
========
The *$require* factory is a simple function that allows you to require a file. Unlike the native *require*()* function, *$require* loads files relative to the current working directory, rather than the currently opened file.

```javascript
// in C:\node\project\test\index.js:
var result = $require('folder/subfolder/file');

// loads C:\node\project\folder\subfolder\file.js,
```