JPEX - Javascipt Protoype Extension
===================================

node_module
------------
*(name)*  
If all of the above fail, it will attempt to load the dependency from node_modules. This includes anything in the node_modules folder and global modiles like fs and path.  
To avoid the overhead of checking all factories and folders before resorting to this method, you can manually register a node_module.
```javascript
var MyClass = jpex.extend(function(fs, path){
  path.resolve('/');
  fs.readFile();
});

MyClass.Register.node_module('fs');

new MyClass();
```