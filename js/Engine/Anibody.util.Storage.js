Anibody.SetPackage("Anibody", "util");

/**
 * @description Adding a local storage function to the Engine, so values can be saved beyond sessions
 * @returns 
 */
Anibody.util.Storage = function Storage() {
    
    if(Anibody.util.Storage.Instance !== null)
        return Anibody.util.Storage.Instance;
    
    Anibody.classes.EngineObject.call(this);

    this.Pre = "AniBody_" + this.Engine.Info.Project;
    // flag wether browser allows html5-local storage or engine needs to use cookies as pieces
    this.BrowserAllowsLocalStorage = false;

    this._isNotSync = false;

    this.Object = null;
    this.ObjectString = "";

this.Initialize();
};
Anibody.util.Storage.prototype = Object.create(Anibody.classes.EngineObject.prototype);
Anibody.util.Storage.prototype.constructor = Anibody.util.Storage;

Anibody.util.Storage.Instance = null;

/**
 * returns the Storage
 * @returns {Anibody.util.Storage.Instance}
 */
Anibody.util.Storage.GetInstance = function(){
    if(Anibody.util.Storage.Instance !== null)
        return Anibody.util.Storage.Instance;
    else
        return new Anibody.util.Storage();
};

/**
 * @description Function initiliazes the storage by testing wether the HTML5-Local Storage feature is availible or not and invokes the needed functions for restoring the storage
 * @returns {undefined}
 */
Anibody.util.Storage.prototype.Initialize = function () {
    if (this._isLocalStorageAvailable())
        this.BrowserAllowsLocalStorage = true;
    else
        this.BrowserAllowsLocalStorage = false;

    //Get (old) storage keys-values from browser
    if (this.BrowserAllowsLocalStorage) {
        var str = localStorage[this.Pre];
        if (!str){
            this.ObjectString = "{}";
        }
        else {
            this.ObjectString = str;
        }
    }

    // UpdateObject();
    if (this.ObjectString.length < 3) {
        //console.log("Storage is empty");
        this.Object = {};
    } else {
        var str = this.ObjectString;
        this.Object = JSON.parse(str);
    }

    this._isNotSync = false;

    window.addEventListener('beforeunload', function (e) {
        var st = Anibody.util.Storage.GetInstance();
        if(st._isNotSync){    
            st._syncBrowser();
        } 
    });

    window.addEventListener('unload', function(event) {
        var st = Anibody.util.Storage.GetInstance();
        if(st._isNotSync){    
            st._syncBrowser();
        } 
      }, this);
	
    
    if(Anibody.util.Storage.Instance === null)
        Anibody.util.Storage.Instance = this;

};

/**
 * @description easy test if html 5 localStorage is active or not
 */
Anibody.util.Storage.prototype._isLocalStorageAvailable = function () {
    var test = this.Pre + 'test' + Date.now();
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};
/**
 * @description searches if the object has an attribte "name" and returnes its value or false if not found
 * @returns Value
 */
Anibody.util.Storage.prototype.Read = function (name) {
    var res = this.Object[name];
    var e;
    if (res)
        return res;
    else {
        e = {code: 404, msg: "Storage has no attribute called " + name};
        this.Engine.HandleError(e);
        return e;
    }
};

/**
 * @description writes the value "val" to the attribute "name"
 * @returns val
 */
Anibody.util.Storage.prototype.Write = function (key, val) {
    this.Object[key] = val;
    // updating ObjectString by stringify complete Object
    this.ObjectString = JSON.stringify(this.Object);
    this._isNotSync = true;
    this._syncBrowser();
    return val;
};

/**
 * @description Deletes the key and the key-value - if no key is specified, function deletes whole storage
 * @param {String} Key that will be deleted 
 * @returns {undefined}
 */
Anibody.util.Storage.prototype.Delete = function (key) {
    if (arguments.length === 0) {
        this.Object = {};
        this.ObjectString = "{}";
    } else
        try {
            this.Object[key] = "undefined";
            this._isNotSync = true;
            this._syncBrowser();
        } catch (e) {
            e = {code: 403, msg: "Storage has no attribute called " + key};
            this.HandleError(e);
        }
};

/**
 * @description writes the ObjectString to the LocalStorage so the Storage can be used the next time
 * @returns undefined
 */
Anibody.util.Storage.prototype._syncBrowser = function () {
    if (this.BrowserAllowsLocalStorage) {
        localStorage[this.Pre] = this.ObjectString;
        this._isNotSync = false;
    }
};