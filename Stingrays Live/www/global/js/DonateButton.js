var DonateButton = function (label, callback) {
    var _button;
    var _timeout;
    var _animTimeout;
    var _currentFrame = 0;
    var _fps = 30;
    var _log = statics.utils.log;
    var that = this;

    this.init = function (label, callback) {
        _button = $('#donate-button');
        _button.html('<div class="anim graphic"></div><div class="label graphic">' + label + '</div><div class="shadow"></div>');

        $('.graphic', _button).off(statics.startEvent);
        
        $('.graphic', _button).on(statics.startEvent, function (e) {
            that.highlight(true);
            return false;
        });

        $('.graphic', _button).off(statics.selectEvent);
        $('.graphic', _button).on(statics.selectEvent, callback);
    }

    var _nextFrame = function () {
        $('.anim', _button).css({
            'background-position': '0px -' + (_currentFrame * statics.shakeIconHeight) + 'px'
        });

        _currentFrame++;

        if (_currentFrame == statics.shakeFrames) {
            _currentFrame = 0;
        } else {
            if (_animTimeout) clearTimeout(_animTimeout);

            _animTimeout = setTimeout(function() {
                requestAnimationFrame(_nextFrame);
            }, 1000 / _fps);
        }
    }

    this.highlight = function (boo) {
        if (boo) {
            _button.addClass('highlight');
        } else {
            _button.removeClass('highlight');
        }
    }

    this.shake = function () {
        if (window.slug != 'penguins') return;
        
        _nextFrame();
        that.play();
    }

    this.pause = function () {
        if (_animTimeout) clearTimeout(_animTimeout);
        if (_timeout) clearTimeout(_timeout);
    }

    this.play = function () {
        if (_timeout) clearTimeout(_timeout);

        _timeout = setTimeout(that.shake, statics.utils.randomRange(15000, 30000));
    }

    this.init(label, callback);
}
