Change Log
==========

##1.3.0
###Features
- Interfaces functionality added  
- Registering a factory returns an object with additional option methods (currently only contains the *interface()* method)  
- It is now possible to specify the life cycle of a factory or service using the `.lifecycle.x()` syntax. Possible options are `application`, `class`, `instance`, `none`  
- Due to the introduction of life cycles, the *singleton* parameter has been deprecated.  
###Breaking Changes
- All $ factories now have interfaces (i.e. *$ipromise*). If you have overwritten a default factory that is used by another default factory, it will need to include the interface in order to work. i.e. *$fs* used to depend on *$promise* but it now depends on $ipromise.  

##1.2.0  
###Features  
- Added detailed documentation  
- $error factory and $errorFactory factory  
- ErrorType Factory i.e. `jpex.Register.ErrorType('Custom')`  
- Ancestoral dependencies i.e. `['^$errorFactory']`  
- Deprecated jpex-fs as it is now included in the standard jpex build  
