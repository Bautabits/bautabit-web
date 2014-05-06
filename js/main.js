---
---
require.config({
	baseUrl: hombit_root + '/js',
	shim: {
		'lib/underscore': {
			exports: '_'
		},
		'lib/backbone': {
			deps: ["lib/underscore", "lib/jquery"],
			exports: "Backbone"
		},
		'lib/handlebars': {
			deps: ["lib/jquery"],
			exports: "Handlebars"
		}
	}
});

//the "main" function to bootstrap your code
requirejs(['lib/underscore', 'lib/backbone', 'view/mainview'], function (_, Backbone, MainView) {   // or, you could use these deps in a separate module using define
	window.view = new MainView();
	$('#content').append(view.render().el);
});
