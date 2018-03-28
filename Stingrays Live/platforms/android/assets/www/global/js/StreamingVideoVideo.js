createClass(function StreamingVideoVideo (controller, myDomId, mute) {
	this.isActive = false;
	this.isFlat = false;
	this.domID;

	var that = this;
	var _video;
	var _hls;
	var _stateEvents = 'abort canplay canplaythrough ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked emptied seeking stalled suspend waiting';

	this.init = function (controller, myDomId, mute) {
		this.domID = myDomId;
		
		var v = $('<video webkit-playsinline="" playsinline="" x-webkit-airplay="allow" id="' + this.domID + '" />');
		v.addClass('player');
		$('#' + this.domID).replaceWith(v);
		
		_video = v.get(0);
		_video.autoplay = true;
		
		if (mute) {
			// autoplay issues
			_video.muted = true;
		}
	}

	var _onStateChange = function (e) {
		if (!that.isActive) return;
		$(document).trigger('streamingvideo.statechange', [e.type]);
	}

	this.setActive = function (boo) {
		if (boo) {
			$(_video).addClass('active');
		} else {
			$(_video).removeClass('active');
		}

		this.isActive = boo;
	}

	this.getDOM = function () {
		return _video;
	}

	this.pause = function () {
		_video.pause();
	}

	var _onError = function (event, data) {
		var msg = false;

		if (data.fatal) {
			_hls.destroy();
			msg = 'error';
		}

		if (msg) {
			_onStateChange({
				type: msg
			});
		}
	}

	this.play = function (url) {
		$(_video).off(_stateEvents);
		$(_video).on(_stateEvents, _onStateChange);

		if (this.isFlat) {
			$(_video).attr('src', url);
			_video.play();
		} else {
			if (_hls) {
				_hls.destroy();
			}

			_hls = new Hls();
			window.hls = _hls;

			_hls.on(Hls.Events.ERROR, _onError);

			_hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
				_hls.loadLevel = data.levels.length - 1;
				_video.play();
			});

			_hls.loadSource(url);
			_hls.attachMedia(_video);
		}
	}

	this.destroy = function () {
		if (_hls) {
			_hls.destroy();
		}

		$(_video).off(_stateEvents);
		_video.src = '';

		this.isFlat = false;
		this.isActive = false;
	}
});
