JPEX - Javascipt Protoype Extension
===================================

Folder
------
*(Path)*  
If a dependency can't be found in the registered factories, it will attempt to find the dependency on any registered folders.
This can be an expensive process so should be avoided if possible. Once the dependency has been found in a folder, the resulting location will be cached.
```javascript
var MyClass = jpex.extend(function(jsfile, jsonfile){
  file1.doSomething();
  file3.isJson;
});

MyClass.Register.Folder('files');

new MyClass();
```

Folders (advanced)
------------------
*(Path, Options)*  
It is also possible to have the folder factory automatically register all files in a folder. This means you can organise your application in a logical manner and then have all dependencies automatically loaded and injected into your jpex classes.  
The Options parameter takes the following options:
######type
The type of dependency you want to register them as. If not specified it will register all functions as factories and anything else as a constant. Valid values are *'Factory', 'Service', 'Constant', 'Enum'*
######singleton
Whether or not to create a singleton if the files are services or factories.
######prefix
Aprefix to add to the start of each dependency
######suffix
Asuffix to add to the end of each dependency
######prefixFolder
When adding sub folders, this will prepend the folder name to the dependency, so *main* folder with a *sub.js* file will be registered as *mainSub*, for example.
######pattern
A glob pattern to match by. This defaults to `'**/*.js'`
######transform
*(file, folders, ext)*  
A function that will transform the filename into the name of the dependency. This is entirely optional and will be handled automatically using the above option values if omitted.  
The function takes 3 parameters: the file name (without the folders or file extension), an array of folders leading to the file, and the file extension (.js).  
The value returned by this function will be used as the dependency name.
######register
Another optional function that takes the name of the dependency and the contents of the related file and registers the dependency against the class.  

```javascript
var MyClass = jpex.extend(function(myserviceModel, subfolderServiceModel){
  
});

MyClass.Register.Folder('models', {
  type : 'Service',
  suffix : 'model'
});

//where there is a folder structure:
// models
//   myservice.js
//   subfolder
//     service.js
```