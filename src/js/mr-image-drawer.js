// public-admin/scripts/directives/nwRects.js

app.directive('mrImageDrawer', function(){
    return {
        restrict: 'A',
        scope: {
            rects: '=mrModel'
        },
        template: '<div ng-repeat="rect in rects" ng-style="getRectStyle($index, rect)" ng-mouseenter="setPercent($index, 0.1)" ng-mouseout="setPercent($index, 0.3)"></div>',
        link: function(scope, element) {
			scope.percentages = [];
			
			scope.getRectStyle = function (index, rect){
				return {
					position: 'absolute',
					cursor: 'pointer',
					top: rect.y1 + 'px', left: rect.x1+ 'px', width: (rect.x2 - rect.x1) + 'px', height: (rect.y2 - rect.y1) + 'px',
					border: (rect.stroke || 3) + ' solid ' + (rect.color || '#F00'), 
					backgroundColor: scope.increaseBrightness(rect.color || '#F00', scope.percentages[index])
				}
			}
			
			scope.setPercent = function (index, value){
				if(!scope.percentages)
					return;
				
				scope.percentages[index] = value;
			}
			
			scope.$watch('rects', function(newVal, oldVal){
				scope.percentages = [];
				if(!newVal)
					return;
				
				for(var i = 0; i < newVal.length; i++){
					scope.percentages[i] = 0.3; 
				}
			}, true);
			
            scope.increaseBrightness = function (hex, percent) {
                // Strip the leading # if it's there
                hex = hex.replace(/^\s*#|\s*$/g, '');

                // Convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
                if(hex.length == 3){
                    hex = hex.replace(/(.)/g, '$1$1');
                }

                var r = parseInt(hex.substr(0, 2), 16),
                    g = parseInt(hex.substr(2, 2), 16),
                    b = parseInt(hex.substr(4, 2), 16);

                return 'rgba(' + r + ',' + g + ',' + b + ',' + percent + ')';
            };

        }
    };
});
