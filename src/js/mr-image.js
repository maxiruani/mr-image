
var app = angular.module('mrImage', []);

app.directive('mrImage', function() {
    return {
        restrict: 'A',
        scope: {
            src: '=mrSrc',
            maxWidth: '=?mrMaxWidth',
            aspectRatio: '=?mrAspectRatio',
            scale: '=?mrScale',
            drawer: '=?mrDrawer',
            selector: '=?mrSelector'
        },
        template:
            '<div mr-image-selector mr-model="selector" mr-aspect-ratio="aspectRatio" style="height: {{scaleValue(height, scale) + \'px\'}}; width: {{scaleValue(width, scale) + \'px\'}}"></div>' +
            '<div mr-image-drawer mr-model="drawer" style="height: {{scaleValue(height, scale) + \'px\'}}; width: {{scaleValue(width, scale) + \'px\'}}"></div>' +
            '<img ng-src="{{src}}" width="{{scaleValue(width, scale)}}" height="{{scaleValue(height, scale)}}">',

        link: function (scope, element) {

            element.addClass('mr-image');

            function setImageSize(src) {
                scope.image = new Image();
                scope.image.onload = function () {
                    scope.$apply(function () {
                        scope.height = scope.height || scope.image.height;
                        scope.width = scope.width || scope.image.width;

                        if (angular.isUndefined(scope.scale) && angular.isDefined(scope.maxWidth)) {
                            scope.scale = scope.maxWidth >= scope.width ? 1 : scope.maxWidth / scope.width;
                        }
                        else {
                            scope.scale = scope.scale || 1;
                        }

                        element.css('width', scope.scaleValue(scope.width, scope.scale) + 'px');
                        element.css('height', scope.scaleValue(scope.height, scope.scale) + 'px');
                    });
                };
                scope.image.src = src;
            }

            setImageSize(scope.src);

            scope.scaleValue = function (value, scale) {
                return Math.floor(value * scale);
            };
        }
    };
});