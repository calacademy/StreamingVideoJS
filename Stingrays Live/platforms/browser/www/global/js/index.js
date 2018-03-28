var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        // prevent sleep
        if (window.plugins) {
            if (window.plugins.insomnia) {
                window.plugins.insomnia.keepAwake(function () {
                    console.log('keeping awake');
                });
            }
        }

        // go full screen on Android if possible
        AndroidFullScreen.immersiveMode(function () {
            console.log('AndroidFullScreen.immersiveMode supported');
        }, function () {
            console.log('AndroidFullScreen.immersiveMode not supported');
        });
        
        window.streamingVideo = new StreamingVideo();

        document.addEventListener('pause', streamingVideo.onPause, false);
        document.addEventListener('resume', streamingVideo.onResume, false);
        document.addEventListener('online', streamingVideo.onOnline, false);
        document.addEventListener('offline', streamingVideo.onOffline, false);  
    }
};
