Folder
======
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Path          | String        |           |

If a dependency can't be found in the registered factories, it will attempt to find the dependency in any registered folders.  
This can be an expensive process so should be avoided if possible. Once the dependency has been found in a folder, the resulting location will be cached.

```javascript
var MyClass = jpex.extend(function(jsfile, jsonfile){
  file1.doSomething();
  file3.isJson;
});

MyClass.Register.Folder('files');

new MyClass();
```


There is also an extended version of folders [here](https://github.com/jackmellis/jpex/blob/master/jpex-folder/readme.md)