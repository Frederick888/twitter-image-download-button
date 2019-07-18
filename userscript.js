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
// @require      https://onee3.org/libs/fileserver/1.3.8/FileSaver.min.js
// @require      https://onee3.org/libs/jszip/3.2.2/jszip.min.js
// @require      https://onee3.org/libs/jszip-utils/0.1.0/jszip-utils.min.js
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

function fileMime(filename) {
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

function downloadZip(imageUrls, filenamePrefix) {
    let zip = new JSZip();
    imageUrls.forEach(function (imageUrl) {
        imageUrl = new URL(imageUrl);
        imageUrl.searchParams.set('name', 'orig');
        console.log('Downloading ' + imageUrl);
        let filename = filenamePrefix + '-' + imageUrl.pathname.replace(/^\/media\//, '') + '.' + imageUrl.searchParams.get('format');
        zip.file(filename, urlToPromise(imageUrl), {
            binary: true
        });
    });
    zip.generateAsync({
        type: "blob"
    }).then(function callback(blob) {
        FileSaver.saveAs(blob, filenamePrefix + '.zip');
    }, function (e) {
        alert("Download error!");
        console.log(e);
    });
}

function downloadImage(imageUrl, filenamePrefix) {
    imageUrl = new URL(imageUrl);
    imageUrl.searchParams.set('name', 'orig');
    console.log('Downloading ' + imageUrl);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", imageUrl, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (ev) {
        let filename = filenamePrefix + '-' + imageUrl.pathname.replace(/^\/media\//, '') + '.' + imageUrl.searchParams.get('format');
        let blob = new Blob([xhr.response], {
            type: fileMime(filename)
        });
        FileSaver.saveAs(blob, filename);
    };
    xhr.send();
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function mainLoop() {
    let buttonHomePage = htmlToElement(`
<div class="css-1dbjc4n r-1iusvr4 r-18u37iz r-16y2uox r-1h0z5md">
    <div role="button" data-focusable="true" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-11cpok1 r-bztko3 r-lrvibr download-button" data-testid="download">
        <div dir="ltr" class="css-901oao r-1awozwy r-1re7ezh r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-ad9z0x r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0">
            <div class="css-1dbjc4n r-xoduu5">
                <div class="css-1dbjc4n r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>
                <svg class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi" fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><path d="M20.953,11.003l-9.95,9.95c-1.097,1.096-2.537,1.645-3.978,1.645s-2.881-0.548-3.978-1.645  c-2.193-2.194-2.193-5.762-0.001-7.956l5.561-5.56c1.175-1.176,3.225-1.177,4.401,0c0.589,0.588,0.912,1.369,0.912,2.201  s-0.323,1.613-0.912,2.201l-4.316,4.316c-0.234,0.234-0.613,0.234-0.848,0s-0.234-0.614,0-0.849l4.316-4.316  c0.361-0.361,0.56-0.842,0.56-1.353s-0.198-0.991-0.56-1.352c-0.723-0.723-1.983-0.722-2.706,0l-5.56,5.56  c-1.725,1.725-1.725,4.533,0.001,6.258c1.726,1.727,4.533,1.726,6.259,0l9.949-9.95c1.725-1.725,1.725-4.533-0.001-6.258  c-1.725-1.726-4.532-1.725-6.259,0l-1.281,1.283c-0.234,0.234-0.614,0.234-0.849,0c-0.234-0.234-0.234-0.614-0.001-0.849  l1.282-1.283c2.195-2.192,5.763-2.193,7.956,0C23.146,5.241,23.146,8.81,20.953,11.003z"/></svg>
            </div>
            <div class="css-1dbjc4n r-xoduu5 r-1udh08x">
                <span class="css-901oao css-16my406 r-gwet1z r-ad9z0x r-1n0xq6e r-bcqeeo r-d3hbe1 r-1wgg2b2 r-axxi2z r-qvutc0">
                    <span class="css-901oao css-16my406 r-gwet1z r-ad9z0x r-bcqeeo r-qvutc0 download-button-counter">1</span>
                </span>
            </div>
        </div>
    </div>
</div>
`);
    let buttonModal = htmlToElement(`
<div class="css-1dbjc4n r-1iusvr4 r-18u37iz r-16y2uox r-1h0z5md">
    <div role="button" data-focusable="true" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-11cpok1 r-bztko3 r-lrvibr download-button" data-testid="like">
        <div dir="ltr" class="css-901oao r-1awozwy r-jwli3a r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-ad9z0x r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0">
            <div class="css-1dbjc4n r-xoduu5">
                <div class="css-1dbjc4n r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>
                <svg class="r-4qtqp9 r-yyyyoo r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue" fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><path d="M20.953,11.003l-9.95,9.95c-1.097,1.096-2.537,1.645-3.978,1.645s-2.881-0.548-3.978-1.645  c-2.193-2.194-2.193-5.762-0.001-7.956l5.561-5.56c1.175-1.176,3.225-1.177,4.401,0c0.589,0.588,0.912,1.369,0.912,2.201  s-0.323,1.613-0.912,2.201l-4.316,4.316c-0.234,0.234-0.613,0.234-0.848,0s-0.234-0.614,0-0.849l4.316-4.316  c0.361-0.361,0.56-0.842,0.56-1.353s-0.198-0.991-0.56-1.352c-0.723-0.723-1.983-0.722-2.706,0l-5.56,5.56  c-1.725,1.725-1.725,4.533,0.001,6.258c1.726,1.727,4.533,1.726,6.259,0l9.949-9.95c1.725-1.725,1.725-4.533-0.001-6.258  c-1.725-1.726-4.532-1.725-6.259,0l-1.281,1.283c-0.234,0.234-0.614,0.234-0.849,0c-0.234-0.234-0.234-0.614-0.001-0.849  l1.282-1.283c2.195-2.192,5.763-2.193,7.956,0C23.146,5.241,23.146,8.81,20.953,11.003z"/></svg>
            </div>
            <div class="css-1dbjc4n r-xoduu5 r-1udh08x">
                <span class="css-901oao css-16my406 r-gwet1z r-ad9z0x r-1n0xq6e r-bcqeeo r-d3hbe1 r-1wgg2b2 r-axxi2z r-qvutc0">
                    <span class="css-901oao css-16my406 r-gwet1z r-ad9z0x r-bcqeeo r-qvutc0">1</span>
                </span>
            </div>
        </div>
    </div>
</div>
`);
    let buttonTweetPage = htmlToElement(`
<div class="css-1dbjc4n r-18u37iz r-1h0z5md r-3qxfft r-h4g966 r-rjfia">
    <div aria-haspopup="false" aria-label="Download" role="button" data-focusable="true" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-11cpok1 r-bztko3 r-lrvibr download-button">
        <div dir="ltr" class="css-901oao r-1awozwy r-1re7ezh r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-ad9z0x r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0">
            <div class="css-1dbjc4n r-xoduu5">
                <div class="css-1dbjc4n r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>
                <svg class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi" fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><path d="M20.953,11.003l-9.95,9.95c-1.097,1.096-2.537,1.645-3.978,1.645s-2.881-0.548-3.978-1.645  c-2.193-2.194-2.193-5.762-0.001-7.956l5.561-5.56c1.175-1.176,3.225-1.177,4.401,0c0.589,0.588,0.912,1.369,0.912,2.201  s-0.323,1.613-0.912,2.201l-4.316,4.316c-0.234,0.234-0.613,0.234-0.848,0s-0.234-0.614,0-0.849l4.316-4.316  c0.361-0.361,0.56-0.842,0.56-1.353s-0.198-0.991-0.56-1.352c-0.723-0.723-1.983-0.722-2.706,0l-5.56,5.56  c-1.725,1.725-1.725,4.533,0.001,6.258c1.726,1.727,4.533,1.726,6.259,0l9.949-9.95c1.725-1.725,1.725-4.533-0.001-6.258  c-1.725-1.726-4.532-1.725-6.259,0l-1.281,1.283c-0.234,0.234-0.614,0.234-0.849,0c-0.234-0.234-0.234-0.614-0.001-0.849  l1.282-1.283c2.195-2.192,5.763-2.193,7.956,0C23.146,5.241,23.146,8.81,20.953,11.003z"/></svg>
            </div>
        </div>
    </div>
</div>
`);

    let articles = document.querySelectorAll('article.css-1dbjc4n');
    let modals = document.querySelectorAll('div.css-1dbjc4n[aria-modal="true"]');
    let containers;
    if (window.location.pathname.match(/^\/.*\/status\/\d+\/photo\/\d+/) && modals.length > 0) {
        containers = Array.from(articles).concat(Array.from(modals));
    } else {
        containers = articles;
    }
    containers.forEach((container) => {
        let downloadButton = container.querySelector('.download-button');
        if (downloadButton) {
            return;
        }
        let imageBoxes = Array.from(container.querySelectorAll('img.css-9pa8cd'))
            .filter((imageBox) => {
                return imageBox.getAttribute('src').indexOf('pbs.twimg.com/media') > 0;
            });
        if (imageBoxes.length > 0) {
            let filenamePrefix;
            if (imageBoxes[0].closest('div.css-1dbjc4n > a[href*="/status/"]')) {
                filenamePrefix = imageBoxes[0].closest('div.css-1dbjc4n > a[href*="/status/"]').getAttribute('href').replace(/^\/(.*)\/status\/(\d+).*?$/, '$1-$2');
            } else {
                filenamePrefix = window.location.pathname.replace(/^\/(.*)\/status\/(\d+)\/.*?$/, '$1-$2');
            }
            let buttonGroup = container.querySelector(':scope div.css-1dbjc4n.r-18u37iz[role="group"]');
            let buttons = buttonGroup.querySelectorAll(':scope > div.r-1h0z5md');
            let shareButton = buttons[buttons.length - 1];
            if (shareButton.classList.contains('r-1iusvr4')) {
                // homepage   css-1dbjc4n r-1iusvr4 r-18u37iz r-16y2uox r-1h0z5md
                shareButton.before(buttonHomePage);
            } else if (shareButton.classList.contains('r-3qxfft')) {
                // tweet page css-1dbjc4n r-18u37iz r-1h0z5md r-3qxfft r-h4g966 r-rjfia
                shareButton.before(buttonTweetPage);
            } else if (shareButton.classList.contains('r-1mlwlqe')) {
                // modal      css-1dbjc4n r-1mlwlqe r-18u37iz r-18kxxzh r-1h0z5md
                shareButton.before(buttonModal);
            }
            downloadButton = container.querySelector('.download-button');
            if (downloadButton) {
                let downloadButtonCounter = container.querySelector('.download-button-counter');
                if (downloadButtonCounter) {
                    downloadButtonCounter.innerHTML = imageBoxes.length;
                }
                let clonedButton = downloadButton.cloneNode(true);
                if (imageBoxes.length === 1) {
                    downloadButton.parentNode.replaceChild(clonedButton, downloadButton);
                    clonedButton.addEventListener('click', (event) => {
                        let imageUrl = imageBoxes[0].getAttribute('src');
                        downloadImage(imageUrl, filenamePrefix);
                    });
                } else if (shareButton.classList.contains('r-1mlwlqe')) {
                    downloadButton.parentNode.replaceChild(clonedButton, downloadButton);
                    clonedButton.addEventListener('click', (event) => {
                        let modalUl = container.querySelector('ul');
                        let ulWidth = parseInt(modalUl.style.getPropertyValue('width').replace(/px$/, ''));
                        let transformX = parseInt(modalUl.style.getPropertyValue('transform').replace(/.*translate3d\(([-\d]+)px.*/, '$1'));
                        let imageIndex = Math.round(Math.abs(transformX) * 2 / ulWidth);
                        let imageUrl = imageBoxes[imageIndex].getAttribute('src');
                        downloadImage(imageUrl, filenamePrefix);
                    });
                } else {
                    downloadButton.parentNode.replaceChild(clonedButton, downloadButton);
                    clonedButton.addEventListener('click', (event) => {
                        let imageUrls = imageBoxes.map((imageBox) => {
                            return imageBox.getAttribute('src');
                        });
                        downloadZip(imageUrls, filenamePrefix);
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
        mainLoop();
        setInterval(mainLoop, 200);
    }
}

docReady(bootstrap);
