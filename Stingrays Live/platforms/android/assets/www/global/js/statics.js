if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

var statics = {
	isHLSCapable: false,
	width: 1280,
	height: 720,
	logoHeight: 40,
	shakeIconHeight: 85,
	shakeFrames: 26,
	startEvent: Modernizr.touch ? 'touchstart' : 'mousedown',
	selectEvent: Modernizr.touch ? 'touchend' : 'mouseup',
	utils: {
		log: function (obj) {
			console.log(obj);
		},
		randomRange: function (low, high) {
			return (Math.random() * (high - low)) + low;
		},
		scaleToFill: function (container, item) {
			var w = Math.ceil((statics.width * container.height()) / statics.height);
			
			if (w >= container.width()) {
				item.css('width', w + 'px');
				item.css('height', container.height() + 'px');

				var x = Math.round((container.width() - w) / 2);
				item.css('left', x + 'px');
				item.css('top', '0px');
			} else {
				var h = Math.ceil((statics.height * container.width()) / statics.width);

				item.css('width', container.width() + 'px');
				item.css('height', h + 'px');
				
				var y = Math.round((container.height() - h) / 2);
				
				item.css('left', '0px');
				item.css('top', y + 'px');
			}
		}	
	}
};
