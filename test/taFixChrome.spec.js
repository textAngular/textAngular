describe('taFixChrome', function(){
    'use strict';
    beforeEach(module('textAngular'));
    var taFixChrome;
    beforeEach(inject(function(_taFixChrome_){
        taFixChrome = _taFixChrome_;
    }));

    describe('should cleanse the following HTML samples from chrome', function(){
        it('should remove the style attributes on a non-span', function(){
            expect(taFixChrome('<div style="font-family: inherit; line-height: 1.428571429;">Test Content</div>')).toBe('<div>Test Content</div>');
        });

        it('should remove a span with only those attributes', function(){
            expect(taFixChrome('<div><span style="font-family: inherit; line-height: 1.428571429;">Test Content</span></div>')).toBe('<div>Test Content</div>');
        });

        it('should the style attributes on a span with other attributes', function(){
            expect(taFixChrome('<div><span style="width: 200px; font-family: inherit; line-height: 1.428571429;">Test Content</span></div>')).toBe('<div><span style="width: 200px;">Test Content</span></div>');
        });

        it('should leave a span with none of those attributes', function(){
            expect(taFixChrome('<div><span>Test Content</span></div>')).toBe('<div><span>Test Content</span></div>');
            expect(taFixChrome('<div><span style="width: 200px;">Test Content</span></div>')).toBe('<div><span style="width: 200px;">Test Content</span></div>');
        });

        it('should remove a matching span with its following br', function(){
            expect(taFixChrome('<div><span style="font-family: inherit; line-height: 1.428571429;">Test Content</span><br/></div>')).toBe('<div>Test Content</div>');
        });

        it('should correctly keep final part of string after "Apple-converted-space"', function(){
            expect(taFixChrome('<p class="p1">I can see this part of the text<span class="Apple-converted-space">&nbsp; </span>but not this part</p>')).toBe('<p class="p1">I can see this part of the text  but not this part</p>');
        });

        it('should not damage html when removing style', function(){
            expect(taFixChrome('<a style="background-color: rgb(255, 255, 255);" href="https://www.google.pl" target="_blank">google</a>')).toBe('<a href="https://www.google.pl" target="_blank">google</a>');
        });

        it('should keep background-color style', function(){
            expect(taFixChrome('<a style="background-color: rgb(255, 255, 255);" href="https://www.google.pl" target="_blank">google</a>', true)).toBe('<a style="background-color: rgb(255, 255, 255);" href="https://www.google.pl" target="_blank">google</a>');
        });

        it('should keep styles', function(){
            expect(taFixChrome('<div><span style="font-family: inherit; line-height: 1.428571429;">Test Content</span></div>', true)).toBe('<div><span style="font-family: inherit; line-height: 1.428571429;">Test Content</span></div>');
        });

        it('should handle multiple styles', function(){
            expect(
        taFixChrome('<pre class="command-line" style="text-align: left;"><span class="command">git checkout master</span><span>git fetch upstream</span>git merge upstream/master</pre><pre class="command-line" style="text-align: left;">git push</pre>', false))
            .toBe(
            '<pre class="command-line" style="text-align: left;"><span class="command">git checkout master</span>git fetch upstreamgit merge upstream/master</pre><pre class="command-line" style="text-align: left;">git push</pre>');
        });

    });
});