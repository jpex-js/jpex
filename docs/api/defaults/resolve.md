$resolve  
=======  
The $resolve factory allows you to load a dependency after instantiating your class. Although use cases are limited, it does allow for variants of lazy loading and unit testing.  

```javascript
var fs = $resolve('$fs');
var path = $resolve('path');
var p = $resolve('$ipromise');
```
It is also possible to provide additional named parameters to the resolver:
```javascript
$resolve('someService', {myFactory : {}});
```
