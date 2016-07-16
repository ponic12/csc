(function(window, angular) {
  'use strict';
  /*global moment*/
  /*global io*/
  angular
    .module('fwk', [])
    .directive('scrollToLast', scrollToLast)
    .directive('dateTimeLabel', dateTimeLabel)
    .directive('limitLengthTo', limitLengthTo)
    .directive('ngEnter', ngEnter)
    .directive('ngNumbers', ngNumbers)
    .directive('noTouchScroll', noTouchScroll)
    .directive('multiItems', multiItems)
    .directive('onlyLetters', onlyLetters)
    .directive('ngHold', ngHold)
    .directive('kcdRecompile', kcdRecompile)
    .directive('convertTfSn', convertTfSn)
    .factory("Helper", Helper)
    .factory('sio', sio);


  function dateTimeLabel() {
    return {
      restrict: 'E',
      replace: 'true',
      template: function() {
        return '<span></span>';
      },
      compile: function() {
        return {
          post: function(scope, element, attrs) {
            var dateVal = scope.$eval(attrs.value);
            if (dateVal != null) {
              var val = dateVal.toString().replace(/[^0-9]/g, '');
              var input = parseInt(val);
              if (!attrs.format) attrs.format = "DD/MM/YY HH:mm";
              var d = new Date(input);
              var formattedDateTime = moment(d).format(attrs.format);
              element.append(formattedDateTime);
            }
          }
        }
      }
    };
  };

  function limitLengthTo() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var checkLimit = function(event, attributes) {
          if ((attributes.limitLengthTo != undefined) &&
            (event != undefined) &&
            (event.srcElement != undefined) &&
            (event.srcElement.value != undefined) &&
            (event.srcElement.value.length <= attributes.limitLengthTo) &&
            (event.srcElement.value != "")) { // caracteres validos menores que limite
            attributes.lastValidValue = event.srcElement.value;
          }
          else {
            if (attributes.lastValidValue == undefined) {
              return;
            }
            else if (attributes.lastValidValue.length == 1) {
              attributes.lastValidValue = "";
            }

            var lastValidValue = attributes.lastValidValue;

            //Si es texto
            if (isNaN(event.srcElement.valueAsNumber)) {
              var controller = attributes.ngModel;
              var value = lastValidValue;
              var expression = controller + "=" + "'" + value + "'";
              if (attributes.ngModel && lastValidValue != "")
                scope.$eval(expression);
              event.srcElement.value = lastValidValue;
            }

            if (!isNaN(event.srcElement.valueAsNumber)) {
              var controller = attributes.ngModel;
              var value = lastValidValue;
              var expression = controller + "=" + value;
              if (attributes.ngModel && lastValidValue != "")
                scope.$eval(expression);
              event.srcElement.value = lastValidValue;
            }
          }
        };

        //element[0].addEventListener('keyup', function (e) {
        //    attrs.charNum = e.keyCode;
        //}, true);
        element[0].addEventListener('input', function(e) {
          checkLimit(e, attrs);
        });
        element[0].addEventListener('paste', function(e) {
          checkLimit(e, attrs);
        });
      }
    };
  };

  function Helper() {
    var obj = {
      getDateAndTime: function() {
        var d = new Date();
        var mes = d.getMonth() + 1;
        var fechaCierre = d.getDate() + "/" + mes + "/" + d.getFullYear();
        var horaCierre = d.toLocaleTimeString('en-Us');
        var fechaModificacion = fechaCierre + " " + horaCierre;
        return fechaModificacion;
      },
      formatDate: function() {
        var d = new Date();
        var fecha = "/Date(" + d.getTime() + ")/";
        return fecha;
      },
      parameterByName: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      },
      stringLimitTo: function(cadena, cant) {
        return cadena.substr(0, cant - 1);
      }
    }
    return obj;
  };

  function ngEnter() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });
          event.preventDefault();
        }
      });
    };
  };

  function ngNumbers() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function(inputValue) {
          if (inputValue == undefined) return ''
          var transformedInput = inputValue.replace(/[^0-9]/g, '');
          if (transformedInput != inputValue) {
            modelCtrl.$setViewValue(transformedInput);
            modelCtrl.$render();
          }

          return transformedInput;
        });
      }
    };
  };

  function noTouchScroll() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element[0].addEventListener('touchstart', function(e) {
          e.preventDefault();
        });
      }
    };
  };

  function multiItems() {
    return {
      restrict: 'A',
      scope: {
        data: '=',
        addItem: '&',
        delItems: '&',
        selItem: '&'
      },
      templateUrl: ""
    }
  };

  function onlyLetters() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        this.checkInput = function(event, attributes) {
          if (event && event.srcElement && event.srcElement.value) {
            if (/^[a-zA-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DD\u00D1\u00E1\u00E9\u00ED\u00F3\u00C1\u00FA\u00FD\u00F1\u00C4\u00CB\u00CF\u00D6\u00DC\u00E4\u00EB\u00EF\u00F6\u00FC\u00FF¨\.\'\s]+$/.test(event.srcElement.value) == false)
              event.srcElement.value =
              (attributes.lastValidValue && attributes.lastValidValue != null) ? attributes.lastValidValue : '';
            else
              attributes.lastValidValue = event.srcElement.value;
          }
        };
        element[0].addEventListener('input', function(e) {
          checkInput(e, attrs);
        });
        element[0].addEventListener('paste', function(e) {
          checkInput(e, attrs);
        });
      }
    };
  };

  scrollToLast.$inject = ['$location', '$anchorScroll'];
  function scrollToLast($location, $anchorScroll) {
    function linkFn(scope, element, attrs) {
      $location.hash(attrs.scrollToLast);
      $anchorScroll();
    }
    return {
      restrict: 'AE',
      scope: {},
      link: linkFn
    };
  };
  kcdRecompile.$inject = ['$parse'];
  function kcdRecompile($parse) {
    'use strict';
    return {
      transclude: true,
      link: function link(scope, $el, attrs, ctrls, transclude) {
        var previousElements;

        compile();

        function compile() {
          transclude(scope, function(clone, clonedScope) {
            // transclude creates a clone containing all children elements;
            // as we assign the current scope as first parameter, the clonedScope is the same
            previousElements = clone;
            $el.append(clone);
          });
        }

        function recompile() {
          if (previousElements) {
            previousElements.remove();
            previousElements = null;
            $el.empty();
          }

          compile();
        }

        scope.$watch(attrs.kcdRecompile, function(_new, _old) {
          var useBoolean = attrs.hasOwnProperty('useBoolean');
          if ((useBoolean && (!_new || _new === 'false')) || (!useBoolean && (!_new || _new === _old))) {
            return;
          }
          // reset kcdRecompile to false if we're using a boolean
          if (useBoolean) {
            $parse(attrs.kcdRecompile).assign(scope, false);
          }

          recompile();
        });
      }
    };
  };
  ngHold.$inject = ['$timeout', '$parse'];
  function ngHold($timeout, $parse) {
    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        var fn = $parse(attrs.ngHold),
          isHolding, timeoutId

        el.on('mousedown', function($event) {
          isHolding = true;
          timeoutId = $timeout(function() {
            if (isHolding) {
              fn(scope, {
                $event: $event
              });
            }
          }, 1500);
        });

        el.on('mouseup', function() {
          isHolding = false;

          if (timeoutId) {
            $timeout.cancel(timeoutId);
            timeoutId = null;
          }
        });
      }
    }
  };
  convertTfSn.$inject = ['converterSrv'];
  function convertTfSn(converterSrv) {
    return {
      restrict: 'A',
      replace: 'true',
      template: function() {
        return '<span></span>';
      },
      compile: function() {
        return {
          post: function(scope, element, attrs) {
            var input = scope.$eval(attrs.convertTfSn);
            var output = converterSrv.convertTFSN(input);
            element.append(output);
          }
        }
      }
    };
  };
  sio.$inject = ['$rootScope'];
  function sio($rootScope) {
    var socket = io.connect();
    return {
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if (callback)
              callback.apply(socket, args);
          });
        })
      }
    }
  };
}(window, window.angular));