// Adds an "Open in Compiler Explorer" button to every C/C++ code block.
// The sample is sent to godbolt.org as a client-state URL, so no server or API key is needed.
(function () {
    'use strict';

    var CE_URL = 'https://godbolt.org/clientstate/';

    var LANGS = {
        'language-cpp': { lang: 'c++', compiler: 'g162', options: '-std=c++26 -O2 -Wall' },
        'language-c':   { lang: 'c',   compiler: 'cg162', options: '-std=c23 -O2 -Wall' }
    };

    function base64Url(text) {
        var bytes = new TextEncoder().encode(text);
        var binary = '';
        for (var i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function buildUrl(source, cfg) {
        var session = {
            id: 1,
            language: cfg.lang,
            source: source,
            compilers: [{ id: cfg.compiler, options: cfg.options }]
        };
        // Only complete programs can be run; fragments are opened compile-only.
        if (/\bmain\s*\(/.test(source)) {
            session.executors = [{
                arguments: '',
                argumentsVisible: false,
                stdin: '',
                stdinVisible: false,
                compilerOutputVisible: true,
                wrap: false,
                compiler: { id: cfg.compiler, options: cfg.options, libs: [] }
            }];
        }
        return CE_URL + base64Url(JSON.stringify({ sessions: [session] }));
    }

    function addButton(code, cfg) {
        var pre = code.parentElement;
        if (!pre || pre.tagName !== 'PRE') return;

        var buttons = pre.querySelector('.buttons');
        if (!buttons) {
            buttons = document.createElement('div');
            buttons.className = 'buttons';
            pre.insertBefore(buttons, pre.firstChild);
        }

        var button = document.createElement('button');
        button.className = 'fa fa-external-link ce-button';
        button.title = 'Open in Compiler Explorer';
        button.setAttribute('aria-label', 'Open in Compiler Explorer');
        button.addEventListener('click', function () {
            window.open(buildUrl(code.textContent, cfg), '_blank', 'noopener');
        });
        buttons.insertBefore(button, buttons.firstChild);
    }

    function init() {
        Object.keys(LANGS).forEach(function (cls) {
            document.querySelectorAll('pre > code.' + cls).forEach(function (code) {
                addButton(code, LANGS[cls]);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
