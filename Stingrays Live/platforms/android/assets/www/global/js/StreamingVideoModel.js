var StreamingVideoModel = function () {
	var _endpoint = 'https://s3.amazonaws.com/data.calacademy.org/';
	var _data;
	var _request;
	var _hls;

	var _onData = function (data) {
		// merge with default
        _data = $.extend(true, window.config, data);
		$(document).trigger('streamingvideo.dataload');	
	}

	var _onHLSData = function (data) {
		var url = false;
		var arr = data.split('&');

		$.each(arr, function (i, v) {
			var arr2 = v.split('=');

			if (arr2[0] == _data.key) {
				url = decodeURIComponent(arr2[1]);
				return false;
			}
		});

		if (!url) {
			_onHLSError();
			return;
		}

		$(document).trigger('streamingvideo.hlsdataload', [url]);
	}

	var _onError = function (jqXHR, textStatus, errorThrown) {
		if (textStatus != 'abort') {
			$(document).trigger('streamingvideo.dataerror');	
		}
	}

	var _onHLSError = function (jqXHR, textStatus, errorThrown) {
		if (textStatus != 'abort') {
			$(document).trigger('streamingvideo.hlsdataerror');	
		}
	}

	this.getConfig = function () {
		return _data;
	}

	this.destroy = function () {
		_data = null;

		if (_request) {
			_request.abort();
			_request = null;
		}

		if (_hls) {
			_hls.abort();
			_hls = null;
		}
	}

	this.loadHLSData = function (id) {
		if (_hls) {
			_hls.abort();
			_hls = null;
		}

		if (!$.isArray(_data.streams)) {
			_onHLSError();
			return;
		}

		var url = _data.endpoint + '=' + id;

		_hls = $.ajax({
			url: url,
			cache: false,
			dataType: 'text',
			success: _onHLSData,
			error: _onHLSError
		});
	}

	this.loadConfig = function () { 
		if (_request) {
			_request.abort();
			_request = null;
		}

		_request = $.ajax({
			url: _endpoint + window.slug + '/data.json',
			cache: false,
			dataType: 'json',
			success: _onData,
			error: _onError
		});
	}

	this.init = function () {}

	this.init();
}