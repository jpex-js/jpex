JPEX - Javascipt Protoype Extension
===================================

Default Factories
------------------
There are a handful of predefined factories that wrap up common functions such as `setTimeout`. Although you can continue using the non-injected functions, the injected versions mean you can easily mock out their behaviour in unit tests. The JpexMocks library automatically mocks out all of these for you.

#####$timeout, $interval, $immediate, $tick

#####$log

#####$promise