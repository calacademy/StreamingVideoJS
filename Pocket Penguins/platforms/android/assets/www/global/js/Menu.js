var Menu = function (data) {
    var _container;
    var _data;
    var _log = statics.utils.log;
    var that = this;

    this.init = function (data) {
        _container = $('#menu-container');
        _container.html('<div id="menu-ui" />');

        _data = data;

        if (_data.streams.length <= 2) {
            $('html').addClass('two-streams-or-less');
        }

        _createList();
        $('#menu-ui').append('<div id="menu-bg" />');
        _addInteraction();
        _container.addClass('active');
        
        this.reselect();

        _initResize();
    }

    var _initResize = function () {
        $(window).off('resize.menu');
        
        $(window).on('resize.menu', function () {
            // resize the buttons
            $('html').removeClass('small-menu');

            if (_data.streams.length > 2) {
                var screenWidth = $(this).outerWidth(true);
                var buttonWidth = Math.round(screenWidth / 4);
                
                if (screenWidth < 1024) {
                    if (buttonWidth > 200) {
                        buttonWidth = 200;
                    }
                }
                
                if (buttonWidth < 250) {
                    $('html').addClass('small-menu');
                }

                $('li', _container).css('width', buttonWidth + 'px');
            }

            // center the menu
            var w = 0;

            $('li', _container).each(function () {
                w += $(this).outerWidth(true);
            });

            var padding = Math.floor(($('.streaming-video').outerWidth(true) - w) / 2);

            $('ul', _container).css('padding-left', padding + 'px');
        });

        $(window).trigger('resize.menu');
    }

    var _createList = function () {
        var ul = $('<ul />');

        $.each(_data.streams, function (i, obj) {
            var li = $('<li />');
            li.data('stream', obj);
            
            li.addClass('stream-index-' + i);
            li.append('<div class="label">' + obj.label + '</div>');
            li.append('<div class="img-container"><img src="images/menu/' + obj.asset + '.png" /></div>');
            
            ul.append(li);
        });

        $('#menu-ui').html(ul); 
    }

    var _onStreamSelect = function (e) {
        if ($(this).hasClass('selected')) {
            that.remove();
            return false;
        }

        // remove last select class
        $('li', _container).removeClass('selected');
        
        // add select class
        $(this).addClass('selected');

        that.remove();
        
        var s = $(this).data('stream');
        $(document).trigger('streamingvideo.streamselect', [s]);
        
        return false;
    }

    var _onStreamDown = function (e) {
        // remove last select class
        $('li', _container).removeClass('highlight');
        
        // add select class
        $(this).addClass('highlight');
    }

    var _enableMenuOpen = function () {
        _container.off(statics.selectEvent);

        _container.on(statics.selectEvent, function () {
            $(this).off(statics.selectEvent);
            $('html').addClass('menu-open');
            $(window).trigger('resize.menu');
            $(document).trigger('streamingvideo.menuopen');

            return false;
        });

    }

    var _addInteraction = function () {
        $('li', _container).off(statics.startEvent);
        $('li', _container).off(statics.selectEvent);

        $('li', _container).on(statics.startEvent, _onStreamDown);
        $('li', _container).on(statics.selectEvent, _onStreamSelect);

        _enableMenuOpen();
        
        $('#menu-bg').off(statics.selectEvent);

        $('#menu-bg').on(statics.selectEvent, function () {
            that.remove();
            
            return false;
        });
    }

    this.reselect = function () {
        var preselect = false;

        if (localStorage['last-play']) {
            $('li', _container).each(function () {
                if ($(this).data('stream').id == localStorage['last-play']) {
                    $(this).trigger(statics.startEvent);
                    $(this).trigger(statics.selectEvent);
                    preselect = true;
                    
                    return false;
                }
             });
        }

        if (!preselect) {
            $('li', _container).eq(0).trigger(statics.startEvent);
            $('li', _container).eq(0).trigger(statics.selectEvent);
        }
    }

    this.remove = function () {
        $('html').removeClass('menu-open');
        $('li', _container).removeClass('highlight');
        $('.selected', _container).addClass('highlight');
        _enableMenuOpen();
    }

    this.deactivate = function () {
        $('li', _container).removeClass('highlight');
        $('html').removeClass('menu-open');
    }

    this.destroy = function () {
        $(window).off('resize.menu');

        $('li', _container).off(statics.startEvent);
        $('li', _container).off(statics.selectEvent);
        _container.empty();
        _container.removeClass('active');

        _container.off(statics.startEvent);
        _container.off(statics.selectEvent);

        that.deactivate();
    }

    this.init(data);
}
