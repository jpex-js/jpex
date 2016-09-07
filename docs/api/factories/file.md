File
====
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Path          | String        |           |

This will attempt to load the provided path when injected. Once loaded, the result is returned as is, there is no additional processing, just the object in the file. If Path is a relative path, it will be resolved in relation to the current working directory.

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