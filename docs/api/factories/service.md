Service
=======
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Dependencies  | Array[String] | null      |
| Function      | Function      |           |

Services are simple classes that are instantiated and the instance returned when injected.  
It is also possible to register another Jpex class as a service, meaning that you can inject classes into each other.

```javascript
var MyClass = jpex.extend(function(myService){
  myService.doSomething();
});

MyClass.Register.Service('myService', function($log){
  this.doSomething = function(){
      $log('Do Something!');
  };
});

new MyClass();

var LinkedClass = jpex.extend(function(myClass){

});

LinkedClass.Register.Service('myClass', MyClass); // injects MyClass as a dependency of Linked Class
```