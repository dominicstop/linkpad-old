
Explanation for the weird code i write for future reference

#### About Wrap() and WrapArray()
* A cheatsheet to remember and access the properties and their respective data types. 
	* Used to wrap objects so that VSCode can infer the types (ideally, this would have been written in TS) and suggest them.
	* Makes things like map, filter, reduce, forEach, iteration logic, destructuring etc. easier because all of the types and properties are suggested and inferred.
	* I don’t have to constantly look up what the exact property names are. 
* So that all properties are properly defined and can be accessed gracefully without having to constantly check if a property exist before accessing them (esp. for nested objects, ideally optional chaining should be used instead but it’s not available for the current config):
	* `const valA = obj.foo && obj.foo.bar && obj.foo.bar.baz `;
	* `const valB = (b.a || {}).c || ''`
* So that if a property happens to be falsey i.e null/undef etc., it can be easily be assigned with a default value (an alt. to writing  `const {a = 'default', b = 0} = (obj || {})` or `try { a.foo } etc.` all the time):
	* `const module = ModuleItem.wrap(props.module)`
	* `const title  = module.modulename  || 'module n/a'`
	* `const desc   = module.description || 'no description'`
* caveats: impacts app performance :(
* **Note**: i don’t really know much about js (or what the hell i’m doing), and this is pretty much just a hack/workaround and there must be better way to do this (like TS, Flow, proptypes, some sort of webpack plugin or some other js pattern or paradigm that i don’t know etc.). In essence what I’m trying to replicate are basically models to hold data but without instantiating a class (since i have to use it in state and pass it around via props etc. i want them to be a simple key-value pair object).
