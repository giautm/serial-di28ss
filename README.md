Serial DI-28SS
================

Ứng dụng đọc kết quả từ đầu cân DI-28SS.
Cho phép các trang web truy cập được kết quả từ đầu cân DI-28SS thông qua ứng dụng này.

Cài đặt
------------

Tìm ứng dụng Serial DI-28SS trên [Chrome Web Store]()
và nhấp vào “Add to Browser... (Thêm vào trình duyệt...)”.

Sử dụng
-----
Trang web đọc kết quả cần nhúng đoạn javascript sau:
```javascript
function DI28SS() {
}
DI28SS.initialize = function (element, options) {
    if (options && options.extensionId) {
        try {
            var runtime = chrome && chrome.runtime;
            if (runtime) {
                this.port = runtime.connect(options.extensionId, {name: 'di-28ss'});
                this.port.onMessage.addListener(function (msg) {
                    element.dispatchEvent(new CustomEvent('di-28ss-data', {detail: msg}));
                });
            } else {
                console.error('CHROMIUM RUNTIME IS NOT AVAILABLE!');
            }
        } catch (e) {
            if (e.message.indexOf('chrome') > -1) {
                console.error('CHROMIUM RUNTIME IS NOT AVAILABLE!');
            } else {
                console.error(e);
            }
        }
        return this;
    } else {
        throw 'Invalid options';
    }
};
```

Sau đó khởi tạo:
```
document.addEventListener('di-28ss-data', function (event) {
    console.log(event.detail);
}
DI28SS.initialize(document, {extensionId: 'fchemkcehmoabjidaaelannhmghacdee'});
```