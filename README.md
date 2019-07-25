
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
* caveats: impacts performance :(
* **Note**: i don’t really know much about js (or what the hell i’m doing), and this is pretty much just a hack/workaround and there must be better way to do this (like TS, Flow, proptypes, some sort of webpack plugin or some other js pattern or paradigm that i don’t know etc.). 
	* In essence what I’m trying to replicate are basically models to hold data but without instantiating a class (since i have to use it in state and pass it around via props etc. i want them to be a simple key-value pair object).

#### Why Some Functions are Static
* Signifies that the function is a pure function; i.e if you give it the same input, it will spit out the same output. Makes things more predictable (ish).
* Signifies that it does not mutate the input, but rather it always creates another output. Used for transforming item A to item B, etc. and thus A and B are untouched. Useful for debugging and makes things a bit more predictable esp. for long chains of transformations\processing i.e piping the input\output from function to function. 
	* `const a = Foo.processRawData(raw_data)`
	* `const b = Foo.createFromA(a)`
	* `const c = Foo.transformB(b)`
	* `console.log(a, b, c)`
* Signifies that it’s scopeless and standalone i.e the function itself, does not need to be binded or does not belongs to an instance and thus can be extracted and moved around; In other words, the lexical scope is contained within itself (the function body) and nothing else.
	* `a(){}` means the scope belongs to the current instance and is only meant to be called inside that instance i.e a private function.
	* `a = () => {}` means that  the function’s scope is binded to the current instance and is intended to be called somewhere else (from outside the func. as a public function, inside a callback etc.)
	* `static a(){}` means that it’s a pure function and its functionality is only useful in the current class.
* A collection of functions that are semi-related. (kase nasanay ako to create a static class in java and c# that just contains util funcs).

#### About the use of Enums
1. In Relation to State: 
	* Used to make things more predictable and simple by encompassing multiple state values into a single enum i.e modeling it like a state machine. Reduces the number of state variables/re-renders, and makes debugging easier (only changing one state to change the UI, identify what’s going on, etc.)
	* Example - Conditional Rendering :
```javascript
//ex a
switch(loading){
	case LOAD_STATE.LOADING: return (<A/>);
	case LOAD_STATE.SUCCESS: return (<B/>);
	case LOAD_STATE.ERROR  : return (<C/>);
	//...
};
//ex b
return (
	(loading === LOAD_STATE.LOADING)? <A/> :
	(loading === LOAD_STATE.SUCCESS)? <B/> :
	//...
);
```
	* Example - Deriving State: 
```javascript
deriveStateFromLoaing(){
	switch(this.state.loading){
		case LOAD_STATE.LOADING: { showA: false, title: 'loading', ...};
		case LOAD_STATE.SUCCESS: { showA: true , title: 'abc'    , ...};
		case LOAD_STATE.ERROR  : { showA: false, title: 'error'  , ...};
	};
};
```
2. In Relation to Using it As A Key: 
	* Boilerplate that’s used to define the param names of a callback so that they remain consistent when used somewhere else and eliminate copy & paste and guessing\remembering what the param names are.
		* `const a = params[PARAM_KEYS.a] || ‘’;`
		* `const b = params[PARAM_KEYS.b] || -1;`
	* Boilerplate that’s used for defining, emitting and handling the different events.
		* `emitter.addListener(EVENTS.onA, this._handleA);`
		* `emitter.emit(EVENTS.onA)`