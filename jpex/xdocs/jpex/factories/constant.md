JPEX - Javascipt Protoype Extension
===================================

Constant
---------
*(Name, Value)*
Returns a constant value. This is useful for passing a static object into classes, such as a database connection.
```javascript
var MyClass = jpex.extend(function(db){
  db.retrieveSomeStuff();
});
MyClass.Register.Constant('db', returnDatabaseObjectFromSomewhere());

new MyClass();
```