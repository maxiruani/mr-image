
app.directive('mrImageSelector', function(){

    function offset(element) {
        var documentElem;
        var box = { top: 0, left: 0 };
        var doc = element && element[0].ownerDocument;

        documentElem = doc.documentElement;

        if ( typeof element[0].getBoundingClientRect !== undefined ) {
            box = element[0].getBoundingClientRect();
        }

        return {
            top: box.top + (window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
            left: box.left + (window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0)
        };
    }

    return {
        restrict: 'A',
        scope: {
            selector: '=?mrModel',
            src: '=?mrSrc',
            aspectRatio: '=?mrAspectRatio'
        },
        link: function(scope, element) {

            scope.selector = scope.selector || {};

            var selector = scope.selector;
            var aspectRatio = scope.aspectRatio;

            scope.$watch('aspectRatio', function (value) {
                aspectRatio = value;
            });

            var $document = angular.element(document);

            //
            // Initialize
            //

            var $rect = angular.element('<div class="mr-box">' +
            '<div class="mr-line top"></div>'    +
            '<div class="mr-line bottom"></div>' +
            '<div class="mr-line left"></div>'   +
            '<div class="mr-line right"></div>'  +
            '</div>');

            var $lines = angular.element('<div class="mr-drag-line n"></div>' +
            '<div class="mr-drag-line s"></div>' +
            '<div class="mr-drag-line w"></div>' +
            '<div class="mr-drag-line e"></div>');

            var $handles = angular.element('<div class="mr-drag-handle nw"></div>' +
            '<div class="mr-drag-handle n"></div>'  +
            '<div class="mr-drag-handle ne"></div>' +
            '<div class="mr-drag-handle w"></div>'  +
            '<div class="mr-drag-handle e"></div>'  +
            '<div class="mr-drag-handle sw"></div>' +
            '<div class="mr-drag-handle s"></div>'  +
            '<div class="mr-drag-handle se"></div>');

            $rect.append($lines).append($handles);

            element.append($rect);

            //
            // Shadow
            //

            var $shadow = angular.element('<div class="mr-shadow">');

            var $shadowLeft         = angular.element('<div class="mr-shadow left">');
            var $shadowCenterTop    = angular.element('<div class="mr-shadow center top">');
            var $shadowCenterBottom = angular.element('<div class="mr-shadow center bottom">');
            var $shadowRight        = angular.element('<div class="mr-shadow right">');

            $shadow.append($shadowLeft).append($shadowCenterTop).append($shadowCenterBottom).append($shadowRight);
            element.append($shadow);

            function updateShadow(position, width, height) {
                $shadow.css('display', 'block');

                $shadowLeft.css('right', width - position.left  + 'px');
                $shadowRight.css('left', width - position.right + 'px');

                $shadowCenterTop.css('left',   position.left  + 'px');
                $shadowCenterTop.css('right',  position.right + 'px');
                $shadowCenterTop.css('bottom', height - position.top + 'px');

                $shadowCenterBottom.css('left',  position.left  + 'px');
                $shadowCenterBottom.css('right', position.right + 'px');
                $shadowCenterBottom.css('top',   height - position.bottom + 'px');
            }

            //
            // User select
            //

            function enableUserSelect() {
                $document[0].documentElement.className = $document[0].documentElement.className.replace(' mr-user-select', '');
            }

            function disableUserSelect() {
                $document[0].documentElement.className += ' mr-user-select';
            }

            //
            // Drawing
            //

            var click = false, centerX, centerY;

            element.bind('mousedown', onDrawingDown);

            function bindDrawing() {
                $document.bind('mousemove', onDrawingMove);
                $document.bind('mouseup', onDrawingUp);
            }

            function unbindDrawing() {
                $document.unbind('mousemove', onDrawingMove);
                $document.unbind('mouseup', onDrawingUp);
            }

            function onDrawingDown(event) {
                disableUserSelect();
                // pageX and pageY are absolutes (relative to document), transform to relative to parent
                var position = offset(element); // offset() absolutes coordinates relative to document
                centerX = event.pageX - position.left;
                centerY = event.pageY - position.top;
                click = true;
                bindDrawing();
            }

            function onDrawingMove(event) {
                click = false;
                var position = offset(element);
                var currentX = event.pageX - position.left;
                var currentY = event.pageY - position.top;
                scope.$apply(function () {
                    update(centerX, centerY, currentX, currentY);
                });
            }

            function onDrawingUp(event) {
                enableUserSelect();
                if (click) {
                    scope.$apply(clear);
                }
                unbindDrawing();
            }

            function update(x1, y1, x2, y2, apply) {
                var height = element.css('height').replace('px', '');
                var width  = element.css('width').replace('px', '');

                // Cap values to bounds
                x2 = x2 < 0 ? 0 : x2;
                x2 = x2 > width ? width : x2;
                y2 = y2 < 0 ? 0 : y2;
                y2 = y2 > height ? height : y2;

                var position = {
                    top: y1 < y2 ? y1 : y2,
                    bottom: y2 > y1 ? height - y2 : height - y1,
                    left: x1 < x2 ? x1 : x2,
                    right: x2 > x1 ? width - x2 : width - x1
                };

                updateRect(position, width, height);
            }

            //
            // Resize and moving variables
            //

            var startX, startY, rectPosition, type;

            //
            // Resize
            //

            $lines.bind('mousedown', onResizeDown);
            $handles.bind('mousedown', onResizeDown);

            function bindResize() {
                $document.bind('mousemove', onResizeMove);
                $document.bind('mouseup', onResizeUp);
            }

            function unbindResize() {
                $document.unbind('mousemove', onResizeMove);
                $document.unbind('mouseup', onResizeUp);
            }

            function onResizeDown(event) {
                event.stopPropagation();
                disableUserSelect();
                type = angular.element(event.target).attr('class').replace('mr-drag-handle', '').replace('mr-drag-line', '').trim();
                startX = event.pageX;
                startY = event.pageY;

                rectPosition = {
                    top:    parseInt($rect.css('top')),
                    bottom: parseInt($rect.css('bottom')),
                    left:   parseInt($rect.css('left')),
                    right:  parseInt($rect.css('right'))
                };

                bindResize();
            }

            function onResizeMove(event) {
                var height = element.css('height').replace('px', '');
                var width  = element.css('width').replace('px', '');

                // The difference (delta) is the same to all coordinates, relatives and absolutes
                var diffX = event.pageX - startX;
                var diffY = event.pageY - startY;

                var position = {
                    top:    rectPosition.top,
                    bottom: rectPosition.bottom,
                    left:   rectPosition.left,
                    right:  rectPosition.right
                };

                // nw n ne
                // w    e
                // sw s se

                if (type[0] == 'n') {
                    position.top += diffY;
                }
                else if (type[0] == 's') {
                    position.bottom -= diffY;
                }
                if (type[0] == 'w' || type[1] == 'w') {
                    position.left += diffX;
                }
                else if (type[0] == 'e' || type[1] == 'e') {
                    position.right -= diffX;
                }

                var aux;

                if (position.top >= height - position.bottom || position.bottom >= height - position.top) {
                    aux = position.top;
                    position.top = height - position.bottom;
                    position.bottom = height - aux;
                }

                if (position.left >= width - position.right || position.right >= width - position.left) {
                    aux = position.left;
                    position.left = width - position.right;
                    position.right = width - aux;
                }

                position.top    = position.top    < 0 ?  0 : position.top;
                position.bottom = position.bottom < 0 ?  0 : position.bottom;
                position.left   = position.left   < 0 ?  0 : position.left;
                position.right  = position.right  < 0 ?  0 : position.right;

                if (aspectRatio) {
                    if (type == 'n') {
                        position.left = width - (position.right + (height - position.top - position.bottom) * aspectRatio);
                    }
                    if (type == 's') {
                        position.right = width - (position.left + (height - position.top - position.bottom) * aspectRatio);
                    }
                    if (type == 'w' || type == 'nw' || type == 'ne') {
                        position.top = height - (position.bottom + (width - position.left - position.right) / aspectRatio);

                        if (position.top < 0) {
                            position.top = 0;

                            if (type[0] == 'w' || type[1] == 'w') {
                                position.left = width - (position.right + (height - position.top - position.bottom) * aspectRatio);
                            }
                            else {
                                position.right = width - (position.left + (height - position.top - position.bottom) * aspectRatio);
                            }
                        }
                    }
                    if (type == 'e' || type == 'se' || type == 'sw') {
                        position.bottom = height - (position.top + (width - position.left - position.right) / aspectRatio);

                        if (position.bottom < 0) {
                            position.bottom = 0;

                            if (type[0] == 'e' || type[1] == 'e') {
                                position.right = width - (position.left + (height - position.top - position.bottom) * aspectRatio);
                            }
                            else {
                                position.left = width - (position.right + (height - position.top - position.bottom) * aspectRatio);
                            }
                        }
                    }
                }

                scope.$apply(function () {
                    updateRect(position, width, height);
                });
            }

            function onResizeUp(event) {
                enableUserSelect();
                unbindResize();
            }

            //
            // Moving
            //

            $rect.bind('mousedown', onMovingDown);

            function bindMoving() {
                $document.bind('mousemove', onMovingMove);
                $document.bind('mouseup', onMovingUp);
            }

            function unbindMoving() {
                $document.unbind('mousemove', onMovingMove);
                $document.unbind('mouseup', onMovingUp);
            }

            function onMovingDown(event) {
                event.stopPropagation();
                disableUserSelect();
                startX = event.pageX;
                startY = event.pageY;

                rectPosition = {
                    top:    parseInt($rect.css('top')),
                    bottom: parseInt($rect.css('bottom')),
                    left:   parseInt($rect.css('left')),
                    right:  parseInt($rect.css('right'))
                };

                bindMoving();
            }

            function onMovingMove(event) {
                var height = element.css('height').replace('px', '');
                var width  = element.css('width').replace('px', '');

                // The difference (delta) is the same to all coordinates, relatives and absolutes
                var diffX = event.pageX - startX;
                var diffY = event.pageY - startY;

                // Position is relative to parent
                var position = {
                    top:    rectPosition.top    + diffY,
                    bottom: rectPosition.bottom - diffY,
                    left:   rectPosition.left   + diffX,
                    right:  rectPosition.right  - diffX
                };

                if (position.top < 0) {
                    position.bottom = position.bottom + position.top;
                    position.top = 0;
                }

                if (position.bottom < 0) {
                    position.top = position.bottom + position.top;
                    position.bottom = 0;
                }

                if (position.left < 0) {
                    position.right = position.right + position.left;
                    position.left = 0;
                }

                if (position.right < 0) {
                    position.left = position.left + position.right;
                    position.right = 0;
                }

                scope.$apply(function () {
                    updateRect(position, width, height);
                });
            }

            function onMovingUp(event) {
                enableUserSelect();
                unbindMoving();
            }

            function updateRect(position, width, height, apply) {
                if (!position) {
                    return;
                }

                if (aspectRatio) {
                    if (centerX > position.left) {
                        position.left = width - (position.right + (height - position.top - position.bottom) * aspectRatio);
                    }
                    else {
                        position.right = width - (position.left + (height - position.top - position.bottom) * aspectRatio);
                    }

                    if (position.top < 0) {
                        position.top = 0;

                        position.left = width - (position.right + (height - position.top - position.bottom) * aspectRatio);
                    }
                    if (position.bottom < 0) {
                        position.bottom = 0;

                        position.right = width - (position.left + (height - position.top - position.bottom) * aspectRatio);
                    }
                    if (position.left < 0) {
                        position.left = 0;

                        position.top = height - (position.bottom + (width - position.left - position.right) / aspectRatio);
                    }
                    if (position.right < 0) {
                        position.right = 0;

                        position.bottom = height - (position.top + (width - position.left - position.right) / aspectRatio);
                    }
                }

                updateShadow(position, width, height);

                $rect.css('display', 'block');

                $rect.css({
                    top:    position.top    + 'px',
                    bottom: position.bottom + 'px',
                    left:   position.left   + 'px',
                    right:  position.right  + 'px'
                });

                selectorWatch();

                selector.x1 = position.left;
                selector.y1 = position.top;
                selector.x2 = width - position.right;
                selector.y2 = height - position.bottom;

                selectorWatch = scope.$watch('selector', updateSelector, true);
            }

            //
            // Selector
            //

            var binded = true;

            function bind() {
                if (binded) {
                    return;
                }
                element.bind('mousedown', onDrawingDown);
                $lines.bind('mousedown', onResizeDown);
                $handles.bind('mousedown', onResizeDown);
                $rect.bind('mousedown', onMovingDown);
                binded = true;
            }

            function unbind() {
                if (!binded) {
                    return;
                }
                element.unbind('mousedown', onDrawingDown);
                $lines.unbind('mousedown', onResizeDown);
                $handles.unbind('mousedown', onResizeDown);
                $rect.unbind('mousedown', onMovingDown);
                binded = false;
            }

            selector.clear = clear;
            selector.enabled = typeof selector.enabled !== 'boolean' ? true : selector.enabled;

            var selectorWatch = scope.$watch('selector', updateSelector, true);

            function clear() {
                selector.x1 = selector.x2 = selector.y1 = selector.y2 = undefined;
                $rect.css('display', 'none');
                $shadow.css('display', 'none');
            }

            function isPositionUndefined() {
                return angular.isUndefined(selector.x1) && angular.isUndefined(selector.x2)
                    && angular.isUndefined(selector.y1) && angular.isUndefined(selector.y2);
            }

            function isPositionFinite() {
                return isFinite(selector.x1) && isFinite(selector.x2) && isFinite(selector.y1) && isFinite(selector.y2);
            }

            function updateSelector(selector, old) {
                // To avoid when watch is created
                updateSelectorEnabled(selector.enabled);
                if (angular.equals(selector, old) || selector.enabled != old.enabled) {
                    return;
                }
                if (isPositionUndefined()) {
                    return;
                }
                if (!isPositionFinite()) {
                    console.error('[ERROR]: Selector position value (x1, x2, y1, y2) is not a valid number.');
                    return;
                }
                update(selector.x1, selector.y1, selector.x2, selector.y2);
            }

            function updateSelectorEnabled(enabled) {
                selector.enabled = typeof enabled !== 'boolean' ? true : enabled;

                if (selector.enabled && isPositionFinite()){
                    bind();
                    element.css('z-index', 300);
                    $rect.css('display', 'block');
                    $shadow.css('display', 'block');
                }
                else if (selector.enabled) {
                    bind();
                    element.css('z-index', 300);
                    clear();
                }
                else {
                    unbind();
                    element.css('z-index', 100);
                    $rect.css('display', 'none');
                    $shadow.css('display', 'none');
                }
            }

            //
            // Crop
            //

            selector.crop = crop;

            function crop() {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var scale = 1 / scope.$parent.scale;
                var width = (selector.x2 - selector.x1) * scale;
                var height = (selector.y2 - selector.y1) * scale;
                canvas.width = width;
                canvas.height = height;
                context.drawImage(scope.$parent.image, selector.x1 * scale, selector.y1 * scale, width, height, 0, 0, width, height);
                return canvas.toDataURL('image/png');
            }
        }
    };
});