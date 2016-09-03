JPEX - Javascipt Protoype Extension
===================================

File
-----
*(Name, Path)*  
This will attempt to require the provided path when injected. Once loaded, the result is returned as is, there is no additional processing, just the object in the file.
```javascript
var MyClass = jpex.extend(function(file1, file2, file3){
  file1.doSomething();
  file2.sameAsFile1();
  file3.isJson;
});

MyClass.Register.File('file1', 'files/jsfile');
MyClass.Register.File('file2', 'files/jsfile.js');
MyClass.Register.File('file3', 'files/jsonfile.json');

new MyClass();
```