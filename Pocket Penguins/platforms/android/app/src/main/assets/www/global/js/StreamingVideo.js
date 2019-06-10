var StreamingVideo  = function () {
    var that = this;
    var _activePlayer;
    var _idlePlayer;
    var _numPlayersReady = 0;
    var _donateButton;
    var _alert;
    var _menu;
    var _tracking;
    var _selectedStream;
    var _destroyIdleTimeout;
    var _isPlayingFallback = false;

    var _model;
    var _log = statics.utils.log;

    this.init = function () {
        _buffering(true);

        if (_tracking) _tracking.destroy();
        _tracking = new Tracking();

        _onOverlayOpen();

        // add some markup
        $('#vid-container').html('<div class="player" id="player1"></div><div class="player" id="player2"></div>');

        // listen for some stuff
        $(document).off('streamingvideo');
        $(document).on('streamingvideo.menuopen', _onOverlayOpen);
        $(document).on('streamingvideo.alertopen', _onOverlayOpen);
        $(document).on('streamingvideo.streamselect', _onStreamSelect);
        $(document).on('streamingvideo.dataerror', this.onDataError);
        $(document).on('streamingvideo.dataload', _onData);
        $(document).on('streamingvideo.hlsdataerror', this.onDataError);
        $(document).on('streamingvideo.hlsdataload', _onHLSData);
        $(document).on('streamingvideo.statechange', _onStateChange);

        // load stream data
        _model = new StreamingVideoModel()
        _model.loadConfig(); 
    }

    var _onOverlayOpen = function () {
        $('#logo, #donate-button, #mute-button').removeClass('highlight');
    }

    this.initPlayers = function () {
        var mute = $('html').hasClass('muted');

        _activePlayer = new StreamingVideoVideo(this, 'player1', mute);
        _idlePlayer = new StreamingVideoVideo(this, 'player2', mute);
        
        $(window).off('resize.scaleVideos');

        $(window).on('resize.scaleVideos', function () {
            statics.utils.scaleToFill($('#vid-container'), $('.player'));    
        });
        
        $(window).trigger('resize.scaleVideos');
    }

    var _getDonateStyle = function () {
        var i = 0;

        if (typeof(localStorage['donate-style-index']) == 'string') {
            var storedNum = parseInt(localStorage['donate-style-index']);

            if (!isNaN(storedNum)) {
                // successfully retrieved from localStorage
                i = storedNum;

                if (config.donateStyles.length > (i + 1)) {
                    i++;
                } else {
                    i = 0;
                }
            }
        }

        localStorage['donate-style-index'] = i;
        
        return config.donateStyles[i];
    }

    var _initDonateButton = function () {
        var obj = _getDonateStyle();
        var label = obj.button.normal + ' <strong>' + obj.button.bold + '</strong>';

        _donateButton = new DonateButton(label, function (e) {
            _tracking.trackEvent('Alert', 'Click', 'Donate Button');

            _removeAlert();

            _alert = new Alert({
                title: obj.alert.title,
                body: obj.alert.body,
                buttons: [
                    {
                        text: 'Cancel',
                        mapCallbackToBackground: true,
                        callback: _removeAlert
                    },
                    {
                        text: obj.alert.confirm,
                        callback: function () {
                            window.open(obj.alert.url, '_system');
                            _removeAlert();
                        }
                    }
                ]
            }, $('.streaming-video'));

            _alert.add();
            _donateButton.shake();
            _donateButton.highlight(false);
            return false;
        });

        _donateButton.shake();
    }

    var _initMute = function () {
        var config = _model.getConfig();
        if (!config) return;


        $('#mute-button').off(statics.selectEvent);
        $('#mute-button').off(statics.startEvent);

        $('#mute-button').on(statics.startEvent, function (e) {
            $(this).addClass('highlight');
            return false;
        });

        $('#mute-button').on(statics.selectEvent, function (e) {
            $('html').toggleClass('muted');

            if (_activePlayer) {
                if ($('html').hasClass('muted')) {
                    _activePlayer.mute(true);    
                } else {
                    _activePlayer.mute(false); 
                }
            }

            $(this).removeClass('highlight');
            return false;
        });
    }

    var _initLogo = function () {
        $('#logo').off(statics.selectEvent);
        $('#logo').off(statics.startEvent);

        $('#logo').on(statics.startEvent, function (e) {
            $(this).addClass('highlight');
            return false;
        });

        $('#logo').on(statics.selectEvent, function (e) {
            _tracking.trackEvent('Alert', 'Click', 'Logo');

            var obj = config.alerts.logo;

            _alert = new Alert({
                title: obj.title,
                body: obj.body,
                buttons: [
                    {
                        text: 'Cancel',
                        mapCallbackToBackground: true,
                        callback: _removeAlert
                    },
                    {
                        text: 'OK',
                        callback: function () {
                            window.open(obj.url, '_system');
                            _removeAlert();
                        }
                    }
                ]
            }, $('.streaming-video'));

            _alert.add();
            $(this).removeClass('highlight');

            return false;
        }); 
    }

    var _removeAlert = function () {
        if (_alert) _alert.remove();
        _alert = null;
    }

    var _onHLSData = function (data, url) {
        if (_selectedStream) {
            that.loadAndPlay(url, _selectedStream.id, false);
        } else {
            that.loadAndPlay(url, null, false);
        }
    }

    var _onData = function () {
        that.initPlayers();
        _initUI();
    }

    var _initUI = function () {
        _initLogo();
        _initMute();
        _initDonateButton();

        // already on stage
        if ($('#menu-container li').length) {
            if (_menu && !_isPlayingFallback) _menu.reselect();
            return;
        }

        // invalid data
        if (_model.getConfig() == null) return;

        if (_menu) _menu.destroy();
        _menu = new Menu(_model.getConfig());
    }

    var _buffering = function (boo) {
        if (boo) {
            $('html').addClass('buffering');
        } else {
            $('html').removeClass('buffering');
        }
    }

    this.playFallbackVideo = function () {
        if (!_idlePlayer) {
            // players not yet created or need to be recreated as raw
            _isPlayingFallback = true;
            this.initPlayers();
        }
        
        _tracking.trackEvent('Menu', 'Select', 'fallback');
        
        if (_menu) _menu.deactivate();
        this.loadAndPlay('fallback.mp4', null, true);
    }

    this.loadAndPlay = function (url, id, isFlat) {
        if (typeof(isFlat) == 'undefined') isFlat = false;
        _buffering(true);

        // not ready
        if (!_idlePlayer || !_activePlayer) return;

        // save selection
        if (!isFlat) {
            localStorage['last-play'] = id;
        }

        // swapsies
        var idle = _idlePlayer;
        var active = _activePlayer;

        _activePlayer = idle;
        _idlePlayer = active;

        var muted = $('html').hasClass('muted');
        _activePlayer.setActive(true, muted);
        _idlePlayer.setActive(false, muted);

        // start active
        _activePlayer.isFlat = isFlat;
        _activePlayer.play(url);
    }

    var _onStreamSelect = function (e, obj) {
        _selectedStream = obj;
        _tracking.trackEvent('Menu', 'Select', obj.label);

        _isPlayingFallback = false;           
        
        _model.loadHLSData(obj.id);
    }

    var _destroyIdle = function () {
        if (_destroyIdleTimeout) {
            clearTimeout(_destroyIdleTimeout);
        }

        _destroyIdleTimeout = setTimeout(function () {
            _idlePlayer.destroy();
        }, 1000);
    }

    var _onStateChange = function (e, state) {
        // _log('_onStateChange: ' + state);
        // _log('_activePlayer.isFlat: ' + _activePlayer.isFlat);

        switch (state) {
            case 'timeout':
            case 'error':
                _activePlayer.pause();
                that.onStreamError();
                break;
            case 'waiting':
            case 'buffering':
                _buffering(true);
                break;
            case 'playing':
                $('html').addClass('first-play');

                $(_idlePlayer.getDOM()).removeClass('playing');
                $(_activePlayer.getDOM()).addClass('playing');
                $(_activePlayer.getDOM()).addClass('first-play');
                
                _updateLogoShadow();
                _destroyIdle();
                _buffering(false);
                break;
            case 'ended':
                if (_activePlayer.isFlat) {
                    that.onFlatVideoComplete();
                } else {
                    // live stream should not be throwing an ended event
                    that.onStreamError();
                }

                break;
        }
    }

    var _updateLogoShadow = function () {
        var scale = 1;
        var opacity = 0;

        if (_selectedStream) {
            if (typeof(_selectedStream.logoShadowScale) == 'string') {
                scale = parseFloat(_selectedStream.logoShadowScale);
            }

            if (typeof(_selectedStream.logoShadowOpacity) == 'string') {
                opacity = parseFloat(_selectedStream.logoShadowOpacity);
            }
        }
        
        $('#logo .shadow').css({
            'opacity': opacity,
            'transform': 'scale(' + scale + ')'
        });
    }

    var _restartAfterFatalError = function () {
        that.destroy();
        that.init();
        _removeAlert();
    }

    var _destroyVideos = function () {
        if (_activePlayer) {
            _activePlayer.destroy();
            _activePlayer = null;
        }
        if (_idlePlayer) {
            _idlePlayer.destroy();
            _idlePlayer = null;
        }

        _numPlayersReady = 0;
        $('#vid-container').empty();
    }

    this.destroy = function () {
        $(window).off('resize.scaleVideos');
        
        if (_destroyIdleTimeout) {
            clearTimeout(_destroyIdleTimeout);
        }

        if (_donateButton) _donateButton.pause();
        if (_menu) _menu.destroy();
        _removeAlert();
        _model.destroy();

        _destroyVideos();

        if (_tracking) _tracking.destroy();
        _isPlayingFallback = false;
    }

    this.onFlatVideoComplete = function () {
        _tracking.trackEvent('Stream', 'Complete', 'fallback');

        _removeAlert();

        var obj = config.alerts.flatPlaybackComplete;

        _alert = new Alert({
            title: obj.title,
            body: obj.body,
            buttons: [
                {
                    text: 'Cancel',
                    mapCallbackToBackground: true,
                    callback: _restartAfterFatalError
                },
                {
                    text: 'OK',
                    callback: function () {
                        // replay the video
                        that.playFallbackVideo();
                        _removeAlert();
                    }
                }
            ]
        }, $('.streaming-video'));

        _alert.add();
    }

    this.onError = function () {
        _removeAlert();

        var obj = config.alerts.error;

        _alert = new Alert({
            title: obj.title,
            body: obj.body,
            buttons: [
                {
                    text: 'OK',
                    callback: function () {
                        that.playFallbackVideo();
                        _removeAlert();
                    }
                },
                {
                    text: 'Cancel',
                    mapCallbackToBackground: true,
                    callback: _restartAfterFatalError
                }
            ]
        }, $('.streaming-video'));

        _alert.add();
    }

    this.onDataError = function (e) {
        _log('onDataError');
        _tracking.trackEvent('Runtime', 'error', 'onDataError');
        
        _initUI();
        that.onError();
    }

    this.onStreamError = function (e) {
        _log('onStreamError');
        _tracking.trackEvent('Runtime', 'error', 'onStreamError');
        
        // that.onError();
        _restartAfterFatalError();
    }

    this.onPause = function () {
        _log('onPause');
        $('html').removeClass('first-play');
        that.destroy();
    }

    this.onResume = function () {
        _log('onResume');
        that.init();
    }

    this.onOnline = function () {
        _log('onOnline');
    }

    this.onOffline = function () {
        _log('onOffline');
    }

    this.init();
}
