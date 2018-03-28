createClass(function Alert (options, container) {
    var _alert;
    var _alertClass = 'alerting';
    var _container;
    var that = this;

    this.init = function (options, container) {
        _container = container;
        _alert = $('<div class="alert" />');

        _alert.html('<div class="alert-container"><div class="alert-content"></div></div>');
        _alert.append($('<div class="bg" />'));

        var content = $('.alert-content', _alert);

        if (options.title) {
            content.append('<h2>' + options.title + '</h2>');    
        }

        if (options.body) {
            content.append('<div class="body">' + options.body + '</div>');    
        }
        
        if (options.buttons) {
            $.each(options.buttons, function (i, obj) {
                that.addButton(obj);
            });

            _alert.addClass('num-btns-' + options.buttons.length);    
        }

        // remove alert on outside click
        $('.bg', _alert).on(statics.selectEvent, _onBackgroundClick);
    }

    var _onBackgroundClick = function () {
        that.remove();
    }

    this.add = function () {
        // already alerting
        if ($('html').hasClass(_alertClass)) return;

        $('html').addClass(_alertClass);
        _container.prepend(_alert);
        
        $(document).trigger('streamingvideo.alertopen');
    }

    this.remove = function () {
        _alert.remove();
        $('html').removeClass(_alertClass);
    }

    this.addButton = function (obj) {
        if (obj.mapCallbackToBackground) {
            _onBackgroundClick = obj.callback;
        }

        var btn = $('<div />');
        btn.addClass('button');

        btn.html(obj.text);
        btn.on(statics.selectEvent, obj.callback);

        $('.alert-content', _alert).append(btn);
    }
});
