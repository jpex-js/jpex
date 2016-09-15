Constant
========
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Value         | Any           |           |

Returns a constant value. This is useful for passing a static object into classes, such as a database connection.  

```javascript
var MyClass = jpex.extend(function(db){
  db.retrieveSomeStuff();
});
MyClass.Register.Constant('db', returnDatabaseObjectFromSomewhere());

new MyClass();
```

If your register a factory or service as a singleton, after the first time it is resolved, it is re-registered as a cosntant.