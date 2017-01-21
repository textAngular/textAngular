describe('taToolFunctions', function(){
    var taToolFunctions;

    beforeEach(module('textAngular'));

    beforeEach(inject(function(_taToolFunctions_){
        taToolFunctions = _taToolFunctions_;
    }));

    describe('extractVideoId', function(){

        it('should extract video id from youtube link variations', function(){
            youtubeVideoUrlVariations = [
                'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index',
                'http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/0zM3nApSvMg',
                'http://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0',
                'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s',
                'http://www.youtube.com/embed/0zM3nApSvMg?rel=0',
                'http://www.youtube.com/watch?v=0zM3nApSvMg',
                'http://youtu.be/0zM3nApSvMg',
                'https://www.youtube-nocookie.com/embed/0zM3nApSvMg'
            ];
            dailymotionVideoUrlVariations = [
                'http://www.dailymotion.com/video/x57m2yg_2-time-dakar-winner-ripping-through-sand-dunes-dakar-2017_sport',
                'http://www.dailymotion.com/video/x57m2yg',
                'http://dai.ly/x57m2yg'

            ];

            angular.forEach(youtubeVideoUrlVariations, function(videoUrl,provider) {
                expect(taToolFunctions.extractVideoId(videoUrl,'y')).toBe('0zM3nApSvMg');
            });
            angular.forEach(dailymotionVideoUrlVariations, function(videoUrl,provider) {
                expect(taToolFunctions.extractVideoId(videoUrl,'d')).toBe('x57m2yg');
            });
        });
        it('should not extract video id from invalid youtube link variations', function(){
            invalidYoutubeVideoUrlVariations = [
                'http://www.youtube.com/watch?v=0zM3nApS&feature=feedrec_grec_index',
                'http://www.youtube.com/user/elsonVEVO#p/a/u/1/8U-VIH_o',
                'http://www.youtube.com/v/0zM3nApS?fs=1&amp;hl=en_US&amp;rel=0',
                'http://www.youtube.com/watch?v=0zApSvMg#t=0m10s',
                'http://www.youtube.com/embed/0zM3Mg?rel=0',
                'http://www.youtube.com/watch?v=0znApSvMg',
                'http://youtu.be/0zM3nAvMg',
                'https://www.youtube-nocookie.com/embed/0zM3nAvMg'
            ];
            invalidDailymotionVideoUrlsVariations = [
                'http://www.dailymotion.com/video/x58m2ygggwp_2-time-dakar-winner-ripping-through-sand-dunes-dakar-2017_sport',
                'http://www.dailymotion.com/video/x58m2ygggwp',
                'http://www.dai.ly/x58m2ygggwpgasd'
            ];

            angular.forEach(invalidYoutubeVideoUrlVariations, function(videoUrl,provider) {
                expect(taToolFunctions.extractVideoId(videoUrl,"y")).toBeNull();
            });
            angular.forEach(invalidDailymotionVideoUrlsVariations, function(videoUrl,provider) {
                expect(taToolFunctions.extractVideoId(videoUrl,"d")).toBeNull();
            });
        });
    });
    describe('determineVideoProvider', function(){

        it('should determine youtube/dailymotion provider from youtube link variations', function(){
            youtubeVideoUrlVariations2 = [
                'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index',
                'http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/0zM3nApSvMg',
                'http://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0',
                'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s',
                'http://www.youtube.com/embed/0zM3nApSvMg?rel=0',
                'http://www.youtube.com/watch?v=0zM3nApSvMg',
                'http://youtu.be/0zM3nApSvMg',
                'https://www.youtube-nocookie.com/embed/0zM3nApSvMg'
            ];
            dailymotionVideoUrlVariations2 = [
                'http://www.dailymotion.com/video/x57m2yg_2-time-dakar-winner-ripping-through-sand-dunes-dakar-2017_sport',
                'http://www.dailymotion.com/video/x57m2yg',
                'http://dai.ly/x57m2yg'
            ];

            angular.forEach(youtubeVideoUrlVariations2, function(videoUrl) {
                expect(taToolFunctions.determineVideoProvider(videoUrl)).toBe('y');
            });
            angular.forEach(dailymotionVideoUrlVariations2, function(videoUrl) {
                expect(taToolFunctions.determineVideoProvider(videoUrl)).toBe('d');
            });
        });
    });
});
