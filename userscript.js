// ==UserScript==
// @name         Twitter Image Download Button
// @namespace    https://onee3.org
// @version      0.65
// @description  Show a button to download the full-size images in Twitter
// @author       Frederick888
// @license      GPL-3.0-or-later
// @match        https://twitter.com/*
// @match        https://tweetdeck.twitter.com/*
// @grant        none
// @require      https://onee3.org/libs/fileserver/1.3.3/FileSaver.min.js
// @require      https://onee3.org/libs/jszip/3.1.3/jszip.min.js
// @require      https://onee3.org/libs/jszip-utils/0.0.2/jszip-utils.min.js
// @require      https://onee3.org/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

function urlToPromise(url) {
    return new Promise(function (resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function file_mime(filename) {
    let extension = filename.replace(/.*(\.\w+)$/g, "$1");
    switch (extension) {
        case ".jpg":
        case ".jpeg":
        case ".jpe":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        case ".png":
            return "image/png";
        default:
            return "";
    }
}

function download_zip(image_urls, tweet_link) {
    let zip = new JSZip();
    image_urls.forEach(function (url) {
        let image_url = url;
        console.log('Downloading ' + image_url);
        let filename = tweet_link.replace(/\/(.*)\/status\/(.*)/, '$1-$2-') +
            image_url.replace(/.*\//, '').replace(/:orig$/, '');
        zip.file(filename, urlToPromise(image_url), {
            binary: true
        });
    });
    zip.generateAsync({
        type: "blob"
    }).then(function callback(blob) {
        saveAs(blob, tweet_link.replace(/\/(.*)\/status\/(.*)/, '$1-$2.zip'));
    }, function (e) {
        alert("Download error!");
        console.log(e);
    });
}

function download_image(image_url, tweet_link) {
    console.log('Downloading ' + image_url);
    // image_url should have :orig suffix
    let xhr = new XMLHttpRequest();
    xhr.open("GET", image_url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (ev) {
        let filename = tweet_link.replace(/\/(.*)\/status\/(.*)/, '$1-$2-') +
            image_url.replace(/.*\//, '').replace(/:orig$/, '');
        let blob = new Blob([xhr.response], {
            type: file_mime(filename)
        });
        saveAs(blob, filename);
    };
    xhr.send();
}

function tweet_link($fav_or_dm_btn) {
    let regexp = /^https?:\/\/(\w+\.)?twitter\.com/;
    let $tweet = $fav_or_dm_btn.closest('.tweet');
    if ($tweet.length > 0) {
        let $time = $tweet.find('.tweet-timestamp');
        let link;
        if ($time.is('a')) {
            link = $time.attr('href');
        } else {
            link = $time.find('a').attr('href');
        }
        return link.replace(regexp, '');
    } else {
        let $tweet_detail = $fav_or_dm_btn.closest('.tweet-detail');
        let link = $tweet_detail.find('div.margin-tl.txt-mute > a').attr('href');
        return link.replace(regexp, '');
    }
}

function main_loop_deck() {
    console.log('main loop (deck) triggered');

    let button = '<li class="tweet-action-item pull-left margin-r--13">' +
        '<a class="js-show-tip tweet-action position-rel" href="#" rel="download" title="" data-original-title="Download Image(s)">' +
        '<i class="js-icon-download icon icon-download icon-download-toggle txt-center"></i>' +
        '<span class="is-vishidden">Download Image(s)</span></a></li>';
    let button_detail = '<li class="tweet-detail-action-item">' +
        '<a class="js-show-tip tweet-detail-action position-rel" href="#" rel="download" title="" data-original-title="Download Image(s)">' +
        '<i class="js-icon-download icon icon-download icon-download-toggle txt-center"></i>' +
        '<span class="is-vishidden">Download Image(s)</span></a></li>';

    let $favIcon = $('.js-icon-favorite');
    $favIcon.each(function () {
        let $action_item = $(this).closest('.tweet-action-item').length > 0 ?
            $(this).closest('.tweet-action-item') : $(this).closest('.tweet-detail-action-item');
        let link = tweet_link($action_item);
        if ($action_item.attr('download-added') != 'true') {
            $action_item.attr('download-added', 'true');
            if ($(this).closest('.tweet-action-item').length > 0) {
                $action_item.after(button);
            } else {
                $action_item.after(button_detail);
            }

            let $parent = $action_item.closest('.js-tweet');
            let $added_button = $parent.find('.icon-download').closest('a.tweet-action').length > 0 ?
                $parent.find('.icon-download').closest('a.tweet-action') : $parent.find('.icon-download').closest('a.tweet-detail-action');

            let $modal_content = $parent.closest('.js-modal-panel.med-fullpanel');
            if ($modal_content.length > 0) {
                // this url has :large itself
                $added_button.on('click', function () {
                    let image_url = $modal_content.find('img.media-img').attr('src');
                    download_image(image_url.replace(/^.*(http.*\.\w+)(:small|:large)?.*$/, "$1:orig"), link);
                });
            } else {
                $image_container = $parent.find('.js-media-image-link');
                if ($image_container.length === 0) {
                    $added_button.css('display', 'none');
                } else if ($image_container.length == 1) {
                    let image_url = $image_container.css('background-image') != 'none' ?
                        $image_container.css('background-image') : $image_container.find('img').attr('src');
                    image_url = image_url.replace(/^.*(http.*\.\w+)(:small|:large)?.*$/, "$1:orig");
                    $added_button.on('click', function () {
                        download_image(image_url, link);
                    });
                } else if ($image_container.length > 1) {
                    let image_urls = [];
                    $image_container.each(function () {
                        let image_url = $(this).css('background-image') != 'none' ?
                            $(this).css('background-image') : $(this).find('img').attr('src');
                        image_url = image_url.replace(/^.*(http.*\.\w+)(:small|:large)?.*$/, "$1:orig");
                        image_urls.push(image_url);
                    });
                    $added_button.on('click', function () {
                        download_zip(image_urls, link);
                    });
                }
            }
        }
    });
}

function main_loop() {
    console.log('main loop triggered');

    let button = '<div class="ProfileTweet-action ProfileTweet-action--download">' +
        '<button class="ProfileTweet-actionButton u-textUserColorHover">' +
        '<div class="IconContainer js-tooltip" data-original-title="Download Image(s)">' +
        '<span class="Icon Icon--medium Icon--dl"></span>' +
        '<span class="u-hiddenVisually">Download Image(s)</span></div>' +
        '<span class="ProfileTweet-actionCount">' +
        '<span class="ProfileTweet-actionCountForPresentation" aria-hidden="true">1</span></span>' +
        '</button></div>';

    let $dmIcon = $('.ProfileTweet-action--dm');
    $dmIcon.each(function () {
        let link = tweet_link($(this));
        if ($(this).attr('download-added') != 'true') {
            $(this).attr('download-added', 'true');
            $(this).before(button);

            let $parent = $(this).closest('.ProfileTweet-actionList');
            let $added_button = $parent.find('.Icon--dl').closest('.ProfileTweet-actionButton');
            let $added_button_counter = $added_button.find('.ProfileTweet-actionCountForPresentation');

            let $gallery_content = $parent.closest('.Gallery-content');
            // gallery mode
            if ($gallery_content.length > 0) {
                // this url has :large itself
                $added_button.on('click', function () {
                    let image_url = $gallery_content.find('.Gallery-media .media-image').attr('src');
                    download_image(image_url.replace(/^.*(http.*\.\w+)(:small|:large)?.*$/, "$1:orig"), link);
                });
            } else {
                let $image_container = $parent.closest('.tweet')
                    .find('.AdaptiveMediaOuterContainer');
                if ($image_container.length > 0) {
                    $image_container = $image_container.first().find('.AdaptiveMedia-photoContainer');
                }
                let image_count = $image_container.length;
                if (image_count === 0) {
                    $added_button.closest('div').css('display', 'none');
                } else if (image_count == 1) {
                    $added_button_counter.html(image_count);
                    let image_url = $image_container.attr('data-image-url') + ':orig';
                    $added_button.on('click', function () {
                        download_image(image_url, link);
                    });
                } else {
                    $added_button_counter.html(image_count);
                    $added_button.on('click', function () {
                        let image_urls = [];
                        $image_container.each(function () {
                            let $this = $(this);
                            let image_url = $this.attr('data-image-url') + ':orig';
                            image_urls.push(image_url);
                        });
                        download_zip(image_urls, link);
                    });
                }
            }
        }
    });
}

// https://stackoverflow.com/questions/9899372/
(function (funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === "complete") {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function (callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function () {
                callback(context);
            }, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({
                fn: callback,
                ctx: context
            });
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    };
})("docReady", window);

function bootstrap() {
    'use strict';
    if (window.location.hostname == "twitter.com") {
        let css = '<style>.Icon--dl:before { content: "\\f088"; color: #657786; }' +
            '.ProfileTweet-action.ProfileTweet-action--download:hover .Icon--dl:before { color: #ff9966; }' +
            '.ProfileTweet-action.ProfileTweet-action--download:hover .ProfileTweet-actionCountForPresentation { color: #ff9966; }' +
            '.Gallery .ProfileTweet-actionCountForPresentation { color: #fff !important; }' +
            '.Gallery .Icon--dl:before { color: #fff; }' +
            '.Gallery .ProfileTweet-action.ProfileTweet-action--download:hover .Icon--dl:before { color: #ff9966; }' +
            '</style>';

        $('head').append(css);

        main_loop();
        setInterval(main_loop, 500);
    } else if (window.location.hostname == "tweetdeck.twitter.com") {
        let css = '<style>.js-icon-download:before { content: "\\f088"; }' +
            '.tweet-action:hover .icon-download { color: #ff9966; }' +
            '.without-tweet-drag-handles .tweet-detail-action-item { width: 20% !important; }' +
            '</style>';
        $('head').append(css);
        main_loop_deck();
        setInterval(main_loop_deck, 500);
    }
}

docReady(bootstrap);