#$fs - Jpex File System Wrapper

$fs is a wrapper around node's File System module (fs). It includes only the asynchronous methods (readFileSync etc. are not included). Any method that would normally take a callback has been converted into a promise (with the exception of fs.watch).  
```javascript
var MyClass = jpex.extend(function($fs){
  $fs.readFile('files/file', 'utf8')
    .then(function(data){})
    .catch(function(err){});
});
```