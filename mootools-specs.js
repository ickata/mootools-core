/*
---
name: Browser
requires: ~
provides: ~
...
*/



describe('Browser.exec', function(){

	it('should evaluate on global scope', function(){
		Browser.exec.call(Browser.exec, 'var execSpec = 42');
		expect(window.execSpec).toEqual(42);
	});

	it('should return the evaluated script', function(){
		expect(Browser.exec('function test(){}')).toEqual('function test(){}');
	});

});

// String.stripScripts

describe('String.stripScripts', function(){

	it('should strip all script tags from a string', function(){
		expect('<div><script type="text/javascript" src="file.js"></script></div>'.stripScripts()).toEqual('<div></div>');
	});

	it('should execute the stripped tags from the string', function(){
		expect('<div><script type="text/javascript"> var stripScriptsSpec = 42; </script></div>'.stripScripts(true)).toEqual('<div></div>');
		expect(window.stripScriptsSpec).toEqual(42);
		expect('<div><script id="my-script">\n// <!--\nvar stripScriptsSpec = 24;\n//-->\n</script></div>'.stripScripts(true)).toEqual('<div></div>');
		expect(window.stripScriptsSpec).toEqual(24);
		expect('<div><script>\n/*<![CDATA[*/\nvar stripScriptsSpec = 4242;\n/*]]>*/</script></div>'.stripScripts(true)).toEqual('<div></div>');
		expect(window.stripScriptsSpec).toEqual(4242);
	});
	
	it('should load & execute script files synchronously', function(){
		var div = new Element('div').inject(document.body);
		[
			'<div id="my-container"></div>',
			'<script>',
			'document.id("my-container").set("text", "dynamic content");',
			'</script>',
			'<script id="mt-more-More">',
			'Drag = undefined;',
			'</script>',
			'<script type="text/javascript" id="mt-more-Drag" src="https://rawgithub.com/mootools/mootools-more/master/Source/Drag/Drag.js"></script>',
			'<script src="https://rawgithub.com/mootools/mootools-more/master/Source/Drag/Drag.Move.js" id="mt-more-Drag-Move" type="text/javascript"></script>',
			'<script>',
			'new Drag.Move(div);',
			'</script>'
		].join('').stripScripts(function(code, html, urls, fn){
			div.set('html', html);
			fn();
			expect(div.get('text')).toEqual('dynamic content');
		});
	});

});


describe('Document', function(){

	it('should hold the parent window', function(){
		expect(document.window).toEqual(window);
	});

	it('should hold the head element', function(){
		expect(document.head.tagName.toLowerCase()).toEqual('head');
	});

});

describe('Window', function(){

	it('should set the Element prototype', function(){
		expect(window.Element.prototype).toBeDefined();
	});

});

describe('Browser', function(){
	var isPhantomJS = !!navigator.userAgent.match(/phantomjs/i);

	it('should think it is executed in a browser', function(){
		if (!isPhantomJS) expect(['ie', 'safari', 'chrome', 'firefox', 'opera']).toContain(Browser.name);
	});



	it('should assume the IE version is emulated by the documentMode (X-UA-Compatible)', function(){
		if (Browser.name == 'ie' && document.documentMode) expect(Browser.version).toEqual(document.documentMode);
	});
	it('should find a browser version', function(){
		expect(Browser.version || isPhantomJS).toBeTruthy();
		expect(typeof Browser.version).toEqual('number');
	});

});

describe('Browser.parseUA', function(){

	var parse = Browser.parseUA;
	var userAgents = {
		ie6: {
			desc: 'Internet Explorer 6',
			string: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; Win64; x64; SV1; .NET CLR 2.0.50727)',
			expect: {
				name: 'ie',
				version: 6
			}
		},
		ie7: {
			desc: 'Internet Explorer 7',
			string: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)',
			expect: {
				name: 'ie',
				version: 7
			}
		},
		ie8: {
			desc: 'Internet Explorer 8',
			string: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)',
			expect: {
				name: 'ie',
				version: 8
			}
		},
		ie9: {
			desc: 'Internet Explorer 9',
			string: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
			expect: {
				name: 'ie',
				version: 9
			}
		},
		ie10: {
			desc: 'Internet Explorer 10',
			string: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
			expect: {
				name: 'ie',
				version: 10
			}
		},
		ie11: {
			desc: 'Internet Explorer 11',
			string: 'Mozilla/5.0 (IE 11.0; Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko',
			expect: {
				name: 'ie',
				version: 11
			}
		},
		ie11v2: {
			desc: 'Internet Explorer 11 v2',
			string: 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv 11.0) like Gecko',
			expect: {
				name: 'ie',
				version: 11
			}
		},
		ieCompat: {
			desc: 'Internet Explorer 10 in IE7 compatibility',
			string: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/6.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)',
			expect: {
				name: 'ie',
				version: 7
			}
		},
		firefox: {
			desc: 'Firefox v24',
			string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:24.0) Gecko/20100101 Firefox/24.0',
			expect: {
				name: 'firefox',
				version: 24
			}
		},
		opera10: {
			desc: 'Opera 10',
			string: 'Opera/9.80 (Windows NT 5.1; U; cs) Presto/2.2.15 Version/10.00',
			expect: {
				name: 'opera',
				version: 10
			}
		},
		opera11: {
			desc: 'Opera 11.62',
			string: 'Opera/9.80 (Windows NT 6.1; WOW64; U; pt) Presto/2.10.229 Version/11.62',
			expect: {
				name: 'opera',
				version: 11.62
			}
		},
		opera12: {
			desc: 'Opera 12.14',
			string: 'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
			expect: {
				name: 'opera',
				version: 12.14
			}
		},
		safari: {
			desc: 'Safari 6.1',
			string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.71 (KHTML, like Gecko) Version/6.1 Safari/537.71',
			expect: {
				name: 'safari',
				version: 6.1
			}
		},
		chrome: {
			desc: 'Chrome 31',
			string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
			expect: {
				name: 'chrome',
				version: 31
			}
		},
		chromeios: {
			desc: 'Chrome 33 on iOS',
			string: 'Mozilla/5.0 (iPad; CPU OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/33.0.1750.21 Mobile/11B554a Safari/9537.53',
			expect: {
				name: 'chrome',
				version: 33
			}
		},
		edge12: {
			desc: 'Edge 12',
			string: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0',
			expect: {
				name: 'edge',
				version: 12,
				platform: 'windows'
			}
		},
      edge12latest: {
         desc: 'Edge 12.1024',
         string: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135  Safari/537.36 Edge/12.1024',
         expect: {
            name: 'edge',
            version: 12,
            platform: 'windows'
         }
      }
	};

	var testUA = function(ua){
		return function(){
			var browser = parse(ua.string, '');
			Object.forEach(ua.expect, runExpects, browser);
		};
	};

	var runExpects = function(val, key){
		expect(this[key]).toEqual(val);
	};

	Object.forEach(userAgents, function(obj){
		it('should parse ' + obj.desc + ' user agent string', testUA(obj));
	});

});

/*
---
name: Class.Extras
requires: ~
provides: ~
...
*/

var Local = Local || {};

describe('Chain', function(){

	Local.Chain = new Class({

		Implements: Chain

	});

	it('callChain should not fail when nothing was added to the chain', function(){
		var chain = new Local.Chain();
		chain.callChain();
	});

	it('should pass arguments to the function and return values', function(){
		var chain = new Local.Chain();
		var arr = [];
		chain.chain(function(a, b){
			var str = "0" + b + a;
			arr.push(str);
			return str;
		});
		chain.chain(function(a, b){
			var str = "1" + b + a;
			arr.push(str);
			return str;
		});
		var ret;
		expect(arr).toEqual([]);
		ret = chain.callChain("a", "A");
		expect(ret).toEqual("0Aa");
		expect(arr).toEqual(["0Aa"]);

		ret = chain.callChain("b", "B");
		expect(ret).toEqual("1Bb");
		expect(arr).toEqual(["0Aa", "1Bb"]);

		ret = chain.callChain();
		expect(ret).toEqual(false);
		expect(arr).toEqual(["0Aa", "1Bb"]);
	});

	it('should chain any number of functions', function(){
		var chain = new Local.Chain();
		var arr = [];

		chain.chain(function(){
			arr.push(0);
		}, function(){
			arr.push(1);
		});

		expect(arr).toEqual([]);
		chain.callChain();
		expect(arr).toEqual([0]);
		chain.chain(function(){
			arr.push(2);
		});
		chain.callChain();
		expect(arr).toEqual([0, 1]);
		chain.callChain();
		expect(arr).toEqual([0, 1, 2]);
		chain.callChain();
		expect(arr).toEqual([0, 1, 2]);
	});

	it('should allow an array of functions', function(){
		var chain = new Local.Chain();
		var arr = [];

		chain.chain([function(){
			arr.push(0);
		}, function(){
			arr.push(1);
		}, function(){
			arr.push(2);
		}]);

		expect(arr).toEqual([]);
		chain.callChain();
		expect(arr).toEqual([0]);
		chain.callChain();
		expect(arr).toEqual([0, 1]);
		chain.callChain();
		expect(arr).toEqual([0, 1, 2]);
		chain.callChain();
		expect(arr).toEqual([0, 1, 2]);
	});

	it('each instance should have its own chain', function(){
		var foo = new Local.Chain();
		var bar = new Local.Chain();
		foo.val = "F";
		bar.val = "B";
		foo.chain(function(){
			this.val += 'OO';
		});
		bar.chain(function(){
			this.val += 'AR';
		});
		expect(foo.val).toEqual('F');
		expect(bar.val).toEqual('B');
		foo.callChain();
		bar.callChain();
		expect(foo.val).toEqual('FOO');
		expect(bar.val).toEqual('BAR');
	});

	it('should be able to clear the chain', function(){
		var called;
		var fn = function(){
			called = true;
		};

		var chain = new Local.Chain();
		chain.chain(fn, fn, fn, fn);

		chain.callChain();
		expect(called).toBeTruthy();
		called = false;

		chain.clearChain();

		chain.callChain();
		expect(called).toBeFalsy();
		called = false;
	});

	it('should be able to clear the chain from within', function(){
		var foo = new Local.Chain();

		var test = 0;
		foo.chain(function(){
			test++;
			foo.clearChain();
		}).chain(function(){
			test++;
		}).callChain();

		expect(test).toEqual(1);
	});

});

var fire = 'fireEvent', create = function(){
	return new Events();
};

describe('Events API: Mixin', function(){

	beforeEach(function(){
		Local.called = 0;
		Local.fn = function(){
			return Local.called++;
		};
	});

	it('should add an Event to the Class', function(){
		var object = create();

		object.addEvent('event', Local.fn)[fire]('event');

		expect(Local.called).toEqual(1);
	});

	it('should add multiple Events to the Class', function(){
		create().addEvents({
			event1: Local.fn,
			event2: Local.fn
		})[fire]('event1')[fire]('event2');

		expect(Local.called).toEqual(2);
	});

	it('should remove a specific method for an event', function(){
		var object = create();
		var x = 0, fn = function(){ x++; };

		object.addEvent('event', Local.fn).addEvent('event', fn).removeEvent('event', Local.fn)[fire]('event');

		expect(x).toEqual(1);
		expect(Local.called).toEqual(0);
	});

	it('should remove an event and its methods', function(){
		var object = create();
		var x = 0, fn = function(){ x++; };

		object.addEvent('event', Local.fn).addEvent('event', fn).removeEvents('event')[fire]('event');

		expect(x).toEqual(0);
		expect(Local.called).toEqual(0);
	});

	it('should remove all events', function(){
		var object = create();
		var x = 0, fn = function(){ x++; };

		object.addEvent('event1', Local.fn).addEvent('event2', fn).removeEvents();
		object[fire]('event1')[fire]('event2');

		// Should not fail
		object.removeEvents()[fire]('event1')[fire]('event2');

		expect(x).toEqual(0);
		expect(Local.called).toEqual(0);
	});

	it('should remove events with an object', function(){
		var object = create();
		var events = {
			event1: Local.fn,
			event2: Local.fn
		};

		object.addEvent('event1', function(){ Local.fn(); }).addEvents(events)[fire]('event1');
		expect(Local.called).toEqual(2);

		object.removeEvents(events);
		object[fire]('event1');
		expect(Local.called).toEqual(3);

		object[fire]('event2');
		expect(Local.called).toEqual(3);
	});

	it('should remove an event immediately', function(){
		var object = create();

		var methods = [];

		var three = function(){
			methods.push(3);
		};

		object.addEvent('event', function(){
			methods.push(1);
			this.removeEvent('event', three);
		}).addEvent('event', function(){
			methods.push(2);
		}).addEvent('event', three);

		object[fire]('event');
		expect(methods).toEqual([1, 2]);

		object[fire]('event');
		expect(methods).toEqual([1, 2, 1, 2]);
	});

	it('should be able to remove itself', function(){
		var object = create();

		var methods = [];

		var one = function(){
			object.removeEvent('event', one);
			methods.push(1);
		};
		var two = function(){
			object.removeEvent('event', two);
			methods.push(2);
		};
		var three = function(){
			methods.push(3);
		};

		object.addEvent('event', one).addEvent('event', two).addEvent('event', three);

		object[fire]('event');
		expect(methods).toEqual([1, 2, 3]);

		object[fire]('event');
		expect(methods).toEqual([1, 2, 3, 3]);
	});

});

describe('Options Class', function(){

	Local.OptionsTest = new Class({
		Implements: [Options, Events],

		options: {
			a: 1,
			b: 2
		},

		initialize: function(options){
			this.setOptions(options);
		}
	});

	it('should set options', function(){
		var myTest = new Local.OptionsTest({a: 1, b: 3});
		expect(myTest.options).not.toEqual(undefined);
	});

	it('should override default options', function(){
		var myTest = new Local.OptionsTest({a: 3, b: 4});
		expect(myTest.options.a).toEqual(3);
		expect(myTest.options.b).toEqual(4);
	});

});

describe('Options Class with Events', function(){

	beforeEach(function(){
		Local.OptionsTest = new Class({
			Implements: [Options, Events],

			options: {
				onEvent1: function(){
					return true;
				},
				onEvent2: function(){
					return false;
				}
			},

			initialize: function(options){
				this.setOptions(options);
			}
		});
	});

	it('should add events in the options object if class has implemented the Events class', function(){
		var myTest = new Local.OptionsTest({
			onEvent2: function(){
				return true;
			},

			onEvent3: function(){
				return true;
			}
		});

		expect(myTest.$events.event1.length).toEqual(1);
		expect(myTest.$events.event2.length).toEqual(1);
		expect(myTest.$events.event3.length).toEqual(1);
	});

});

describe('setOptions', function(){

	it('should allow to pass the document', function(){

		var A = new Class({

			Implements: Options,

			initialize: function(options){
				this.setOptions(options);
			}

		});

		expect(new A({document: document}).options.document == document).toBeTruthy();
	});

});

/*
---
name: Class
requires: ~
provides: ~
...
*/

(function(){

var Animal = new Class({

	initialized: false,

	initialize: function(name, sound){
		this.name = name;
		this.sound = sound || '';
		this.initialized = true;
	},

	eat: function(){
		return 'animal:eat:' + this.name;
	},

	say: function(){
		return 'animal:say:' + this.name;
	}

});

var Cat = new Class({

	Extends: Animal,

	ferocious: false,

	initialize: function(name, sound){
		this.parent(name, sound || 'miao');
	},

	eat: function(){
		return 'cat:eat:' + this.name;
	},

	play: function(){
		return 'cat:play:' + this.name;
	}

});

var Lion = new Class({

	Extends: Cat,

	ferocious: true,

	initialize: function(name){
		this.parent(name, 'rarr');
	},

	eat: function(){
		return 'lion:eat:' + this.name;
	}

});

var Actions = new Class({

	jump: function(){
		return 'actions:jump:' + this.name;
	},

	sleep: function(){
		return 'actions:sleep:' + this.name;
	}

});

var Attributes = new Class({

	color: function(){
		return 'attributes:color:' + this.name;
	},

	size: function(){
		return 'attributes:size:' + this.name;
	}

});


describe('Class creation', function(){

	

	it("Classes should be of type 'class'", function(){
		expect(typeOf(Animal)).toEqual('class');
	});

	it('should call initialize upon instantiation', function(){
		var animal = new Animal('lamina');
		expect(animal.name).toEqual('lamina');
		expect(animal.initialized).toBeTruthy();
		expect(animal.say()).toEqual('animal:say:lamina');
	});

	it("should use 'Extend' property to extend another class", function(){
		var cat = new Cat('fluffy');
		expect(cat.name).toEqual('fluffy');
		expect(cat.sound).toEqual('miao');
		expect(cat.ferocious).toBeFalsy();
		expect(cat.say()).toEqual('animal:say:fluffy');
		expect(cat.eat()).toEqual('cat:eat:fluffy');
		expect(cat.play()).toEqual('cat:play:fluffy');
	});

	it("should use 'Extend' property to extend an extended class", function(){
		var leo = new Lion('leo');
		expect(leo.name).toEqual('leo');
		expect(leo.sound).toEqual('rarr');
		expect(leo.ferocious).toBeTruthy();
		expect(leo.say()).toEqual('animal:say:leo');
		expect(leo.eat()).toEqual('lion:eat:leo');
		expect(leo.play()).toEqual('cat:play:leo');
	});

	it("should use 'Implements' property to implement another class", function(){
		var Dog = new Class({
			Implements: Animal
		});

		var rover = new Dog('rover');
		expect(rover.name).toEqual('rover');
		expect(rover.initialized).toBeTruthy();
		expect(rover.eat()).toEqual('animal:eat:rover');
	});

	it("should use 'Implements' property to implement any number of classes", function(){
		var Dog = new Class({
			Extends: Animal,
			Implements: [Actions, Attributes]
		});

		var rover = new Dog('rover');
		expect(rover.initialized).toBeTruthy();
		expect(rover.eat()).toEqual('animal:eat:rover');
		expect(rover.say()).toEqual('animal:say:rover');
		expect(rover.jump()).toEqual('actions:jump:rover');
		expect(rover.sleep()).toEqual('actions:sleep:rover');
		expect(rover.size()).toEqual('attributes:size:rover');
		expect(rover.color()).toEqual('attributes:color:rover');
	});

	it("should alter the Class's prototype when implementing new methods", function(){
		var Dog = new Class({
			Extends: Animal
		});

		var rover = new Dog('rover');

		Dog.implement({
			jump: function(){
				return 'dog:jump:' + this.name;
			}
		});

		var spot = new Dog('spot');

		expect(spot.jump()).toEqual('dog:jump:spot');
		expect(rover.jump()).toEqual('dog:jump:rover');
	});

	it("should alter the Class's prototype when implementing new methods into the super class", function(){
		var Dog = new Class({
			Extends: Animal
		});

		var rover = new Dog('rover');

		Animal.implement({
			jump: function(){
				return 'animal:jump:' + this.name;
			}
		});

		var spot = new Dog('spot');

		expect(spot.jump()).toEqual('animal:jump:spot');
		expect(rover.jump()).toEqual('animal:jump:rover');
	});

	it("should alter the Class's prototype when overwriting methods in the super class", function(){
		var Dog = new Class({
			Extends: Animal
		});

		var rover = new Dog('rover');
		expect(rover.say()).toEqual('animal:say:rover');

		Animal.implement({
			say: function(){
				return 'NEW:animal:say:' + this.name;
			}
		});

		var spot = new Dog('spot');

		expect(spot.say()).toEqual('NEW:animal:say:spot');
		expect(rover.say()).toEqual('NEW:animal:say:rover');
	});

});

describe('Class::implement', function(){

	it('should implement an object', function(){
		var Dog = new Class({
			Extends: Animal
		});

		Dog.implement(new Actions);

		var rover = new Dog('rover');

		expect(rover.name).toEqual('rover');
		expect(rover.jump()).toEqual('actions:jump:rover');
		expect(rover.sleep()).toEqual('actions:sleep:rover');
	});

	it('should implement any number of objects', function(){
		var Dog = new Class({
			Extends: Animal
		});

		Dog.implement(new Actions).implement(new Attributes);

		var rover = new Dog('rover');

		expect(rover.name).toEqual('rover');
		expect(rover.jump()).toEqual('actions:jump:rover');
		expect(rover.sleep()).toEqual('actions:sleep:rover');
		expect(rover.size()).toEqual('attributes:size:rover');
		expect(rover.color()).toEqual('attributes:color:rover');
	});

});

describe('Class toString', function(){

	it('should allow to implement toString', function(){
		var Person = new Class({

			initialize: function(name){
				this.name = name;
			},

			toString: function(){
				return this.name;
			}

		});

		var Italian = new Class({

			Extends: Person,

			toString: function(){
				return "It's me, " + this.name;
			}

		});

		expect((new Person('Valerio')) + '').toBe('Valerio');

		expect((new Italian('Valerio')) + '').toBe("It's me, Valerio");
	});

});

describe('Class.toElement', function(){

	var MyParentElement = new Class({

		initialize: function(element){
			this.element = element;
		},

		toElement: function(){
			return this.element;
		}

	});

	var MyChildElement = new Class({

		Extends: MyParentElement,

		initialize: function(element){
			this.parent(element);
		}

	});

	var MyArrayElement = new Class({

		Extends: Array,

		initialize: function(element){
			this.element = element;
		},

		toElement: function(){
			return this.element;
		}

	});

	it('should return an element when a class instance is passed to document.id', function(){
		var element = new Element('div', {'class': 'my-element'});
		var instance = new MyParentElement(element);

		expect(document.id(instance)).toBe(element);
	});

	it('should call the toElement() method in parent class if none is defined in child', function(){
		var element = new Element('div', {'class': 'my-element'});
		var instance = new MyChildElement(element);

		expect(document.id(instance)).toBe(element);
		expect(instance instanceof MyParentElement).toEqual(true);
	});

	it('should call toElement() when extending natives (String, Array, Object)', function(){
		var element = new Element('div', {'class': 'my-element'});
		var instance = new MyArrayElement(element);

		expect(document.id(instance)).toBe(element);
		expect(instance instanceof Array).toEqual(true);
	});

});

})();

/*
---
name: Core
requires: ~
provides: ~
...
*/




describe('Function.prototype.overloadSetter', function(){

	var collector, setter;
	beforeEach(function(){
		collector = {};
		setter = (function(key, value){
			collector[key] = value;
		});
	});

	it('should call a specific setter', function(){
		setter = setter.overloadSetter();
		setter('key', 'value');

		expect(collector).toEqual({key: 'value'});

		setter({
			otherKey: 1,
			property: 2
		});

		expect(collector).toEqual({
			key: 'value',
			otherKey: 1,
			property: 2
		});

		setter({
			key: 3
		});
		setter('otherKey', 4);

		expect(collector).toEqual({
			key: 3,
			otherKey: 4,
			property: 2
		});
	});

	it('should only works with objects in plural mode', function(){
		setter = setter.overloadSetter(true);

		setter({
			a: 'b',
			c: 'd'
		});

		expect(collector).toEqual({
			a: 'b',
			c: 'd'
		});
	});

});

describe('Function.prototype.overloadGetter', function(){

	var object, getter;
	beforeEach(function(){
		object = {
			aa: 1,
			bb: 2,
			cc: 3
		};

		getter = (function(key){
			return object[key] || null;
		});
	});

	it('should call a getter for each argument', function(){
		getter = getter.overloadGetter();

		expect(getter('aa')).toEqual(1);
		expect(getter('bb')).toEqual(2);
		expect(getter('cc')).toEqual(3);
		expect(getter('dd')).toBeNull();

		expect(getter('aa', 'bb', 'cc')).toEqual(object);
		expect(getter(['aa', 'bb', 'cc'])).toEqual(object);
		expect(getter(['aa', 'cc', 'dd'])).toEqual({aa: 1, cc: 3, dd: null});
	});

	it('should work in plural mode', function(){
		getter = getter.overloadGetter(true);

		expect(getter('aa')).toEqual({
			aa: 1
		});

		expect(getter(['aa', 'bb'])).toEqual({
			aa: 1,
			bb: 2
		});

	})

});

describe('typeOf', function(){

	it("should return 'array' for Array objects", function(){
		expect(typeOf([1,2])).toEqual('array');
	});

	it("should return 'string' for String objects", function(){
		expect(typeOf('ciao')).toEqual('string');
	});

	it("should return 'regexp' for RegExp objects", function(){
		expect(typeOf(/_/)).toEqual('regexp');
	});

	it("should return 'function' for Function objects", function(){
		expect(typeOf(function(){})).toEqual('function');
	});

	it("should return 'number' for Number objects", function(){
		expect(typeOf(10)).toEqual('number');
		expect(typeOf(NaN)).not.toEqual('number');
	});

	it("should return 'boolean' for Boolean objects", function(){
		expect(typeOf(true)).toEqual('boolean');
		expect(typeOf(false)).toEqual('boolean');
	});

	it("should return 'object' for Object objects", function(){
		expect(typeOf({a:2})).toEqual('object');
	});

	it("should return 'arguments' for Function arguments", function(){
		if (typeof window != 'undefined' && window.opera){ // Seems like the Opera guys can't decide on this
			var type = typeOf(arguments);
			expect(type == 'array' || type == 'arguments').toBeTruthy();
			return;
		}

		expect(typeOf(arguments)).toEqual('arguments');
	});

	it("should return 'null' for null objects", function(){
		expect(typeOf(null)).toEqual('null');
	});

	it("should return 'null' for undefined objects", function(){
		expect(typeOf(undefined)).toEqual('null');
	});

});

describe('instanceOf', function(){

	it("should return false on null object", function(){
		expect(instanceOf(null, null)).toBeFalsy();
	});

	it("should return true for Arrays", function(){
		expect(instanceOf([], Array)).toBeTruthy();
	});

	it("should return true for Numbers", function(){
		expect(instanceOf(1, Number)).toBeTruthy();
	});

	it("should return true for Objects", function(){
		expect(instanceOf({}, Object)).toBeTruthy();
	});

	it("should return true for Dates", function(){
		expect(instanceOf(new Date(), Date)).toBeTruthy();
	});

	it("should return true for Booleans", function(){
		expect(instanceOf(true, Boolean)).toBeTruthy();
	});

	it("should return true for RegExps", function(){
		expect(instanceOf(/_/, RegExp)).toBeTruthy();
	});

	it("should respect the parent property of a custom object", function(){
		var X = function(){};
		X.parent = Array;
		expect(instanceOf(new X, Array)).toBeTruthy();
	});

	// todo(ibolmo)
	var dit = typeof window != 'undefined' && window.Element && Element.set ? it : xit;
	dit("should return true for Element instances", function(){
		expect(instanceOf(new Element('div'), Element)).toBeTruthy();
	});

});

describe('Array.from', function(){

	it('should return the same array', function(){
		var arr1 = [1,2,3];
		var arr2 = Array.from(arr1);
		expect(arr1 === arr2).toBeTruthy();
	});

	it('should return an array for arguments', function(){
		var fnTest = function(){
			return Array.from(arguments);
		};
		var arr = fnTest(1,2,3);
		expect(Type.isArray(arr)).toBeTruthy();
		expect(arr.length).toEqual(3);
	});

	it('should transform a non array into an array', function(){
		expect(Array.from(1)).toEqual([1]);
	});

	it('should transforum an undefined or null into an empty array', function(){
		expect(Array.from(null)).toEqual([]);
		expect(Array.from(undefined)).toEqual([]);
	});

	it('should ignore and return an array', function(){
		expect(Array.from([1,2,3])).toEqual([1,2,3]);
	});

	it('should return a copy of arguments or the arguments if it is of type array', function(){
		// In Opera arguments is an array so it does not return a copy
		// This is intended. Array.from is expected to return an Array from an array-like-object
		// It does not make a copy when the passed in value is an array already
		var args, type, copy = (function(){
			type = typeOf(arguments);
			args = arguments;

			return Array.from(arguments);
		})(1, 2);

		expect((type == 'array') ? (copy === args) : (copy !== args)).toBeTruthy();
	});

});

describe('String.from', function(){

	it('should convert to type string', function(){
		expect(typeOf(String.from('string'))).toBe('string');

		expect(typeOf(String.from(1))).toBe('string');

		expect(typeOf(String.from(new Date))).toBe('string');

		expect(typeOf(String.from(function(){}))).toBe('string');
	});

});

describe('Function.from', function(){

	it('if a function is passed in that function should be returned', function(){
		var fn = function(a,b){ return a; };
		expect(Function.from(fn)).toEqual(fn);
	});

	it('should return a function that returns the value passed when called', function(){
		expect(Function.from('hello world!')()).toEqual('hello world!');
	});

});

describe('Number.from', function(){

	it('should return the number representation of a string', function(){
		expect(Number.from("10")).toEqual(10);
		expect(Number.from("10px")).toEqual(10);
	});

	it('should return null when it fails to return a number type', function(){
		expect(Number.from("ciao")).toBeNull();
	});

});

describe('Type', function(){

	var Instrument = new Type('Instrument', function(name){
		this.name = name;
	}).implement({

		method: function(){
			return 'playing ' + this.name;
		}

	});

	var Car = new Type('Car', function(name){
		this.name = name;
	}).implement({

		method: (function(){
			return 'driving a ' + this.name;
		}).protect()

	});

	it('should allow implementation over existing methods when a method is not protected', function(){
		Instrument.implement({
			method: function(){
				return 'playing a guitar';
			}
		});
		var myInstrument = new Instrument('Guitar');
		expect(myInstrument.method()).toEqual('playing a guitar');
	});

	it('should not override a method when it is protected', function(){
		Car.implement({
			method: function(){
				return 'hell no!';
			}
		});
		var myCar = new Car('nice car');
		expect(myCar.method()).toEqual('driving a nice car');
	});

	it('should allow generic calls', function(){
		expect(Car.method({name: 'not so nice car'})).toEqual('driving a not so nice car');
	});

	it("should be a Type", function(){
		expect(Type.isType(Instrument)).toBeTruthy();
	});

	it("should generate and evaluate correct types", function(){
		var myCar = new Car('nice car');
		expect(Type.isCar(myCar)).toBeTruthy();
	});

	it("isEnumerable method on Type should return true for arrays, arguments, objects with a numerical length property", function(){
		expect(Type.isEnumerable([1,2,3])).toBeTruthy();
		(function(){
			expect(Type.isEnumerable(arguments)).toBeTruthy();
		})(1,2,3);
		expect(Type.isEnumerable({length: 2})).toBeTruthy();
	});

	it('sould chain any function on a type', function(){
		var MyType = new Type('MyType', function(){}.implement({
			a: function(){}
		}));

		expect(MyType.alias('a', 'b').implement({
			method: function(){}
		}).extend({
			staticMethod: function(){}
		})).toBe(MyType);
	});

});

describe('Object.keys', function(){	

	var object = { a: 'string', b: 233, c: {} };

	it('keys should return an empty array', function(){
		expect(Object.keys({})).toEqual([]);
	});

	it('should return an array containing the keys of the object', function(){
		expect(Object.keys(object)).toEqual(['a', 'b', 'c']);
	});

	it('should return an array containing non-enum keys', function(){
		var buggy = {constructor: 'foo', valueOf: 'bar'};
		var keys = Object.keys(buggy).join('');
		expect(keys.indexOf('constructor') != -1).toBeTruthy();
		expect(keys.indexOf('valueOf') != -1).toBeTruthy();
	});

});

describe('Object.each', function(){

	it('should call the function for each item in the object', function(){
		var daysObj = {};
		Object.each({first: "Sunday", second: "Monday", third: "Tuesday"}, function(value, key){
			daysObj[key] = value;
		});

		expect(daysObj).toEqual({first: 'Sunday', second: 'Monday', third: 'Tuesday'});
	});

	it('should call non-enumerable properties too', function(){
		var obj = {
			foo: 'bar',
			constructor: "constructor",
			hasOwnProperty: "hasOwnProperty",
			isPrototypeOf: "isPrototypeOf",
			propertyIsEnumerable: "propertyIsEnumerable",
			toLocaleString: "toLocaleString",
			toString: "toString",
			valueOf: "valueOf"
		};

		var keysInObject = true, iteration = 0;
		var props = ['foo', 'hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'].join('');

		Object.each(obj, function(i, k){
			iteration++;
			if (props.indexOf(k) == -1) keysInObject = false;  
		});

		expect(keysInObject).toBeTruthy();
		expect(iteration).toEqual(8);
	});

});

describe('Array.each', function(){

	it('should call the function for each item in Function arguments', function(){
		var daysArr = [];
		(function(){
			Array.each(Array.from(arguments), function(value, key){
				daysArr[key] = value;
			});
		})('Sun','Mon','Tue');

		expect(daysArr).toEqual(['Sun','Mon','Tue']);
	});

	it('should call the function for each item in the array', function(){
		var daysArr = [];
		Array.each(['Sun','Mon','Tue'], function(value, i){
			daysArr.push(value);
		});

		expect(daysArr).toEqual(['Sun','Mon','Tue']);
	});

	it('should not iterate over deleted elements', function(){
		var array = [0, 1, 2, 3],
			testArray = [];
		delete array[1];
		delete array[2];

		array.each(function(value){
			testArray.push(value);
		});

		expect(testArray).toEqual([0, 3]);
	});

});

describe('Array.clone', function(){
	it('should recursively clone and dereference arrays and objects, while mantaining the primitive values', function(){
		var a = [1,2,3, [1,2,3, {a: [1,2,3]}]];
		var b = Array.clone(a);
		expect(a === b).toBeFalsy();
		expect(a[3] === b[3]).toBeFalsy();
		expect(a[3][3] === b[3][3]).toBeFalsy();
		expect(a[3][3].a === b[3][3].a).toBeFalsy();

		expect(a[3]).toEqual(b[3]);
		expect(a[3][3]).toEqual(b[3][3]);
		expect(a[3][3].a).toEqual(b[3][3].a);
	});
});

describe('Object.clone', function(){
	it('should recursively clone and dereference arrays and objects, while mantaining the primitive values', function(){
		var a = {a:[1,2,3, [1,2,3, {a: [1,2,3]}]]};
		var b = Object.clone(a);
		expect(a === b).toBeFalsy();
		expect(a.a[3] === b.a[3]).toBeFalsy();
		expect(a.a[3][3] === b.a[3][3]).toBeFalsy();
		expect(a.a[3][3].a === b.a[3][3].a).toBeFalsy();

		expect(a.a[3]).toEqual(b.a[3]);
		expect(a.a[3][3]).toEqual(b.a[3][3]);
		expect(a.a[3][3].a).toEqual(b.a[3][3].a);
	});
});

describe('Object.merge', function(){

	it('should merge any object inside the passed in object, and should return the passed in object', function(){
		var a = {a:1, b:2, c: {a:1, b:2, c:3}};
		var b = {c: {d:4}, d:4};
		var c = {a: 5, c: {a:5}};

		var merger = Object.merge(a, b);

		expect(merger).toEqual({a:1, b:2, c:{a:1, b:2, c:3, d:4}, d:4});
		expect(merger === a).toBeTruthy();

		expect(Object.merge(a, b, c)).toEqual({a:5, b:2, c:{a:5, b:2, c:3, d:4}, d:4});
	});

	it('should recursively clone sub objects and sub-arrays', function(){
		var a = {a:1, b:2, c: {a:1, b:2, c:3}, d: [1,2,3]};
		var b = {e: {a:1}, f: [1,2,3]};

		var merger = Object.merge(a, b);

		expect(a.e === b.e).toBeFalsy();
		expect(a.f === b.f).toBeFalsy();
	});

});

describe('Object.append', function(){
	it('should combine two objects', function(){
		var a = {a: 1, b: 2}, b = {b: 3, c: 4};
		expect(Object.append(a, b)).toEqual({a: 1, b: 3, c: 4});

		a = {a: 1, b: 2}; b = {b: 3, c: 4};
		expect(Object.append(a, b)).toEqual(a);

		a = {a: 1, b: 2}; b = {b: 3, c: 4};
		var c = {a: 2, d: 5};
		expect(Object.append(a, b, c)).toEqual({a: 2, b: 3, c: 4, d: 5});
	});
});

describe('Date.now', function(){

	it('should return a timestamp', function(){
		expect(Type.isNumber(Date.now())).toBeTruthy();
	});

});

describe('String.uniqueID', function(){

	it('should be a string', function(){
		expect(typeof String.uniqueID()).toBe('string');
	});

	it("should generate unique ids", function(){
		expect(String.uniqueID()).not.toEqual(String.uniqueID());
	});

});

describe('typeOf Client', function(){

	var dit = typeof document == 'undefined' ? xit : it;
	dit("should return 'collection' for HTMLElements collections", function(){
		expect(typeOf(document.getElementsByTagName('*'))).toEqual('collection');
	});

	dit("should return 'element' for an Element", function(){
		var div = document.createElement('div');
		expect(typeOf(div)).toEqual('element');
	});

	// todo(ibolmo)
	if (typeof window != 'undefined' && window.Elements) dit("should return 'elements' for Elements", function(){
		expect(typeOf(new Elements)).toEqual('elements');
	});

	if (typeof window != 'undefined' && window.Browser) dit("should return 'window' for the window object", function(){
		expect(typeOf(window)).toEqual('window');
	});

	if (typeof window != 'undefined' && window.Browser) dit("should return 'document' for the document object", function(){
		expect(typeOf(document)).toEqual('document');
	});

});

describe('Array.from', function(){

	var dit = typeof document == 'undefined' ? xit : it;
	dit('should return an array for an Elements collection', function(){
		var div1 = document.createElement('div');
		var div2 = document.createElement('div');
		var div3 = document.createElement('div');

		div1.appendChild(div2);
		div1.appendChild(div3);

		var array = Array.from(div1.getElementsByTagName('*'));
		expect(Type.isArray(array)).toEqual(true);
	});

	dit('should return an array for an Options collection', function(){
		var div = document.createElement('div');
		div.innerHTML = '<select><option>a</option></select>';
		var select = div.firstChild;
		var array = Array.from(select.options);
		expect(Type.isArray(array)).toEqual(true);
	});

});


describe('Core', function(){

	describe('typeOf', function(){
		it('should correctly report the type of arguments when using "use strict"', function(){
			"use strict";
			expect(typeOf(arguments)).toEqual('arguments');
		});
	});

});

/*
---
name: Native
requires: ~
provides: ~
...
*/



/*
---
name: Type
requires: ~
provides: ~
...
*/

(function(){

var Instrument = new Type('Instrument', function(name){
	this.name = name;
});

Instrument.implement({

	method: function(){
		return this.property + ' ' + this.name;
	},

	property: 'stuff'

});

var Car = new Type('Car', function(name){
	this.name = name;
});

Car.implement({

	property: 'stuff',

	method: function(){
		return this.name + '_' + this.property;
	}

});

describe('Type (private)', function(){

	it('should allow implementation over existing methods when browser option is not set', function(){
		Instrument.implement({ property: 'staff' });
		var myInstrument = new Instrument('xeelophone');
		expect(myInstrument.method()).toEqual('staff xeelophone');
	});

	it('should allow generic calls', function(){
		expect(Car.method({name: 'ciccio', property: 'bello'})).toEqual('ciccio_bello');
	});

	it("should have a 'native' type", function(){
		expect(Type.isType(Car)).toBeTruthy();
	});

});

})();

/*
---
name: Element.Delegation
requires: ~
provides: ~
...
*/

describe('Element.Delegation', function(){

	describe('fireEvent', function(){

		it('should fire the added `click:relay(a)` function with fireEvent', function(){

			var a = new Element('a[text=Hello World]'), result, self;
			var div = new Element('div').inject(document.body).adopt(a).addEvent('click:relay(a)', function(){
				result = arguments[1];
				self = this;
			}).fireEvent('click:relay(a)', [null, a]);

			expect(result).toEqual(a);
			expect(self).toEqual(div);

			div.destroy();

		});

		it('Should fire click events through fireEvent and delegate when a target is passed as argument', function(){

			var a = new Element('a[text="Hello World"]'), result, self;
			var div = new Element('div').inject(document.body).adopt(a).addEvent('click:relay(a)', function(){
				result = arguments[1];
				self = this;
			}).fireEvent('click', [null, a]);

			expect(result).toEqual(a);
			expect(self).toEqual(a);

			div.destroy();

		});

		it('Should not fire click events through fireEvent when added as delegated events without an target', function(){

			var spy = jasmine.createSpy('click');
			var a = new Element('a[text="Hello World"]');
			var div = new Element('div').inject(document.body).adopt(a).addEvent('click:relay(a)', spy).fireEvent('click');

			expect(spy).not.toHaveBeenCalled();

			div.destroy();

		});

	});

	describe('removeEvent', function(){

		describe('submit', function(){

			it('should remove nicely', function(){
				var element = new Element('div', {
					html: '<div><form><input type="text"></form></div>'
				});

				var input = element.getElement('input');
				var listener = function(){};

				element.addEvent('submit:relay(form)', listener);

				// IE8, fireEvent on the observer element. This adds the
				// submit event to the <form> element.
				element.fireEvent('focusin', [{target: input}, input]);

				// remove element, which also removes the form
				element.getElement('div').destroy();

				// now removing the event, should remove the submit event from the
				// form, but it's not there anymore, so it may not throw an error.
				element.removeEvent('submit:relay(form)', listener);

			});

		});

	});

});

/*
---
name: Element.Dimensions
requires: ~
provides: ~
...
*/

describe('Element.Dimensions', function(){

	var div, relDiv, absDiv, scrollDiv, tallDiv;

	beforeEach(function(){
		div = new Element('div', {
			id: 'ElementDimensionsTest',
			styles: {
				width: 100,
				height: 100,
				margin: 2,
				padding: 3,
				border: '1px solid black',
				visibility: 'hidden',
				display: 'block',
				position: 'absolute',
				top: 100,
				left: 100,
				overflow: 'hidden',
				zIndex: 1
			}
		}).inject($(document.body));

		relDiv = new Element('div', {
			styles: {
				width: 50,
				height: 50,
				margin: 5,
				padding: 5,
				border: '1px solid green',
				visibility: 'hidden',
				position: 'relative',
				overflow: 'hidden',
				'float': 'left',
				'display': 'inline'
			}
		}).inject(div);

		absDiv = new Element('div', {
			styles: {
				width: 10,
				height: 10,
				margin: 5,
				padding: 5,
				border: '1px solid red',
				visibility: 'hidden',
				position: 'absolute',
				top: 10,
				left: 10,
				overflow: 'hidden'
			}
		}).inject(relDiv);

		scrollDiv = new Element('div', {
			styles: {
				width: 100,
				height: 100,
				overflow: 'scroll',
				visibility: 'hidden',
				position: 'absolute',
				top: 0,
				left: 0
			}
		}).inject($(document.body));

		tallDiv = new Element('div', {
			styles: {
				width: 200,
				height: 200,
				visibility: 'hidden'
			}
		}).inject(scrollDiv);
	});

	describe('Element.getSize', function(){

		it('should measure the width and height of the element', function(){
			expect(div.getSize().x).toEqual(108);
			expect(div.getSize().y).toEqual(108);
		});

	});

	describe("SVG dimensions", function(){
		if (!document.addEventListener) return; // IE8- has no support for svg anyway, so this spec does not apply
		var svgElements = [{
			el: 'svg',
			prop: {
				'xmlns': 'http://www.w3.org/2000/svg',
				height: '200px',
				width: '142px',
				viewBox: '0 0 512 512'
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#E44D26",
				points: "107.644,470.877 74.633,100.62 437.367,100.62 404.321,470.819 255.778,512"
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#F16529",
				points: "256,480.523 376.03,447.246 404.27,130.894 256,130.894"
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#E44D26",
				points: "107.644,470.877 74.633,100.62 437.367,100.62 404.321,470.819 255.778,512"
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#EBEBEB",
				points: "256,268.217 195.91,268.217 191.76,221.716 256,221.716 256,176.305 255.843,176.305 142.132,176.305 143.219,188.488 154.38,313.627 256,313.627"
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#EBEBEB",
				points: "256,386.153 255.801,386.206 205.227,372.55 201.994,336.333 177.419,336.333 156.409,336.333 162.771,407.634 255.791,433.457 256,433.399"
			}
		}, {
			el: 'path',
			prop: {
				d: "M108.382,0h23.077v22.8h21.11V0h23.078v69.044H152.57v-23.12h-21.11v23.12h-23.077V0z"
			}
		}, {
			el: 'path',
			prop: {
				d: "M205.994,22.896h-20.316V0h63.72v22.896h-20.325v46.148h-23.078V22.896z"
			}
		}, {
			el: 'path',
			prop: {
				d: "M259.511,0h24.063l14.802,24.26L313.163,0h24.072v69.044h-22.982V34.822l-15.877,24.549h-0.397l-15.888-24.549v34.222h-22.58V0z"
			}
		}, {
			el: 'path',
			prop: {
				d: "M348.72,0h23.084v46.222h32.453v22.822H348.72V0z"
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#FFFFFF",
				points: "255.843,268.217 255.843,313.627 311.761,313.627 306.49,372.521 255.843,386.191 255.843,433.435 348.937,407.634 349.62,399.962 360.291,280.411 361.399,268.217 349.162,268.217"
			}
		}, {
			el: 'polygon',
			prop: {
				fill: "#FFFFFF",
				points: "255.843,176.305 255.843,204.509 255.843,221.605 255.843,221.716 365.385,221.716 365.385,221.716 365.531,221.716 366.442,211.509 368.511,188.488 369.597,176.305"
			}
		}];

		var svgContainer;
		svgElements.each(function (e, i){
			var thisElement = document.createElementNS('http://www.w3.org/2000/svg', e.el);
			thisElement.setProperties(e.prop);
			if (i == 0){
				svgContainer = thisElement
				$(document.body).adopt(thisElement);
				return
			};
			svgContainer.adopt(thisElement);
		});
		var svgElement = document.getElement('svg');

		it("should get the correct height and width of a svg element", function(){
			expect(svgElement.getSize().y).toEqual(200);
			expect(svgElement.getSize().x).toEqual(142);
			svgElement.destroy();
		});
	});

	describe('Element.getPosition', function(){

		it('should measure the x and y position of the element', function(){
			expect(div.getPosition()).toEqual({x: 102, y: 102});
		});

		it('should measure the x and y position of the element relative to another', function(){
			expect(relDiv.getPosition(div)).toEqual({x: 8, y: 8});
		});

		it('should match subpixels if needed', function(){
			var oddSizedDiv = new Element('div', {
				styles: {
					width: 51,
					height: 51,
					margin: 5,
					visibility: 'hidden',
					position: 'relative',
					overflow: 'hidden',
					'float': 'left'
				}
			}).inject($(document.body));

			var insideOddSizedDiv = new Element('div', {
				styles: {
					width: 10,
					height: 10,
					margin: 5.5,
					visibility: 'hidden',
					overflow: 'hidden'
				}
			}).inject(oddSizedDiv);

			expect(insideOddSizedDiv.getPosition(oddSizedDiv).x)
				.toEqual(insideOddSizedDiv.getBoundingClientRect().left - oddSizedDiv.getBoundingClientRect().left);
		});

	});

	describe('Element.getCoordinates', function(){

		it('should return the coordinates relative to parent', function(){
			expect(absDiv.getCoordinates(relDiv)).toEqual({left:15, top:15, width:22, height:22, right:37, bottom:37});
		});

	});

	describe('Element.getScrollSize', function(){

		it('should return the scrollSize', function(){
			expect(scrollDiv.getScrollSize()).toEqual({x:200, y:200});
		});

	});

	describe('Element.scrollTo', function(){

		it('should scroll the element', function(){
			expect(scrollDiv.scrollTo(20, 20).getScroll()).toEqual({x:20, y:20});
		});

	});

	afterEach(function(){
		[div, relDiv, absDiv, scrollDiv, tallDiv].each(function(el){
			$(el).destroy();
		});
	});

});

describe('Element.getOffsetParent', function(){

	var container, offsetParent, wrapper, child, table, td;

	beforeEach(function(){
		container = new Element('div');

		offsetParent = new Element('div', {
			styles: {position: 'relative'}
		}).inject(container);

		wrapper = new Element('div', {
			styles: {height: 0}
		}).inject(offsetParent);

		child = new Element('div').inject(wrapper);

		table = new Element('table').inject(offsetParent);

		td = new Element('td').inject(new Element('tr').inject(table));

		container.inject(document.body);

	});

	it('Should return the right offsetParent', function(){

		expect(child.getOffsetParent()).toEqual(offsetParent);

	});

	it('Should return body for elements with body as offsetParent', function(){

		expect(offsetParent.getOffsetParent()).toEqual(document.body);

	});

	it('Should return a table element for td-elements', function(){

		expect(td.getOffsetParent()).toEqual(table);

	});

	it('Should return a td element for elements with position:static inside a td', function(){

		child.inject(td);

		expect(child.getOffsetParent()).toEqual(td);

	});

	it('Should not return a td element for elements with a position other than static inside a td', function(){

		child.setStyle('position', 'absolute');

		expect(child.getOffsetParent()).toEqual(offsetParent);

	});

	it('Should return null for elements with position:fixed', function(){

		table.setStyle('position', 'fixed');

		expect(table.getOffsetParent()).toBeNull();

	});

	it('Should return null for the body element', function(){

		expect($(document.body).getOffsetParent()).toBeNull();

	});

	afterEach(function(){
		container.destroy();
	});

});

/*
---
name: Element.Event
requires: ~
provides: ~
...
*/

(function(){

var Local = Local || {};

var fire = 'fireEvent', create = function(){
	return new Element('div');
};

describe('Events API: Element', function(){

	beforeEach(function(){
		Local.called = 0;
		Local.fn = function(){
			return Local.called++;
		};
	});

	it('should add an Event to the Class', function(){
		var object = create();

		object.addEvent('event', Local.fn)[fire]('event');

		expect(Local.called).toEqual(1);
	});

	it('should add multiple Events to the Class', function(){
		create().addEvents({
			event1: Local.fn,
			event2: Local.fn
		})[fire]('event1')[fire]('event2');

		expect(Local.called).toEqual(2);
	});

	it('should remove a specific method for an event', function(){
		var object = create();
		var x = 0, fn = function(){ x++; };

		object.addEvent('event', Local.fn).addEvent('event', fn).removeEvent('event', Local.fn)[fire]('event');

		expect(x).toEqual(1);
		expect(Local.called).toEqual(0);
	});

	it('should remove an event and its methods', function(){
		var object = create();
		var x = 0, fn = function(){ x++; };

		object.addEvent('event', Local.fn).addEvent('event', fn).removeEvents('event')[fire]('event');

		expect(x).toEqual(0);
		expect(Local.called).toEqual(0);
	});

	it('should remove all events', function(){
		var object = create();
		var x = 0, fn = function(){ x++; };

		object.addEvent('event1', Local.fn).addEvent('event2', fn).removeEvents();
		object[fire]('event1')[fire]('event2');

		// Should not fail
		object.removeEvents()[fire]('event1')[fire]('event2');

		expect(x).toEqual(0);
		expect(Local.called).toEqual(0);
	});

	it('should remove events with an object', function(){
		var object = create();
		var events = {
			event1: Local.fn,
			event2: Local.fn
		};

		object.addEvent('event1', function(){ Local.fn(); }).addEvents(events)[fire]('event1');
		expect(Local.called).toEqual(2);

		object.removeEvents(events);
		object[fire]('event1');
		expect(Local.called).toEqual(3);

		object[fire]('event2');
		expect(Local.called).toEqual(3);
	});

	it('should remove an event immediately', function(){
		var object = create();

		var methods = [];

		var three = function(){
			methods.push(3);
		};

		object.addEvent('event', function(){
			methods.push(1);
			this.removeEvent('event', three);
		}).addEvent('event', function(){
			methods.push(2);
		}).addEvent('event', three);

		object[fire]('event');
		expect(methods).toEqual([1, 2]);

		object[fire]('event');
		expect(methods).toEqual([1, 2, 1, 2]);
	});

	it('should be able to remove itself', function(){
		var object = create();

		var methods = [];

		var one = function(){
			object.removeEvent('event', one);
			methods.push(1);
		};
		var two = function(){
			object.removeEvent('event', two);
			methods.push(2);
		};
		var three = function(){
			methods.push(3);
		};

		object.addEvent('event', one).addEvent('event', two).addEvent('event', three);

		object[fire]('event');
		expect(methods).toEqual([1, 2, 3]);

		object[fire]('event');
		expect(methods).toEqual([1, 2, 3, 3]);
	});

});

var fragment = document.createDocumentFragment();

// Restore native fireEvent in IE for Syn
var createElement = function(tag, props){
	var el = new Element(tag);
	if (el._fireEvent) el.fireEvent = el._fireEvent;
	return el.set(props);
};

describe('Element.Event', function(){

	it('Should trigger the click event', function(){

		var callback = jasmine.createSpy('Element.Event click');

		var el = createElement('a', {
			text: 'test',
			styles: {
				display: 'block',
				overflow: 'hidden',
				height: '1px'
			},
			events: {
				click: callback
			}
		}).inject(document.body);

		Syn.trigger('click', null, el);

		expect(callback).toHaveBeenCalled();
		el.destroy();
	});

	it('Should trigger the click event and prevent the default behavior', function(){

		var callback = jasmine.createSpy('Element.Event click with prevent');

		var el = createElement('a', {
			text: 'test',
			styles: {
				display: 'block',
				overflow: 'hidden',
				height: '1px'
			},
			events: {
				click: function(event){
					event.preventDefault();
					callback();
				}
			}
		}).inject(document.body);

		Syn.trigger('click', null, el);

		expect(callback).toHaveBeenCalled();
		el.destroy();

	});

	if (window.postMessage && !navigator.userAgent.match(/phantomjs/i)) it('Should trigger message event', function(){

		var theMessage, spy = jasmine.createSpy('message');
		window.addEvent('message', function(e){
			theMessage = e.event.data;
			spy();
		});
		window.postMessage('I am a message from outer space...', '*');
		waits(150);
		runs(function(){
			expect(spy).toHaveBeenCalled();
			expect(theMessage).toEqual('I am a message from outer space...');
		});
	});

	it('Should watch for a key-down event', function(){

		var callback = jasmine.createSpy('keydown');

		var div = createElement('div').addEvent('keydown', function(event){
			callback(event.key);
		}).inject(document.body);

		Syn.key('a', div);

		expect(callback).toHaveBeenCalledWith('a');
		div.destroy();
	});

	it('should clone events of an element', function(){

		var calls = 0;

		var element = new Element('div').addEvent('click', function(){ calls++; });
		element.fireEvent('click');

		expect(calls).toBe(1);

		var clone = new Element('div').cloneEvents(element, 'click');
		clone.fireEvent('click');

		expect(calls).toBe(2);

		element.addEvent('custom', function(){ calls += 2; }).fireEvent('custom');

		expect(calls).toBe(4);

		clone.cloneEvents(element);
		clone.fireEvent('click');

		expect(calls).toBe(5);

		clone.fireEvent('custom');

		expect(calls).toBe(7);
	});

});

describe('Element.Event', function(){
	// This is private API. Do not use.

	it('should pass the name of the custom event to the callbacks', function(){
		var callbacks = 0;
		var callback = jasmine.createSpy('Element.Event custom');

		var fn = function(anything, type){
			expect(type).toEqual('customEvent');
			callbacks++;
		};
		Element.Events.customEvent = {

			base: 'click',

			condition: function(event, type){
				fn(null, type);
				return true;
			},

			onAdd: fn,
			onRemove: fn

		};

		var div = createElement('div').addEvent('customEvent', callback).inject(document.body);

		Syn.trigger('click', null, div);

		expect(callback).toHaveBeenCalled();
		div.removeEvent('customEvent', callback).destroy();
		expect(callbacks).toEqual(3);
	});

});

describe('Element.Event.change', function(){

	it('should not fire "change" for any property', function(){
		var callback = jasmine.createSpy('Element.Event.change');

		var radio = new Element('input', {
			'type': 'radio',
			'class': 'someClass',
			'checked': 'checked'
		}).addEvent('change', callback).inject(document.body);

		radio.removeClass('someClass');
		expect(callback).not.toHaveBeenCalled();

		var checkbox = new Element('input', {
			'type': 'checkbox',
			'class': 'someClass',
			'checked': 'checked'
		}).addEvent('change', callback).inject(document.body);

		checkbox.removeClass('someClass');
		expect(callback).not.toHaveBeenCalled();

		var text = new Element('input', {
			'type': 'text',
			'class': 'otherClass',
			'value': 'text value'
		}).addEvent('change', callback).inject(document.body);

		text.removeClass('otherClass');
		expect(callback).not.toHaveBeenCalled();

		[radio, checkbox, text].invoke('destroy');
	});

});

describe('Element.Event keyup with f<key>', function(){

	it('should pass event.key == f2 when pressing f2 on keyup and keydown', function(){

		var keydown = jasmine.createSpy('keydown');
		var keyup = jasmine.createSpy('keyup');

		var div = createElement('div')
			.addEvent('keydown', function(event){
				keydown(event.key);
			})
			.addEvent('keyup', function(event){
				keyup(event.key);
			})
			.inject(document.body);

		Syn.trigger('keydown', 'f2', div);
		Syn.trigger('keyup', 'f2', div);

		expect(keydown).toHaveBeenCalledWith('f2');
		expect(keyup).toHaveBeenCalledWith('f2');

		div.destroy();

	});

});

describe('Keypress key code', function(){

	/*<ltIE8>*/
	// return early for IE8- because Syn.js does not fire events
	if (!document.addEventListener) return;
	/*</ltIE8>*/

	var input, key, shift, done;
	DOMEvent.defineKey(33, 'pageup');

	function keyHandler(e){
		key = e.key;
		shift = !!e.event.shiftKey;
	}

	function typeWriter(action){
		setTimeout(function () {
			Syn.type(action, 'keyTester');
		}, 1);
		if (done) return true;
	}

	beforeEach(function(){
		input = new Element('input', {
			'type': 'text',
			'id': 'keyTester'
		}).addEvent('keypress', keyHandler).inject(document.body);
	});

	afterEach(function(){
		input.removeEvent('keypress', keyHandler).destroy();
		input = key = shift = done = null;
	});

	it('should return "enter" in event.key', function(){
		typeWriter('[enter]');
		waits(50);
		runs(function(){
			expect(key).toBe('enter');
			expect(shift).not.toBeTruthy();
		});
	});

	it('should return "1" in event.key', function(){
		typeWriter('1');
		waits(50);
		runs(function(){
			expect(key).toBe('1');
			expect(shift).not.toBeTruthy();
		});
	});

	it('should return "!" when pressing SHIFT + 1', function(){
		typeWriter('[shift]![shift-up]');
		waits(50);
		runs(function(){
			expect(key).toBe('!');
			expect(shift).toBeTruthy();
		});
	});

	it('should map code 33 correctly with keypress event', function(){
		var mock = {type: 'keypress', which: 33, shiftKey: true};
		var e = new DOMEvent(mock);
		expect(e.key).toBe('!');
	});

});

describe('Element.removeEvent', function(){

	it('should remove the onunload method', function(){
		var text;
		var handler = function(){ text = 'nope'; };
		window.addEvent('unload', handler);
		window.removeEvent('unload', handler);
		window.fireEvent('unload');
		expect(text).toBe(undefined);
	});


});

describe('relatedTarget', function () {

	var outer = new Element('div');
	var el = new Element('div').inject(outer);
	['mouseenter', 'mouseleave', 'mouseover', 'mouseout'].each(function(event, i){
		it('should listen to a ' + event + ' event and set the correct relatedTarget', function(){
			var mockEvent = {type: event};
			mockEvent[(i % 2 == 0 ? 'from' : 'to') + 'Element'] = outer; // simulate FF that does not set relatedTarget

			var e = new DOMEvent(mockEvent);
			expect(e.type).toBe(event);
			expect(e.relatedTarget).toBe(outer);
		});
	});

});

describe('Mouse wheel', function(){

	function attachProperties(e, direction){
		e.detail = 1 * direction;
		e.wheelDelta = 1 * direction;
		e.deltaY = -1 * direction;
	}

	function dispatchFakeWheel(type, wheelDirection){

		var event;
		try {
			// Firefox
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, window, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
			attachProperties(event, wheelDirection);
			window.dispatchEvent(event);
		} catch(e){}

		try {
			// Chrome, PhantomJS, Safari
			event = document.createEvent("WheelEvent");
			event.initMouseEvent(type, 0, 100, window, 0, 0, 0, 0, null, null, null, null);
			attachProperties(event, wheelDirection);
			window.dispatchEvent(event);
		} catch(e){}

		try {
			// IE9
			event = document.createEvent("HTMLEvents");
			event.initEvent(type, true, false);
			attachProperties(event, wheelDirection);
			window.dispatchEvent(event);
		} catch(e){}

		try {
			// IE10+, Safari
			var event = document.createEvent("MouseEvents");
			event.initEvent(type, true, true);
			attachProperties(event, wheelDirection);
			window.dispatchEvent(event);
		} catch(e){}

		try {
			// IE8
			var event = document.createEventObject();
			document.documentElement.fireEvent(type, event);
		} catch(e){}
	}

	var triggered = false;
	var wheel = false;
	var testWheel = !!window.addEventListener;
	var callback = function(e){
		if (e.wheel) wheel = e.wheel > 0 ? 'wheel moved up' : 'wheel moved down';
		triggered = 'triggered';
	};

	beforeEach(function(){
		wheel = triggered = false;
		window.addEvent('mousewheel', callback);
		document.documentElement.addEvent('mousewheel', callback);
	});

	afterEach(function(){
		window.removeEvent('mousewheel', callback);
		document.documentElement.removeEvent('mousewheel', callback);
	});

	it('should trigger/listen to mousewheel event', function(){
		// http://jsfiddle.net/W6QrS/3

		['mousewheel', 'wheel' ,'DOMMouseScroll' ].each(dispatchFakeWheel);
		expect(triggered).toBeTruthy();
	});

	it('should listen to mouse wheel direction', function(){
		// http://jsfiddle.net/58yCr/

		if (!testWheel) return;

		// fire event with wheel going up
		['mousewheel', 'wheel' ,'DOMMouseScroll' ].each(function(type){
			dispatchFakeWheel(type, 120);
		});
		expect(wheel).toEqual('wheel moved up');
		wheel = false;

		// fire event with wheel going down
		['mousewheel', 'wheel' ,'DOMMouseScroll' ].each(function(type){
			dispatchFakeWheel(type, -120);
		});
		expect(wheel).toEqual('wheel moved down');
	});
});

})();

/*
---
name: Element.Style
requires: ~
provides: ~
...
*/



describe('Element.set `opacity`', function(){

	it('should set the opacity of an Element', function(){
		var el = new Element('div').setStyle('opacity', 0.4);
		if (document.html.style.opacity != null)
			expect(el.style.opacity).toEqual('0.4');
		else if (document.html.style.filter != null)
			expect(el.style.filter).toEqual('alpha(opacity=40)');
		else
			expect(el.getStyle('opacity')).toEqual(0.4);
	});

	it('should return the opacity of an Element', function(){
		var div = new Element('div').setStyle('opacity', 0.4);
		expect(div.getStyle('opacity') == 0.4).toBeTruthy();
		div.setStyle('opacity', 0);
		expect(div.getStyle('opacity') == 0).toBeTruthy();
	});

});

describe('Element.getStyle', function(){

	it('should get a six digit hex code from a three digit hex code', function(){
		var el = new Element('div').set('html', '<div style="color:#00ff00"></div>');
		expect(el.getElement('div').getStyle('color')).toEqual('#00ff00');
	});

	it('should getStyle a six digit hex code from an RGB value', function(){
		var el = new Element('div').set('html', '<div style="color:rgb(0, 255, 0)"></div>');
		expect(el.getElement('div').getStyle('color')).toEqual('#00ff00');
	});

	it('should `getStyle` with a dash in it', function(){
		var el = new Element('div').set('html', '<div style="list-style-type:square"></div>');
		expect(el.getElement('div').getStyle('list-style-type')).toEqual('square');
	});

	it('should `getStyle` padding', function(){
		var el = new Element('div').set('html', '<div style="padding:20px"></div>');
		expect(el.getElement('div').getStyle('padding-left')).toEqual('20px');
	});

});

describe('Element.setStyle', function(){

	it('should set the `styles` property on an Element using the Element constructor', function(){
		expect(new Element('div', {styles:{'color':'#00ff00'}}).getStyle('color')).toEqual('#00ff00');
	});

	it('should `setStyle` on an Element', function(){
		expect(new Element('div').setStyle('color','#00ff00').getStyle('color')).toEqual('#00ff00');
	});

	it('should properly `setStyle` for a property with a dash in it', function(){
		expect(new Element('div').setStyle('list-style-type', 'square').getStyle('list-style-type')).toEqual('square');
	});

});

describe('Element.getStyles', function(){

	it('should return multiple styles', function(){
		var el = new Element('div').set('html', '<div style="color:#00ff00;list-style-type:square"></div>');
		expect(el.getElement('div').getStyles('color', 'list-style-type')).toEqual({color:'#00ff00', 'list-style-type':'square'});
	});

});

describe('Element.setStyles', function(){

	it('should set multiple styles', function(){
		expect(new Element('div').setStyles({'list-style-type':'square', 'color':'#00ff00'}).getStyles('list-style-type', 'color')).toEqual({'list-style-type':'square', color:'#00ff00'});
	});

});

describe('Element.set opacity', function(){

	it('should not remove existent filters on browsers with filters', function(){
		var div = new Element('div'),
		hasOpacity = document.html.style.opacity != null

		if (!hasOpacity && document.html.style.filter != null && !window.opera && !Syn.browser.gecko){ //we can prolly remove the last two check
			div.style.filter = 'blur(strength=50)';
			div.set('opacity', 0.4);
			expect(div.style.filter).toMatch(/blur\(strength=50\)/i);
		}
	});

	it('should handle very small numbers with scientific notation like 1.1e-20 with opacity', function(){
		var div = new Element('div');
		div.set('opacity', 1e-20);
		div.set('opacity', 0.5);
		expect(+div.get('opacity')).toEqual(0.5);
	});

});

describe('Element.Style', function(){

	describe('opacity', function(){

		beforeEach(function(){
			var className = String.uniqueID();
			var style = this.style = $(document.createElement('style'));
			style.type = 'text/css';
			var definition = [
				'.' + className + '{',
					'opacity: 0.5;',
					'filter: alpha(opacity=50);',
					'color: #ff0000;',
				'}'
			].join('');

			// fix this, see https://github.com/mootools/mootools-core/issues/2265
			if (style.styleSheet) style.styleSheet.cssText = definition;
			else style.set('text', definition);

			document.head.appendChild(style);

			this.element = new Element('div', {
				'class': className,
				text: 'yo'
			}).inject(document.body);
		});

		afterEach(function(){
			this.style.destroy();
			this.element.destroy();
			this.element = null;
		});

		it('should get the opacity defined by the CSS', function(){
			expect(this.element.getStyle('opacity')).toEqual(0.5);
		});

		it('should set/overwrite the opacity', function(){
			this.element.setStyle('opacity', 1);
			expect(this.element.getStyle('opacity')).toEqual(1);
			this.element.setStyle('opacity', null);
			expect(this.element.getStyle('opacity')).toEqual(0.5);
		});

		it('should remove the style by setting it to `null`', function(){
			this.element.setStyle('color', '#FF9900');
			expect(this.element.getStyle('color')).toEqual('#ff9900');
			this.element.setStyle('color', null);
			expect(this.element.getStyle('color')).toEqual('#ff0000');
		});

	});

	describe('getStyle height / width / margin with CSS', function(){

		var style, element;

		it('[beforeAll]', function(){
			var className = String.uniqueID();
			style = $(document.createElement('style'));
			style.type = 'text/css';
			var definition = [
				'.' + className + '{',
					'height: 200px;',
					'width: 50%;',
					'margin-left: 20%;',
				'}'
			].join('');

			// fix this, see https://github.com/mootools/mootools-core/issues/2265
			if (style.styleSheet) style.styleSheet.cssText = definition;
			else style.set('text', definition);

			document.head.appendChild(style);

			element = new Element('div', {
				'class': className,
				text: 'yo'
			}).inject(document.body);

		});

		it('should get the height from the CSS', function(){
			expect(element.getStyle('height')).toEqual('200px');
		});

		it('should get the width from the CSS', function(){
			expect(element.getStyle('width')).toMatch(/\d+px/);
		});

		it('should not mangle the units from inline width in %', function(){
			expect(new Element('div').setStyle('width', '40%').getStyle('width')).toEqual('40%');
		});

		it('should not mangle the units from inline auto width', function(){
			expect(new Element('div').setStyle('width', 'auto').getStyle('width')).toEqual('auto');
		});

		it('should get the left margin from the CSS', function(){
			// FireFox returns px (and maybe even as floats)
			var re = /^(20\%|(\d+|\d+\.\d+)px)$/;
			expect(re.test('20%')).toBe(true);
			expect(re.test('20px')).toBe(true);
			expect(re.test('20.43px')).toBe(true);
			expect(re.test('20')).toBe(false);
			expect(re.test('auto')).toBe(false);
			expect(element.getStyle('margin-left')).toMatch(re);
		});

		it('[afterAll]', function(){
			style.destroy();
			element.destroy();
		});

	});

	describe('getStyle height / width / borders from auto values', function(){

		var element;

		it('[beforeAll]', function(){
			// the test framework stylesheet pollutes this test by setting border at 0px.
			// create an unknown element to bypass it and use browser defaults.
			element = new Element('unknown', {
				styles: {
					display: 'block'
				}
			});

			var child = new Element('div', {
				styles: {
					width: '200px',
					height: '100px'
				}
			});

			element.adopt(child).inject(document.body);
		});

		it('should inherit the height from the child', function(){
			expect(element.getStyle('height')).toEqual('100px');
		});

		it('should get a pixel based width', function(){
			expect(element.getStyle('width')).toMatch(/\d+px/);
		});

		it('should have a 0px border left', function(){
			expect(element.getStyle('borderLeftWidth')).toEqual('0px');
		});

		it('[afterAll]', function(){
			element.destroy();
		});

	});

	describe('getStyle border after setStyle', function(){

		it('should have same order when getting a previously set border', function(){
			var border = '2px solid #123abc';
			expect(new Element('div').setStyle('border', border).getStyle('border')).toEqual(border);
		});

	});

	describe('getComputedStyle margin-left on detached element', function(){

		it('should have a non-null margin-left', function(){
			expect(new Element('div').getComputedStyle('margin-left')).not.toEqual(null);
		});

	});

	describe('set/getStyle background-size', function(){

		xit('should return the correct pixel size', function(){
			var foo = new Element('div', {
				styles: {
					backgroundSize: '44px'
				}
			});
			foo.setStyle('background-size', 20);
			expect(foo.getStyle('backgroundSize')).toEqual('20px');
		});

	});

	describe('getStyle background-position', function(){
		beforeEach(function(){
			var className = 'getStyleBackgroundPosition';
			var style = this.style = $(document.createElement('style'));
			style.type = 'text/css';
			var definition = [
				'.' + className + '{',
					'background: #69a none no-repeat left bottom;',
				'}'
			].join('');

			// fix this, see https://github.com/mootools/mootools-core/issues/2265
			if (style.styleSheet) style.styleSheet.cssText = definition;
			else style.set('text', definition);

			document.head.appendChild(style);

			this.element = new Element('div', {
				'class': className,
				text: 'yo'
			}).inject(document.body);
		});

		afterEach(function(){
			this.style.destroy();
			this.element.destroy();
			this.element = null;
		});

		it('should have non-empty background-position shorthand', function(){
			expect(this.element.getStyle('background-position')).not.toEqual(null);
			expect(this.element.getStyle('background-position')).toMatch(/\w+/);
		});

		it('should not return a keyword-based background-position shorthand', function(){
			expect(this.element.getStyle('background-position')).not.toMatch(/(top|right|bottom|left)/);
			expect(this.element.getStyle('background-position')).toEqual('0% 100%');
		});

		it('should have non-empty background-position on an element with no set styles', function(){
			var element = new Element('div');
			expect(element.getStyle('background-position')).not.toEqual(null);
			expect(element.getStyle('background-position')).toMatch(/\w+/);
			element = null;
		});

		it('should remove the background-position', function(){
			var element = new Element('div');
			element.setStyle('background-position', '40px 10px');
			element.setStyle('background-position', null);
			expect(element.getStyle('background-position')).toMatch(/0px 0px|0% 0%/);
		});

	});
	
	describe('Border Radius', function(){
	
		var supportBorderRadius = document.body.style.borderRadius != null ? true : false;
		if (navigator.userAgent.match(/PhantomJS\/1./)) supportBorderRadius = false;
		var dit = supportBorderRadius ? it : xit; // don't run unless border-radius is supported
		var element = new Element('div');
		
		dit("should set and read each borderRadius corner", function(){

			expect(element.getStyle('borderRadius')).toEqual('0px 0px 0px 0px');
			element.setStyle('border-top-left-radius', '15px');
			expect(element.getStyle('border-top-left-radius')).toEqual('15px');
			expect(element.getStyle('borderRadius')).toEqual('15px 0px 0px 0px');

			element.setStyle('border-radius', '10px');
			expect(element.getStyle('border-top-left-radius')).not.toEqual('15px');
			expect(element.getStyle('border-top-left-radius')).toEqual('10px');

			element.setStyle('border-radius', '2em');
			element.setStyle('border-bottom-left-radius', '1em');
			expect(element.getStyle('border-bottom-left-radius')).toEqual('1em');
			expect(element.getStyle('border-radius')).toEqual('2em 2em 2em 1em');

			element.setStyle('border-radius', '2px 2px 0px 0px');
			expect(element.getStyle('border-radius')).toEqual('2px 2px 0px 0px');
			element.setStyle('borderRadius', '10px');
			element.setStyle('border-top-left-radius', '20px');
			element.setStyle('border-bottom-left-radius', '0px');
			expect(element.getStyle('border-top-left-radius')).toEqual('20px');
			expect(element.getStyle('border-radius')).toEqual('20px 10px 10px 0px');
			
		});
		element.destroy();
	});
	
});

/*
---
name: Element
requires: ~
provides: ~
...
*/

describe('Element constructor', function(){

	it("should return an Element with the correct tag", function(){
		var element = new Element('div');
		expect(typeOf(element)).toEqual('element');
		expect(element.getFirst).toBeDefined();
		expect(element.tagName.toLowerCase()).toEqual('div');
	});

	it('should return an Element with various attributes', function(){
		var element = new Element('div', { 'id': 'divID', 'title': 'divTitle' });
		expect(element.id).toEqual('divID');
		expect(element.title).toEqual('divTitle');
	});

	it('should return an Element with for attribute', function(){
		var label = new Element('label', { 'for': 'myId' });
		expect(label.htmlFor).toEqual('myId');
	});

	it('should return an Element with class attribute', function(){
		var div1 = new Element('div', { 'class': 'class' });
		var div2 = new Element('div', { 'class': 'class1 class2 class3' });

		expect(div1.className).toEqual('class');
		expect(div2.className).toEqual('class1 class2 class3');
	});

	it('should return input Elements with name and type attributes', function(){
		var username = new Element('input', { type: 'text', name: 'username', value: 'username' });
		var password = new Element('input', { type: 'password', name: 'password', value: 'password' });
		expect(username.type).toEqual('text');
		expect(username.name).toEqual('username');
		expect(username.value).toEqual('username');

		expect(password.type).toEqual('password');
		expect(password.name).toEqual('password');
		expect(password.value).toEqual('password');

		var dad = new Element('div');
		dad.adopt(username, password);
		dad.inject(document.body);
		expect(document.getElementsByName('username')[0]).toEqual(username);
		expect(document.getElementsByName('password')[0]).toEqual(password);
		dad.dispose();
	});

	it('should be able to use all kinds of silly characters in your name attribute values', function(){
		["foo","bar[]","b'a'z",'b"a"ng','boi ng'].each(function(name){
			var input = new Element('input', { type: 'text', name: name, value: name });
			expect(input.type).toEqual('text');
			expect(input.name).toEqual(name);
			expect(input.value).toEqual(name);
			var dad = new Element('div');
			dad.adopt(input);
			dad.inject(document.body);
			expect(document.getElementsByName(name)[0]).toEqual(input);
			dad.dispose();
		});
	});

	it('should create an element with type="email"', function(){
		var el = new Element('input', {type: 'email'});
		expect(el.get('type').match(/email|text/)).toBeTruthy();
	});

	it('should return input Elements that are checked', function(){
		var check1 = new Element('input', { type: 'checkbox' });
		var check2 = new Element('input', { type: 'checkbox', checked: true });
		var check3 = new Element('input', { type: 'checkbox', checked: 'checked' });

		expect(check1.checked).toBeFalsy();
		expect(check2.checked).toBeTruthy();
		expect(check3.checked).toBeTruthy();
	});

	it("should return a select Element that retains it's selected options", function(){
		var div = new Element('div', { 'html':
			'<select multiple="multiple" name="select[]">' +
				'<option value="" name="none">--</option>' +
				'<option value="volvo" name="volvo">Volvo</option>' +
				'<option value="saab" name="saab" selected="selected">Saab</option>' +
				'<option value="opel" name="opel" selected="selected">Opel</option>' +
				'<option value="bmw" name="bmw">BMW</option>' +
			'</select>'
		});

		var select1 = div.getFirst();
		var select2 = new Element('select', { name: 'select[]', multiple: true }).adopt(
			new Element('option', { name: 'none', value: '', html: '--' }),
			new Element('option', { name: 'volvo', value: 'volvo', html: 'Volvo' }),
			new Element('option', { name: 'saab', value: 'saab', html: 'Saab', selected: true }),
			new Element('option', { name: 'opel', value: 'opel', html: 'Opel', selected: 'selected' }),
			new Element('option', { name: 'bmw', value: 'bmw', html: 'BMW' })
		);

		expect(select1.multiple).toBeTruthy();
		expect(select2.multiple).toBeTruthy();

		expect(select1.name).toEqual(select2.name);
		expect(select1.options.length).toEqual(select2.options.length);
		expect(select1.toQueryString()).toEqual(select2.toQueryString());
	});

});

describe('Element.set', function(){

	it("should set a single attribute of an Element", function(){
		var div = new Element('div').set('id', 'some_id');
		expect(div.id).toEqual('some_id');
	});

	it("should set the checked attribute of an Element", function(){
		var input1 = new Element('input', {type: 'checkbox'}).set('checked', 'checked');
		var input2 = new Element('input', {type: 'checkbox'}).set('checked', true);
		expect(input1.checked).toBeTruthy();
		expect(input2.checked).toBeTruthy();
	});

	it("should set the class name of an element", function(){
		var div = new Element('div').set('class', 'some_class');
		expect(div.className).toEqual('some_class');
	});

	it("should set the for attribute of an element", function(){
		var input = new Element('label', {type: 'text'}).set('for', 'some_element');
		expect(input.htmlFor).toEqual('some_element');
	});

	it("should set the html of an Element", function(){
		var html = '<a href="http://mootools.net/">Link</a>';
		var parent = new Element('div').set('html', html);
		expect(parent.innerHTML.toLowerCase()).toEqual(html.toLowerCase());
	});

	it("should set the html of an Element with multiple arguments", function(){
		var html = ['<p>Paragraph</p>', '<a href="http://mootools.net/">Link</a>'];
		var parent = new Element('div').set('html', html);
		expect(parent.innerHTML.toLowerCase()).toEqual(html.join('').toLowerCase());
	});

	it("should set the html of a select Element", function(){
		var html = '<option>option 1</option><option selected="selected">option 2</option>';
		var select = new Element('select').set('html', html);
		expect(select.getChildren().length).toEqual(2);
		expect(select.options.length).toEqual(2);
		expect(select.selectedIndex).toEqual(1);
	});

	it("should set the html of a table Element", function(){
		var html = '<tbody><tr><td>cell 1</td><td>cell 2</td></tr><tr><td class="cell">cell 1</td><td>cell 2</td></tr></tbody>';
		var table = new Element('table').set('html', html);
		expect(table.getChildren().length).toEqual(1);
		expect(table.getFirst().getFirst().getChildren().length).toEqual(2);
		expect(table.getFirst().getLast().getFirst().className).toEqual('cell');
	});

	it("should set the html of a tbody Element", function(){
		var html = '<tr><td>cell 1</td><td>cell 2</td></tr><tr><td class="cell">cell 1</td><td>cell 2</td></tr>';
		var tbody = new Element('tbody').inject(new Element('table')).set('html', html);
		expect(tbody.getChildren().length).toEqual(2);
		expect(tbody.getLast().getFirst().className).toEqual('cell');
	});

	it("should set the html of a tr Element", function(){
		var html = '<td class="cell">cell 1</td><td>cell 2</td>';
		var tr = new Element('tr').inject(new Element('tbody').inject(new Element('table'))).set('html', html);
		expect(tr.getChildren().length).toEqual(2);
		expect(tr.getFirst().className).toEqual('cell');
	});

	it("adopting should not change the parent of the element doing the adopting", function(){
		var baldGuy = new Element('div');
		var annie = new Element('span');

		gramps = baldGuy.getParent();
		baldGuy.adopt(annie);
		expect(baldGuy.getParent()).toEqual(gramps)
	});

	it("should set the html of a td Element", function(){
		var html = '<span class="span">Some Span</span><a href="#">Some Link</a>';
		var td = new Element('td').inject(new Element('tr').inject(new Element('tbody').inject(new Element('table')))).set('html', html);
		expect(td.getChildren().length).toEqual(2);
		expect(td.getFirst().className).toEqual('span');
	});

	it("should set the style attribute of an Element", function(){
		var style = 'font-size:12px;line-height:23px;';
		var div = new Element('div').set('style', style);
		expect(div.style.lineHeight).toEqual('23px');
		expect(div.style.fontSize).toEqual('12px');
	});

	it("should set the text of an element", function(){
		var div = new Element('div').set('text', 'some text content');
		expect(div.get('text')).toEqual('some text content');
		expect(div.innerHTML).toEqual('some text content');
	});

	it("should set multiple attributes of an Element", function(){
		var div = new Element('div').set({ id: 'some_id', 'title': 'some_title', 'html': 'some_content' });
		expect(div.id).toEqual('some_id');
		expect(div.title).toEqual('some_title');
		expect(div.innerHTML).toEqual('some_content');
	});

	it("should set various attributes of a script Element", function(){
		var script = new Element('script').set({ type: 'text/javascript', defer: 'defer' });
		expect(script.type).toEqual('text/javascript');
		expect(script.defer).toBeTruthy();
	});

	it("should set various attributes of a table Element", function(){
		var table1 = new Element('table').set({ border: '2', cellpadding: '3', cellspacing: '4', align: 'center' });
		var table2 = new Element('table').set({ cellPadding: '3', cellSpacing: '4' });
		expect(table1.border == 2).toBeTruthy();
		expect(table1.cellPadding == 3).toBeTruthy();
		expect(table2.cellPadding == 3).toBeTruthy();
		expect(table1.cellSpacing == 4).toBeTruthy();
		expect(table2.cellSpacing == 4).toBeTruthy();
		expect(table1.align).toEqual('center');
	});

});

var myElements = new Elements([
	new Element('div'),
	document.createElement('a'),
	new Element('div', {id: 'el-' + Date.now()})
]);

describe('Elements', function(){

	

	it('should return an elements type', function(){
		expect(typeOf(myElements) == 'elements').toBeTruthy();
	});

	it('should return an array of Elements', function(){
		expect(myElements.every(function(e){ return typeOf(e) == 'element'; })).toBeTruthy();
	});

	it('should apply Element prototypes to the returned array', function(){
		expect(myElements.getFirst).toBeDefined();
	});

	it('should return all Elements that match the string matcher', function(){
		var filter = myElements.filter('div');

		expect(filter[0] == myElements[0] && filter[1] == myElements[2] && filter.length == 2).toBeTruthy();
	});

	it('should return all Elements that match the comparator', function(){
		var elements = myElements.filter(function(element){
			return element.match('a');
		});
		expect(elements[0] == myElements[1] && elements.length == 1).toBeTruthy();
	});

});

describe('TextNode.constructor', function(){

	it('should return a new textnode element', function(){
		var text = document.newTextNode('yo');
		expect(typeOf(text)).toEqual('textnode');
	});

});

describe('IFrame constructor', function(){

	it('should return a new IFrame', function(){
		var iFrame1 = document.createElement('iframe');
		var iFrame2 = new IFrame();
		expect(iFrame1.tagName).toEqual(iFrame2.tagName);
	});

	it('should return the same IFrame if passed', function(){
		var iFrame1 = document.createElement('iframe');
		var iFrame2 = new IFrame(iFrame1);
		expect(iFrame1).toEqual(iFrame2);
	});

});

describe('$', function(){

	beforeEach(function(){
		Container = document.createElement('div');
		Container.innerHTML = '<div id="dollar"></div>';
		document.body.appendChild(Container);
	});

	afterEach(function(){
		document.body.removeChild(Container);
		Container = null;
	});

	it('should return an extended Element by string id', function(){
		var dollar1 = document.getElementById('dollar');
		var dollar2 = $('dollar');

		expect(dollar1).toEqual(dollar2);
		expect(dollar1.getFirst).toBeDefined();
	});

	it('should return the window if passed', function(){
		var win = $(window);
		expect(win == window).toBeTruthy();
	});

	it('should return the document if passed', function(){
		expect($(document)).toEqual(document);
	});

	it('should return null if string not found or type mismatch', function(){
		expect($(1)).toBeNull();
		expect($('nonexistant')).toBeNull();
	});

});

describe('$$', function(){

	it('should return all Elements of a specific tag', function(){
		var divs1 = $$('div');
		var divs2 = new Elements(Array.from(document.getElementsByTagName('div')));
		expect(divs1).toEqual(divs2);
	});

	it('should return multiple Elements for each specific tag', function(){
		var uidOf = (typeof $uid != 'undefined') ? $uid : Slick.uidOf;
		var sortBy = function(a, b){
			a = uidOf(a); b = uidOf(b);
			return a > b ? 1 : -1;
		};
		var headers1 = $$('h3', 'h4').sort(sortBy);
		var headers2 = new Elements(Array.flatten([document.getElementsByTagName('h3'), document.getElementsByTagName('h4')])).sort(sortBy);
		expect(headers1).toEqual(headers2);
	});

	it('should return an empty array if not is found', function(){
		expect($$('not_found')).toEqual(new Elements([]));
	});

});

describe('getDocument', function(){

	it('should return the owner document for elements', function(){
		var doc = document.newElement('div').getDocument();
		expect(doc).toEqual(document);
	});

	it('should return the owned document for window', function(){
		var doc = window.getDocument();
		expect(doc).toEqual(document);
	});

	it('should return self for document', function(){
		var doc = document.getDocument();
		expect(doc).toEqual(document);
	});

});

describe('getWindow', function(){

	it('should return the owner window for elements', function(){
		var win = document.newElement('div').getWindow();
		expect(win == window).toBeTruthy();
	});

	it('should return the owner window for document', function(){
		var win = document.getWindow();
		expect(win == window).toBeTruthy();
	});

	it('should return self for window', function(){
		var win = window.getWindow();
		expect(win == window).toBeTruthy();
	});

});

describe('Element.getElement', function(){

	beforeEach(function(){
		Container = new Element('div');
		Container.innerHTML = '<div id="first"></div><div id="second"></div><p></p><a></a>';
	});

	afterEach(function(){
		Container = null;
	});

	it('should return the first Element to match the tag, otherwise null', function(){
		var child = Container.getElement('div');
		expect(child.id).toEqual('first');
		expect(Container.getElement('iframe')).toBeNull();
	});

});

describe('Element.getElements', function(){

	beforeEach(function(){
		Container = new Element('div');
		Container.innerHTML = '<div id="first"></div><div id="second"></div><p></p><a></a>';
	});

	afterEach(function(){
		Container = null;
	});

	it('should return all the elements that match the tag', function(){
		var children = Container.getElements('div');
		expect(children.length).toEqual(2);
	});

	it('should return all the elements that match the tags', function(){
		var children = Container.getElements('div,a');
		expect(children.length).toEqual(3);
		expect(children[2].tagName.toLowerCase()).toEqual('a');
	});

});

describe('Document.getElement', function(){

	it('should return the first Element to match the tag, otherwise null', function(){
		var div = document.getElement('div');
		var ndiv = document.getElementsByTagName('div')[0];
		expect(div).toEqual(ndiv);

		var notfound = document.getElement('canvas');
		expect(notfound).toBeNull();
	});

});

describe('Document.getElements', function(){

	it('should return all the elements that match the tag', function(){
		var divs = document.getElements('div');
		var ndivs = new Elements(document.getElementsByTagName('div'));
		expect(divs).toEqual(ndivs);
	});

	it('should return all the elements that match the tags', function(){
		var headers = document.getElements('h3,h4');
		var headers2 = new Elements(Array.flatten([document.getElementsByTagName('h3'), document.getElementsByTagName('h4')]));
		expect(headers.length).toEqual(headers2.length);
	});

});

describe('Element.getElementById', function(){

	beforeEach(function(){
		Container = new Element('div');
		Container.innerHTML = '<div id="first"></div><div id="second"></div><p></p><a></a>';
		document.body.appendChild(Container);
	});

	afterEach(function(){
		document.body.removeChild(Container);
		Container = null;
	});

	it('should getElementById that matches the id, otherwise null', function(){
		expect(Container.getElementById('first')).toEqual(Container.childNodes[0]);
		expect(Container.getElementById('not_found')).toBeNull();
	});

});

describe('Element.get style', function(){

	it("should return a CSS string representing the Element's styles", function(){
		var style = 'font-size:12px;color:rgb(255,255,255)';
		var myElement = new Element('div').set('style', style);
		expect(myElement.get('style').toLowerCase().replace(/\s/g, '').replace(/;$/, '')).toMatch(/(font-size:12px;color:rgb\(255,255,255\))|(color:rgb\(255,255,255\);font-size:12px)/);
		//I'm replacing these characters (space and the last semicolon) as they are not vital to the style, and browsers sometimes include them, sometimes not.
	});

});

describe('Element.get tag', function(){

	it("should return the Element's tag", function(){
		var myElement = new Element('div');
		expect(myElement.get('tag')).toEqual('div');
	});

});

describe('Element.get', function(){

	it("should get an absolute href", function(){
		var link = new Element('a', {href: "http://google.com/"});
		expect(link.get('href')).toEqual("http://google.com/");
	});

	it("should get an absolute href to the same domain", function(){
		var link = new Element('a', {href: window.location.href});
		expect(link.get('href')).toEqual(window.location.href);
	});

	it("should get a relative href", function(){
		var link = new Element('a', {href: "../index.html"});
		expect(link.get('href')).toEqual("../index.html");
	});

	it("should get a host absolute href", function(){
		var link = new Element('a', {href: "/developers"});
		expect(link.get('href')).toEqual("/developers");
	});

	it("should return null when attribute is missing", function(){
		var link = new Element('a');
		expect(link.get('href')).toBeNull();
	});

});

describe('Element.erase', function(){

	it("should erase an Element's property", function(){
		var myElement = new Element('a', {href: 'http://mootools.net/', title: 'mootools!'});
		expect(myElement.get('title')).toEqual('mootools!');
		expect(myElement.erase('title').get('title')).toBeNull();
	});

	it("should erase an Element's style", function(){
		var myElement = new Element('div', {style: "color:rgb(255, 255, 255); font-size:12px;"});
		myElement.erase('style');
		expect(myElement.get('style')).toEqual('');
	});

});

describe('Element.match', function(){

	it('should return true if tag is not provided', function(){
		var element = new Element('div');
		expect(element.match()).toBeTruthy();
	});

	it("should return true if the Element's tag matches", function(){
		var element = new Element('div');
		expect(element.match('div')).toBeTruthy();
	});

});

describe('Element.inject', function(){

	beforeEach(function(){
		var html = [
			'<div id="first"></div>',
			'<div id="second">',
				'<div id="first-child"></div>',
				'<div id="second-child"></div>',
			'</div>'
		].join('');
		Container = new Element('div', {style: 'position:absolute;top:0;left:0;visibility:hidden;', html: html});
		document.body.appendChild(Container);

		test = new Element('div', {id:'inject-test'});
	});

	afterEach(function(){
		document.body.removeChild(Container);
		Container.set('html', '');
		Container = null;
		test = null;
	});

	it('should inject the Element before an Element', function(){
		test.inject($('first'), 'before');
		expect(Container.childNodes[0]).toEqual(test);

		test.inject($('second-child'), 'before');
		expect(Container.childNodes[1].childNodes[1]).toEqual(test);
	});

	it('should inject the Element after an Element', function(){
		test.inject($('first'), 'after');
		expect(Container.childNodes[1]).toEqual(test);

		test.inject($('first-child'), 'after');
		expect(Container.childNodes[1].childNodes[1]).toEqual(test);
	});

	it('should inject the Element at bottom of an Element', function(){
		var first = $('first');
		test.inject(first, 'bottom');
		expect(first.childNodes[0]).toEqual(test);

		var second = $('second');
		test.inject(second, 'bottom');
		expect(second.childNodes[2]).toEqual(test);

		test.inject(Container, 'bottom');
		expect(Container.childNodes[2]).toEqual(test);
	});

	it('should inject the Element inside an Element', function(){
		var first = $('first');
		test.inject(first, 'inside');
		expect(first.childNodes[0]).toEqual(test);

		var second = $('second');
		test.inject(second, 'inside');
		expect(second.childNodes[2]).toEqual(test);

		test.inject(Container, 'inside');
		expect(Container.childNodes[2]).toEqual(test);
	});

	it('should inject the Element at the top of an Element', function(){
		test.inject(Container, 'top');
		expect(Container.childNodes[0]).toEqual(test);

		var second = $('second');
		test.inject(second, 'top');
		expect(second.childNodes[0]).toEqual(test);
	});

	it('should inject the Element in an Element', function(){
		var first = $('first');
		test.inject(first);
		expect(first.childNodes[0]).toEqual(test);

		var second = $('second');
		test.inject(second);
		expect(second.childNodes[2]).toEqual(test);

		test.inject(Container);
		expect(Container.childNodes[2]).toEqual(test);
	});

});

describe('Element.replaces', function(){

	it('should replace an Element with the Element', function(){
		var parent = new Element('div');
		var div = new Element('div', {id: 'original'}).inject(parent);
		var el = new Element('div', {id: 'replaced'});
		el.replaces(div);
		expect(parent.childNodes[0]).toEqual(el);
	});

});

describe('Element.grab', function(){

	beforeEach(function(){
		var html = [
			'<div id="first"></div>',
			'<div id="second">',
				'<div id="first-child"></div>',
				'<div id="second-child"></div>',
			'</div>'
		].join('');
		Container = new Element('div', {style: 'position:absolute;top:0;left:0;visibility:hidden;', html: html}).inject(document.body);

		test = new Element('div', {id:'grab-test'});
	});

	afterEach(function(){
		document.body.removeChild(Container);
		Container.set('html', '');
		Container = null;
		test = null;
	});

	it('should grab the Element before this Element', function(){
		$('first').grab(test, 'before');
		expect(Container.childNodes[0]).toEqual(test);

		$('second-child').grab(test, 'before');
		expect(Container.childNodes[1].childNodes[1]).toEqual(test);
	});

	it('should grab the Element after this Element', function(){
		$('first').grab(test, 'after');
		expect(Container.childNodes[1]).toEqual(test);

		$('first-child').grab(test, 'after');
		expect(Container.childNodes[1].childNodes[1]).toEqual(test);
	});

	it('should grab the Element at the bottom of this Element', function(){
		var first = $('first');
		first.grab(test, 'bottom');
		expect(first.childNodes[0]).toEqual(test);

		var second = $('second');
		second.grab(test, 'bottom');
		expect(second.childNodes[2]).toEqual(test);

		Container.grab(test, 'bottom');
		expect(Container.childNodes[2]).toEqual(test);
	});

	it('should grab the Element inside this Element', function(){
		var first = $('first');
		first.grab(test, 'inside');
		expect(first.childNodes[0]).toEqual(test);

		var second = $('second');
		second.grab(test, 'inside');
		expect(second.childNodes[2]).toEqual(test);

		Container.grab(test, 'inside');
		expect(Container.childNodes[2]).toEqual(test);
	});

	it('should grab the Element at the top of this Element', function(){
		Container.grab(test, 'top');
		expect(Container.childNodes[0]).toEqual(test);

		var second = $('second');
		second.grab(test, 'top');
		expect(second.childNodes[0]).toEqual(test);
	});

	it('should grab an Element in the Element', function(){
		var first = $('first').grab(test);
		expect(first.childNodes[0]).toEqual(test);

		var second = $('second').grab(test);
		expect(second.childNodes[2]).toEqual(test);

		Container.grab(test);
		expect(Container.childNodes[2]).toEqual(test);
	});

});

describe('Element.wraps', function(){

	it('should replace and adopt the Element', function(){
		var div = new Element('div');
		var child = new Element('p').inject(div);

		var wrapper = new Element('div', {id: 'wrapper'}).wraps(div.childNodes[0]);
		expect(div.childNodes[0]).toEqual(wrapper);
		expect(wrapper.childNodes[0]).toEqual(child);
	});

});

describe('Element.appendText', function(){

	beforeEach(function(){
		Container = new Element('div', {style: 'position:absolute;top:0;left:0;visibility:hidden;'}).inject(document.body);
		var html = [
			'<div id="first"></div>',
			'<div id="second">',
				'<div id="first-child"></div>',
				'<div id="second-child"></div>',
			'</div>'
		].join('');
		Container.set('html', html);
	});

	afterEach(function(){
		document.body.removeChild(Container);
		Container.set('html', '');
		Container = null;
		test = null;
	});

	it('should append a TextNode before this Element', function(){
		$('first').appendText('test', 'before');
		expect(Container.childNodes[0].nodeValue).toEqual('test');

		$('second-child').appendText('test', 'before');
		expect(Container.childNodes[2].childNodes[1].nodeValue).toEqual('test');
	});

	it('should append a TextNode the Element after this Element', function(){
		$('first').appendText('test', 'after');
		expect(Container.childNodes[1].nodeValue).toEqual('test');

		$('first-child').appendText('test', 'after');
		expect(Container.childNodes[2].childNodes[1].nodeValue).toEqual('test');
	});

	it('should append a TextNode the Element at the bottom of this Element', function(){
		var first = $('first');
		first.appendText('test', 'bottom');
		expect(first.childNodes[0].nodeValue).toEqual('test');

		var second = $('second');
		second.appendText('test', 'bottom');
		expect(second.childNodes[2].nodeValue).toEqual('test');

		Container.appendText('test', 'bottom');
		expect(Container.childNodes[2].nodeValue).toEqual('test');
	});

	it('should append a TextNode the Element inside this Element', function(){
		var first = $('first');
		first.appendText('test', 'inside');
		expect(first.childNodes[0].nodeValue).toEqual('test');

		var second = $('second');
		second.appendText('test', 'inside');
		expect(second.childNodes[2].nodeValue).toEqual('test');

		Container.appendText('test', 'inside');
		expect(Container.childNodes[2].nodeValue).toEqual('test');
	});

	it('should append a TextNode the Element at the top of this Element', function(){
		Container.appendText('test', 'top');
		expect(Container.childNodes[0].nodeValue).toEqual('test');

		var second = $('second');
		second.appendText('test', 'top');
		expect(second.childNodes[0].nodeValue).toEqual('test');
	});

	it('should append a TextNode an Element in the Element', function(){
		var first = $('first').appendText('test');
		expect(first.childNodes[0].nodeValue).toEqual('test');

		var second = $('second').appendText('test');
		expect(second.childNodes[2].nodeValue).toEqual('test');

		Container.appendText('test');
		expect(Container.childNodes[2].nodeValue).toEqual('test');
	});

});

describe('Element.adopt', function(){


	beforeEach(function(){
		Container = new Element('div').inject(document.body);
		Container.empty();
	});

	afterEach(function(){
		document.body.removeChild(Container);
		Container.set('html', '');
		Container = null;
	});

	it('should adopt an Element by its id', function(){
		var child = new Element('div', {id: 'adopt-me'});
		document.body.appendChild(child);
		Container.adopt('adopt-me');
		expect(Container.childNodes[0]).toEqual(child);
	});

	it('should adopt an Element', function(){
		var child = new Element('p');
		Container.adopt(child);
		expect(Container.childNodes[0]).toEqual(child);
	});

	it('should adopt any number of Elements or ids', function(){
		var children = [];
		(100).times(function(i){ children[i] = new Element('span', {id: 'child-' + i}); });
		Container.adopt(children);
		expect(Container.childNodes.length).toEqual(100);
		expect(Container.childNodes[10]).toEqual(children[10]);
	});

});

describe('Element.dispose', function(){

	it('should dispose the Element from the DOM', function(){
		var Container = new Element('div').inject(document.body);

		var child = new Element('div').inject(Container);
		child.dispose();
		expect(Container.childNodes.length).toEqual(0);

		document.body.removeChild(Container);
		Container.set('html', '');
		Container = null;
	});

});

describe('Element.clone', function(){

	beforeEach(function(){
		Container = new Element('div', {'id': 'outer', 'class': 'moo'});
		Container.innerHTML = '<span class="foo" id="inner1"><div class="movie" id="sixfeet">under</div></span><span id="inner2"></span>';
	});

	afterEach(function(){
		Container = null;
	});

	it('should return a clone', function(){
		var div = new Element('div');
		var clone = div.clone();
		expect(div).not.toEqual(clone);
		expect(typeOf(div)).toEqual('element');
		expect(typeOf(clone)).toEqual('element');
	});

	it('should remove id from clone and clone children by default', function(){
		var clone = Container.clone();
		expect(clone.getElementsByTagName('*').length).toEqual(3);
		expect(clone.className).toEqual('moo');
		expect(clone.id).toEqual('');
		expect(Container.id).toEqual('outer');
	});

	it('should remove all ids', function(){
		var clone = Container.clone(true);
		expect(clone.id).toEqual('');
		expect(clone.childNodes.length).toEqual(2);
		expect(clone.childNodes[0].id).toEqual('');
		expect(clone.childNodes[0].childNodes[0].id).toEqual('');
		expect(clone.childNodes[0].className).toEqual('foo');
	});

	it('should keep id if specified', function(){
		var clone = Container.clone(true, true);
		expect(clone.id).toEqual('outer');
		expect(clone.childNodes.length).toEqual(2);
		expect(clone.childNodes[0].id).toEqual('inner1');
		expect(clone.childNodes[0].childNodes[0].id).toEqual('sixfeet');
		expect(clone.childNodes[0].className).toEqual('foo');
	});

	it('should clone empty href attribute', function(){
		var clone = new Element('div', {
			html: '<a href="">empty anchor</a>'
		}).getFirst().clone();

		expect(clone.getAttribute('href', 2)).toEqual('');
	});

	it('should not clone Element Storage', function(){
		Container.store('drink', 'milk');
		var clone = Container.clone();
		expect(clone.retrieve('drink')).toBeNull();
		expect(Container.retrieve('drink')).toEqual('milk');
	});

	

	var dit = it; // don't run unless no compat
	dit('should clone child nodes and not copy their uid', function(){
		var cloned = Container.clone(true).getElements('*');
		var old = Container.getElements('*');
		expect(cloned.length).toEqual(3);
		expect(old.length).toEqual(3);
		expect(new Elements([old, cloned]).length).toEqual(2);
	});

	it('should clone a text input and retain value', function(){
		var inputs = new Element('div', { 'html': '' +
			'<input id="input1" type="text" value="Some Value" />' +
			'<input id="input2" type="text" />'
		}).getChildren();

		var input1 = inputs[0].clone();
		var input2 = inputs[1].clone(false, true);

		expect(!input1.id).toBeTruthy();
		expect(input2.id).toEqual('input2');
		expect(input1.value).toEqual('Some Value');
		expect(input2.value).toEqual('');
	});

	it('should clone a textarea and retain value', function(){
		var textareas = new Element('div', { 'html': '' +
			'<textarea id="textarea1"></textarea>' +
			'<textarea id="textarea2">Some-Text-Here</textarea>'
		}).getChildren();

		var textarea1 = textareas[0].clone();
		var textarea2 = textareas[1].clone(false, true);

		expect(!textarea1.id).toBeTruthy();
		expect(textarea2.id).toEqual('textarea2');
		expect(textarea1.value).toEqual('');
		expect(textarea2.value).toEqual('Some-Text-Here');
	});

	it('should clone a checkbox and retain checked state', function(){
		var checks = new Element('div', { 'html': '' +
			'<input id="check1" type="checkbox" />' +
			'<input id="check2" type="checkbox" checked="checked" />'
		}).getChildren();

		var check1 = checks[0].clone();
		var check2 = checks[1].clone(false, true);

		expect(!check1.id).toBeTruthy();
		expect(check2.id).toEqual('check2');
		expect(check1.checked).toBeFalsy();
		expect(check2.checked).toBeTruthy();
	});

	it('should clone a select and retain selected state', function(){
		var selects = new Element('div', { 'html': '' +
			'<select name="select" id="select1">' +
				'<option>--</option>' +
				'<option value="volvo">Volvo</option>' +
				'<option value="saab">Saab</option>' +
				'<option value="opel" selected="selected">Opel</option>' +
				'<option value="bmw">BMW</option>' +
			'</select>' +
			'<select name="select[]" id="select2" multiple="multiple">' +
				'<option>--</option>' +
				'<option value="volvo">Volvo</option>' +
				'<option value="saab">Saab</option>' +
				'<option value="opel" selected="selected">Opel</option>' +
				'<option value="bmw" selected="selected">BMW</option>' +
			'</select>'
		}).getChildren();

		var select1 = selects[0].clone(true);
		var select2 = selects[1].clone(true, true);

		expect(!select1.id).toBeTruthy();
		expect(select2.id).toEqual('select2');
		expect(select1.selectedIndex).toEqual(3);
		expect(select2.options[3].selected).toBeTruthy();
		expect(select2.options[4].selected).toBeTruthy();
	});

	it('should clone custom attributes', function(){
		var div = new Element('div');
		div.setAttribute('foo', 'FOO');

		expect(div.clone().getAttribute('foo')).toEqual('FOO');
	});

});

describe('Element className methods', function(){

	it('should return true if the Element has the given class', function(){
		var div = new Element('div', {'class': 'header bold\tunderline'});
		expect(div.hasClass('header')).toBeTruthy();
		expect(div.hasClass('bold')).toBeTruthy();
		expect(div.hasClass('underline')).toBeTruthy();
	});

	it('should return false if the element does not have the given class', function(){
		var div = new Element('div', {'class': 'header bold'});
		expect(div.hasClass('italics')).toBeFalsy();
		expect(div.hasClass('head')).toBeFalsy();
	});

	it('should add the class to the Element', function(){
		var div = new Element('div');
		div.addClass('myclass');
		expect(div.hasClass('myclass')).toBeTruthy();
	});

	it('should append classes to the Element', function(){
		var div = new Element('div', {'class': 'myclass'});
		div.addClass('aclass');
		expect(div.hasClass('aclass')).toBeTruthy();
	});

	it('should remove the class in the Element', function(){
		var div = new Element('div', {'class': 'myclass'});
		div.removeClass('myclass');
		expect(div.hasClass('myclass')).toBeFalsy();
	});

	it('should only remove the specific class', function(){
		var div = new Element('div', {'class': 'myclass aclass'});
		div.removeClass('myclass');
		expect(div.hasClass('myclass')).toBeFalsy();
	});

	it('should not remove any class if the class is not found', function(){
		var div = new Element('div', {'class': 'myclass'});
		div.removeClass('extra');
		expect(div.hasClass('myclass')).toBeTruthy();
	});

	it('should add the class if the Element does not have the class', function(){
		var div = new Element('div');
		div.toggleClass('myclass');
		expect(div.hasClass('myclass')).toBeTruthy();
	});

	it('should remove the class if the Element does have the class', function(){
		var div = new Element('div', {'class': 'myclass'});
		div.toggleClass('myclass');
		expect(div.hasClass('myclass')).toBeFalsy();
	});

});

describe('Element.empty', function(){

	it('should remove all children', function(){
		var children = [];
		(5).times(function(i){ children[i] = new Element('p'); });
		var div = new Element('div').adopt(children);
		div.empty();
		expect(div.get('html')).toEqual('');
	});

});

describe('Element.destroy', function(){

	it('should obliterate the Element from the universe', function(){
		var div = new Element('div', {id: 'destroy-test'}).inject(document.body);
		var result = div.destroy();
		expect(result).toBeNull();
		expect($('destroy-test')).toBeNull();
	});

});

describe('Element.toQueryString', function(){

	it('should return an empty string for an Element that does not have form Elements', function(){
		var div = new Element('div');
		expect(div.toQueryString()).toEqual('');
	});

	it('should ignore any form Elements that do not have a name, disabled, or whose value is false', function(){
		var form = new Element('form').adopt(
			new Element('input', { name: 'input', disabled: true, type: 'checkbox', checked: true, value: 'checked' }),
			new Element('select').adopt(
				new Element('option', { name: 'volvo', value: false, html: 'Volvo' }),
				new Element('option', { value: 'saab', html: 'Saab', selected: true })
			),
			new Element('textarea', { name: 'textarea', disabled: true, value: 'textarea-value' })
		);
		expect(form.toQueryString()).toEqual('');
	});

	it("should return a query string containing even empty values, multiple select may have no selected options", function(){
		var form = new Element('form',{'html':
			'<input type="checkbox" name="input" value="" checked="checked" />' +
			'<select name="select[]" multiple="multiple" size="5">' +
				'<option name="none" value="">--</option>' +
				'<option name="volvo" value="volvo">Volvo</option>' +
				'<option name="saab" value="saab">Saab</option>' +
				'<option name="opel" value="opel">Opel</option>' +
				'<option name="bmw" value="bmw">BMW</option>' +
			'</select>' +
			'<textarea name="textarea"></textarea>'
		});
		expect(form.toQueryString()).toEqual('input=&textarea=');
	});

	it("should return a query string ignoring submit, reset and file form Elements", function(){
		var form = new Element('form', { 'html': '' +
			'<input type="checkbox" name="input" value="checked" checked="checked" />' +
			'<input type="file" name="file" />' +
			'<textarea name="textarea">textarea-value</textarea>' +
			'<input type="submit" name="go" value="Go" />' +
			'<input type="reset" name="cancel" value="Reset" />'
		});
		expect(form.toQueryString()).toEqual('input=checked&textarea=textarea-value');
	});

});

describe('Element.getProperty', function(){

	it('should getProperty from an Element', function(){
		var anchor1 = new Element('a');
		anchor1.href = 'http://mootools.net';
		expect(anchor1.getProperty('href')).toEqual('http://mootools.net');

		var anchor2 = new Element('a');
		anchor2.href = '#someLink';
		expect(anchor2.getProperty('href')).toEqual('#someLink');
	});

	it('should getProperty type of an input Element', function(){
		var input1 = new Element('input', {type: 'text'});
		expect(input1.getProperty('type')).toEqual('text');

		var input2 = new Element('input', {type: 'checkbox'});
		expect(input2.getProperty('type')).toEqual('checkbox');

		var div = new Element('div', {'html':
			'<select name="test" id="test" multiple="multiple">' +
				'<option value="1">option-value</option>' +
			'</select>'
		});
		var input3 = div.getElement('select');
		expect(input3.getProperty('type')).toEqual('select-multiple');
		expect(input3.getProperty('name')).toEqual('test');
	});

	it('should getPropety checked from an input Element', function(){
		var checked1 = new Element('input', { type: 'checkbox' });
		checked1.checked = 'checked';
		expect(checked1.getProperty('checked')).toBeTruthy();

		var checked2 = new Element('input', { type: 'checkbox' });
		checked2.checked = true;
		expect(checked2.getProperty('checked')).toBeTruthy();

		var checked3 = new Element('input', { type: 'checkbox' });
		checked3.checked = false;
		expect(checked3.getProperty('checked')).toBeFalsy();
	});

	it('should getProperty disabled from an input Element', function(){
		var disabled1 = new Element('input', { type: 'text' });
		disabled1.disabled = 'disabled';
		expect(disabled1.getProperty('disabled')).toBeTruthy();

		var disabled2 = new Element('input', { type: 'text' });
		disabled2.disabled = true;
		expect(disabled2.getProperty('disabled')).toBeTruthy();

		var disabled3 = new Element('input', { type: 'text' });
		disabled3.disabled = false;
		expect(disabled3.getProperty('disabled')).toBeFalsy();
	});

	it('should getProperty readonly from an input Element', function(){
		var readonly1 = new Element('input', { type: 'text' });
		readonly1.readOnly = 'readonly';
		expect(readonly1.getProperty('readonly')).toBeTruthy();

		var readonly2 = new Element('input', { type: 'text' });
		readonly2.readOnly = true;
		expect(readonly2.getProperty('readonly')).toBeTruthy();

		var readonly3 = new Element('input', { type: 'text' });
		readonly3.readOnly = false;
		expect(readonly3.getProperty('readonly')).toBeFalsy();
	});

});

describe('Element.setProperty', function(){

	it('should setProperty from an Element', function(){
		var anchor1 = new Element('a').setProperty('href', 'http://mootools.net/');
		expect(anchor1.getProperty('href')).toEqual('http://mootools.net/');

		var anchor2 = new Element('a').setProperty('href', '#someLink');
		expect(anchor2.getProperty('href')).toEqual('#someLink');
	});

	it('should setProperty type of an input Element', function(){
		var input1 = new Element('input').setProperty('type', 'text');
		expect(input1.getProperty('type')).toEqual('text');

		var input2 = new Element('input').setProperty('type', 'checkbox');
		expect(input2.getProperty('type')).toEqual('checkbox');
	});

	it('should setProperty checked from an input Element', function(){
		var checked1 = new Element('input', { type: 'checkbox' }).setProperty('checked', 'checked');
		expect(checked1.getProperty('checked')).toBeTruthy();

		var checked2 = new Element('input', { type: 'checkbox' }).setProperty('checked', true);
		expect(checked2.getProperty('checked')).toBeTruthy();

		var checked3 = new Element('input', { type: 'checkbox' }).setProperty('checked', false);
		expect(checked3.getProperty('checked')).toBeFalsy();
	});

	it('should setProperty disabled of an input Element', function(){
		var disabled1 = new Element('input', { type: 'text' }).setProperty('disabled', 'disabled');
		expect(disabled1.getProperty('disabled')).toBeTruthy();

		var disabled2 = new Element('input', { type: 'text' }).setProperty('disabled', true);
		expect(disabled2.getProperty('disabled')).toBeTruthy();

		var disabled3 = new Element('input', { type: 'text' }).setProperty('disabled', false);
		expect(disabled3.getProperty('disabled')).toBeFalsy();
	});

	it('should setProperty readonly of an input Element', function(){
		var readonly1 = new Element('input', { type: 'text' }).setProperty('readonly', 'readonly');
		expect(readonly1.getProperty('readonly')).toBeTruthy();

		var readonly2 = new Element('input', { type: 'text' }).setProperty('readonly', true);
		expect(readonly2.getProperty('readonly')).toBeTruthy();

		var readonly3 = new Element('input', { type: 'text' }).setProperty('readonly', false);
		expect(readonly3.getProperty('readonly')).toBeFalsy();
	});

	it('should setProperty defaultValue of an input Element', function(){
		var form = new Element('form');
		var defaultValue = new Element('input', {'type': 'text', 'value': '321'});
		expect(defaultValue.getProperty('value')).toEqual('321');
		defaultValue.setProperty('defaultValue', '123');
		form.grab(defaultValue);
		form.reset();
		expect(defaultValue.getProperty('value')).toEqual('123');
	});

});

describe('Element.getProperties', function(){

	it('should return an object associate with the properties passed', function(){
		var readonly = new Element('input', { type: 'text', readonly: 'readonly' });
		var props = readonly.getProperties('type', 'readonly');
		expect(props).toEqual({ type: 'text', readonly: true });
	});

});

describe('Element.setProperties', function(){

	it('should set each property to the Element', function(){
		var readonly = new Element('input').setProperties({ type: 'text', readonly: 'readonly' });
		var props = readonly.getProperties('type', 'readonly');
		expect(props).toEqual({ type: 'text', readonly: true });
	});

});

describe('Element.removeProperties', function(){

	it('should remove each property from the Element', function(){
		var anchor = new Element('a', {href: '#', title: 'title', rel: 'left'});
		anchor.removeProperties('title', 'rel');
		expect(anchor.getProperties('href', 'title', 'rel')).toEqual({ href: '#', title: null, rel: null });
	});

});

describe('Element.getPrevious', function(){

	it('should return the previous Element, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(children[1].getPrevious()).toEqual(children[0]);
		expect(children[0].getPrevious()).toBeNull();
	});

	it('should return the previous Element that matches, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('a'), new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(children[1].getPrevious('a')).toEqual(children[0]);
		expect(children[1].getPrevious('span')).toBeNull();
	});

});

describe('Element.getAllPrevious', function(){

	it('should return all the previous Elements, otherwise an empty array', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(children[2].getAllPrevious()).toEqual(new Elements([children[1], children[0]]));
		expect(children[0].getAllPrevious()).toEqual(new Elements([]));
	});

	it('should return all the previous Elements that match, otherwise an empty array', function(){
		var container = new Element('div');
		var children = [new Element('a'), new Element('div'), new Element('a'), new Element('div')];
		container.adopt(children);
		expect(children[3].getAllPrevious('a')).toEqual(new Elements([children[2], children[0]]));
		expect(children[1].getAllPrevious('span')).toEqual(new Elements([]));
	});

});

describe('Element.getNext', function(){

	it('should return the next Element, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(children[1].getNext()).toEqual(children[2]);
		expect(children[2].getNext()).toBeNull();
	});

	it('should return the previous Element that matches, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('div'), new Element('div'), new Element('a')];
		container.adopt(children);
		expect(children[1].getNext('a')).toEqual(children[3]);
		expect(children[1].getNext('span')).toBeNull();
	});

});

describe('Element.getAllNext', function(){

	it('should return all the next Elements, otherwise an empty array', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(children[0].getAllNext()).toEqual(new Elements(children.slice(1)));
		expect(children[2].getAllNext()).toEqual(new Elements([]));
	});

	it('should return all the next Elements that match, otherwise an empty array', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('a'), new Element('div'), new Element('a')];
		container.adopt(children);
		expect(children[0].getAllNext('a')).toEqual(new Elements([children[1], children[3]]));
		expect(children[0].getAllNext('span')).toEqual(new Elements([]));
	});

});

describe('Element.getFirst', function(){

	it('should return the first Element in the Element, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('a'), new Element('div')];
		container.adopt(children);
		expect(container.getFirst()).toEqual(children[0]);
		expect(children[0].getFirst()).toBeNull();
	});

});

describe('Element.getLast', function(){

	it('should return the last Element in the Element, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('a'), new Element('div')];
		container.adopt(children);
		expect(container.getLast()).toEqual(children[2]);
		expect(children[0].getLast()).toBeNull();
	});

	it('should return the last Element in the Element that matches, otherwise null', function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('a'), new Element('div'), new Element('a')];
		container.adopt(children);
		expect(container.getLast('a')).toEqual(children[3]);
		expect(container.getLast('span')).toBeNull();
	});

});

describe('Element.getParent', function(){

	it('should return the parent of the Element, otherwise null', function(){
		var container = new Element('p');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(children[1].getParent()).toEqual(container);
		expect(container.getParent()).toBeNull();
	});

	it('should return the parent of the Element that matches, otherwise null', function(){
		var container = new Element('p');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(new Element('div').adopt(children));
		expect(children[1].getParent('p')).toEqual(container);
		expect(children[1].getParent('table')).toBeNull();
	});

});

describe('Element.getParents', function(){

	it('should return the parents of the Element, otherwise returns an empty array', function(){
		var container = new Element('p');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(new Element('div').adopt(new Element('div').adopt(children)));
		expect(children[1].getParents()).toEqual(new Elements([container.getFirst().getFirst(), container.getFirst(), container]));
		expect(container.getParents()).toEqual(new Elements([]));
	});

	it('should return the parents of the Element that match, otherwise returns an empty array', function(){
		var container = new Element('p');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(new Element('div').adopt(new Element('div').adopt(children)));
		expect(children[1].getParents('div')).toEqual(new Elements([container.getFirst().getFirst(), container.getFirst()]));
		expect(children[1].getParents('table')).toEqual(new Elements([]));
	});

});

describe('Element.getChildren', function(){

	it("should return the Element's children, otherwise returns an empty array", function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('div'), new Element('div')];
		container.adopt(children);
		expect(container.getChildren()).toEqual(new Elements(children));
		expect(children[0].getChildren()).toEqual(new Elements([]));
	});

	it("should return the Element's children that match, otherwise returns an empty array", function(){
		var container = new Element('div');
		var children = [new Element('div'), new Element('a'), new Element('a')];
		container.adopt(children);
		expect(container.getChildren('a')).toEqual(new Elements([children[1], children[2]]));
		expect(container.getChildren('span')).toEqual(new Elements([]));
	});

});

describe('Element.hasChild', function(){

	beforeEach(function(){
		Local = {};
		Local.container = new Element('div');
		Local.children = [new Element('div'), new Element('div'), new Element('div')];
		Local.container.adopt(Local.children);
		Local.grandchild = new Element('div').inject(Local.children[1]);
	});

	afterEach(function(){
		Local = null;
	});

	

	it("should return true if the Element is a child or grandchild", function(){
		expect(Local.container.contains(Local.children[0])).toBeTruthy();
		expect(Local.container.contains(Local.children[2])).toBeTruthy();
		expect(Local.container.contains(Local.grandchild)).toBeTruthy();
	});

	it("should return true if it's the Element itself", function(){
		expect(Local.container.contains(Local.container)).toBeTruthy();
	});

	it("should return false if the Element is the parent or a sibling", function(){
		expect(Local.children[2].contains(Local.container)).toBeFalsy();
		expect(Local.children[2].contains(Local.children[1])).toBeFalsy();
	});

});

describe('Elements.extend', function(){

	

	it('should be able to append a collection', function(){
		var items = [
			new Element('span'),
			new Element('span'),
			new Element('p'),
			new Element('p')
		];
		var container = new Element('div').adopt(items);

		container.getElements('span').append(container.getElements('p'));
		expect(new Elements(items)).toEqual(container.getElements('*'));
		expect(items.length).toEqual(4);
	});

});

describe('document.id', function(){

	it('should find IDs with special characters', function(){
		var element = new Element('div#id\\.part.class').inject(document.body);

		var found = document.id('id.part');
		expect(found).toBe(element);
		expect(found.id).toBe('id.part');
		expect(found.className).toBe('class');

		element.destroy();

		element = new Element('div#id\\#part').inject(document.body);

		found = document.id('id#part');
		expect(found).toBe(element);
		expect(found.id).toBe('id#part');
	});

});

describe('Element.getElementById', function(){

	it('should find IDs with special characters', function(){
		var inner = new Element('div#id\\.part');
		var outer = new Element('div').adopt(inner);

		expect(outer.getElementById('id.part')).toBe(inner);
		expect(inner.id).toBe('id.part');
	});

});

describe('Element.removeProperty', function(){

	it('should removeProperty from an Element', function (){
		var readonly = new Element('input', { type: 'text', readonly: 'readonly', maxlength: 10 });
		readonly.removeProperty('readonly');
		readonly.removeProperty('maxlength');
		var props = readonly.getProperties('type', 'readonly');
		expect(props).toEqual({type: 'text', readonly: false});

		var maxlength = readonly.getProperty('maxlength');
		expect(!maxlength || maxlength == 2147483647).toBeTruthy(); // ie6/7 Bug
	});

});

describe('Element.toQueryString', function(){

	it("should return a query string from the Element's form Elements", function(){
		var form = new Element('form', { 'html': '' +
			'<input type="checkbox" name="input" value="checked" checked="checked" />' +
			'<select name="select[]" multiple="multiple" size="5">' +
				'<option name="none" value="">--</option>' +
				'<option name="volvo" value="volvo">Volvo</option>' +
				'<option name="saab" value="saab" selected="selected">Saab</option>' +
				'<option name="opel" value="opel" selected="selected">Opel</option>' +
				'<option name="bmw" value="bmw">BMW</option>' +
			'</select>' +
			'<textarea name="textarea">textarea-value</textarea>'
		});
		expect(form.toQueryString()).toEqual('input=checked&select%5B%5D=saab&select%5B%5D=opel&textarea=textarea-value');
	});

	it("should return a query string containing even empty values, single select must have a selected option", function(){
		var form = new Element('form').adopt(
			new Element('input', {name: 'input', type: 'checkbox', checked: true, value: ''}),
			new Element('select', {name: 'select[]'}).adopt(
				new Element('option', {name: 'none', value: '', html: '--', selected: true}),
				new Element('option', {name: 'volvo', value: 'volvo', html: 'Volvo'}),
				new Element('option', {name: 'saab', value: 'saab', html: 'Saab'}),
				new Element('option', {name: 'opel', value: 'opel', html: 'Opel'}),
				new Element('option', {name: 'bmw', value: 'bmw', html: 'BMW'})
			),
			new Element('textarea', {name: 'textarea', value: ''})
		);
		expect(form.toQueryString()).toEqual('input=&select%5B%5D=&textarea=');
		expect(form.getElementsByTagName('select')[0].selectedIndex).toEqual(0);
	});

});

describe('Element.clone', function(){

	it('should clone children of object elements', function(){
		var div = new Element('div').set('html', '<div id="swfobject-video" class="video">' +
			'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="425" height="344">' +
				'<param name="movie" value="http://www.youtube.com/v/6nOVQDMOvvE&amp;rel=0&amp;color1=0xb1b1b1&amp;color2=0xcfcfcf&amp;hl=en_US&amp;feature=player_embedded&amp;fs=1" />' +
				'<param name="wmode" value="opaque" />' +
				'<param name="quality" value="high" />' +
				'<param name="bgcolor" value="#000616" />' +
				'<param name="allowFullScreen" value="true" />' +
				'<!--[if !IE]>-->' +
				'<object type="application/x-shockwave-flash" data="http://www.youtube.com/v/6nOVQDMOvvE&amp;rel=0&amp;color1=0xb1b1b1&amp;color2=0xcfcfcf&amp;hl=en_US&amp;feature=player_embedded&amp;fs=1" width="425" height="344">' +
				'<param name="wmode" value="opaque" />' +
				'<param name="quality" value="high" />' +
				'<param name="bgcolor" value="#000616" />' +
				'<param name="allowFullScreen" value="true" />' +
				'<!--<![endif]-->' +
				'<p class="flash-required">Flash is required to view this video.</p>' +
				'<!--[if !IE]>-->' +
				'</object>' +
				'<!--<![endif]-->' +
			'</object>' +
		'</div>');

		expect(div.clone().getElementsByTagName('param').length).toBeGreaterThan(0);

		div = new Element('div').set('html', '<div id="ie-video" class="video">' +
			'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="425" height="344">' +
				'<param name="movie" value="http://www.youtube.com/v/6nOVQDMOvvE&amp;rel=0&amp;color1=0xb1b1b1&amp;color2=0xcfcfcf&amp;hl=en_US&amp;feature=player_embedded&amp;fs=1" />' +
				'<param name="wmode" value="opaque" />' +
				'<param name="quality" value="high" />' +
				'<param name="bgcolor" value="#000616" />' +
				'<param name="allowFullScreen" value="true" />' +
			'</object>' +
		'</div>');

		expect(div.clone().getElementsByTagName('param').length).toBeGreaterThan(0);
	});

	it('should set the ID of the cloned element and then fetch it with document.id', function(){
		var cloneMe = new Element('div', {id: 'cloneMe', text: 'cloneMe'}).inject(document.body);
		var cloned = $('cloneMe').clone();
		expect(cloned.get('id')).toEqual(null);
		cloned.set('id', 'sauce').inject(cloneMe.parentNode);
		expect(cloned.get('id')).toEqual('sauce');
		var sauceHTML = new Element('div').adopt($('sauce')).get('html');
		var cloneHTML = new Element('div').adopt(cloned).get('html');
		expect(sauceHTML).toEqual(cloneHTML);
		cloneMe.destroy();
		cloned.destroy();
	});

});

describe('Elements implement order', function(){

	it('should give precedence to Array over Element', function(){
		var anchor = new Element('a');

		var element = new Element('div').adopt(
			new Element('span'),
			anchor
		);

		expect(element.getLast()).toBe(anchor);

		expect(new Elements([element, anchor]).getLast()).toBe(anchor);
	});

});

describe('Element traversal', function(){

	it('should match against all provided selectors', function(){
		var div = new Element('div').adopt(
			new Element('span').adopt(
				new Element('a')
			)
		);

		var span = div.getElement('span');
		var anchor = span.getElement('a');

		expect(anchor.getParent('div, span')).toBe(div);
		expect(anchor.getParent('span, div')).toBe(span);

		expect(anchor.getParent('tagname, div')).toBe(div);
		expect(anchor.getParent('div > span')).toBe(span);
	});

});

describe('Elements.prototype.erase', function(){

	var element = new Element('div', {
		html: '<div></div><p></p><span></span>'
	});

	var original = element.getChildren();
	var altered = element.getChildren().erase(original[1]);

	it('should decrease the length of the collection', function(){
		expect(altered.length).toEqual(2);
	});

	it('should remove an element from the collection', function(){
		expect(altered[1]).toEqual(original[2]);
	});

	it('should remove the last element from the collection', function(){
		expect(altered[2]).toEqual(undefined);
	});

});

describe('Element.set("html")', function(){

	it("should set the html of a tr Element, even when it has no parentNode", function(){
		var html = '<td class="cell c">cell 1</td><td>cell 2</td>';
		var tr = new Element('tr');
		expect(tr.parentNode).toEqual(null);
		// In IE using appendChild like in set('html') sets the parentNode to a documentFragment
		tr.set('html', html).inject(new Element('tbody').inject(new Element('table')));
		expect(tr.get('html').toLowerCase().replace(/>\s+</, '><')).toEqual(html);
		expect(tr.getChildren().length).toEqual(2);
		expect(tr.getFirst().className).toEqual('cell c');
	});

	it("should set the html of a style Element", function(){

		var styleElement = document.createElement('style');
		var def = 'body {color: red;}';
		styleElement.setAttribute("type", "text/css");
		var docHead = document.getElementsByTagName('head')[0];
		docHead.appendChild(styleElement);
		if (styleElement.styleSheet){       // IE
			styleElement.styleSheet.cssText = def;
		} else {                             // the world
			var node = document.createTextNode(def);
			styleElement.appendChild(node);
		}

		styleElement = $(styleElement),
			innerStyleA = '* { color: #a0a}',
			innerStyleB = '.testStyling { font: 44px/44px Courier}';

		function fixString(s){
			// because browsers return content with different case/space formatting
			return s.toLowerCase().replace(/\t|\s/g,'');
		}
		function getStyles(){
			return fixString(styleElement.get('html'));
		}

		styleElement.set('html', innerStyleA);
		expect(getStyles()).toEqual(fixString(innerStyleA));

		styleElement.erase('html');
		expect(getStyles()).toEqual('');

		styleElement.set('html', innerStyleB);
		expect(getStyles()).toEqual(fixString(innerStyleB));
		styleElement.destroy();
	});

	it('should set the text of a style Element', function(){
		
		var docHead = $(document.head);
		var styleElement = new Element('style', {type: 'text/css'}).inject(docHead);
		var definition = [
			'.pos-abs-left {',
				'position: absolute;',
				'width: 200px;',
				'height: 200px;',
				'left: 10%;',
				'background: red;',
			'}'
		].join('');
		styleElement.set('text', definition);
		var returned = styleElement.get('text').toLowerCase();
		expect(returned.indexOf('position: absolute')).not.toEqual(-1);
		expect(returned.indexOf('width: 200px')).not.toEqual(-1);
		expect(returned.indexOf('height: 200px')).not.toEqual(-1);
		expect(returned.indexOf('left: 10%')).not.toEqual(-1);
		expect(returned.indexOf('background: red')).not.toEqual(-1);
		styleElement.destroy();
	});

});

describe('Elements.empty', function(){

	it('should empty the Elements collection', function(){
		var list = $$('div').empty();

		expect(list.length).toEqual(0);
		expect(list[0]).toBe(undefined);
	});

});

describe('Elements.append', function(){

	it('should append an Elements collection', function(){
		var list = new Element('div').adopt(
			new Element('div'),
			new Element('div')
		).getChildren();

		var p = new Element('div').adopt(
			new Element('p'),
			new Element('p')
		).getChildren();

		var appended = list.append(p);

		expect(appended).toBe(list);
		expect(appended).toEqual(new Elements([list[0], list[1], p[0], p[1]]));
	});

});

describe('Elements.concat', function(){

	it('should concat an Elements collection', function(){
		var list = new Element('div').adopt(
			new Element('div'),
			new Element('div')
		).getChildren();

		var p = new Element('div').adopt(
			new Element('p'),
			new Element('p')
		).getChildren();

		var concatenated = list.concat(p[0], p[1]);

		expect(concatenated).not.toBe(list);
		expect(concatenated).toEqual(new Elements([list[0], list[1], p[0], p[1]]));

		expect(typeOf(concatenated)).toBe('elements');
	});

});

describe('Element.getElement', function(){

	it('should return null', function(){
		var div = new Element('div'),
			a = new Element('a'),
			span = new Element('span'),
			p = new Element('span');

		p.adopt(span, a);
		div.adopt(p);

		var element = div.getElement();
		expect(element).toBe(null);
	});

});

describe('Element.getElements', function(){

	it('should return an empty collection', function(){
		var div = new Element('div'),
			a = new Element('a'),
			span = new Element('span'),
			p = new Element('span');

		p.adopt(span, a);
		div.adopt(p);

		var elements = div.getElements();
		expect(elements.length).toBe(0);
	});

	it('should return an empty collection if called on document.body', function(){
		expect($(document.body).getElements()).toEqual(new Elements);
	});

});

describe('Element.getFirst', function(){

	it('should return last the first element only if it matches the expression', function(){
		var container = new Element('div');
		var children = [new Element('div').adopt(new Element('a')), new Element('a'), new Element('div')];
		container.adopt(children);
		expect(container.getFirst('div')).toBe(children[0]);
		expect(container.getFirst('a')).toBe(children[1]);
		expect(container.getFirst('span')).toBeNull();
	});
});

describe('Element.getLast', function(){

	it('should return the last element only if it matches the expression', function(){
		var container = new Element('div');
		var children = [new Element('div').adopt(new Element('a')), new Element('a'), new Element('div')];
		container.adopt(children);
		expect(container.getLast('div')).toBe(children[2]);
		expect(container.getLast('a')).toBe(children[1]);
		expect(container.getLast('span')).toBeNull();
	});
});

describe('Elements.unshift', function(){

	it('should not allow to unshift any value', function(){
		var container = new Element('div').adopt(
			new Element('span'),
			new Element('p')
		);

		var collection = container.getElements('*'),
			length = collection.length;
		collection.unshift('someRandomValue');

		expect(collection.length).toBe(length);

		collection.unshift(new Element('p'), new Element('span'));
		expect(collection.length).toBe(length + 2);
		expect(collection.filter('p').length).toBe(2);
		expect(collection.filter('span').length).toBe(2);
	});

});

describe('Element.getProperty', function(){

	it('should get the attrubte of a form when the form has an input with as ID the attribute name', function(){
		var div = new Element('div');
		div.innerHTML = '<form action="s"><input id="action"></form>';
		expect($(div.firstChild).getProperty('action')).toEqual('s');
	});

	it('should ignore expandos', function(){
		var div = new Element('div');
		expect(div.getProperty('inject')).toBeNull();
	});

	it('should work in collaboration with setProperty', function(){
		var div = new Element('div', {random: 'attribute'});
		expect(div.getProperty('random')).toEqual('attribute');
	});

	it('should get custom attributes in html', function(){
		var div = new Element('div', {html: '<div data-load="typical"></div>'}).getFirst();
		expect(div.get('data-load')).toEqual('typical');

		div = new Element('div', {html: '<div data-custom></div>'}).getFirst();
		expect(div.get('data-custom')).toEqual('');

		div = new Element('div', {html: '<div data-custom="nested"><a data-custom="other"></a></div>'}).getFirst();
		expect(div.get('data-custom')).toEqual('nested');

		div = new Element('div', {html: '<div><a data-custom="other"></a></div>'}).getFirst();
		expect(div.get('data-custom')).toEqual(null);

		div = new Element('div', {html: '<a data-custom="singular" href="#">href</a>'}).getFirst();
		expect(div.get('data-custom')).toEqual('singular');

		div = new Element('div', {html: '<div class="><" data-custom="evil attribute values"></div>'}).getFirst();
		expect(div.get('data-custom')).toEqual('evil attribute values');

		div = new Element('div', {html: '<div class="> . <" data-custom="aggrevated evil attribute values"></div>'}).getFirst();
		expect(div.get('data-custom')).toEqual('aggrevated evil attribute values');

		div = new Element('div', {html: '<a href="#"> data-custom="singular"</a>'}).getFirst();
		expect(div.get('data-custom')).toEqual(null);
	});

});

describe('Element.set', function(){

	describe('value', function(){

		it('should return `null` when the value of a input element is set to `undefined`', function(){
			var value;
			expect(new Element('input', {value: value}).get('value')).toEqual('');
		});

		it('should set a falsey value and not an empty string', function(){
			expect(new Element('input', {value: false}).get('value')).toEqual('false');
			expect(new Element('input', {value: 0}).get('value')).toEqual('0');
		});

		it('should set the selected option for a select element to matching string w/o falsy matches', function(){
			var form = new Element('form');
			form.set('html', '<select>\
				<option value="">no value</option>\
				<option value="0">value 0</option>\
				<option value="1">value 1</option>\
				</select>');
			expect(form.getElement('select').set('value', 0).get('value')).toEqual('0');
		});

	});

	describe('type', function(){

		it('should set the type of a button', function(){
			expect(new Element('button', {type: 'button'}).get('type')).toEqual('button');
		});

	});

	describe('value as object with toString()', function(){

		it('should call the toString() method of a passed object', function(){
			var a = new Element('a').set('href', {toString: function(){ return '1'; }});
			expect(a.get('href')).toEqual('1');
		});

	});

});

describe("Element.setProperty('type')", function(){

	it('should keep the input value after setting a input field to another type (submit button)', function(){
		var input = new Element('input', {value: 'myValue', type: 'text'});
		input.setProperty('type', 'submit');
		expect(input.getProperty('value')).toEqual('myValue');
	});

	it('should set the right type and value of input fields when a input field is created with CSS selectors', function(){
		var input = new Element('input[type="submit"]', {value: 'myValue'});
		expect(input.getProperty('value')).toEqual('myValue');
	});

});

describe('Element.get', function(){

	describe('value', function(){

		it('should get the value of a option element when it does not have the value attribute', function(){
			var select = new Element('select').set('html', '<option>s</option>');
			expect(select.getElement('option').get('value')).toEqual('s');
		});

		it('should return the text of the selected option for a select element', function(){
			var form = new Element('form');
			form.set('html', '<select>\
				<option>value 1</option>\
				<option>value 2</option>\
				<option selected>value 3</option>\
				<option>value 4</option>\
				</select>');
			expect(form.getElement('select').get('value')).toEqual('value 3');
		});

		it('should return the text of the selected option for a multiple select element', function(){
			var form = new Element('form');
			form.set('html', '<select multiple>\
				<option>value 1</option>\
				<option selected>value 2</option>\
				<option selected>value 3</option>\
				<option>value 4</option>\
				</select>');
			expect(form.getElement('select').get('value')).toEqual('value 2');
		});

		it('should return the text of the first option of aselect element', function(){
			var form = new Element('form');
			form.set('html', '<select>\
				<option>value 1</option>\
				<option>value 2</option>\
				</select>');
			expect(form.getElement('select').get('value')).toEqual('value 1');
		});

		it('should return value of a select element', function(){
			var form = new Element('form');
			form.set('html', '<select multiple>\
				<option value="one">value 1</option>\
				<option selected value="two">value 2</option>\
				</select>');
			expect(form.getElement('select').get('value')).toEqual('two');
		});

	});

	describe('text', function(){

		it('should return the original text with `text-transform: uppercase`', function(){
			var div = new Element('div', {html: '<div style="text-transform: uppercase">text</div>'});
			div.inject(document.body);
			expect($(div.firstChild).get('text')).toEqual('text');
			div.destroy();
		});

	});

});

describe('tabIndex', function(){

	it('should get and set the correct tabIndex', function(){
		var div = document.createElement('div');
		div.innerHTML = '<input tabindex="2">';
		expect($(div.firstChild).get('tabindex')).toEqual(2);
		expect($(div.firstChild).set('tabindex', 3).get('tabindex')).toEqual(3);
	});

});

if (document.createElement('video').canPlayType){
	describe('Video/Audio loop, controls, and autoplay set/get attributes', function(){

		it('should set/get the boolean value of loop, controls, and autoplay', function(){
			try{
				var div = new Element('div', {html: '<video loop controls autoplay>'}),
					video = div.getElement('video');

				if ('loop' in video){
					expect(video.getProperty('loop')).toBe(true);
					expect(video.setProperty('loop', false).getProperty('loop')).toBe(false);
				}
				expect(video.getProperty('controls')).toBe(true);
				expect(video.setProperty('controls', false).getProperty('controls')).toBe(false);
				expect(video.getProperty('autoplay')).toBe(true);
				expect(video.setProperty('autoplay', false).getProperty('autoplay')).toBe(false);
			}catch(O_o){
				if(O_o.message.indexOf('Not implemented') == -1){
					expect(O_o.message + " : "+O_o).toBe("")
				}
			}
	});

	});
}

describe("Element.set('html')", function(){

	describe('HTML5 tags', function(){

		it('should create childNodes for html5 tags', function(){
			expect(new Element('div', {html: '<nav>Muu</nav><p>Tuuls</p><section>!</section>'}).childNodes.length).toEqual(3);
		});

	});

	describe('Numbers', function(){

		it('should set a number (so no string) as html', function(){
			expect(new Element('div', {html: 20}).innerHTML).toEqual('20');
		});

	});

	describe('Arrays', function(){

		it('should allow an Array as input, the text is concatenated', function(){
			expect(new Element('div', {html: ['moo', 'rocks', 'your', 'socks', 1]}).innerHTML).toEqual('moorocksyoursocks1');
		});

	});

});

describe("Element.erase('html')", function(){

	it('should empty the html inside an element', function(){
		expect(new Element('div', {html: '<p>foo bar</p>'}).erase('html').innerHTML).toEqual('');
	});

});

describe('Element.clone', function(){

	it('should not crash IE for multiple clones', function(){
		new Element('div', {
			html: '<ul id="testContainer"><li id="template"></li></ul>'
		}).inject(document.body);

		var container = $('testContainer'),
		template = container.getElement('li#template').dispose();

		template.clone().set('html', 'Clone #1').inject('testContainer');
		template.clone().set('html', 'Clone #2').inject('testContainer');

		container.destroy();
	});

});

describe('Element.erase', function(){

	var elements, subject, image, textarea;

	beforeEach(function(){
		elements = [
			subject = new Element('div'),
			image = new Element('img'),
			textarea = new Element('div', {html: '<textarea id="t1">hello</textarea>'}).getFirst()
		].invoke('inject', document.body);
	});

	afterEach(function(){
		elements.invoke('destroy');
	});

	it('should erase the class of an Element', function(){
		subject.set('class', 'test');
		subject.erase('class');
		expect(subject.get('class')).toEqual(null);
	});

	it('should erase the id of an Element', function(){
		subject.set('id', 'test');
		subject.erase('id');
		expect(subject.get('id')).toEqual(null);
	});

	it('should erase the random attribute of an Element', function(){
		subject.set('random', 'test');
		subject.erase('random');
		expect(subject.get('random')).toEqual(null);
	});

	it('should erase the value attribute of a textarea', function(){
		textarea.erase('value');
		expect(textarea.get('value')).toEqual('');
	});

});

describe('Element.appendHTML', function(){

	var check, base, baseFallBack;

	beforeEach(function(){
		check = new Element('span', {
			html: '<div>content</div><div>content</div>',
			styles: {
				display: 'none'
			}
		});

		check.inject(document.documentElement);
		base = $(check.getChildren()[0]);
		baseFallBack = $(check.getChildren()[1]);

		base.set('rel', '0');
		baseFallBack.set('rel', '1');
	});

	afterEach(function(){
		baseFallBack = baseFallBack.destroy();
		base = base.destroy();
		check = check.destroy();
	});

	it('should insert element before', function(){

		base.appendHTML('<span>HI!</span>', 'before');
		baseFallBack.appendHTML('<span>HI!</span>', 'before');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.get('text')).toBe('HI!');
			expect(child.nextSibling.getAttribute('rel')).toBe('' + i);
		});
	});

	it('should insert element after', function(){
		base.appendHTML('<span>HI!</span>', 'after');
		baseFallBack.appendHTML('<span>HI!</span>', 'after');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.get('text')).toBe('HI!');
			expect(child.previousSibling.getAttribute('rel')).toBe('' + i);
		});
	});

	it('should insert element on bottom', function(){
		base.appendHTML('<span>HI!</span>', 'bottom');
		baseFallBack.appendHTML('<span>HI!</span>', 'bottom');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		expect(children.each(function(child, i){
			expect(child.get('text')).toBe('HI!');
			expect(child.parentNode.getAttribute('rel')).toBe('' + i);
			expect(child.parentNode.get('text')).toBe('contentHI!');
		}));
	});

	it('should insert element on top', function(){
		base.appendHTML('<span>HI!</span>', 'top');
		baseFallBack.appendHTML('<span>HI!</span>', 'top');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.get('text')).toBe('HI!');
			expect(child.parentNode.getAttribute('rel')).toBe('' + i);
			expect(child.parentNode.get('text')).toBe('HI!content');
		});
	});

	it('should insert element on inside (bottom)', function(){
		base.appendHTML('<span>HI!</span>', 'inside');
		baseFallBack.appendHTML('<span>HI!</span>', 'inside');

		var children = check.getElements('span');

		expect(children.length).toBe(2);
		children.each(function(child, i){
			expect(child.get('text')).toBe('HI!');
			expect(child.parentNode.getAttribute('rel')).toBe('' + i);
			expect(child.parentNode.get('text')).toBe('contentHI!');
		});
	});

});

describe('IFrame', function(){

	it('(async) should call onload', function(){
		runs(function(){
			this.onComplete = jasmine.createSpy('IFrame onComplete');

			this.iframe = new IFrame({
				src: 'http://' + document.location.host + '/random',
				onload: this.onComplete
			}).inject(document.body);
		});

		waitsFor(1000, function(){
			return this.onComplete.wasCalled;
		});

		runs(function(){
			this.iframe.destroy();
		});
	});

});

describe('new Element(expression)', function(){

	it('should create a new div element', function(){
		var div = new Element('div');

		expect(div.tagName.toLowerCase()).toEqual('div');
		expect(!div.className && div.className.length == 0).toBeTruthy();
		expect(!div.id && div.id.length == 0).toBeTruthy();
		expect(typeOf(div)).toEqual('element');
	});

	it('should create a new element with id and class', function(){
		var p = new Element('p', {
			id: 'myParagraph',
			'class': 'test className'
		});

		expect(p.tagName.toLowerCase()).toEqual('p');
		expect(p.className).toEqual('test className');
	});

	it('should create a new element with id and class from css expression', function(){
		var p = new Element('p#myParagraph.test.className');

		expect(p.tagName.toLowerCase()).toEqual('p');
		expect(p.className).toEqual('test className');
	});

	it('should create attributes from css expression', function(){
		var input = new Element('input[type=text][readonly=true][value=Some Text]');

		expect(input.tagName.toLowerCase()).toEqual('input');
		expect(input.type).toEqual('text');
		expect(input.readOnly).toEqual(true);
		expect(input.value).toEqual('Some Text');
	});

	it('should overwrite ids and classes', function(){
		var div = new Element('div#myDiv.myClass', {
			id: 'myOverwrittenId',
			'class': 'overwrittenClass'
		});

		expect(div.tagName.toLowerCase()).toEqual('div');
		expect(div.id).toEqual('myOverwrittenId');
		expect(div.className).toEqual('overwrittenClass');
	});

	it('should overwrite attributes', function(){
		var a = new Element('a[href=http://dojotoolkit.org/]', {
			href: 'http://mootools.net/'
		});

		expect(a.tagName.toLowerCase()).toEqual('a');
		expect(a.href).toEqual('http://mootools.net/');
	});

	it('should reset attributes and classes with empty string', function(){
		var div = new Element('div#myDiv.myClass', {
			id: '',
			'class': ''
		});

		expect(div.tagName.toLowerCase()).toEqual('div');
		expect(div.id).toEqual('');
		expect(div.className).toEqual('');
	});

	it('should not reset attributes and classes with null', function(){
		var div = new Element('div#myDiv.myClass', {
			id: null,
			'class': null
		});

		expect(div.tagName.toLowerCase()).toEqual('div');
		expect(div.id).toEqual('myDiv');
		expect(div.className).toEqual('myClass');
	});

	it('should not reset attributes and classes with undefined', function(){
		var div = new Element('div#myDiv.myClass', {
			id: undefined,
			'class': undefined
		});

		expect(div.tagName.toLowerCase()).toEqual('div');
		expect(div.id).toEqual('myDiv');
		expect(div.className).toEqual('myClass');
	});

	it('should fall back to a div tag', function(){
		var someElement = new Element('#myId');

		expect(someElement.tagName.toLowerCase()).toEqual('div');
		expect(someElement.id).toEqual('myId');
	});

	it('should allow zero (0) values', function(){
		var table = new Element('table[cellpadding=0]');

		expect(table.tagName.toLowerCase()).toEqual('table');
		expect(table.cellPadding == 0).toBeTruthy();
	});

	it('should allow empty boolean attributes', function(){
		var script = new Element('script[async]');
		expect(script.get('async')).toBeTruthy();
	});

	it('should allow false to be passed for checked', function(){
		var input = new Element('input', {
			type: 'checkbox',
			checked: false
		});

		expect(input.checked).toEqual(false);
	});

});

describe('Element', function(){

	describe('classList', function(){

		it('should not fail for empty strings', function(){
			var element = new Element('div');
			element.addClass('');
			expect(element.className).toEqual('');
		});

		it('should trim whitespaces', function(){
			var element = new Element('div');
			element.addClass(' bar ');
			expect(element.className).toEqual('bar');
		});

		it('should add multiple classes', function(){
			var element = new Element('div');
			element.addClass(' bar foo');
			expect(element.className).toEqual('bar foo');
		});

		it('should add multiple equal classes', function(){
			var element = new Element('div');
			element.addClass('bar bar ');
			expect(element.className).toEqual('bar');
		});

		it('should add class with some newline', function(){
			var element = new Element('div');
			element.addClass('bar\nfoo');
			expect(element.className).toEqual('bar foo');
		});

	});

});
describe('normalize value for new Element type == checkbox || radio', function(){

	it('value of new created checkbox should be "on" if none specified', function() {
		var input = new Element('input', {
			type: 'checkbox'
		});
		input.set('checked', true);
		expect(input.get('value')).toEqual('on');
	});
	it('value of new created checkbox should be the specified in constructor', function() {
		var input = new Element('input', {
			type: 'checkbox',
			value: 'someValue'
		});
		input.set('checked', true);
		expect(input.get('value')).toEqual('someValue');
	});
	it('value of new created radio button should be "on" if none specified', function() {
		var input = new Element('input', {
			type: 'radio'
		});
		input.set('checked', true);
		expect(input.get('value')).toEqual('on');
	});
	it('value of new created radio should be the specified in constructor', function() {
		var input = new Element('input', {
			type: 'radio',
			value: 'someValue'
		});
		input.set('checked', true);
		expect(input.get('value')).toEqual('someValue');
	});
});

/*
---
name: Fx.Morph
requires: ~
provides: ~
...
*/
describe('Fx.Morph', function(){

	beforeEach(function(){
		this.clock = sinon.useFakeTimers();

		this.div = new Element('div', {'class': 'pos-abs-left'});
		this.style = new Element('style');
		var definition = [
			'.pos-abs-left {',
				'position: absolute;',
				'width: 200px;',
				'height: 200px;',
				'left: 10%;',
				'background: red',
			'}'
		].join('');

		[this.style, this.div].invoke('inject', document.body);

		if (this.style.styleSheet) this.style.styleSheet.cssText = definition;
		else this.style.set('text', definition);
	});

	afterEach(function(){
		this.clock.reset();
		this.clock.restore();
		[this.div, this.style].invoke('destroy');
	});

	it('should morph the style of an element', function(){

		var element = new Element('div', {
			styles: {
				height: 100,
				width: 100
			}
		}).inject(document.body);

		var fx = new Fx.Morph(element, {
			duration: 100
		});

		fx.start({
			height: [10, 50],
			width: [10, 50]
		});

		this.clock.tick(200);

		expect(element.getStyle('height').toInt()).toEqual(50);
		expect(element.getStyle('width').toInt()).toEqual(50);
		element.destroy();

	});

	it('should set morph options with the element getter and setter', function(){

		var element = new Element('div');

		element.set('morph', {
			duration: 100
		});

		expect(element.get('morph').options.duration).toEqual(100);

	});

	it('should morph between % units', function(){
		var spy = spyOn(this.div, 'setStyle').andCallThrough();
		this.div.set('morph', {unit : '%'}).morph({'left': [10, 50]});

		this.clock.tick(1000);

		expect(this.div.setStyle).toHaveBeenCalledWith('left', ['10%']);
		expect(this.div.setStyle).toHaveBeenCalledWith('left', ['50%']);
	});

	it('it should morph when the unit option is set, but an empty value', function(){

		this.div.set('morph', {
			duration: 100,
			unit: 'px'
		}).morph({
			opacity: 1,
			top : 100
		});

		this.clock.tick(150);

		expect(this.div.getStyle('top')).toEqual('100px');
		expect(this.div.getStyle('opacity')).toEqual(1);

	});

	it('it should morph when the unit option is set, but the style value is a number', function(){

		this.div.setStyles({
			top: '50px',
			opacity: 0
		}).set('morph', {
			duration: 100,
			unit: 'px'
		}).morph({
			opacity: 1,
			top : 100
		});

		this.clock.tick(150);

		expect(this.div.getStyle('top')).toEqual('100px');
		expect(this.div.getStyle('opacity')).toEqual(1);

	});

});

/*
---
name: Fx.Tween
requires: ~
provides: ~
...
*/
describe('Fx.Tween', function(){

	beforeEach(function(){
		this.clock = sinon.useFakeTimers();
	});

	afterEach(function(){
		this.clock.reset();
		this.clock.restore();
	});

	it('should tween the style of an element', function(){

		var element = new Element('div#st_el', {
			styles: {
				height: 100
			}
		}).inject(document.body);

		var fx = new Fx.Tween(element, {
			duration: 100,
			property: 'height'
		});

		fx.start(10, 50);

		this.clock.tick(200);

		expect(element.getStyle('height').toInt()).toEqual(50);
		element.destroy();

	});

	it('should tween the style of an element via Element.tween', function(){

		var element = new Element('div', {
			styles: {
				width: 100
			},
			tween: {
				duration: 100
			}
		}).inject(document.body).tween('width', 50);

		this.clock.tick(200);

		expect(element.getStyle('width').toInt()).toEqual(50);
		element.destroy();

	});

	it('should fade an element', function(){

		var element = new Element('div', {
			styles: { opacity: 0 }
		}).inject(document.body);

		element.set('tween', {
			duration: 100
		});

		element.fade('in');

		this.clock.tick(130);

		expect(element.getStyle('opacity').toInt()).toEqual(1);
		element.destroy();

	});

	it('should fade out an element and fade in when triggerd inside the onComplete event', function(){

		var element = new Element('div').inject($(document.body));
		var firstOpacity, lastOpacity, lastVisibility, runOnce = true;
		element.set('tween', {
			duration: 100,
			onComplete: function (){
                if(runOnce){
                    firstOpacity = this.element.getStyle('opacity');
                    runOnce && this.element.fade();
                    runOnce = false;
                }
                
			}
		});

		element.fade();
		this.clock.tick(250);
		lastOpacity = element.getStyle('opacity');
		lastVisibility = element.getStyle('visibility');

		expect(firstOpacity.toInt()).toEqual(0);
		expect(lastOpacity.toInt()).toEqual(1);
		expect(lastVisibility).toEqual('visible');
		element.destroy();
	});

	it('should fade an element with toggle', function(){

		var element = new Element('div', {
			styles: { opacity: 1 }
		}).inject(document.body);

		element.set('tween', {
			duration: 100
		});

		element.fade('toggle');

		this.clock.tick(130);

		expect(element.getStyle('opacity').toInt()).toEqual(0);
		element.destroy();

	});

	it('should set tween options with the element getter en setter', function(){

		var element = new Element('div');

		element.set('tween', {
			duration: 100
		});

		expect(element.get('tween').options.duration).toEqual(100);

	});

	it('should fade an element with toggle', function(){

		var element = new Element('div', {
			tween: {
				duration: 10
			}
		}).setStyle('background-color', '#fff').inject(document.body);

		element.highlight('#f00');

		this.clock.tick(40);

		expect(['#fff', '#ffffff']).toContain(element.getStyle('background-color').toLowerCase());
		element.destroy();

	});

	describe('Element.fade', function(){

		it('Should set the visibility style', function(){

			var element = new Element('div', {styles: {'visibility': 'visible'}}).inject(document.body);

			expect(element.getStyles('opacity', 'visibility')).toEqual({opacity: 1, visibility: 'visible'});

			element.fade(0.5);
			this.clock.tick(600);
			expect(element.getStyles('opacity', 'visibility')).toEqual({opacity: 0.5, visibility: 'visible'});

			element.fade(0);
			this.clock.tick(600);
			expect(element.getStyles('opacity', 'visibility')).toEqual({opacity: 0, visibility: 'hidden'});

			element.fade(1);
			this.clock.tick(600);
			expect(element.getStyles('opacity', 'visibility')).toEqual({opacity: 1, visibility: 'visible'});

			element.destroy();

		});

		it('should accept the old style arguments (0, 1)', function(){

			var element = new Element('div');
			element.fade(1, 0);

			var tween = element.get('tween');

			expect(tween.from[0].value).toEqual(1);
			expect(tween.to[0].value).toEqual(0);

			this.clock.tick(1000);

			expect(element.getStyle('opacity')).toEqual(0);

		});

	});

});

/*
---
name: Fx
requires: ~
provides: ~
...
*/
describe('Fx', function(){

	beforeEach(function(){
		this.clock = sinon.useFakeTimers();
	});

	afterEach(function(){
		this.clock.reset();
		this.clock.restore();
	});

	Object.each(Fx.Transitions, function(value, transition){
		if (transition == 'extend') return;

		it('should start a Fx and call the onComplete event with ' + transition + ' as timing function', function(){

			var onComplete = jasmine.createSpy('complete'),
				onStart = jasmine.createSpy('start');

			var fx = new Fx({
				duration: 500,
				transition: Fx.Transitions[transition],
				onComplete: onComplete,
				onStart: onStart
			});

			expect(onStart).not.toHaveBeenCalled();

			fx.start(10, 20);

			this.clock.tick(100);
			expect(onStart).toHaveBeenCalled();
			expect(onComplete).not.toHaveBeenCalled();

			this.clock.tick(1000);
			expect(onComplete).toHaveBeenCalled();

		});
	});

	it('should cancel a Fx', function(){

		var onCancel = jasmine.createSpy('Fx.cancel');

		var fx = new Fx({
			duration: 500,
			transition: 'sine:in:out',
			onCancel: onCancel
		});

		fx.start();

		expect(onCancel).not.toHaveBeenCalled();

		fx.cancel();

		expect(onCancel).toHaveBeenCalled();

	});

	it('should set the computed value', function(){

		var FxLog = new Class({
			Extends: Fx,
			set: function(current){
				this.foo = current;
			}
		});

		var fx = new FxLog({
			duration: 1000
		}).start(0, 10);

		this.clock.tick(2000);

		expect(fx.foo).toEqual(10);

	});

	it('should pause and resume', function(){

		var FxLog = new Class({
			Extends: Fx,
			set: function(current){
				this.foo = current;
			}
		});

		var fx = new FxLog({
			duration: 2000
		}).start(0, 1);

		this.clock.tick(1000);

		var value;

		fx.pause();
		value = fx.foo;
		expect(fx.foo).toBeGreaterThan(0);
		expect(fx.foo).toBeLessThan(1);

		this.clock.tick(1000);

		expect(fx.foo).toEqual(value);
		fx.resume();

		this.clock.tick(2000);

		expect(fx.foo).toEqual(1);

	});

	it('should chain the Fx', function(){

		var counter = 0;
		var fx = new Fx({
			duration: 500,
			onComplete: function(){
				counter++;
			},
			link: 'chain'
		});

		fx.start().start();

		this.clock.tick(1000);
		this.clock.tick(1000);

		expect(counter).toEqual(2);
	});

	it('should cancel the Fx after a new Fx:start with the link = cancel option', function(){

		var onCancel = jasmine.createSpy('Fx.cancel');

		var fx = new Fx({
			duration: 500,
			onCancel: onCancel,
			link: 'cancel'
		});

		fx.start().start();

		this.clock.tick(1000);

		expect(onCancel).toHaveBeenCalled();

	});

});

describe('Fx', function(){

	beforeEach(function(){
		this.clock = sinon.useFakeTimers();
	});

	afterEach(function(){
		this.clock.reset();
		this.clock.restore();
	});

	it('should return the paused state', function(){
		var fx = new Fx({
			duration: 500
		}).start();

		expect(fx.isPaused()).toEqual(false);

		this.clock.tick(300);
		fx.pause();

		expect(fx.isPaused()).toEqual(true);

		fx.resume();
		this.clock.tick(600);
		expect(fx.isPaused()).toEqual(false);
	});

});

/*
---
name: Request.HTML
requires: ~
provides: ~
...
*/

describe('Request.HTML', function(){

	beforeEach(function(){
		this.spy = jasmine.createSpy();
		this.xhr = sinon.useFakeXMLHttpRequest();
		var requests = this.requests = [];
		this.xhr.onCreate = function(xhr){
			requests.push(xhr);
		};
	});

	afterEach(function(){
		this.xhr.restore();
	});

	it('should create an ajax request and pass the right arguments to the onComplete event', function(){

		var response = '<body><img><div><span>res&amp;ponsé</span></div><script>___SPEC___=5;</script></body>';

		this.spy.identity = 'Request.HTML onComplete';
		var request = new Request.HTML({
			url: '../Helpers/request.php',
			onComplete: this.spy
		}).send();

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);

		expect(this.spy.wasCalled).toBe(true);

		// checks arguments order
		expect(this.spy).toHaveBeenCalledWith(request.response.tree, request.response.elements, request.response.html, request.response.javascript);
		var onCompleteArgs = this.spy.argsForCall[0];
		expect(onCompleteArgs[0][0].nodeName).toEqual('IMG');
		expect(onCompleteArgs[0][1].nodeName).toEqual('DIV');
		expect(onCompleteArgs[1][2].nodeName).toEqual('SPAN');
		expect(onCompleteArgs[2]).toEqual('<img><div><span>res&amp;ponsé</span></div>');
		expect(onCompleteArgs[3].trim()).toEqual('___SPEC___=5;');
		expect(___SPEC___).toEqual(5);

	});

	xit('(async) should create an ajax request and correctly generate the tree response from a tr', function(){

		runs(function(){
			this.request = new Request.HTML({
				url: '../Helpers/request.php',
				onComplete: this.spy
			}).send({data: {
				'__response': '<tr><td>text</td></tr>', '__type': 'html'
			}});
		});

		waitsFor(800, function(){
			return this.spy.wasCalled;
		});

		runs(function(){
			var onCompleteArgs = this.spy.argsForCall[0];

			expect(onCompleteArgs[0][0].nodeName).toEqual('TR');
			expect(onCompleteArgs[1][1].nodeName).toEqual('TD');
			expect(onCompleteArgs[2]).toEqual('<tr><td>text</td></tr>');
		});

	});

	xit('(async) should create an ajax request and correctly generate the tree response from options', function(){

		runs(function(){
			this.request = new Request.HTML({
				url: '../Helpers/request.php',
				onComplete: this.spy
			}).send({data: {
				'__response': '<option>1</option><option>2</option><option>3</option>', '__type': 'html'
			}});
		});

		waitsFor(800, function(){
			return this.spy.wasCalled;
		});

		runs(function(){
			var onCompleteArgs = this.spy.argsForCall[0];

			expect(onCompleteArgs[0].length).toEqual(3);
			expect(onCompleteArgs[1].length).toEqual(3);
			expect(onCompleteArgs[2]).toEqual('<option>1</option><option>2</option><option>3</option>');
			expect(onCompleteArgs[3]).toBeFalsy();

			var firstOption = onCompleteArgs[0][0];
			expect(firstOption.tagName).toEqual('OPTION');
			expect(firstOption.innerHTML).toEqual('1');
		});

	});

	it('should create an ajax request and correctly update an element with the response', function(){

		var response = '<span>text</span>';

		this.spy.identity = 'Request.HTML onComplete update element';
		new Element('div', {'id': 'update', 'html': '<div>some</div>'}).inject(document.body);
		this.request = new Request.HTML({
			url: '../Helpers/request.php',
			onComplete: this.spy,
			update: 'update'
		}).send();

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);

		expect(this.spy.wasCalled).toBe(true);

		var update = $('update');
		expect(update.getChildren().length).toEqual(1);
		expect(update.getFirst().get('tag')).toEqual('span');
		expect(update.getFirst().get('text')).toEqual('text');
		update.dispose();
	});

	it('should create an ajax request and correctly append the response to an element', function(){

		var response = '<div><span>text</span><p>paragraph</p></div>';

		new Element('div', {'id': 'update', 'html': '<div>some</div>'}).inject(document.body);
		this.spy.identity = 'Request.HTML onComplete ajax append';
		this.request = new Request.HTML({
			url: '../Helpers/request.php',
			onComplete: this.spy,
			append: 'update'
		}).send();

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);

		expect(this.spy.wasCalled).toBe(true);

		var update = $('update');
		expect(update.getChildren().length).toEqual(2);
		expect(update.getFirst().get('tag')).toEqual('div');
		expect(update.getFirst().get('text')).toEqual('some');
		var div = update.getFirst().getNext();
		expect(div.get('tag')).toEqual('div');
		expect(div.getFirst().get('tag')).toEqual('span');
		expect(div.getFirst().get('text')).toEqual('text');
		expect(div.getLast().get('tag')).toEqual('p');
		expect(div.getLast().get('text')).toEqual('paragraph');
		update.dispose();

	});

	it('should create an ajax request and correctly filter it by the passed selector', function(){

		var response = '<span>text</span><a>aaa</a>';

		this.spy.identity = 'Request.HTML onComplete filter';
		var request = new Request.HTML({
			url: '../Helpers/request.php',
			onComplete: this.spy,
			filter: 'a'
		}).send();

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);
		expect(this.spy.wasCalled).toBe(true);

		var onCompleteArgs = this.spy.argsForCall[0];
		expect(onCompleteArgs[0].length).toEqual(1);
		expect(onCompleteArgs[0][0].get('tag')).toEqual('a');
		expect(onCompleteArgs[0][0].get('text')).toEqual('aaa');

	});

	it('should create an ajax request that filters the response and updates the target', function(){

		var response = '<div>text<p><a>a link</a></p></div>';

		this.spy.identity = 'Request.HTML onComplete update and filter';
		new Element('div', {'id': 'update', 'html': '<div>some</div>'}).inject(document.body);
		this.request = new Request.HTML({
			url: '../Helpers/request.php',
			onComplete: this.spy,
			update: 'update',
			filter: 'a'
		}).send();

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);
		expect(this.spy.wasCalled).toBe(true);

		var update = $('update');
		expect(update.getChildren().length).toEqual(1);
		expect(update.getFirst().get('tag')).toEqual('a');
		expect(update.getFirst().get('text')).toEqual('a link');
		update.dispose();

	});

	it('should create an ajax request that filters the response and appends to the target', function(){

		var response = '<div>text<p><a>a link</a></p></div>';

		new Element('div', {'id': 'update', 'html': '<div>some</div>'}).inject(document.body);
		this.spy.identity = 'Request.HTML onComplete append and filter';
		this.request = new Request.HTML({
			url: '../Helpers/request.php',
			onComplete: this.spy,
			append: 'update',
			filter: 'a'
		}).send();

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);
		expect(this.spy.wasCalled).toBe(true);

		var update = $('update');
		expect(update.getChildren().length).toEqual(2);
		expect(update.get('html').toLowerCase()).toEqual('<div>some</div><a>a link</a>');
		update.dispose();

	});

	it('should create an ajax request through Element.load', function(){

		var element = new Element('div');

		var response = 'hello world!';

		this.spy.identity = 'Request.HTML onComplete load';
		var request = element.set('load', {
			url: '../Helpers/request.php',
			onComplete: this.spy
		}).get('load');

		expect(instanceOf(request, Request.HTML)).toBeTruthy();

		element.load({
			'__response': response, '__type': 'html'
		});

		this.requests[0].respond(200, {'Content-Type': 'text/html'}, response);
		expect(this.spy.wasCalled).toBe(true);

		runs(function(){
			var onCompleteArgs = this.spy.argsForCall[0];
			expect(element.get('text')).toEqual('hello world!');
		});

	});

});

/*
---
name: Request.JSON
requires: ~
provides: ~
...
*/

describe('Request.JSON', function(){

	beforeEach(function(){
		this.spy = jasmine.createSpy();
		this.xhr = sinon.useFakeXMLHttpRequest();
		var requests = this.requests = [];
		this.xhr.onCreate = function(xhr){
			requests.push(xhr);
		};
	});

	afterEach(function(){
		this.xhr.restore();
	});

	it('should create a JSON request', function(){

		var response = '{"ok":true}';

		this.spy.identity = 'Requst.JSON';
		this.request = new Request.JSON({
			url: '../Helpers/request.php',
			onComplete: this.spy
		}).send({data: {
			'__response': response
		}});

		this.requests[0].respond(200, {'Content-Type': 'text/json'}, response);
		expect(this.spy.wasCalled).toBe(true);

		// checks the first argument from the first call
		expect(this.spy.argsForCall[0][0]).toEqual({ok: true});

	});

	it('should fire the error event', function(){

		var response = '{"ok":function(){invalid;}}';

		this.spy.identity = 'Requst.JSON error';
		this.request = new Request.JSON({
			url: '../Helpers/request.php',
			onError: this.spy
		}).send({data: {
			'__response': response
		}});

		this.requests[0].respond(200, {'Content-Type': 'text/json'}, response);
		expect(this.spy.wasCalled).toBe(true);

		// checks the first argument from the first call
		expect(this.spy.argsForCall[0][0]).toEqual('{"ok":function(){invalid;}}');

	});

});

/*
---
name: Request
requires: ~
provides: ~
...
*/

describe('Request', function(){
	var hasWithCredentials = 'withCredentials' in new Browser.Request;

	beforeEach(function(){
		this.xhr = sinon.useFakeXMLHttpRequest();
		var requests = this.requests = [];
		this.xhr.onCreate = function(xhr){
			requests.push(xhr);
		};
	});

	afterEach(function(){
		this.xhr.restore();
	});

	it('should create an ajax request', function(){
		var onComplete = jasmine.createSpy('Request onComplete');

		var request = new Request({
			url: '/',
			onComplete: onComplete
		}).send({data: {
			'__response': 'res&amp;ponsé'
		}});

		this.requests[0].respond(200, {'Content-Type': 'text/plain'}, 'res&amp;ponsé');

		// checks the first argument from the first call
		expect(onComplete.argsForCall[0][0]).toEqual('res&amp;ponsé');

	});

	it('should create a Request with method get and sending data', function(){

		var onComplete = jasmine.createSpy('Request onComplete data');

		var request = new Request({
			url: '../Helpers/request.php',
			method: 'get',
			onComplete: onComplete
		}).send({data: {'some': 'data'}});

		this.requests[0].respond(200, {'Content-Type': 'text/json'}, 'data');

		expect(onComplete.wasCalled).toBe(true);

		expect(onComplete.argsForCall[0][0]).toEqual('data');

	});

	it('the options passed on the send method should rewrite the current ones', function(){

		var onComplete = jasmine.createSpy('Request onComplete rewrite data');
		var request = new Request({
			url: '../Helpers/request.php',
			method: 'get',
			data: {'setup': 'data'},
			onComplete: onComplete
		}).send({method: 'post', data: {'send': 'senddata'}});

		var requested = this.requests[0];

		expect(requested.method.toLowerCase()).toBe('post');

		requested.respond(200, {'Content-Type': 'text/plain'}, '');

		expect(onComplete.wasCalled).toBe(true);
	});

	xit('(async) should create an ajax request and as it\'s an invalid XML, onComplete will receive null as the xml document', function(){

		runs(function(){
			this.onComplete = jasmine.createSpy();
			this.request = new Request({
				url: '../Helpers/request.php',
				onComplete: this.onComplete
			}).send({data: {
				'__type': 'xml',
				'__response': 'response'
			}});
		});

		waitsFor(800, function(){
			return this.onComplete.wasCalled;
		});

		runs(function(){
			expect(this.onComplete.argsForCall[0][0]).toEqual('response');
			expect(this.request.response.text).toEqual('response');
		});

		runs(function(){
			this.chain = jasmine.createSpy();
			this.request.chain(this.chain).send({data: {
				'__type': 'xml',
				'__response': '<node>response</node><no></no>'
			}});
		});

		waitsFor(800, function(){
			return this.chain.wasCalled;
		});

		runs(function(){
			expect(this.onComplete.argsForCall[0][0]).toEqual('<node>response</node><no></no>');
			expect(this.request.response.text).toEqual('<node>response</node><no></no>');
		});

	});

	it('should not overwrite the data object', function(){

		var onComplete = jasmine.createSpy('Request onComplete overwrite protection');
		var request = new Request({
			url: '../Helpers/request.php',
			data: {
				__response: 'data'
			},
			onComplete: onComplete
		}).post();

		var requested = this.requests[0];
		requested.respond(200, {'Content-Type': 'text/plain'}, requested.requestBody)

		expect(onComplete.wasCalled).toBe(true);

		expect(onComplete.argsForCall[0][0]).toEqual('__response=data');

	});

	it('should not set xhr.withCredentials flag by default', function(){
		var request = new Request({
			url: '/something/or/other'
		}).send();

		expect(request.xhr.withCredentials).toBeFalsy();
	});

	

	var dit = hasWithCredentials ? it : xit; // don't run unless no compat
	dit('should not set xhr.withCredentials flag in 1.5 for this.options.user', function(){
		var request = new Request({
			url: '/something/or/other',
			user: 'someone'
		}).send();

		expect(request.xhr.withCredentials).toBeFalsy();
	});

	dit('should set xhr.withCredentials flag if options.withCredentials is set', function(){
		var request = new Request({
			url: '/something/or/other',
			withCredentials: true
		}).send();

		expect(request.xhr.withCredentials).toBe(true);
	});
});

/*
---
name: Array
requires: ~
provides: ~
...
*/

(function(){

var getTestArray = function(){
	var a = [0, 1, 2, 3];
	delete a[1];
	delete a[2];
	return a;
};


describe("Array", function(){

	// Array.flatten

	it('should flatten a multidimensional array', function(){
		var arr = [1,2,3,[4,5,[6,7,[8]]], [[[[[9]]]]]];
		expect(arr.flatten()).toEqual([1,2,3,4,5,6,7,8,9]);
	});

	it('should flatten arguments', function(){
		var test = function(){
			return Array.flatten(arguments);
		};
		expect(test(1,2,3)).toEqual([1,2,3]);
		expect(test([1,2,3])).toEqual([1,2,3]);
		expect(test(1,2,[3])).toEqual([1,2,3]);
	});

	// Array.filter

	it('should filter an array', function(){
		var array = [1,2,3,0,0,0];
		var arr = array.concat([false, null, 4]).filter(Type.isNumber);
		expect(arr).toEqual(array.concat(4));
	});

	it('filter should skip deleted elements', function(){
		var i = 0;
		getTestArray().filter(function(){
			i++;
			return true;
		});

		expect(i).toEqual(2);
	});

	// Array.clean

	it('should clean an array from undefined and null values', function(){
		var array = [null, 1, 0, true, false, "foo", undefined];
		var arr = array.clean();
		expect(arr).toEqual([1, 0, true, false, "foo"]);
	});

	// Array.map

	it('should return a mapping of an array', function(){
		var arr = [1,2,3,0,0,0].map(function(item){
			return (item + 1);
		});

		expect(arr).toEqual([2,3,4,1,1,1]);
	});

	it('map should skip deleted elements', function(){
		var i = 0;
		getTestArray().map(function(){
			return i++;
		});

		expect(i).toEqual(2);
	});

	// Array.every

	it('should return true if every item matches the comparator, otherwise false', function(){
		expect([1,2,3,0,0,0].every(Type.isNumber)).toBeTruthy();

		expect(['1',2,3,0].every(Type.isNumber)).toBeFalsy();
	});

	it('every should skip deleted elements', function(){
		var i = 0;
		getTestArray().every(function(){
			i++;
			return true;
		});

		expect(i).toEqual(2);
	});

	// Array.some

	it('should return true if some of the items in the array match the comparator, otherwise false', function(){
		expect(['1',2,3,0].some(Type.isNumber)).toBeTruthy();

		expect([1,2,3,0,0,0].map(String).some(Type.isNumber)).toBeFalsy();
	});

	it('some should skip deleted elements', function(){
		var i = 0;
		var a = getTestArray();
		delete a[0];

		// skips the first three elements
		a.some(function(value, index){
			i = index;
			return true;
		});

		expect(i).toEqual(3);
	});

	// Array.indexOf

	it('should return the index of the item', function(){
		expect([1,2,3,0,0,0].indexOf(0)).toEqual(3);
	});

	it('should return -1 if the item is not found in the array', function(){
		expect([1,2,3,0,0,0].indexOf('not found')).toEqual(-1);
	});

	// Array.erase

	it('should remove all items in the array that match the specified item', function(){
		var arr = [1,2,3,0,0,0].erase(0);
		expect(arr).toEqual([1,2,3]);
	});

	// Array.contains

	it('should return true if the array contains the specified item', function(){
		expect([1,2,3,0,0,0].contains(0)).toBeTruthy();
	});

	it('should return false if the array does not contain the specified item', function(){
		expect([0,1,2].contains('not found')).toBeFalsy();
	});

	// Array.associate

	it('should associate an array with a specified array', function(){
		var obj = [1,2,3,0,0,0].associate(['a', 'b', 'c', 'd']);
		expect(obj).toEqual({a:1, b:2, c:3, d:0});
	});

	// Array.append

	it('should append to an array', function(){
		var a = [1,2,4];
		var b = [2,3,4,5];
		a.append(b);
		expect(a).toEqual([1,2,4,2,3,4,5]);
		expect(b).toEqual([2,3,4,5]);
	});

	var isType = function(type){
		return function(obj){
			return typeOf(obj) == type;
		};
	};

	// Array.link
	it('should link an array items to a new object according to the specified matchers', function(){
		var el = document.createElement('div');
		var assoc2 = [100, 'Hello', {foo: 'bar'}, el, false].link({
			myNumber: isType('number'),
			myElement: isType('element'),
			myObject: isType('object'),
			myString: isType('string'),
			myBoolean: isType('boolean')
		});

		expect(assoc2).toEqual({
			myNumber: 100,
			myElement: el,
			myObject: {foo: 'bar'},
			myString: 'Hello',
			myBoolean: false
		});
	});

	

	it('should append an array', function(){
		var a = [1,2,4];
		var b = [2,3,4,5];
		a.append(b);
		expect(a).toEqual([1,2,4,2,3,4,5]);
		expect(b).toEqual([2,3,4,5]);
	});

	// Array.combine

	it('should combine an array', function(){
		var arr = [1,2,3,4].combine([3,1,4,5,6,7]);
		expect(arr).toEqual([1,2,3,4,5,6,7]);
	});

	// Array.include

	it('should include only new items', function(){
		var arr = [1,2,3,4].include(1).include(5);
		expect(arr).toEqual([1,2,3,4,5]);
	});

	// Array.getLast

	it('should return the last item in the array', function(){
		expect([1,2,3,0,0,0].getLast()).toEqual(0);
		expect([3].getLast()).toEqual(3);
	});

	it('should return null if there are no items', function(){
		expect([].getLast()).toEqual(null);
	});

	// Array.empty

	it('should empty the array', function(){
		var arr = [1,2,3,4].empty();
		expect(arr).toEqual([]);
	});

});

describe("Array Color Methods", function(){

	// Array.hexToRgb

	it('should return null if the length of the array is not 3', function(){
		expect([].hexToRgb()).toBeNull();
	});

	it('should return a CSS rgb string', function(){
		expect(['0','0','0'].hexToRgb()).toEqual('rgb(0,0,0)');
	});

	it('should support shorthand hex', function(){
		expect(['c','c','c'].hexToRgb()).toEqual('rgb(204,204,204)');
	});

	it('should return an array with 16-based numbers when passed true', function(){
		expect(['ff','ff','ff'].hexToRgb(true)).toEqual([255,255,255]);
	});

	// Array.rgbToHex

	it('should return null if the array does not have at least 3 times', function(){
		expect([0,1].rgbToHex()).toBeNull();
	});

	it('should return a css hexadecimal string', function(){
		expect(['255', '0', '0'].rgbToHex()).toEqual('#ff0000');
		expect([0,0,255].rgbToHex()).toEqual('#0000ff');
	});

	it('should return an array with hexadecimal string items', function(){
		expect([0,255,0].rgbToHex(true)).toEqual(['00', 'ff', '00']);
	});

	it('should return `transparent` if the fourth item is 0 and first param is not true', function(){
		expect([0,0,0,0].rgbToHex()).toEqual('transparent');
	});

});

describe('Array.getRandom', function(){

	it('should get a random element from an array', function(){
		var a = [1];

		expect(a.getRandom()).toEqual(1);

		a.push(2);

		// Let's try a few times
		expect(a).toContain(a.getRandom());
		expect(a).toContain(a.getRandom());
		expect(a).toContain(a.getRandom());
		expect(a).toContain(a.getRandom());
	});

});

describe('Array.pick', function(){

	it('should pick a value that is not null from the array', function(){
		expect([null, undefined, true, 1].pick()).toEqual(true);
	});

	it('should return null', function(){
		expect([].pick()).toBeNull();
	});

});

describe('Array', function(){

	describe('Array.map', function(){

		it('should return an array with the same length', function(){
			expect([1, 2, 3, undefined].map(function(v){
				return v;
			}).length).toEqual(4);
		});

		it('shoud return an empty array when the thisArg does not has a length property', function(){
			expect([].map.call({}, function(){
				return 1;
			})).toEqual([]);
		});

	});

	it('should accept thisArgs without length property', function(){
		var object = {}, fn = function(){};
		expect([].every.call(object, fn)).toBe(true);
		expect([].filter.call(object, fn)).toEqual([]);
		expect([].indexOf.call(object)).toEqual(-1);
		expect([].map.call(object, fn)).toEqual([]);
		expect([].some.call(object, fn)).toBe(false);
	});

	describe('Array.filter', function(){

		it('should return the original item, and not any mutations.', function(){

			var result = [0, 1, 2].filter(function(num, i, array){
				if (num == 1){
					array[i] = 'mutation';
					return true;
				}
			});

			expect(result[0]).toEqual(1);
		});

	});

});

})();

/*
---
name: Function
requires: ~
provides: ~
...
*/

var dit = it; // don't run unless no compat

(function(){

var fn = function(){
	return Array.from(arguments).slice();
};

var Rules = function(){
	return this + ' rules';
};

var Args = function(){
	return [this].concat(Array.prototype.slice.call(arguments));
};

describe("Function Methods", function(){

	

	// Function.bind

	it('should return the function bound to an object', function(){
		var fnc = Rules.bind('MooTools');
		expect(fnc()).toEqual('MooTools rules');
	});

	it('should return the function bound to an object with specified argument', function(){
		var results = Args.bind('MooTools', 'rocks')();
		expect(results[0] + '').toEqual(new String('MooTools') + '');
		expect(results[1]).toEqual('rocks');
	});

	dit('should return the function bound to an object with multiple arguments', function(){
		var results = Args.bind('MooTools', ['rocks', 'da house'])();
		expect(results[0] + '').toEqual(new String('MooTools') + '');
		expect(results[1]).toEqual(['rocks', 'da house']);
	});

	

	// Function.pass

	it('should return a function that when called passes the specified arguments to the original function', function(){
		var fnc = fn.pass('MooTools is beautiful and elegant');
		expect(fnc()).toEqual(['MooTools is beautiful and elegant']);
	});

	it('should pass multiple arguments and bind the function to a specific object when it is called', function(){
		var fnc = Args.pass(['rocks', 'da house'], 'MooTools');
		expect(fnc()).toEqual(['MooTools', 'rocks', 'da house']);
	});

	

	// Function.extend

	it("should extend the function's properties", function(){
		var fnc = (function(){}).extend({a: 1, b: 'c'});
		expect(fnc.a).toEqual(1);
		expect(fnc.b).toEqual('c');
	});


	// Function.attempt

	it('should call the function without raising an exception', function(){
		var fnc = function(){
			this_should_not_work();
		};
		fnc.attempt();
	});

	it("should return the function's return value", function(){
		var fnc = Function.from('hello world!');
		expect(fnc.attempt()).toEqual('hello world!');
	});

	it('should return null if the function raises an exception', function(){
		var fnc = function(){
			this_should_not_work();
		};
		expect(fnc.attempt()).toBeNull();
	});

	// Function.delay

	it('delay should return a timer pointer', function(){
		var timer = (function(){}).delay(10000);
		expect(typeOf(timer) == 'number').toBeTruthy();
		clearTimeout(timer);
	});

	// Function.periodical

	it('periodical should return a timer pointer', function(){
		var timer = (function(){}).periodical(10000);
		expect(typeOf(timer) == 'number').toBeTruthy();
		clearInterval(timer);
	});

});

describe('Function.attempt', function(){

	it('should return the result of the first successful function without executing successive functions', function(){
		var calls = 0;
		var attempt = Function.attempt(function(){
			calls++;
			throw new Exception();
		}, function(){
			calls++;
			return 'success';
		}, function(){
			calls++;
			return 'moo';
		});
		expect(calls).toEqual(2);
		expect(attempt).toEqual('success');
	});

	it('should return null when no function succeeded', function(){
		var calls = 0;
		var attempt = Function.attempt(function(){
			calls++;
			return I_invented_this();
		}, function(){
			calls++;
			return uninstall_ie();
		});
		expect(calls).toEqual(2);
		expect(attempt).toBeNull();
	});

});

})();

describe('Function.bind', function(){

	it('should return the function bound to an object', function(){
		var spy = jasmine.createSpy('Function.bind');
		var f = spy.bind('MooTools');
		expect(spy).not.toHaveBeenCalled();
		f();
		expect(spy).toHaveBeenCalledWith();
		f('foo', 'bar');
		expect(spy).toHaveBeenCalledWith('foo', 'bar');
	});

	it('should return the function bound to an object with specified argument', function(){
		var binding = {some: 'binding'};
		var spy = jasmine.createSpy('Function.bind with arg').andReturn('something');
		var f = spy.bind(binding, 'arg');

		expect(spy).not.toHaveBeenCalled();
		expect(f('additional', 'arguments')).toEqual('something');
		expect(spy.mostRecentCall.object).toEqual(binding);
	});

	it('should return the function bound to an object with multiple arguments', function(){
		var binding = {some: 'binding'};
		var spy = jasmine.createSpy('Function.bind with multiple args').andReturn('something');
		var f = spy.bind(binding, ['foo', 'bar']);

		expect(spy).not.toHaveBeenCalled();
		expect(f('additional', 'arguments')).toEqual('something');
		expect(spy.mostRecentCall.object).toEqual(binding);
	});

	dit('should still be possible to use it as constructor', function(){
		function Alien(type) {
			this.type = type;
		}

		var thisArg = {};
		var Tribble = Alien.bind(thisArg, 'Polygeminus grex');

		// `thisArg` should **not** be used for the `this` binding when called as a constructor
		var fuzzball = new Tribble('Klingon');
		expect(fuzzball.type).toEqual('Polygeminus grex');
	});

	dit('when using .call(thisArg) on a bound function, it should ignore the thisArg of .call', function(){
		var fn = function(){
			return [this.foo].concat(Array.slice(arguments));
		};

		expect(fn.bind({foo: 'bar'})()).toEqual(['bar']);
		expect(fn.bind({foo: 'bar'}, 'first').call({foo: 'yeah!'}, 'yooo')).toEqual(['bar', 'first', 'yooo']);

		var bound = fn.bind({foo: 'bar'});
		var bound2 = fn.bind({foo: 'yep'});
		var inst = new bound;
		inst.foo = 'noo!!';
		expect(bound2.call(inst, 'yoo', 'howdy')).toEqual(['yep', 'yoo', 'howdy']);
	});

});

describe('Function.pass', function(){

	it('should return a function that when called passes the specified arguments to the original function', function(){
		var spy = jasmine.createSpy('Function.pass').andReturn('the result');
		var fnc = spy.pass('an argument');
		expect(spy).not.toHaveBeenCalled();
		expect(fnc('additional', 'arguments')).toBe('the result');
		expect(spy).toHaveBeenCalledWith('an argument');
		expect(spy.callCount).toBe(1);
	});

	it('should pass multiple arguments and bind the function to a specific object when it is called', function(){
		var spy = jasmine.createSpy('Function.pass with bind').andReturn('the result');
		var binding = {some: 'binding'};
		var fnc = spy.pass(['multiple', 'arguments'], binding);
		expect(spy).not.toHaveBeenCalled();
		expect(fnc('additional', 'arguments')).toBe('the result');
		expect(spy.mostRecentCall.object).toEqual(binding);
		expect(spy).toHaveBeenCalledWith('multiple', 'arguments');
	});

});

describe('Function.extend', function(){

	it("should extend the function's properties", function(){
		var fnc = (function(){}).extend({a: 1, b: 'c'});
		expect(fnc.a).toEqual(1);
		expect(fnc.b).toEqual('c');
	});

});

describe('Function.attempt', function(){

	it('should call the function without raising an exception', function(){
		var fnc = function(){
			throw 'up';
		};
		fnc.attempt();
	});

	it("should return the function's return value", function(){
		var spy = jasmine.createSpy('Function.attempt').andReturn('hello world!');
		expect(spy.attempt()).toEqual('hello world!');
	});

	it('should return null if the function raises an exception', function(){
		var fnc = function(){
			throw 'up';
		};
		expect(fnc.attempt()).toBeNull();
	});

});

describe('Function.delay', function(){

	beforeEach(function(){
		this.clock = sinon.useFakeTimers();
	});

	afterEach(function(){
		this.clock.reset();
		this.clock.restore();
	});

	it('should return a timer pointer', function(){
		var spyA = jasmine.createSpy('Alice');
		var spyB = jasmine.createSpy('Bob');

		var timerA = spyA.delay(200);
		var timerB = spyB.delay(200);

		this.clock.tick(100);

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).not.toHaveBeenCalled();
		clearTimeout(timerB);

		this.clock.tick(250);
		expect(spyA.callCount).toBe(1);
		expect(spyB.callCount).toBe(0);
	});

	it('should pass parameter 0', function(){
		var spy = jasmine.createSpy('Function.delay with 0');
		spy.delay(50, null, 0);

		this.clock.tick(100);
		expect(spy).toHaveBeenCalledWith(0);
	});

	it('should not pass any argument when no arguments passed', function(){
		var argumentCount = null;
		var spy = function(){
			argumentCount = arguments.length;
		};
		spy.delay(50);
		this.clock.tick(100);
		expect(argumentCount).toEqual(0);
	});

});

describe('Function.periodical', function(){

	beforeEach(function(){
		this.clock = sinon.useFakeTimers();
	});

	afterEach(function(){
		this.clock.reset();
		this.clock.restore();
	});

	it('should return an interval pointer', function(){
		var spy = jasmine.createSpy('Bond');

		var interval = spy.periodical(10);
		expect(spy).not.toHaveBeenCalled();

		this.clock.tick(100);

		expect(spy.callCount).toBeGreaterThan(2);
		expect(spy.callCount).toBeLessThan(15);
		clearInterval(interval);
		spy.reset();
		expect(spy).not.toHaveBeenCalled();

		this.clock.tick(100);

		expect(spy).not.toHaveBeenCalled();
	});

	it('should pass parameter 0', function(){
		var spy = jasmine.createSpy('Function.periodical with 0');
		var timer = spy.periodical(10, null, 0);

		this.clock.tick(100);

		expect(spy).toHaveBeenCalledWith(0);
		clearInterval(timer);
	});

	it('should not pass any argument when no arguments passed', function(){
		var argumentCount = null;
		var spy = function(){
			argumentCount = arguments.length;
		};
		var timer = spy.periodical(50);
		this.clock.tick(100);

		expect(argumentCount).toEqual(0);
		clearInterval(timer);
	});

});

/*
---
name: Hash
requires: ~
provides: ~
...
*/




/*
---
name: Number
requires: ~
provides: ~
...
*/

describe("Number Methods", function(){

	// Number.toInt

	it('should convert a number to an integer', function(){
		expect((111).toInt()).toEqual(111);
	});

	it('should convert a number depending on the radix provided', function(){
		expect((111).toInt(2)).toEqual(7);
		expect((0x16).toInt(10)).toEqual(22); //ECMA standard, radix is optional so if starts with 0x then parsed as hexadecimal
		expect((016).toInt(10)).toEqual(14); //ECMA standard, radix is optional so if starts with 0 then parsed as octal
	});

	// Number.toFloat

	it('should convert a number to a float', function(){
		expect((1.00).toFloat()).toEqual(1);
		expect((1.12 - 0.12).toFloat()).toEqual(1);
		expect((0.0010).toFloat()).toEqual(0.001);
		expect((Number.MIN_VALUE).toFloat()).toEqual(Number.MIN_VALUE);
	});

	// Number.limit

	it('should limit a number within a range', function(){
		expect((-1).limit(0, 1)).toEqual(0);
		expect((3).limit(1, 2)).toEqual(2);
	});

	it('should not limit a number if within the range', function(){
		expect((2).limit(0,4)).toEqual(2);
	});

	// Number.round

	it('should round a number to the nearest whole number if units place is not specified', function(){
		expect((0.01).round()).toEqual(0);
	});

	it('should round a number according the units place specified', function(){
		expect((0.01).round(2)).toEqual(0.01);
		expect((1).round(3)).toEqual(1);
		expect((-1.01).round()).toEqual(-1);
		expect((-1.01).round(2)).toEqual(-1.01);
		expect((111).round(-1)).toEqual(110);
		expect((-111).round(-2)).toEqual(-100);
		expect((100).round(-5)).toEqual(0);
	});

	// Number.times

	it('should call the function for the specified number of times', function(){
		var found = 0;
		(3).times(function(i){
			found = i;
		});

		var found2 = -1;
		(0).times(function(i){
			found2 = i;
		});

		expect(found).toEqual(2);
		expect(found2).toEqual(-1);
	});

	it('should bind and call the function for the specified number of times', function(){
		var aTest = 'hi';
		var found3 = false;
		(1).times(function(i){
			found3 = (this == aTest);
		}, aTest);
		expect(found3).toBeTruthy();
	});

});


(function(math){

	describe('Number Math Methods', function(){
		Object.each(math, function(value, key){
			var example = {};
			var b = value.test[1];
			it('should return the ' + value.title + ' value of the number' + ((b) ? ' and the passed number' : ''), function(){
				expect(value.test[0][key](b)).toEqual(Math[key].apply(null, value.test));
			});
		});
	});

})({
	abs: { test: [-1], title: 'absolute' },
	acos: { test: [0], title: 'arc cosine' },
	asin: { test: [0.5], title: 'arc sine' },
	atan: { test: [0.5], title: 'arc tangent' },
	atan2: { test: [0.1, 0.5], title: 'arc tangent' },
	ceil: { test: [0.6], title: 'number closest to and not less than the' },
	cos: { test: [30], title: 'cosine' },
	exp: { test: [2], title: 'exponent' },
	floor: { test: [2.4], title: 'integer closet to and not greater than' },
	log: { test: [2], title: 'log' },
	max: { test: [5, 3], title: 'maximum' },
	min: { test: [-4, 2], title: 'minimum' },
	pow: { test: [2, 2], title: 'power' },
	sin: { test: [0.5], title: 'sine' },
	sqrt: { test: [4], title: 'square root' },
	tan: { test: [0.3], title: 'tangent' }
});

/*
---
name: Object
requires: ~
provides: ~
...
*/

(function(){

var object = { a: 'string', b: 233, c: {} };

describe("Object Methods", function(){

	// Object subset

	it('should return an object with only the specified keys', function(){
		expect(Object.subset(object, ['a', 'b'])).toEqual({a:'string',b:233});
	});

	it('should ignore undefined keys', function(){
		var obj = {
			b: 'string',
			d: null
		};
		var subset = Object.subset(obj, ['a', 'b', 'c', 'd']);
		expect(subset).toEqual({b: 'string', d: null});
		// To equal doesn't check for undefined properties
		expect('a' in subset).toBeFalsy();
		expect('c' in subset).toBeFalsy();
	});

	// Object keyOf

	it('should return the key of the value or null if not found', function(){
		expect(Object.keyOf(object, 'string')).toEqual('a');
		expect(Object.keyOf(object, 'not found')).toBeNull();
	});

	// Object.contains

	it('should return true if the object contains value otherwise false', function(){
		expect(Object.contains(object, 'string')).toBeTruthy();
		expect(Object.contains(object, 'not found')).toBeFalsy();
	});

	// Object.map

	it('should map a new object according to the comparator', function(){
		expect(Object.map(object, Type.isNumber)).toEqual({a:false,b:true,c:false});
	});

	// Object.filter

	it('should filter the object according to the comparator', function(){
		expect(Object.filter(object, Type.isNumber)).toEqual({b:233});
	});

	// Object.every

	it('should return true if every value matches the comparator, otherwise false', function(){
		expect(Object.every(object, typeOf)).toBeTruthy();
		expect(Object.every(object, Type.isNumber)).toBeFalsy();
	});

	// Object.some

	it('should return true if some of the values match the comparator, otherwise false', function(){
		expect(Object.some(object, Type.isNumber)).toBeTruthy();
		expect(Object.some(object, Type.isArray)).toBeFalsy();
	});

	// Object.values

	it('values should return an empty array', function(){
		expect(Object.values({})).toEqual([]);
	});

	it('should return an array with the values of the object', function(){
		expect(Object.values(object)).toEqual(['string', 233, {}]);
	});

	// Object.toQueryString

	it('should return a query string', function(){
		var myObject = {apple: "red", lemon: "yellow"};
		expect(Object.toQueryString(myObject)).toEqual('apple=red&lemon=yellow');

		var myObject2 = {apple: ['red', 'yellow'], lemon: ['green', 'yellow']};
		expect(Object.toQueryString(myObject2)).toEqual('apple[0]=red&apple[1]=yellow&lemon[0]=green&lemon[1]=yellow');

		var myObject3 = {fruits: {apple: ['red', 'yellow'], lemon: ['green', 'yellow']}};
		expect(Object.toQueryString(myObject3)).toEqual('fruits[apple][0]=red&fruits[apple][1]=yellow&fruits[lemon][0]=green&fruits[lemon][1]=yellow');
	});

});

describe('Object.getLength', function(){

	it('should get the amount of items in an object', function(){
		var object = {
			a: [0, 1, 2],
			s: "It's-me-Valerio!",
			n: 1,
			f: 3.14,
			b: false
		};

		expect(Object.getLength(object)).toEqual(5);

		object.n = null;

		expect(Object.getLength(object)).toEqual(5);
	});

});


describe('Object hasOwnProperty', function(){

	it('should not fail on window', function(){
		expect(function(){
			var fn = function(){};
			Object.each(window, fn);
			Object.keys(window);
			Object.values(window);
			Object.map(window, fn);
			Object.every(window, fn);
			Object.some(window, fn);
			Object.keyOf(window, document);
		}).not.toThrow();
	});

});

})();

/*
---
name: String
requires: ~
provides: ~
...
*/

describe("String Methods", function(){

	// String.capitalize

	it('should capitalize each word', function(){
		expect('i like cookies'.capitalize()).toEqual('I Like Cookies');
		expect('I Like cOOKIES'.capitalize()).toEqual('I Like COOKIES');
	});

	// String.camelCase

	it('should convert a hyphenated string into a camel cased string', function(){
		expect('i-like-cookies'.camelCase()).toEqual('iLikeCookies');
		expect('I-Like-Cookies'.camelCase()).toEqual('ILikeCookies');
	});

	// String.hyphenate

	it('should convert a camel cased string into a hyphenated string', function(){
		expect('iLikeCookies'.hyphenate()).toEqual('i-like-cookies');
		expect('ILikeCookies'.hyphenate()).toEqual('-i-like-cookies');
	});

	// String.clean

	it('should clean all extraneous whitespace from the string', function(){
		expect('  i     like    cookies   '.clean()).toEqual("i like cookies");
		expect('  i\nlike \n cookies \n\t  '.clean()).toEqual("i like cookies");
	});

	// String.trim

	it('should trim left and right whitespace from the string', function(){
		expect('  i like cookies  '.trim()).toEqual('i like cookies');
		expect('  i  \tlike  cookies  '.trim()).toEqual('i  \tlike  cookies');
	});

	

	// String.test

	it('should return true if the test matches the string otherwise false', function(){
		expect('i like teh cookies'.test('cookies')).toBeTruthy();
		expect('i like cookies'.test('ke coo')).toBeTruthy();
		expect('I LIKE COOKIES'.test('cookie', 'i')).toBeTruthy();
		expect('i like cookies'.test('cookiez')).toBeFalsy();
	});

	it('should return true if the regular expression test matches the string otherwise false', function(){
		expect('i like cookies'.test(/like/)).toBeTruthy();
		expect('i like cookies'.test(/^l/)).toBeFalsy();
	});

	// String.toInt

	it('should convert the string into an integer', function(){
		expect('10'.toInt()).toEqual(10);
		expect('10px'.toInt()).toEqual(10);
		expect('10.10em'.toInt()).toEqual(10);
	});

	it('should convert the string into an integer with a specific base', function(){
		expect('10'.toInt(5)).toEqual(5);
	});

	// String.toFloat

	it('should convert the string into a float', function(){
		expect('10.11'.toFloat()).toEqual(10.11);
		expect('10.55px'.toFloat()).toEqual(10.55);
	});

	// String.rgbToHex

	it('should convert the string into a CSS hex string', function(){
		expect('rgb(255,255,255)'.rgbToHex()).toEqual('#ffffff');
		expect('rgb(255,255,255,0)'.rgbToHex()).toEqual('transparent');
	});

	// String.hexToRgb

	it('should convert the CSS hex string into a CSS rgb string', function(){
		expect('#fff'.hexToRgb()).toEqual('rgb(255,255,255)');
		expect('ff00'.hexToRgb()).toEqual('rgb(255,0,0)');
		expect('#000000'.hexToRgb()).toEqual('rgb(0,0,0)');
	});

	// String.substitute

	it('should substitute values from objects', function(){
		expect('This is {color}.'.substitute({'color': 'blue'})).toEqual('This is blue.');
		expect('This is {color} and {size}.'.substitute({'color': 'blue', 'size': 'small'})).toEqual('This is blue and small.');
	});

	it('should substitute values from arrays', function(){
		expect('This is {0}.'.substitute(['blue'])).toEqual('This is blue.');
		expect('This is {0} and {1}.'.substitute(['blue', 'small'])).toEqual('This is blue and small.');
	});

	it('should remove undefined values', function(){
		expect('Checking {0}, {1}, {2}, {3} and {4}.'.substitute([1, 0, undefined, null])).toEqual('Checking 1, 0, ,  and .');
		expect('This is {not-set}.'.substitute({})).toEqual('This is .');
	});

	it('should ignore escaped placeholders', function(){
		expect('Ignore \\{this} but not {that}.'.substitute({'that': 'the others'})).toEqual('Ignore {this} but not the others.');
	});

	it('should substitute with a custom regex', function(){
		var php = (/\$([\w-]+)/g);
		expect('I feel so $language.'.substitute({'language': 'PHP'}, php)).toEqual('I feel so PHP.');
		var ror = (/#\{([^}]+)\}/g);
		expect('I feel so #{language}.'.substitute({'language': 'RoR'}, ror)).toEqual('I feel so RoR.');
	});

	it('should substitute without goofing up nested curly braces', function(){
		expect("fred {is {not} very} cool".substitute({ 'is {not':'BROKEN' })).not.toEqual("fred BROKEN very} cool");
		expect('this {should {break} mo} betta'.substitute({ 'break':'work' })).toEqual('this {should work mo} betta');
	});

});

/*
---
name: Cookie
requires: ~
provides: ~
...
*/

describe('Cookie', function(){

	it("should set a cookie", function(){

		Cookie.write('test', 1);

	});

	it('should read and write a cookie', function(){
		var options = {
			duration: 1
		};

		Cookie.write('key', 'value', options);

		expect(Cookie.read('key', options)).toBe('value');

		Cookie.dispose('key', options);

		expect(Cookie.read('key', options)).toBeNull();
	});

	it('should set HttpCookie flag correctly', function(){
		var instance = new Cookie('key', {
			httpOnly: true,
			document: {
				cookie: ''
			}
		}).write('value');

		expect(instance.options.document.cookie.indexOf('HttpOnly')).not.toBe(-1);
	});

});

/*
---
name: DomReady
requires: ~
provides: ~
...
*/

/* todo
document.addListener = function(type, fn){
	if (this.addEventListener) this.addEventListener(type, fn, false);
	else this.attachEvent('on' + type, fn);
	return this;
};

document.removeListener = function(type, fn){
	if (this.removeEventListener) this.removeEventListener(type, fn, false);
	else this.detachEvent('on' + type, fn);
	return this;
};


window.fireEvent =
document.fireEvent = function(type){
	if (type == 'domready')
	for (var i = 0; i < domreadyCallbacks.length; ++i){
	}
	domreadyCallbacks[i]();
};

window.addEvent = function(){};

var Element = this.Element || {};
Element.Events = {};
*/

/*
---
name: JSON
requires: ~
provides: ~
...
*/

describe('JSON', function(){

	it('should encode and decode an object', function(){
		var object = {
			a: [0, 1, 2],
			s: "It's-me-Valerio!",
			u: '\x01',
			n: 1,
			f: 3.14,
			b: false,
			nil: null,
			o: {
				a: 1,
				b: [1, 2],
				c: {
					a: 2,
					b: 3
				}
			}
		};

		expect(JSON.decode(JSON.encode(object))).toEqual(object);
	});

});
describe('JSON', function(){

    var goodString = '{"name":"Jim Cowart","location":{"city":{"name":"Chattanooga","population":167674}}}';
    var badString = 'alert("I\'m a bad string!")';

    it('should parse a valid JSON string by default', function(){
        expect(typeOf(JSON.decode(goodString))).toEqual("object");
    });

    it('should parse a valid JSON string when secure is set to false', function(){
        expect(typeOf(JSON.decode(goodString, false))).toEqual("object");
    });

    it('should parse a hazarous string when secure is set to false', function(){
        var _old_alert = window.alert;
        window.alert = function (string) {
            if (string == "I'm a bad string!") return true;
            return false;
        };
        expect(JSON.decode(badString, false)).toEqual(true);
        window.alert = _old_alert;
    }); 
    it('should parse a hazarous string when JSON.secure is set to false and secure is not defined', function(){
        var _old_alert = window.alert;
        window.alert = function (string) {
            if (string == "I'm a bad string!") return true;
            return false;
        };
        JSON.secure = false;
        expect(JSON.decode(badString)).toEqual(true);
        window.alert = _old_alert;
        JSON.secure = true;
    });     
    it('should NOT parse a hazarous string by default', function(){
        var err;
        try {
            JSON.decode(badString);
        } catch (e){
            err = !!e;
        };
        expect(err).toEqual(true);
    });  

});
