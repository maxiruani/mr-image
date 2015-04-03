# MR-IMAGE

Simple image select, crop and draw Angular.js directive.

### Features:

 * Lightweight. Just 7.68 Kb .js + 2.79 Kb .css = `10.47 Kb` minified.
 * Native. No need of jQuery.
 * Customizable style.
 * Make image selection and get coordinates.
 * Crop images.
 * Draw squares on image.

# Screenshots:

![Selector](https://raw.github.com/maxiruani/mr-image/master/misc/screenshots/1.png "Selector")

![Drawer](https://raw.github.com/maxiruani/mr-image/master/misc/screenshots/2.png "Drawer")

# Installation

Installation is easy, MR-IMAGE has minimal dependencies - only AngularJS is required.

### Install with Bower
```sh
$ bower install mr-image
```

# Demo

Do you want to see the directive in action? Visit http://maxiruani.github.io/mr-image/

### Adding dependency to your project

When you are done downloading all the dependencies and project files the only remaining part is to add dependencies on the `mrImage` AngularJS module:

```js
angular.module('myModule', ['mrImage']);
```

# Example

```html
<div mr-image mr-src="image.src" mr-max-width="image.maxWidth"
     mr-selector="selector" mr-drawer="drawer"></div>

<img ng-src="{{cropResult}}">
```

```js
var app = angular.module('DemoApp', ['mrImage']);

    app.controller('DemoCtrl', ['$scope', function ($scope) {

        $scope.image = {
            src: 'assets/times.jpg',
            maxWidth: 938
        };

        $scope.selector = {};

        $scope.drawer = [
            { x1: 625, y1: 154, x2: 777, y2: 906, color: '#337ab7', stroke: 1 },
            { x1: 778, y1: 154, x2: 924, y2: 906, color: '#3c763d', stroke: 1 },
            { x1: 172, y1: 566, x2: 624, y2: 801, color: '#a94442', stroke: 1 }
        ];

        $scope.addRect = function () {
            $scope.drawer.push({
                x1: $scope.selector.x1,
                y1: $scope.selector.y1,
                x2: $scope.selector.x2,
                y2: $scope.selector.y2,
                color: '#337ab7',
                stroke: 1
            });
            $scope.selector.clear();
        };

        $scope.cropRect = function () {
            $scope.cropResult = $scope.selector.crop();
        };

    });
```

# Directive

### mr-src
Image source. URL.

### mr-max-width
Optional. Max width of image. The image will scale to adjust.

### mr-selector

Selector       | Object
-------------- | -------------
**Properties** |
x1             | Coordinate x1
y1             | Coordinate y1
x2             | Coordinate x2
y2             | Coordinate y2
enabled        | Default: `true`
**Methods**    |
.clear()       | Clear the selection
.crop()        | Crop the selection, returns image as data url


### mr-drawer

Drawer         | Array
-------------  | ---------
**Array Item** | **Object**
x1             | Coordinate x1
y1             | Coordinate y1
x2             | Coordinate x2
y2             | Coordinate y2
color          | Color of border and background. Example: `#333`
stroke         | Border stroke. Number. Example: `1`

# License

See the [LICENSE](https://github.com/maxiruani/mr-image/blob/master/LICENSE) file.

#### Author: [Maximiliano Ruani](http://github.com/maxiruani)