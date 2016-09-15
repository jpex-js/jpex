Change Log
==========

##Unreleased
###Feaures
- Interfaces functionality added  
- Registering a factory returns an object with additional option methods (currently only contains the *interface()* method)  
###Breaking Changes
- All $ factories now have interfaces (i.e. *$ipromise*). If you have overwritten a default factory that is used by another default factory, it will need to include the interface in order to work. i.e. *$fs* used to depend on *$promise* but it now depends on $ipromise.

##1.2.0  
###Features  
- Added detailed documentation  
- $error factory and $errorFactory factory  
- ErrorType Factory i.e. `jpex.Register.ErrorType('Custom')`  
- Ancestoral dependencies i.e. `['^$errorFactory']`  
- Deprecated jpex-fs as it is now included in the standard jpex build  