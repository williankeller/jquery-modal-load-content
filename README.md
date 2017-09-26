## jQuery Modal Load Content  [![Version](https://img.shields.io/badge/Version-1.0.1-orange.svg)](https://github.com/williankeller/jquery-custom-select/blob/master/CONTRIBUTING.md) [![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)
Load any internal or external content into a responsive and dynamic modal.

### Basic usage:
Define the element that contain the link to be loaded:
```html
<a class="call-to-action" href="/page-example.html">Page example</a>
```


You can call the link from any element, not necessary from a href element, just call data-href:
```html
<div class="call-to-action" data-href="/page-example.html">Example page</div>
```


Also, you can define the target to be loaded. So, only the content inside the `.main-container` class will be loaded:
```html
<div class="call-to-action" data-href="/page-example.html" data-target=".main-container">Example page</div>
```


jQuery call:
```js
$('.call-to-action').modalLoadContent();
```

### Options:
You also can define some options, like:
* `debugMode` - Display messages at the console (`false`);
* `overlayClass` - Default modal overlay class (`.modal-load-content-overlay`);
* `containerClass` - Default modal class container (`.modal-load-content-container`);
* `closeButtonClass` - Default close modal class (`.modal-load-content-close`);
* `closeButtonIcon` - Icon to close modal (`[Close]`);
* `closeButtonText` - Text to close on hover (`Close modal`);
* `errorClass` - Default error class (`.modal-load-content-error`);
* `errorText` - Default error text message (`The requested page could not be loaded.`);

#### Options usage:
```js
$('.call-to-action').modalLoadContent({
  debugMode: true,
  closeButtonIcon: 'x',
  closeButtonText: 'Click to close';
});
```

