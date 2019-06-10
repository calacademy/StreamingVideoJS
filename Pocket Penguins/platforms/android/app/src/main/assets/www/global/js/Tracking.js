var Tracking = function () {
    // var _gaPlugin = window.plugins.gaPlugin;

    this.init = function () {
    	// _gaPlugin.init(_null, _null, config.analyticsID, 5);	
    }

    var _null = function (e) {}

    this.trackEvent = function (category, action, label, value) {
    	if (isNaN(value)) value = 0;
		// _gaPlugin.trackEvent(_null, _null, category, action, label, value);
	}

    this.destroy = function () {
    	// _gaPlugin.exit(_null, _null);
    }

    this.init();
}
