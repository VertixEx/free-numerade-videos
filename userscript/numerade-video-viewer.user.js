// ==UserScript==
// @name         Numerade Video Viewer
// @namespace    https://github.com/GooglyBlox/free-numerade-videos
// @updateURL    https://raw.githubusercontent.com/GooglyBlox/free-numerade-videos/main/userscript/numerade-video-viewer.user.js
// @version      1.1
// @description  Unlock Numerade video answers for free.
// @author       GooglyBlox
// @match        https://www.numerade.com/questions/*
// @match        https://www.numerade.com/ask/question/*
// @icon         https://raw.githubusercontent.com/GooglyBlox/free-numerade-videos/main/no-more-numerade.ico
// @grant        none
// @license      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    async function processLink() {
        const url = window.location.href;
        try {
            const videoSrc = await fetchVideoSrc(url);
            if (videoSrc) {
                const videoElement = document.createElement('video');
                videoElement.src = videoSrc;
                videoElement.controls = true;
                videoElement.className = 'rounded';
                videoElement.style.width = '100%';
                videoElement.style.height = 'auto';

                let containerElement = document.querySelector('.video-redesign__video-container');
                
                if (!containerElement) {
                    containerElement = document.querySelector('.ask-question-detail__simplified-video-container');
                }
                
                if (containerElement) {
                    while (containerElement.firstChild) {
                        containerElement.removeChild(containerElement.firstChild);
                    }
                    containerElement.appendChild(videoElement);
                } else {
                    console.error('Container element not found.');
                }
            } else {
                alert('Failed to load the video.');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    async function fetchVideoSrc(url) {
        const doc = document;
        let videoElement;
        if (url.startsWith('https://www.numerade.com/ask/question/')) {
            videoElement = doc.querySelector('img[src^="https://cdn.numerade.com/ask_previews/"]');
            if (videoElement) {
                let src = videoElement.getAttribute('src');
                src = src.replace('_large', '');
                src = src.substring(0, src.lastIndexOf('.'));
                const webmSrc = src.replace('ask_previews', 'ask_video') + '.webm';
                const mp4Src = src.replace('ask_previews', 'ask_video') + '.mp4';
                return checkVideo(webmSrc, mp4Src);
            } else {
                videoElement = doc.querySelector('video[poster^="https://cdn.numerade.com/project-universal/previews/"]');
                if (videoElement) {
                    let src = videoElement.getAttribute('poster');
                    src = src.replace('_large.jpg', '');
                    const mp4Src = src.replace('previews', 'encoded') + '.mp4';
                    return mp4Src;
                }
            }
        } else {
            videoElement = doc.querySelector('img.background-gif');
            if (videoElement && videoElement.getAttribute('src').endsWith('.gif')) {
                const webmSrc = videoElement.getAttribute('src').replace('previews', 'encoded').replace('.gif', '.webm');
                const mp4Src = videoElement.getAttribute('src').replace('previews', 'encoded').replace('.gif', '.mp4');
                return checkVideo(webmSrc, mp4Src);
            } else {
                videoElement = doc.querySelector('video[poster^="https://cdn.numerade.com/project-universal/previews/"]');
                if (videoElement) {
                    let src = videoElement.getAttribute('poster');
                    src = src.replace('_large.jpg', '');
                    const mp4Src = src.replace('previews', 'encoded') + '.mp4';
                    return mp4Src;
                }
            }
        }
        return null;
    }

    async function checkVideo(webmSrc, mp4Src) {
        const webmResponse = await fetch(webmSrc, { method: 'HEAD' });
        if (webmResponse.ok) {
            return webmSrc;
        } else {
            const mp4Response = await fetch(mp4Src, { method: 'HEAD' });
            if (mp4Response.ok) {
                return mp4Src;
            } else {
                return null;
            }
        }
    }

    processLink();
})();