(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Holder
	///

	app.directive('holderJs', function() {
		return {
			link: function(scope, element, attrs) {
				attrs.$set('data-src', attrs.holderJs);
				Holder.run({images:element[0]});
			}
		};
	});

}());
