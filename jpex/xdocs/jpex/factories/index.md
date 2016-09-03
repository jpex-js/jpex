JPEX - Javascipt Protoype Extension
===================================

Register
---------
Factories are small modules that can be injected into a class. Some are [predefined](#predefined-factories), some are user defined and some are node_modules.

###Injecting dependencies
Dependencies are declared in the class's [constructor](#constructor) function. When you create an instance of a class it attempts to resolve all its dependencies. There is a specific order of precendence for resolving a dependency:

1. [Named parameters](#named-parameters)
2. [Factories](#factories) registered against the class
3. [Factories](#factories) registered against parent classes
4. [Predefined factories](#predefined-factories)
5. [Folders](#folder) registered against the class and its parents
6. [Node modules](#node_module)

###Factories
There are a number of different factory types but they are all essentially just variations of the Factory type:

#####Factory

#####Service

#####Constant

#####Enum

#####File

#####Folder


#####Node_module

####Named Parameters