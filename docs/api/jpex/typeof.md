Jpex.Typeof
===========
*(obj)*  
This is an extension of the native type of statement. However, unlike the native version it can differentiate between objects, dates, arrays, regular expressions, and null objects
```javascript
jpex.Typeof('str'); // 'string'
jpex.Typeof(123); // 'number'
jpex.Typeof({}); // 'object'
jpex.Typeof([]); // 'array'
jpex.Typeof(); // 'undefined'
jpex.Typeof(null); // 'null'
jpex.Typeof(/abc/); // 'regexp'
jpex.Typeof(new Date()); // 'date'
```