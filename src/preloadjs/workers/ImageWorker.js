/**
 * @module PreloadJS
 */

// namespace:
this.createjs = this.createjs||{};

(function () {
    "use strict";

    function createWorker(f) {
        return new Worker(URL.createObjectURL(new Blob([`(${f})()`])));
    }

    const worker = createWorker(() => {
        self.addEventListener("message", e => {
            const src = e.data;
            fetch(src)
                .then(response => response.blob())
                .then(blob => createImageBitmap(blob))
                .then(bitmap => {
                    self.postMessage({ src, bitmap }, [bitmap])
                    bitmap.close();
                })
        })
    });

    createjs.ImageWorker = function () {
        this.loadImageWithWorker = (src) => {
            return new Promise((resolve, reject) => {
                function handler(e) {
                    if (e.data.src == src) {
                        worker.removeEventListener("message", handler);
                        if (e.data.error) {
                            reject(e.data.error);
                        }

                        resolve(e.data.bitmap);
                    }
                }

                worker.addEventListener("message", handler);
                worker.postMessage(src);
            });
        }
    }
})();