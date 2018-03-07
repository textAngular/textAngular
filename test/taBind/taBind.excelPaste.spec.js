describe('taBind.excelPaste', function () {
    'use strict';
    beforeEach(module('textAngular'));
    afterEach(inject(function($document){
        $document.find('body').html('');
    }));
    var $rootScope;


    describe('should sanitize excel based content on paste', function () {
        var element, pasted = '';
        beforeEach(function(){
            pasted = '';
            module(function($provide){
                $provide.value('taSelection', {
                    insertHtml: function(html){ pasted = html; }
                });
            });
        });
        beforeEach(inject(function (_$compile_, _$rootScope_, $document) {
            $rootScope = _$rootScope_;
            $rootScope.html = '<p>Test Contents</p>';
            element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
            $document.find('body').append(element);
            $rootScope.$digest();
        }));
        // in fragment
        it('in fragment', inject(function($timeout, taSelection){
            element.triggerHandler('paste', {clipboardData: {types: ['text/html'], getData: function(){
                return '<html xmlns:v="urn:schemas-microsoft-com:vml"\n' +
                    'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                    'xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
                    'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                    '\n' +
                    '<head>\n' +
                    '<meta name=ProgId content=Excel.Sheet>\n' +
                    '</head>\n' +
                    '\n' +
                    '<body link="#0563C1" vlink="#954F72">\n' +
                    '\n' +
                    '<table border=0 cellpadding=0 cellspacing=0 width=64 style=\'border-collapse:\n' +
                    ' collapse;width:48pt\'>\n' +
                    '<!--StartFragment-->\n' +
                    ' <col width=64 style=\'width:48pt\'>\n' +
                    ' <tr height=20 style=\'height:15.0pt\'>\n' +
                    '  <td height=20 width=64 style=\'height:15.0pt;width:48pt\'>First cell</td>\n' +
                    ' </tr>\n' +
                    ' <tr height=20 style=\'height:15.0pt\'>\n' +
                    '  <td height=20 style=\'height:15.0pt\'>Second cell</td>\n' +
                    ' </tr>\n' +
                    ' <tr height=20 style=\'height:15.0pt\'>\n' +
                    '  <td height=20 style=\'height:15.0pt\'>Third cell</td>\n' +
                    ' </tr>\n' +
                    '<!--EndFragment-->\n' +
                    '</table>\n' +
                    '</body>\n' +
                    '</html>\n';// jshint ignore:line
            }}});
            $timeout.flush();
            $rootScope.$digest();
            expect(pasted).toBe('<p>First cell</p><p>Second cell</p><p>Third cell</p>');
        }));

        it('single cell', inject(function($timeout, taSelection){
            element.triggerHandler('paste', {clipboardData: {types: ['text/html'], getData: function(){
                return '<html xmlns:v="urn:schemas-microsoft-com:vml"\n' +
                    'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                    'xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
                    'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                    '\n' +
                    '<head>\n' +
                    '<meta name=ProgId content=Excel.Sheet>\n' +
                    '</head>\n' +
                    '\n' +
                    '<body link="#0563C1" vlink="#954F72">\n' +
                    '\n' +
                    '<table border=0 cellpadding=0 cellspacing=0 width=64 style=\'border-collapse:\n' +
                    ' collapse;width:48pt\'>\n' +
                    ' <col width=64 style=\'width:48pt\'>\n' +
                    ' <tr height=20 style=\'height:15.0pt\'>\n' +
                    '<!--StartFragment-->\n' +
                    '  <td height=20 width=64 style=\'height:15.0pt;width:48pt\'>Single cell</td>\n' +
                    '<!--EndFragment-->\n' +
                    ' </tr>\n' +
                    '</table>\n' +
                    '</body>\n' +
                    '</html>\n';// jshint ignore:line
            }}});
            $timeout.flush();
            $rootScope.$digest();
            expect(pasted).toBe('<p>Single cell</p>');
        }));

        it('multiline text in single cell', inject(function($timeout, taSelection){
            element.triggerHandler('paste', {clipboardData: {types: ['text/html'], getData: function(){
                return '<html xmlns:v="urn:schemas-microsoft-com:vml"\n' +
                    'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                    'xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
                    'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                    '\n' +
                    '<head>\n' +
                    '<meta name=ProgId content=Excel.Sheet>\n' +
                    '</head>\n' +
                    '\n' +
                    '<body link="#0563C1" vlink="#954F72">\n' +
                    '\n' +
                    '<table border=0 cellpadding=0 cellspacing=0 width=64 style=\'border-collapse:\n' +
                    ' collapse;width:48pt\'>\n' +
                    '<!--StartFragment-->\n' +
                    '<col width=64 style=\'width:48pt\'>\n' +
                    '<tr height=80 style=\'height:60.0pt\'>\n' +
                    '<td height=80 class=xl65 width=64 style=\'height:60.0pt;width:48pt\'>first\n' +
                    'line<br>\n' +
                    'second line<br>\n' +
                    'third line</td>\n' +
                    ' </tr>\n' +
                    ' <tr height=20 style=\'height:15.0pt\'>\n' +
                    '  <td height=20 style=\'height:15.0pt\'>Second cell</td>\n' +
                    ' </tr>\n' +
                    '<!--EndFragment-->\n' +
                    ' </tr>\n' +
                    '</table>\n' +
                    '</body>\n' +
                    '</html>\n';// jshint ignore:line
            }}});
            $timeout.flush();
            $rootScope.$digest();
            expect(pasted).toBe('<p>first line<br/> second line<br/> third line</p><p>Second cell</p>');
        }));

        // bold/italics
        it('handle bold/italics/underline', inject(function($timeout, taSelection){
            element.triggerHandler('paste', {clipboardData: {types: ['text/html'], getData: function(){
                        return '<html xmlns:v="urn:schemas-microsoft-com:vml"\n' +
                            'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                            'xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
                            'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                            '\n' +
                            '<head>\n' +
                            '<meta name=ProgId content=Excel.Sheet>\n' +
                            '</head>\n' +
                            '\n' +
                            '<body link="#0563C1" vlink="#954F72">\n' +
                            '\n' +
                            '<table border=0 cellpadding=0 cellspacing=0 width=64 style=\'border-collapse:\n' +
                            ' collapse;width:48pt\'>\n' +
                            '<!--StartFragment-->\n' +
                            '<col width=64 style=\'width:48pt\'>\n' +
                            ' <tr height=20 style=\'height:15.0pt\'>\n' +
                            '  <td height=20 class=xl65 width=64 style=\'height:15.0pt;width:48pt\'>bold text</td>\n' +
                            ' </tr>\n' +
                            ' <tr height=20 style=\'height:15.0pt\'>\n' +
                            '  <td height=20 class=xl66 style=\'height:15.0pt\'>italic text</td>\n' +
                            ' </tr>\n' +
                            ' <tr height=20 style=\'height:15.0pt\'>\n' +
                            '  <td height=20 class=xl67 style=\'height:15.0pt\'>underlined text</td>\n' +
                            ' </tr>\n' +
                            '<!--EndFragment-->\n\n' +
                            ' </tr>\n' +
                            '</table>\n' +
                            '</body>\n' +
                            '</html>\n';// jshint ignore:line
            }}});
            $timeout.flush();
            $rootScope.$digest();
            expect(pasted).toBe('<p>bold text</p><p>italic text</p><p>underlined text</p>');
        }));

        it('handle several styles in one cell', inject(function($timeout, taSelection){
            element.triggerHandler('paste', {clipboardData: {types: ['text/html'], getData: function(){
                        return '<html xmlns:v="urn:schemas-microsoft-com:vml"\n' +
                            'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                            'xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
                            'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                            '\n' +
                            '<head>\n' +
                            '<meta name=ProgId content=Excel.Sheet>\n' +
                            '</head>\n' +
                            '\n' +
                            '<body link="#0563C1" vlink="#954F72">\n' +
                            '\n' +
                            '<table border=0 cellpadding=0 cellspacing=0 width=64 style=\'border-collapse:\n' +
                            ' collapse;width:48pt\'>\n' +
                            '<col width=64 style=\'width:48pt\'>\n' +
                            ' <tr height=20 style=\'height:15.0pt\'>\n' +
                            '<!--StartFragment-->\n' +
                            '<td height=20 width=64 style=\'height:15.0pt;width:48pt\'>some normal text and\n' +
                            'then <font class="font5">bold one</font><font class="font0"> and</font><font\n' +
                            ' class="font6"> italic one and </font><font class="font7">bold together</font></td>\n' +
                            '<!--EndFragment-->\n' +
                            ' </tr>\n' +
                            '</table>\n' +
                            '</body>\n' +
                            '</html>\n';// jshint ignore:line
            }}});
            $timeout.flush();
            $rootScope.$digest();
            expect(pasted).toBe('<p>some normal text and then bold one and italic one and bold together</p>');
        }));

        it('several cells in one row', inject(function($timeout, taSelection){
            element.triggerHandler('paste', {clipboardData: {types: ['text/html'], getData: function(){
                        return '<html xmlns:v="urn:schemas-microsoft-com:vml"\n' +
                            'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                            'xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
                            'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                            '\n' +
                            '<head>\n' +
                            '<meta name=ProgId content=Excel.Sheet>\n' +
                            '</head>\n' +
                            '\n' +
                            '<body link="#0563C1" vlink="#954F72">\n' +
                            '\n' +
                            '<table border=0 cellpadding=0 cellspacing=0 width=64 style=\'border-collapse:\n' +
                            ' collapse;width:48pt\'>\n' +
                            '<col width=64 style=\'width:48pt\'>\n' +
                            ' <tr height=20 style=\'height:15.0pt\'>\n' +
                            '<!--StartFragment-->\n' +
                            '  <td height=20 width=64 style=\'height:15.0pt;width:48pt\'>first cell</td>\n' +
                            '  <td width=64 style=\'width:48pt\'>second cell</td>\n' +
                            '<!--EndFragment-->\n' +
                            ' </tr>\n' +
                            '</table>\n' +
                            '</body>\n' +
                            '</html>\n';// jshint ignore:line
            }}});
            $timeout.flush();
            $rootScope.$digest();
            expect(pasted).toBe('<p>first cell<br/>second cell</p>');
        }));


     });
});