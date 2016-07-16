(function (framework, $, undefined) {

    // Inicio de la API pública ============================================
    framework.version = "1.0";
    framework.services;
    framework.storage;
    framework.security;
    framework.location;
    framework.notifications;
    framework.log;
    framework.media;

    framework.initialize = function (options, successCallback, errorCallback) {
        if (options)
            // TODO: Implementar un simil "extend" de jQuery para pisar las _options default;
            _options = options;

        _compatible = checkCompatibility();
        _storageAvailable = checkStorageAvailable();
        _utilityFactory = createUtilityFactory();

        framework.location = new LocationManager(_utilityFactory.createLocationUtility());
        framework.security = new SecurityManager(_utilityFactory.createSecurityUtility());
        framework.services = new ServicesManager(_utilityFactory.createServicesUtility());
        framework.media = new MediaManager(_utilityFactory.createMediaUtility());
        framework.notifications = new NotificationManager();
        framework.log = new LogManager();
        framework.storage = new StorageManager(_utilityFactory.createStorageUtility(
            function () {
                _initialized = true;
                if (_inContainer) {
                    activityFacade.frameworkInitialized();
                }
                framework.log.init(function () {
                    if (successCallback)
                        successCallback();
                });
            }, errorCallback));
    }

    framework.getNetworkStatus = function () {
        var x = {};
        if (framework.isInContainer() === false)
            x = window.navigator.onLine;
        else
            x = activityFacade.isSegatServerReachable();

        return x;
    }
    framework.isInitialized = function () {
        return _initialized;
    }
    framework.isInContainer = function () {
        return _inContainer;
    }
    framework.isCompatible = function () {
        return _compatible;
    }
    framework.isStorageAvailable = function () {
        return _storageAvailable;
    };
    framework.loadData = function (path, params, key, obj, prop, cbSuccess, cbError) {
        return new Promise(function (resolve, reject) {
            try {
                framework.storage.getFull(key,
                   function (res) {
                       if (res.value) {
                           obj[prop] = res.value;
                           if (cbSuccess)
                               cbSuccess();
                           resolve(true);
                       }
                       else {
                           framework.services.request(path, params,
                               function (data) {
                                   if (data) {
                                       var serviceName = framework.services.getServiceName(path);
                                       var value = data[serviceName + 'Result'];
                                       obj[prop] = value;
                                       framework.storage.set(key, obj[prop]);
                                   }
                                   if (cbSuccess)
                                       cbSuccess();
                                   resolve(true);
                               },
                               function (err) {
                                   console.log(err);
                                   if (cbError)
                                       cbError(err);
                                   reject(false);
                               }
                           );
                       }
                   },
                   function (err) {
                       console.log(err);
                       if (cbError)
                           cbError(err);
                       reject(false);
                   }
               );
            }
            catch (err) {
                notifyError('LoadData', 'Error obteniendo valor de la key [' + (!key ? '' : key) + ']: ' + err);
                console.log(err);
                reject(key);
            };
        });
    }
    framework.setStartUrl = function (url) {
        if (framework.isInContainer()) {
            activityFacade.setStartURL(url);
            console.log("Start app at: " + url);
        }
    };
    framework.setPushingServiceUrl = function (url) {
        if (framework.isInContainer()) {
            activityFacade.setPushingServiceUrl(url);
            console.log("Start pushing at: " + url);
        }
    }
    framework.applicationInitialized = function () {
        if (framework.isInContainer()) {
            activityFacade.applicationInitialized();
            console.log("applicationInitialized from mobile")
        }
    }
    framework.processQueue = function () {
        if (framework.isInContainer()) {
            activityFacade.processQueue();
            console.log("Processing Queue");
        }
    }
    framework.getOperationCallbacks = function () {
        return _operationCallbacks;
    }
    framework.registerOperationCallbacks = function (requestID, successCB, errorCB) {
        _operationCallbacks.push({
            "requestID": requestID,
            "added": new Date(),
            "successCallback": successCB,
            "errorCallback": errorCB
        });
    }
    framework.receiveOperationResult = function (requestID, success, value) {
        var indexToRemove = -1;

        for (var index = 0; index < _operationCallbacks.length; index++) {
            var entry = _operationCallbacks[index];
            if (entry.requestID == requestID) {
                indexToRemove = index;
                if (success) {
                    if (entry.successCallback) {
                        entry.successCallback(value);
                    }
                } else {
                    if (entry.errorCallback)
                        entry.errorCallback(value);
                }
                break;
            }
        }

        if (indexToRemove >= 0)
            _operationCallbacks.splice(indexToRemove, 1);
    }

    // Fin de la API pública ===============================================


    // Inicio private ============================================
    var _initialized = false;
    var _compatible = false;
    var _storageAvailable = false;
    var _username;
    var _inContainer = false;
    var _logEvents = [];
    var _options = {};
    var _utilityFactory;
    var _servicesUtility;
    var _services;
    var _locationUtility;
    var _operationCallbacks = [];

    // Private methods
    function notifyError(type, message, extra) {
        var errorObject = { "type": type, "message": message, "extra": extra };

        if (_options.onError)
            _options.onError(errorObject);

        console.log('Error detectado: ' + JSON.stringify(errorObject));
    }
    function checkCompatibility() {
        // Definición de 'esta librería es compatible con el dispositivo que la consume' = El dispositivo tiene soporte para HTML5.
        // TODO: Checkear capacidades necesarias de HTML5.
        return false;
    }
    function checkInContainer() {
        return "activityFacade" in window;
    }
    function checkStorageAvailable() {
        return _inContainer || ("indexedDB" in window);
    }

    // "Managers"
    function StorageManager(storageUtility) {
        this._storageUtility = storageUtility;

        this.getFull = function (key, successGet, errorGet) {
            this._storageUtility.get(key,
                function (res) {
                    if (successGet) {
                        if (res && res !== "") {
                            var jsonRes = JSON.parse(res);
                            successGet({ "key": key, "value": jsonRes });
                        }
                        else {
                            if (!res) res = null;
                            successGet({ "key": key, "value": res });
                        }
                    }
                },
                function (err) {
                    notifyError('STORAGE Get', 'Error obteniendo valor de la key [' + (!key ? '' : key) + ']: ' + err);
                    if (errorGet)
                        errorGet({ "key": key, "error": err });
                });
        };
        this.get = function (key, obj, prop) {
            var self = this;
            return new Promise(function (resolve, reject) {
                try {
                    self._storageUtility.get(key,
                        function (res) {
                            if (obj) {
                                if (res !== "" && res) {
                                    var resJson = JSON.parse(res);
                                    obj[prop] = resJson;
                                }
                                else {
                                    obj[prop] = "";
                                }
                            }
                            resolve(true);
                        },
                        function (err) {
                            notifyError('STORAGE_UTILITY', 'Error obteniendo valor de la k2ey [' + (!key ? '' : key) + ']: ' + err);
                            console.log(err);
                            reject(key);
                        });
                }
                catch (err) {
                    notifyError('STORAGE_GET', 'Error obteniendo valor de la key [' + (!key ? '' : key) + ']: ' + err);
                    console.log(err);
                    reject(key);
                };
            });
        };
        this.set = function (key, value, errorCallback) {
            try {
                var strValue = JSON.stringify(value);
                this._storageUtility.set(key, strValue);
            }
            catch (err) {
                notifyError('STORAGE', 'Error estableciendo valor de la key [' + (!key ? '' : key) + '] => [' + (!value ? '' : JSON.stringify(value)) + ']: ' + err);
                if (errorCallback)
                    errorCallback({ "key": key, "error": err });
            }
        };
        this.remove = function (key, errorCallback) {
            try {
                this._storageUtility.remove(key);
            }
            catch (err) {
                notifyError('STORAGE', 'Error removiendo valor de la key [' + (!key ? '' : key) + ']: ' + e);
                if (errorCallback)
                    errorCallback({ "key": key, "error": err });
            }
        };
        this.clear = function (errorCallback) {
            try {
                this._storageUtility.clear();
            }
            catch (err) {
                notifyError('STORAGE', 'Error limpiando storage: ' + e);
                if (errorCallback)
                    errorCallback({ "error": e });
            }
        };

        function init() {
            setInterval(function () {
                var callbacks = framework.getOperationCallbacks();
                //console.log('Limpiando entradas vencidas de "_operationCallbacks". Cantidad actual: ' + callbacks.length);

                try {
                    var indexesToRemove = [];
                    for (var index = 0; index < callbacks.length; index++) {
                        var entry = callbacks[index];
                        // Si el request se agregó hace más de 120 segundos y no se consumió, lo remuevo por estar 'timeout-eado'.
                        if ((new Date().getTime() - entry.added.getTime()) >= 120000)
                            indexesToRemove.push(index);
                    }
                    for (var indexToRemove in indexesToRemove)
                        callbacks.splice(indexToRemove, 1);
                } catch (err) {
                    console.log('Error limpiando entradas vencidas de "_operationCallbacks": ' + err);
                }

                //console.log('Entradas vencidas de "_operationCallbacks" removidas. Nueva cantidad actual: ' + callbacks.length);
            }, 20000);
        };

        //////////////////////
        // CODIGO EJECUCION //
        //////////////////////
        init();
    }
    function SecurityManager(securityUtility) {
        this._securityUtility = securityUtility;

        this.setUsername = function (username) {
            this._securityUtility.setUsername(username);
        }
    };
    function ServicesManager(servicesUtility) {
        function reverse(s) {
            return s.split("").reverse().join("");
        };
        this.getServiceName = function (path) {
            var strInv = reverse(path);
            var str = strInv.substring(0, strInv.indexOf('/'));
            var serviceName = reverse(str);
            return serviceName;
        };

        this._servicesUtility = servicesUtility;
        this._services = [];
        this._httpOptions;
        this.setHttpOptions = function (op) {
            this._httpOptions = op;
        }
        this.canSAF = function () {
            return this._servicesUtility.canSAF();
        }
        this.getAllSafInfos = function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                resolve(self._servicesUtility.getAllSafInfos());
            });
        }
        this.clearSent = function () {
            this._servicesUtility.clearSent();
        }
        this.register = function (path) {
            if (!this._httpOptions) {
                notifyError('SERVICES', 'No existe configuracion de headers');
                return false;
            }
            var serviceName = this.getServiceName(path);
            for (var index = 0; index < this._services.length; index++) {
                var service = this._services[index];
                if (service.name == serviceName) {
                    notifyError('SERVICES', 'El servicio "' + serviceName + '" ya se encuentra registrado.');
                    return false;
                }
            }
            var pathName = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
            if (!location.origin) {
                location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');
            }
            var endpoint = location.origin + pathName + path;

            // TODO pasar todos el _httpOptions como array => modificar APK
            var cfg = { "httpMethod": this._httpOptions.httpMethod, "contentType": this._httpOptions.contentType };
            this._services.push({ "name": serviceName, "endpoint": endpoint, "config": cfg });
        }
        this.unregister = function (serviceName) {
            var indexToRemove = -1;
            for (var index = 0; index < this._services.length; index++) {
                var service = this._services[index];
                if (service.name == serviceName) {
                    indexToRemove = index;
                    break;
                }
            }

            if (indexToRemove < 0)
                notifyError('SERVICES', 'El servicio "' + serviceName + '" NO se encuentra registrado.');
            else
                this._services.splice(indexToRemove, 1);
        }
        this.get = function (serviceName) {
            for (var index = 0; index < this._services.length; index++) {
                var service = this._services[index];
                if (service.name == serviceName)
                    return service;
            }
            return null;
        }
        this.call = function (serviceName, params, safInfo) {
            var service = this.get(serviceName);
            if (service == null)
                throw 'El servicio "' + serviceName + '" NO se encuentra registrado.';
            return this._servicesUtility.call(service, params, safInfo);
        }
        this.request = function (path, params, cbSuccess, cbError, action) {
            var httpAction = this._httpOptions.httpMethod;
            if (action)
                httpAction = action;

            var xhr = new XMLHttpRequest();
            xhr.open(httpAction, path);
            xhr.timeout = 60000;
            xhr.setRequestHeader("Content-Type", this._httpOptions.contentType);
            this._httpOptions.headers.forEach(function (curEl) {
                xhr.setRequestHeader(curEl.name, curEl.value);
            });
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4)
                    if (xhr.status === 200) {
                        var res = JSON.parse(xhr.response);
                        cbSuccess(res);
                    } else if (xhr.status >= 400) {

                        if (cbError)
                            cbError({ "message": xhr.responseText, "status": xhr.status }); //, "xx": xhr.statusText 
                    }
            };
            xhr.onerror = function () {
                cbError(xhr.status);
            };
            xhr.ontimeout = function (e) {
                cbError(xhr.status);
            };
            var res = JSON.stringify(params);
            xhr.send(res);
        }
    }
    function LocationManager(locationUtility) {
        this._locationUtility = locationUtility;

        this.requestLocation = function (timeoutMillis, successCallback, errorCallback) {
            this._locationUtility.requestLocation(timeoutMillis, successCallback, errorCallback);
        }
        this.cancelRequestLocation = function () {
            this._locationUtility.cancelRequestLocation();
        }
    }
    function NotificationManager() {
        this._handlers = [];

        this.addOnNotificationHandler = function (handler) {
            if (handler && (typeof handler === 'function')) {
                var index = this._handlers.indexOf(handler);
                if (index < 0)
                    this._handlers.push(handler);
            }
        }
        this.removeOnNotificationHandler = function (handler) {
            if (handler) {
                var index = this._handlers.indexOf(handler);
                if (index >= 0)
                    this._handlers.splice(index, 1);
            }
        }
        this.notify = function (type, data, eventType) {
            var notification = { "type": type, "data": data };
            if (eventType && eventType != null)
                notification.eventType = eventType;

            for (var index = 0; index < this._handlers.length; index++) {
                var handler = this._handlers[index];
                handler(notification);
            }
        }
        this.initNetworkStatus = function () {
            var netStatus = framework.getNetworkStatus();
            framework.notifications.notify('Network.Status', {
                "online": netStatus
            });
            console.log("Init Network Status = " + netStatus);

            if (!_inContainer) {
                window.addEventListener("online", function () {
                    framework.notifications.notify('Network.Status', {
                        "online": true
                    });
                });
                window.addEventListener("offline", function () {
                    framework.notifications.notify('Network.Status', {
                        "online": false
                    });
                });
            }
        }
    }
    function LogManager() {
        var timerON = false;

        this.init = function (cbSuccess) {
            _jsErrors = [];
            framework.storage.getFull('logEvents',
                function (res) {
                    _logEvents = [];
                    if (res.value) _logEvents = res.value;
                    framework.storage.getFull('logErrors',
                        function (res) {
                            _logErrors = [];
                            if (res.value) _logErrors = res.value;
                            if (cbSuccess)
                                cbSuccess();
                        },
                        function (err) {
                            console.log('Initializing logErrors: error key');
                        }
                    );
                },
                function (err) {
                    console.log('Initializing logEvents: error key');
                });
        };
        this.saveEvent = function (msg, method, namespace) {
            if (!_username) return;

            var fecha = "/Date(" + new Date().getTime() + ")/";
            var evt = { 'username': _username, 'datetime': fecha, 'msg': msg, 'method': method, 'module': namespace };
            console.log(msg);

            _logEvents.push(evt);
            framework.storage.set('logEvents', _logEvents);

            if (_logEvents.length >= 5) {
                var path = _options.logConfig.pathEvents;
                var obj = { "logEvents": _logEvents };
                framework.log.saveEventsToServer(obj, path);
                _logEvents = [];
                framework.storage.set('logEvents', _logEvents);
            }
        };
        this.saveError = function (msg, stack) {
            if (!_username) return;

            var fecha = "/Date(" + new Date().getTime() + ")/";
            var err = { 'username': _username, 'datetime': fecha, 'msg': msg, 'stacktrace': stack, 'disp': 1 };

            _logErrors.push(err);
            framework.storage.set('logErrors', _logErrors);

            if (!timerON) {
                timerON = !timerON;
                setTimeout(function () {
                    var path = _options.logConfig.pathErrors;
                    var obj = { "logErrors": _logErrors };
                    framework.log.saveErrorsToServer(obj, path);
                    _logErrors = [];
                    framework.storage.set('logErrors', _logErrors);
                    timerON = false;
                }, 3000);
            }

            _jsErrors.push(err);
            framework.notifications.notify('JsErrors', {
                "totalJsErrors": _jsErrors.length
            });
        };
        this.getJsErrors = function () {
            return _jsErrors;
        };
        this.clearJsErrors = function () {
            _jsErrors = [];
            framework.notifications.notify('JsErrors', {
                "totalJsErrors": _jsErrors.length
            });
        };
        this.saveEventsToServer = function (logItems, serviceName) {
            var safInfo = { "fecha": new Date().getTime(), "ot": "", "oper": "Event" };
            framework.services.call(serviceName, logItems, safInfo);
            logItems = [];
        };
        this.saveErrorsToServer = function (logItems, serviceName) {
            var safInfo = { "fecha": new Date().getTime(), "ot": "", "oper": "Error" };
            framework.services.call(serviceName, logItems, safInfo);
            logItems = [];
            //framework.services.request(path, logItems,
            //    function (data) {
            //        if (data) logItems = [];
            //    },
            //    function (err) {
            //        console.log(err);
            //    }
            //);
        };
    };
    function MediaManager(mediaUtility) {
        this._mediaUtility = mediaUtility;

        // type: image | xxxxx
        // source: gallery | capture
        this.acquire = function (type, source) {
            var self = this;
            return new Promise(function (resolve, reject) {
                try {
                    self._mediaUtility.acquire(type, source,
                        function (res) {
                            if (res && res != null && res != "")
                                resolve(typeof (res) == "object" ? res : JSON.parse(res));
                            else
                                reject('Sin datos');
                        },
                        function (err) {
                            reject(err);
                        });
                } catch (err) {
                    reject(err);
                };
            });
        }
    }

    // "Factories"
    function createUtilityFactory() {
        if (_inContainer)
            return new InContainerUtilityFactory();
        else
            return new BrowserUtilityFactory();
    }
    function InContainerUtilityFactory() {
        this.createStorageUtility = function (successCallback, errorCallback) {
            return new InContainerStorageUtility(successCallback, errorCallback);
        };
        this.createServicesUtility = function () {
            return new InContainerServicesUtility();
        };
        this.createSecurityUtility = function () {
            return new InContainerSecurityUtility();
        };
        this.createLocationUtility = function () {
            // Es posible de utilizar la implementación browser también en el escenario "en contenedora".
            return new BrowserLocationUtility(); // InContainerLocationUtility()
        };
        this.createMediaUtility = function () {
            return new InContainerMediaUtility();
        };
    }
    function BrowserUtilityFactory() {
        this.createStorageUtility = function (successCallback, errorCallback) {
            return new BrowserStorageUtility(successCallback, errorCallback);
        };
        this.createServicesUtility = function () {
            return new BrowserServicesUtility();
        };
        this.createSecurityUtility = function () {
            return new BrowserSecurityUtility();
        };
        this.createLocationUtility = function () {
            return new BrowserLocationUtility();
        };
        this.createMediaUtility = function () {
            return new BrowserMediaUtility();
        };
    }

    // "Clases" para cuando nos manejamos dentro de la contenedora ("InContainer").
    function InContainerStorageUtility(successCallback, errorCallback) {
        init(successCallback, errorCallback);
        function init(successCallback, errorCallback) {
            if (successCallback)
                setTimeout(function () { successCallback(); }, 250);
        }
        this.get = function (key, successGetCB, errorGetCB) {
            var requestID = activityFacade.getUUID();
            framework.registerOperationCallbacks(requestID, successGetCB, errorGetCB);
            activityFacade.getStorageItem(key, requestID);
        };
        this.set = function (key, value) {
            activityFacade.setStorageItem(key, value);
        };
        this.remove = function (key, successCallback, errorCallback) {
            activityFacade.removeStorageItem(key);
        };
        this.clear = function () {
            activityFacade.clearStorage();
        };
    }
    function InContainerServicesUtility() {
        var allSafInfos = [];

        this.canSAF = function () {
            return true;
        };

        this.getAllSafInfos = function () {
            var infos = allSafInfos;
            var safInfoFn = getSAFInfos;
            return new Promise(function (resolve, reject) {
                try {
                    safInfoFn().then(function (sinf) {
                        var pendOps = infos.filter(function (item) {
                            return (item.sent == false);
                        });
                        pendOps.forEach(function (x) {
                            x.sent = true;
                            var exist = sinf.some(function (y) {
                                var res = (x.fecha == y.fecha);
                                return res;
                            });
                            if (exist) x.sent = false;
                        });

                        var sentOps = infos.filter(function (item) {
                            return (item.sent == true);
                        });
                        infos = sentOps;
                        infos = infos.concat(sinf);
                        resolve(infos);
                    }).catch(function (err2) {
                        reject(err2);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        };
        this.clearSent = function () {
            allSafInfos = [];
        };
        this.call = function (service, params, safInfo) {
            var res = JSON.stringify(params);
            return activityFacade.callService(service.endpoint, res, JSON.stringify(service.config), JSON.stringify(safInfo));
        };
        function getSAFInfos() {
            var getPendingOperationsFn = getPendingOperations;
            return new Promise(function (resolve, reject) {
                getPendingOperationsFn()
					.then(function (pendingOperations) {
					    var safInfos = [];
					    if (pendingOperations != null) {
					        pendingOperations.forEach(function (v) {
					            var x = JSON.parse(v.safInfo);
					            if (typeof (v.safInfo) != 'undefined' && v.safInfo !== 'undefined' && x.oper != 'Event' && x.oper != 'Error')
					                safInfos.push(x);
					        });
					    }
					    resolve(safInfos);
					}).catch(function (err) {
					    reject(err);
					});
            });
        };
        function getPendingOperations() {
            return new Promise(function (resolve, reject) {
                try {
                    var requestID = activityFacade.getUUID();
                    framework.registerOperationCallbacks(requestID,
						function (v) {
						    resolve(JSON.parse(v));
						},
						function (e) {
						    reject(e);
						});
                    activityFacade.getPendingOperations(requestID);
                } catch (err) {
                    reject(err);
                }
            });
        };
    }
    function InContainerSecurityUtility() {
        this.setUsername = function (username) {
            _username = username;
            activityFacade.setUsername(username);
        };
        this.getUsername = function () {
            return _username;
        };
    }
    function InContainerLocationUtility() {
        this.requestLocation = function (timeoutMillis, successCallback, errorCallback) {
            errorCallback('TODO: implementar');
        };
        this.cancelRequestLocation = function () {
            console.log('No implementado en contenedora');
        }
    }
    function InContainerMediaUtility() {
        this.acquire = function (type, source, successCB, errorCB) {
            var requestID = activityFacade.getUUID();
            framework.registerOperationCallbacks(requestID, successCB, errorCB);
            activityFacade.acquireMedia(requestID, type, source);
        };
    }

    // "Clases" para cuando nos manejamos directamente en un browser.
    function BrowserStorageUtility(successCallback, errorCallback) {
        var repositoryName = _options.storageConfig.repository;
        var currentStoreName = _options.storageConfig.defaultStore;
        var db = null;

        function init(successCallback, errorCallback) {
            if (framework.isStorageAvailable())
                openOrCreateRepository(successCallback, errorCallback);
            else
                console.log('Sin soporte para storage offline en browser!');
        };
        function openOrCreateRepository(successCallback, errorCallback) {
            try {
                var openRequest = indexedDB.open(repositoryName, 1);
                openRequest.onupgradeneeded = function (e) {
                    console.log(repositoryName + " IndexDB upgradeada.");
                    db = e.target.result;
                    ensureObjectStores();
                }
                openRequest.onsuccess = function (e) {
                    console.log(repositoryName + " IndexDB se encuentra abierta.");
                    db = e.target.result;
                    if (successCallback)
                        successCallback();
                }
                openRequest.onerror = function (e) {
                    console.log("Error abriendo " + repositoryName + " IndexDB.");
                    console.dir(e);
                }
            }
            catch (e) {
                console.log("Error abriendo " + repositoryName + " IndexDB: " + e.message);
            }
        }
        function ensureObjectStores() {
            if (!db.objectStoreNames.contains(currentStoreName))
                db.createObjectStore(currentStoreName);
        }

        this.get = function (key, successGetCB, errorGetCB) {
            var transaction = db.transaction([currentStoreName], 'readonly');
            var store = transaction.objectStore(currentStoreName);
            var getRequest = store.get(key);
            getRequest.onsuccess = function (e) {
                if (successGetCB)
                    successGetCB(e.target.result);
            }
            getRequest.onerror = function (e) {
                if (errorGetCB)
                    errorGetCB(e);
            }
        };
        this.set = function (key, value) {
            var transaction = db.transaction([currentStoreName], 'readwrite');
            var store = transaction.objectStore(currentStoreName);
            var returnedKey = store.put(value, key);
            if (!returnedKey)
                throw 'Falló guardar el valor con clave: ' + key;
        };
        this.remove = function (key) {
            var transaction = db.transaction([currentStoreName], 'readwrite');
            var store = transaction.objectStore(currentStoreName);
            var returned = store.delete(key);
            if (!returned)
                throw 'Falló eliminar el valor con clave: ' + key;
        };
        this.clear = function () {
            throw 'BrowserStorageUtility: método "clear" no implementado!';
        };

        init(successCallback, errorCallback);
    }
    function BrowserServicesUtility() {
        var allSafInfos = [];
        this.canSAF = function () {
            return false;
        };
        this.getAllSafInfos = function () {
            return new Promise(function (resolve, reject) {
                resolve(allSafInfos);
            });
        };
        this.clearSent = function () {
            allSafInfos = [];
        };
        this.call = function (service, params, safInfo) {
            var operationID = getUID();
            allSafInfos.push(safInfo);
            framework.services.request(service.endpoint, params,
                function (data) {
                    safInfo.sent = true;
                    notify(operationID, true, data);
                },
                function (err) { notify(operationID, false, err); });
            return operationID;
        };

        function notify(id, flag, data) {
            framework.notifications.notify('OPS.OperationDone', {
                "operationID": id, "success": flag,
                "result": data
            });
        };
        function getUID() {
            return new Date().getTime();
        }
    }
    function BrowserSecurityUtility() {
        this.setUsername = function (username) {
            _username = username;
        };
        this.getUsername = function () {
            return _username;
        };
    }
    function BrowserLocationUtility() {
        var watchID;
        var timeoutTimer;

        this.requestLocation = function (timeoutMillis, successCallback, errorCallback) {
            var options = {
                "enableHighAccuracy": true,
                "maximumAge": 0,
                "timeout": timeoutMillis
            };

            var MIN_ACCURACY = 10000; // 50 en metros x default
            watchID = navigator.geolocation.watchPosition(
				function (position) {
				    if (position.coords.accuracy <= MIN_ACCURACY) {
				        if (timeoutTimer && timeoutTimer != null)
				            try { clearTimeout(timeoutTimer); } catch (e1) { console.log(e1); }
				        cancelRequest();
				        console.log(JSON.stringify('lat:' + position.coords.latitude + 'lng:' + position.coords.longitude));
				        if (successCallback)
				            successCallback({ "lat": position.coords.latitude, "lng": position.coords.longitude, "accuracy": position.coords.accuracy });
				    }
				},
				function (error) {
				    console.log(JSON.stringify(error));
				},
				options
			);
            timeoutTimer = setTimeout(function () {
                if (watchID && watchID != null)
                    cancelRequest();
                if (errorCallback)
                    errorCallback({ "message": "Timeout expired (2)", "code": 3 });
            }, timeoutMillis);
            console.log(new Date().toString() + " geolocation.watchPosition WID=" + watchID + '  TID=' + timeoutTimer);
        };
        this.cancelRequestLocation = function () {
            cancelRequest();
        }

        function cancelRequest() {
            console.log('Geolocalizacion cancelada. WID=' + watchID + '  TID=' + timeoutTimer);
            try { clearTimeout(timeoutTimer); } catch (e2) { console.log(e2); };
            try { navigator.geolocation.clearWatch(watchID); } catch (e2) { console.log(e2); };

        }
    }
    function BrowserMediaUtility() {
        this.acquire = function (type, source, successCB, errorCB) {
            if (source == 'capture' && 'image' != type)
                throw 'BrowserMediaUtility: método "acquire" con source="capture" implementado sólo para type="image"!';

            var mimeType = '*/*';
            if (type == 'image')
                mimeType = 'image/*';
            else if (type == 'audio')
                mimeType = 'audio/*';
            else if (type == 'video')
                mimeType = 'video/*';

            if ('capture' == source) {
                capture()
					.then(function (media) {
					    if (successCB)
					        successCB(media);
					}).catch(function (err) {
					    if (errorCB)
					        errorCB(err);
					});
            } else if ('gallery' == source) {
                gallery({ 'mimeType': mimeType })
					.then(function (media) {
					    if (successCB)
					        successCB(media);
					}).catch(function (err) {
					    if (errorCB)
					        errorCB(err);
					});
            } else {
                throw 'BrowserMediaUtility: Origen de medios inválido: ' + source;
            }
        };

        function userMedia() {
            return navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia || null;
        }

        function gallery(options) {
            return new Promise(function (resolve, reject) {
                var tempFileInputObject = false;
                var fileInput = options ? options.fileInput : null;
                var mimeType = options && options.mimeType ? options.mimeType : '*/*';

                if (fileInput == null) {
                    tempFileInputObject = true;
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = mimeType;

                    fileInput.onchange = function (e) {
                        var f = e.target.files[0];
                        var reader = new FileReader();
                        reader.onload = (function (theFile) {
                            return function (e) {
                                var data = parseDataUrl(e.target.result);
                                resolve({ "hasContent": "true", "contents": data.contents, "mimeType": data.mimeType });
                            };
                        })(f);

                        reader.readAsDataURL(f);
                    };

                    fileInput.click();
                }
            });
        }

        function capture(options) {
            return new Promise(function (resolve, reject) {
                if (userMedia()) {
                    var tempVideoObject = false;
                    var video = options ? options.video : null;

                    if (video == null) {
                        tempVideoObject = true;
                        video = document.createElement('video');
                        video.style.width = '100%';
                        video.style.height = '100%';
                        video.style.zIndex = 10000000;
                        video.style.position = 'absolute';
                        video.style.top = 0;
                        video.style.left = 0;
                    }

                    var media = navigator.getUserMedia({ video: true, audio: false }, function (stream) {
                        // URL Object is different in WebKit
                        var url = window.URL || window.webkitURL;

                        // create the url and set the source of the video element
                        video.src = url ? url.createObjectURL(stream) : stream;

                        document.body.appendChild(video);

                        // Start the video
                        video.play();

                        video.onclick = function (e) {
                            var canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            canvas.getContext('2d').drawImage(video, 0, 0);
                            var data = parseDataUrl(canvas.toDataURL('image/jpeg'));

                            if (tempVideoObject == true) {
                                video.pause();
                                video.src = '';
                                video.load();
                                document.body.removeChild(video);
                            }

                            if (tempVideoObject || !options || !options.dontStopVideo || options.dontStopVideo == false)
                                stream.getTracks()[0].stop();

                            resolve({ "hasContent": "true", "contents": data.contents, "mimeType": data.mimeType });
                        };
                    }, function (error) {
                        reject(error);
                    });
                } else {
                    reject('UserMedia not supported!');
                }
            });
        }

        function parseDataUrl(url) {
            var result = {};
            var parts = url.split(",");

            result.mimeType = parts[0].split(';')[0].split(':')[1];
            result.contents = parts[1];

            return result;
        }
    }

    //////////////////////
    // Codigo Ejecucion //
    //////////////////////
    _inContainer = checkInContainer();

})(window.framework = window.framework || {}, null);

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}