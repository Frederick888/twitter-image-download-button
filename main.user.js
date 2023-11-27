// ==UserScript==
// @name            Twitter Image Download Button
// @namespace       https://onee3.org
// @version         1.2.5
// @description     Show a button to download the full-size images in Twitter
// @copyright       2017, Frederick888 (https://openuserjs.org/users/Frederick888)
// @author          Frederick888
// @license         GPL-3.0-or-later
// @homepageURL     https://github.com/Frederick888/twitter-image-download-button
// @supportURL      https://github.com/Frederick888/twitter-image-download-button/issues
// @contributionURL https://github.com/Frederick888/twitter-image-download-button/pulls
// @updateURL       https://openuserjs.org/meta/Frederick888/Twitter_Image_Download_Button.meta.js
// @match           https://twitter.com/*
// @match           https://mobile.twitter.com/*
// @grant           none
// @require         https://onee3.org/libs/fileserver/2.0.5/FileSaver.min.js
// @require         https://onee3.org/libs/jszip/3.7.1/jszip.min.js
// @require         https://onee3.org/libs/jszip-utils/0.1.0/jszip-utils.min.js
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

function saveFile(data, filename) {
    let a = document.getElementById('download-tag');
    if (!a) {
        a = document.createElement('a');
        a.id = 'download-tag';
        a.style.display = 'none';
        document.body.appendChild(a);
    }
    var blob = new Blob([data], {type: fileMime(filename)}),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
        if (navigator.userAgent.indexOf('Firefox') || blob.size < 1048576) {
            // Firefox has no limit on data URLs
            saveFile(blob, filenamePrefix + '.zip');
        } else {
            FileSaver.saveAs(blob, filenamePrefix + '.zip');
        }
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
    xhr.onload = function (_ev) {
        let filename = filenamePrefix + '-' + imageUrl.pathname.replace(/^\/media\//, '') + '.' + imageUrl.searchParams.get('format');
        let blob = new Blob([xhr.response], {
            type: fileMime(filename)
        });
        if (navigator.userAgent.indexOf('Firefox') || blob.size < 1048576) {
            saveFile(blob, filename);
        } else {
            FileSaver.saveAs(blob, filename);
        }
    };
    xhr.send();
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function isHomePage() {
    return window.location.pathname.match(/^(\/home)?(\?.*)?$/);
}

function isTweetPage() {
    return window.location.pathname.match(/^\/.*\/status\/\d+(\?.*)?$/);
}

function isPhotoModalPage() {
    return window.location.pathname.match(/^\/.*\/status\/\d+\/photo\/\d+/);
}

let ButtonLocation = {
    HOME_PAGE: 1,
    TWEET_PAGE: 2,
    PHOTO_MODAL: 3,
};

function getButtonLocation(container) {
    if (container.classList.contains('r-16y2uox')) {
        return ButtonLocation.PHOTO_MODAL;
    }
    if (isTweetPage()) {
        return ButtonLocation.TWEET_PAGE;
    }
    return ButtonLocation.HOME_PAGE;
}

function mainLoop() {
    // cspell: disable
    let buttonHomePage = htmlToElement(`
<div class="css-175oi2r r-18u37iz r-1h0z5md r-13awgt0">
    <div role="button" tabindex="0" class="css-175oi2r r-1777fci r-bt1l66 r-bztko3 r-lrvibr r-1loqt21 r-1ny4l3l download-button" data-testid="download">
        <div dir="ltr" class="css-1rynq56 r-bcqeeo r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-1awozwy r-6koalj r-1h0z5md r-o7ynqc r-clp7b1 r-3s2u2q" style="color: rgb(113, 118, 123); text-overflow: unset;">
            <div class="css-175oi2r r-xoduu5">
                <div class="css-175oi2r r-xoduu5 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1niwhzg r-sdzlij r-xf4iuw r-o7ynqc r-6416eg r-1ny4l3l"></div>
                <svg class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi" fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><path d="M20.953,11.003l-9.95,9.95c-1.097,1.096-2.537,1.645-3.978,1.645s-2.881-0.548-3.978-1.645  c-2.193-2.194-2.193-5.762-0.001-7.956l5.561-5.56c1.175-1.176,3.225-1.177,4.401,0c0.589,0.588,0.912,1.369,0.912,2.201  s-0.323,1.613-0.912,2.201l-4.316,4.316c-0.234,0.234-0.613,0.234-0.848,0s-0.234-0.614,0-0.849l4.316-4.316  c0.361-0.361,0.56-0.842,0.56-1.353s-0.198-0.991-0.56-1.352c-0.723-0.723-1.983-0.722-2.706,0l-5.56,5.56  c-1.725,1.725-1.725,4.533,0.001,6.258c1.726,1.727,4.533,1.726,6.259,0l9.949-9.95c1.725-1.725,1.725-4.533-0.001-6.258  c-1.725-1.726-4.532-1.725-6.259,0l-1.281,1.283c-0.234,0.234-0.614,0.234-0.849,0c-0.234-0.234-0.234-0.614-0.001-0.849  l1.282-1.283c2.195-2.192,5.763-2.193,7.956,0C23.146,5.241,23.146,8.81,20.953,11.003z"/></svg>
            </div>
            <div class="css-175oi2r r-xoduu5 r-1udh08x">
                <span data-testid="app-text-transition-container" style="transition-property: transform; transition-duration: 0.3s; transform: translate3d(0px, 0px, 0px);">
                    <span class="css-1qaijid r-qvutc0 r-1tl8opc r-n6v787 r-1cwl3u0 r-1k6nrdp r-1pn2ns4" style="text-overflow: unset;">
                        <span class="css-1qaijid r-bcqeeo r-qvutc0 r-1tl8opc download-button-counter" style="text-overflow: unset;">1</span>
                    </span>
                </span>
            </div>
        </div>
    </div>
</div>
`);
    let buttonModal = htmlToElement(`
<div class="css-175oi2r r-18u37iz r-1h0z5md r-13awgt0">
    <div role="button" tabindex="0" class="css-175oi2r r-1777fci r-bt1l66 r-bztko3 r-lrvibr r-1loqt21 r-1ny4l3l download-button" data-testid="download">
        <div dir="ltr" class="css-1rynq56 r-bcqeeo r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-1awozwy r-6koalj r-1h0z5md r-o7ynqc r-clp7b1 r-3s2u2q" style="color: rgb(255, 255, 255); text-overflow: unset;">
            <div class="css-175oi2r r-xoduu5">
                <div class="css-175oi2r r-xoduu5 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1niwhzg r-sdzlij r-xf4iuw r-o7ynqc r-6416eg r-1ny4l3l"></div>
                <svg class="r-4qtqp9 r-yyyyoo r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue" fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><path d="M20.953,11.003l-9.95,9.95c-1.097,1.096-2.537,1.645-3.978,1.645s-2.881-0.548-3.978-1.645  c-2.193-2.194-2.193-5.762-0.001-7.956l5.561-5.56c1.175-1.176,3.225-1.177,4.401,0c0.589,0.588,0.912,1.369,0.912,2.201  s-0.323,1.613-0.912,2.201l-4.316,4.316c-0.234,0.234-0.613,0.234-0.848,0s-0.234-0.614,0-0.849l4.316-4.316  c0.361-0.361,0.56-0.842,0.56-1.353s-0.198-0.991-0.56-1.352c-0.723-0.723-1.983-0.722-2.706,0l-5.56,5.56  c-1.725,1.725-1.725,4.533,0.001,6.258c1.726,1.727,4.533,1.726,6.259,0l9.949-9.95c1.725-1.725,1.725-4.533-0.001-6.258  c-1.725-1.726-4.532-1.725-6.259,0l-1.281,1.283c-0.234,0.234-0.614,0.234-0.849,0c-0.234-0.234-0.234-0.614-0.001-0.849  l1.282-1.283c2.195-2.192,5.763-2.193,7.956,0C23.146,5.241,23.146,8.81,20.953,11.003z"/></svg>
            </div>
            <div class="css-175oi2r r-xoduu5 r-1udh08x">
                <span data-testid="app-text-transition-container" style="transition-property: transform; transition-duration: 0.3s; transform: translate3d(0px, 0px, 0px);">
                    <span class="css-1qaijid r-qvutc0 r-1tl8opc r-n6v787 r-1cwl3u0 r-1k6nrdp r-1pn2ns4" style="text-overflow: unset;">
                        <span class="css-1qaijid r-bcqeeo r-qvutc0 r-1tl8opc download-button-counter" style="text-overflow: unset;">1</span>
                    </span>
                </span>
            </div>
        </div>
    </div>
</div>
`);
    let buttonTweetPage = htmlToElement(`
<div class="css-175oi2r r-18u37iz r-1h0z5md r-13awgt0">
    <div role="button" tabindex="0" class="css-175oi2r r-1777fci r-bt1l66 r-bztko3 r-lrvibr r-1loqt21 r-1ny4l3l download-button" data-testid="download">
        <div dir="ltr" class="css-1rynq56 r-bcqeeo r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-1awozwy r-6koalj r-1h0z5md r-o7ynqc r-clp7b1 r-3s2u2q" style="color: rgb(113, 118, 123); text-overflow: unset;">
            <div class="css-175oi2r r-xoduu5">
                <div class="css-175oi2r r-xoduu5 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1niwhzg r-sdzlij r-xf4iuw r-o7ynqc r-6416eg r-1ny4l3l"> </div>
                <svg class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi" fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><path d="M20.953,11.003l-9.95,9.95c-1.097,1.096-2.537,1.645-3.978,1.645s-2.881-0.548-3.978-1.645  c-2.193-2.194-2.193-5.762-0.001-7.956l5.561-5.56c1.175-1.176,3.225-1.177,4.401,0c0.589,0.588,0.912,1.369,0.912,2.201  s-0.323,1.613-0.912,2.201l-4.316,4.316c-0.234,0.234-0.613,0.234-0.848,0s-0.234-0.614,0-0.849l4.316-4.316  c0.361-0.361,0.56-0.842,0.56-1.353s-0.198-0.991-0.56-1.352c-0.723-0.723-1.983-0.722-2.706,0l-5.56,5.56  c-1.725,1.725-1.725,4.533,0.001,6.258c1.726,1.727,4.533,1.726,6.259,0l9.949-9.95c1.725-1.725,1.725-4.533-0.001-6.258  c-1.725-1.726-4.532-1.725-6.259,0l-1.281,1.283c-0.234,0.234-0.614,0.234-0.849,0c-0.234-0.234-0.234-0.614-0.001-0.849  l1.282-1.283c2.195-2.192,5.763-2.193,7.956,0C23.146,5.241,23.146,8.81,20.953,11.003z"/></svg>
            </div>
            <div class="css-175oi2r r-xoduu5 r-1udh08x">
                <span data-testid="app-text-transition-container" style="transform: translate3d(0px, 0px, 0px); transition-property: transform; transition-duration: 0.3s;">
                    <span class="css-1qaijid r-qvutc0 r-1tl8opc r-n6v787 r-1cwl3u0 r-1k6nrdp r-1pn2ns4" style="text-overflow: unset;">
                        <span class="css-1qaijid r-bcqeeo r-qvutc0 r-1tl8opc download-button-counter" style="text-overflow: unset;">1</span>
                    </span>
                </span>
            </div>
        </div>
    </div>
</div>
`);

    // home:            article.css-175oi2r.r-18u37iz.r-1udh08x.r-i023vh.r-1qhn6m8.r-o7ynqc.r-6416eg.r-1ny4l3l.r-1loqt21
    // tweet main:      article.css-175oi2r.r-18u37iz.r-1udh08x.r-i023vh.r-1qhn6m8.r-1ny4l3l
    // tweet comments:  article.css-175oi2r.r-18u37iz.r-1udh08x.r-i023vh.r-1qhn6m8.r-o7ynqc.r-6416eg.r-1ny4l3l.r-1loqt21
    let articles = document.querySelectorAll('article.css-175oi2r');
    // div.css-175oi2r.r-16y2uox.r-1wbh5a2
    let modals = document.querySelectorAll('div.css-175oi2r[aria-modal="true"] > div > div:first-child');
    // cspell: enable
    let containers;
    if (isPhotoModalPage() && modals.length > 0) {
        containers = Array.from(articles).concat(Array.from(modals));
    } else {
        containers = articles;
    }
    containers.forEach((container) => {
        let downloadButton = container.querySelector('.download-button');
        let imageBoxes = Array.from(container.querySelectorAll('img.css-9pa8cd'))
            .filter((imageBox) => {
                return imageBox.getAttribute('src').indexOf('pbs.twimg.com/media') > 0;
            });
        if (downloadButton && parseInt(downloadButton.getAttribute('count-images')) === imageBoxes.length) {
            return;
        }
        if (imageBoxes.length > 0) {
            let filenamePrefix;
            if (imageBoxes[0].closest('div.css-175oi2r > a[href*="/status/"]')) {
                filenamePrefix = imageBoxes[0].closest('div.css-175oi2r > a[href*="/status/"]').getAttribute('href').replace(/^\/(.*)\/status\/(\d+).*?$/, '$1-$2');
            } else {
                filenamePrefix = window.location.pathname.replace(/^\/(.*)\/status\/(\d+)\/.*?$/, '$1-$2');
            }
            let buttonGroup = container.querySelector(':scope div.css-175oi2r > div.css-175oi2r.r-1kbdv8c.r-18u37iz[role="group"]');
            let shareButton = buttonGroup.querySelector(':scope > div:last-child');
            let bookmarkInnerButton = buttonGroup.querySelector(':scope > div > div[data-testid="bookmark"]');
            if (!downloadButton) {
                if (getButtonLocation(container) == ButtonLocation.HOME_PAGE) {
                    bookmarkInnerButton.parentNode.before(buttonHomePage);
                } else if (getButtonLocation(container) == ButtonLocation.TWEET_PAGE) {
                    bookmarkInnerButton.parentNode.before(buttonTweetPage);
                } else if (getButtonLocation(container) == ButtonLocation.PHOTO_MODAL) {
                    shareButton.before(buttonModal);
                }
                downloadButton = container.querySelector('.download-button');
            }
            if (downloadButton) {
                downloadButton.setAttribute('count-images', imageBoxes.length);
                let downloadButtonCounter = container.querySelector('.download-button-counter');
                if (downloadButtonCounter) {
                    downloadButtonCounter.innerHTML = getButtonLocation(container) == ButtonLocation.PHOTO_MODAL ? 1 : imageBoxes.length;
                }
                let clonedButton = downloadButton.cloneNode(true);
                if (imageBoxes.length === 1) {
                    downloadButton.parentNode.replaceChild(clonedButton, downloadButton);
                    clonedButton.addEventListener('click', (_event) => {
                        let imageUrl = imageBoxes[0].getAttribute('src');
                        downloadImage(imageUrl, filenamePrefix);
                    });
                } else if (getButtonLocation(container) == ButtonLocation.PHOTO_MODAL) {
                    downloadButton.parentNode.replaceChild(clonedButton, downloadButton);
                    clonedButton.addEventListener('click', (_event) => {
                        let modalUl = container.querySelector('ul');
                        let ulWidth = parseInt(modalUl.style.getPropertyValue('width').replace(/px$/, ''));
                        let transformX = parseInt(modalUl.style.getPropertyValue('transform').replace(/.*translate3d\(([\.-\d]+)px.*/, '$1'));
                        let imageIndex = Math.round(Math.abs(transformX) * parseInt(clonedButton.getAttribute('count-images')) / ulWidth);
                        let imageUrl = imageBoxes[imageIndex].getAttribute('src');
                        downloadImage(imageUrl, filenamePrefix);
                    });
                } else {
                    downloadButton.parentNode.replaceChild(clonedButton, downloadButton);
                    clonedButton.addEventListener('click', (_event) => {
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

(function () {
    'use strict';
    let style = htmlToElement(`
<style>
    .download-button:hover > div {
        color: rgb(255, 102, 0);
    }
    .download-button:hover > div > div > div:first-of-type {
        background-color: rgba(255, 102, 0, 0.1);
    }
    div.css-175oi2r[aria-modal="true"] .download-button:hover > div {
        color: rgb(255, 255, 255);
    }
    div.css-175oi2r[aria-modal="true"] .download-button:hover > div > div > div:first-of-type {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>
`);
    let head = document.getElementsByTagName('head')[0];
    head.appendChild(style);

    if (typeof MutationObserver === 'function') {
        let observerConfig = {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        };
        let body = document.getElementsByTagName('body')[0];
        let observer = new MutationObserver(mainLoop);
        observer.observe(body, observerConfig);
    } else {
        mainLoop();
        setInterval(mainLoop, 200);
    }
})();
