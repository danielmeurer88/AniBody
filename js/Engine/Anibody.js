
function Anibody(html_id) {

    Anibody.ECMAScriptExtension();

    // ### INFO
    this.Info = {
        Engine: "AniBody",
        Project: "Dev",
        Version: "1.1.4",
        Author: "Daniel Meurer",
        LastUpdated: "2017_12_06_h12" // year_month_day_hhour
    };
    
    this.CurrentFrame = 0;
    
    // Check if jQuery framework is active - $.fn is typicall for jQuery but not a difinite proof for jQuery
    if ($) {
        if (!$.AnibodyArray) {
            $.AnibodyArray = [];
        }
        this.EI = $.AnibodyArray.length;
        $.AnibodyArray.push(this);
        $.Anibody = this;
    } else {
        this.Info.Error = "$ cannot bet set up";
        return false;
    }

    // ### FLAGS
    this.Flags = {};
    this.Flags.ConstantLoop = true; // flag if developer wants to have a timer, which constantly triggers Frame() (input, update, draw) or self responsible
    this.Flags.PreventKeyboardStrokesToBubbleUp = true;
    this.Flags.PreventContextClickBubbleToUp = true;
    this.Flags.MediaManager = true;
    this.Flags.MouseInput = true;
    this.Flags.KeyboardInput = true;
    this.Flags.TouchHandler = true;
    this.Flags.Touch2FakeMouseClick = true;
    this.Flags.DebugWindow = false;
    this.Flags.Storage = true;
    this.Flags.IntervalHandler = true;
    Object.defineProperty(this, "Flags", {enumerable:false});

    // ### PROPERTIES - STATE OF ENGINE
    this.Paused = false;

    // ### PROPERTIES

    // the Object Loop, where all external objects will be saved and the currently important/selected one
    this.Objects = {
        Queue: null,
        SelectedObject: null,
        RegisteredObjects : []
    };

    this.CanvasID = html_id;// the id string
    this.Canvas = {};// the canvas object
    this.Canvas.ScreenRatio = 0;

    // after the user uses the first touch event, it will be true
    this.IsTouchDevice = false;
    this.IsCanvasFitToScreen = false;

    this.Context = null;// the context of the canvas object
    this.Input = null;
    this.Camera = {SelectedCamera: null, Cameras: []};// place holder for all needed camera (in later progress it will be possible to have more than just one camera)
    this.IntervalHandler = null;// the variable for the counter object
    this.Log = [];// most error messages are sent here
    this.ProcessInputFunctionObjects = null;// array of all functions, which the user added and which concern the input processing
    this.UpdateFunctionObjects = null;// PriorityQueue of all functions, which the user added and which concern the update process
    this.ForegroundDrawFunctionObjects = null;// PriorityQueue of Callback-Objects to draw the functions in the background
    this.FPS = 25;// the amount of frames per second (default: 25)
    this.Timer = null; // wildcard for the Timer, which regulates, that the frame-functions is called 'this.FPS' times per second

    this.MediaManager = null;
    // terrain holds the data of a game world. if not further declared a default terrain with the same size as the canvas object will be set
    this.Terrain = null;
    this.DebugWindow = null;
    this.Consolero = null;

    this.OverlayImages = [];

    this.OutsideElement = [];

    this.TopWindow = window;
    if (window.top !== window.self)
        try {
            this.TopWindow = window.parent;
        } catch (e) {
            console.log("top window can't be found;")
        }

    this.Initialize();

}

/**
 * @description Returns the engine and can be saved in a new variable. Needed when there are more Engines in a website
 * Every new instance of Engine overwrites $.Engine
 * <i>every new instance is saved in $.AnibodyArray</i>
 * @returns {Anibody.prototype}
 */
Anibody.prototype.GetEngine = function () {
    return this;
};

/**
 * @description Getter so that an Engine instance does not have to call a global variable
 */
Object.defineProperty(Anibody.prototype, "Engine", {get: function () {
        return $.AnibodyArray[this.EI];
    }});

// Takes up the role of the constructor
Anibody.prototype.Initialize = function () {

    if (this.Flags.MediaManager) {
        this.MediaManager = new Anibody.util.MediaManager();
        this.MediaManager.EI = this.EI;
    }
    // it checks if it's a div container
    // if so it creates a new canvas element inside of it and goes on
    var pseudo = $("#" + this.CanvasID)[0];
    var width = $("#" + this.CanvasID);
    width = width.width();
    var height = $("#" + this.CanvasID).height();
    if (pseudo.nodeName == "DIV") {
        $("#" + this.CanvasID).html("<canvas width='" + width + "' height='" + height + "' id='" + this.CanvasID + "_Canvas'></canvas>");
        this.CanvasID = this.CanvasID + "_Canvas";
    }
    
    this.Canvas = $("#" + this.CanvasID)[0];

    this.Canvas.PosNew = {x: 0, y: 0};
    this.Canvas.PosOld = {x: 0, y: 0};

    this.Canvas.ScreenRatio = parseInt(this.Canvas.width / this.Canvas.height * 1000) / 1000;

    this.Context = this.Canvas.getContext("2d");
    
    this.Input = new Anibody.input.Input();

    this.Objects.Queue = new Anibody.util.PriorityQueue();
    
    this.ProcessInputFunctionObjects = new Anibody.util.PriorityQueue();// the PQ of all callback objects, which the user added and which concern the input processing
    this.UpdateFunctionObjects = new Anibody.util.PriorityQueue();// the PriorityQueue of all callback objects, which the user added and which concern the update process
    this.ForegroundDrawFunctionObjects = new Anibody.util.PriorityQueue();// the PriorityQueue of callback objects to draw in the foregroundground
    
    // set the IntervalHandler function running
    if(this.Flags.IntervalHandler){
        this.IntervalHandler = new Anibody.util.IntervalHandler();// the variable for the counter object
        this.AddUpdateFunctionObject({function: this.IntervalHandler.Update, that: this.IntervalHandler});
    }
    
    if (this.Flags.ConstantLoop)
        this.Timer = new Anibody.util.Timer(this, this.Frame, this.FPS);

    if(this.Flags.Storage){
        this.Storage = new Anibody.util.Storage();
    }
    
    if(this.Flags.DebugWindow)
        this.DebugWindow = new DebugWindow();
    
    this.Consolero = new Anibody.debug.Consolero();
};

/**
 * @description before it starts the Engine, it checks if there is a Terrain object and a Camera selected, if not default objects are initialized
 */
Anibody.prototype.Start = function () {

    if (!this.Terrain)
        this.SetTerrain(new Anibody.DefaultTerrain());

    if (!this.Camera.SelectedCamera){
        this.Camera.SelectedCamera = new Anibody.DefaultCamera();
        this.Camera.Cameras.push(this.Camera.SelectedCamera);
    }

    this.Objects.Queue.Sort();
    if (this.Flags.ConstantLoop)
        this.Timer.Start();
};

/**
 * @description stops the Engine
 */
Anibody.prototype.Stop = function () {this.Timer.Stop();};
/**
 * continues updating objects
 * @returns {undefined}
 */
Anibody.prototype.Continue = function () {this.Paused = false;};
/**
 * pauses updating objects
 * @returns {undefined}
 */
Anibody.prototype.Pause = function () {this.Paused = true};
/**
 * function applies the game loop - it starts
 * ProcessInput(), Update() and Draw()
 * @returns {undefined}
 */
Anibody.prototype.Frame = function () {
    this.CurrentFrame++;
    var e = arguments[0];
    e.ProcessInput();
    if (!e.Paused) {
        e.Update();
    }
    e.Draw();
};

/**
 * @description The functions adds an object to the ProcessInput(), which is a part of the Frame()
 * @param {Object} pio = { function : func, parameter : obj } the function of this object is regularly triggered once per frame with the specific parameter as the first argument
 * @returns {undefined}
 */
Anibody.prototype.AddProcessInputFunctionObject = function (pio, prio) {
    var ref = this.ProcessInputFunctionObjects.Enqueue(pio, prio);
    this.ProcessInputFunctionObjects.Sort();
    return ref;
};
/**
 * @description The functions adds an object to the ProcessInput(), which is a part of the Frame()
 * @param {Object} pio = { function : func, parameter : obj } the function of this object is regularly triggered once per frame with the specific parameter as the first argument
 * @returns {undefined}
 */
Anibody.prototype.RemoveProcessInputFunctionObject = function (ref) {
    this.ProcessInputFunctionObjects.DeleteByReferenceNumber(ref);
};
/**
 * @description the function, which calls all functions concerning to process the user input
 * @returns {undefined}
 */
Anibody.prototype.ProcessInput = function () {

    // set cursor to default - maybe an other object changes the cursor later in the same frame.
    this.Input.Mouse.Cursor.default();
    
    // inpute-object needs to be updated not in Update() but here in ProcessInput()
    this.Input.Update();

    for (var i = 0; i < this.Objects.Queue.heap.length; i++) {
        o = this.GetObject(i);
        if (o && o.ProcessInput)
            o.ProcessInput();
    }

    var pif;
    for (var i = 0; i < this.ProcessInputFunctionObjects.heap.length; i++) {
        pif = this.ProcessInputFunctionObjects.heap[i].data;
        pif.function.call(pif.that, pif.parameter);
    }

    if (this.Input.MouseHandler && this.Input.MouseHandler.ResolveHoverRequest)
        this.Input.MouseHandler.ResolveHoverRequest();

    if (this.Input.MouseHandler && this.Input.MouseHandler.MouseClickHandler)
        this.Input.MouseHandler.MouseClickHandler();

};

/**
 * Adds an UpdateFunctionObject (Object={that,function,parameter}) to the PriorityQueue,
 * whose functions will be updated in the Update-Function
 * @param {object} ufo - UpdateFunctionObject
 * @param {number} prior - priority (optional)
 * @returns {reference number}
 */
Anibody.prototype.AddUpdateFunctionObject = function (ufo, prior) {
    return this.UpdateFunctionObjects.Enqueue(ufo, prior);
};
/**
 * Removes the UpdateFunctionObject that is referenced by the argument
 * @param {number} ref reference number
 * @returns {undefined}
 */
Anibody.prototype.RemoveUpdateFunctionObject = function (ref) {
    this.UpdateFunctionObjects.DeleteByReferenceNumber(ref);
};
/**
 * @description the function, which calls all functions concerning to have the need to be updated every frame
 * @returns {undefined}
 */
Anibody.prototype.Update = function () {

    // get the actual position of the canvas
    this.Input.CalculateCanvasPosition();

    if (!this.Objects.Queue.Sorted)
        this.Objects.Queue.Sort();

    if (this.Terrain && this.Terrain.Update)
        this.Terrain.Update();

    var o;
    // invoke update functions, which are externly included by the programmer of the engine
    for (var i = 0; i < this.UpdateFunctionObjects.heap.length; i++) {
        o = this.UpdateFunctionObjects.heap[i].data;
        o.function.call(o.that, o.parameter);
    }

    // invoke update functions of every object in the object queue as long as they have one

    for (var i = 0; i < this.Objects.Queue.heap.length; i++) {
        o = this.GetObject(i);
        if (o && o.Update)
            o.Update();
    }

    if (this.Flags.MediaManager)
        this.MediaManager.Update();

    if (this.DebugWindow)
        this.DebugWindow.Update();

    if (this.Flags.AntiHoverEffect) {
        if (this.Input.Canvas.MouseOn) {
            this.AHEStart();
        } else {
            if (typeof this.AHE.Canvas !== "undefined" && this.AHE.Canvas) {
                this.AHEStop();
            }
            
        }
    }

    // update the camera
    this.Camera.SelectedCamera.Update();

};
/**
 * @description Adds extra Attributes and set default values. Register a physic function to the Update()-function so that the objects behaves according to the specified Type 
 * @param {Object} obj EngineObjects
 * @param {String} the type of the physic
 * @returns {undefined}
 */

/**
 * Draws on the canvas
 * @returns {undefined}
 */
Anibody.prototype.Draw = function () {

    var c = this.Context;
    c.save();
    c.clearRect(0, 0, this.Canvas.width, this.Canvas.height); // clear the complete canvas
    var o;

    this.Terrain.Draw(c); // draws the terrain first as a back-background

    // draws all Objects added to the engine if they own a Draw()-function and are not hidden
    // if the objects are drawn relative to the camera or statically to the canvas (HUD-like) is up to the Draw() in the certain object

    // looping backwards, so that objects with the highest priority are drawn last
    // i.e. are drawn on top
    for (var i = this.Objects.Queue.heap.length-1; i >= 0; i--) {
        o = this.GetObject(i);
        if (o && o.Draw)
            o.Draw(c);
    }

    if (this.Flags.MediaManager)
        this.MediaManager.Draw(c);

    if (this.DebugWindow)
        this.DebugWindow.Draw();

    // used by widgets
    for (var i = 0; i < this.ForegroundDrawFunctionObjects.heap.length; i++) {
        o = this.ForegroundDrawFunctionObjects.heap[i].data;
        o.function.call(o.that, c, o.parameter);
    }

    // @deprecated through the use of widgets
    if (this.OverlayImages.length > 0) {
        var arr = [];
        var tmp;
        for (var i = 0; i < this.OverlayImages.length; i++) {
            tmp = this.OverlayImages[i];
            c.drawImage(tmp.image, tmp.pos.x, tmp.pos.y, tmp.pos.width, tmp.pos.height);
            tmp.frames--;
            if (tmp.frames > 0)
                arr.push(tmp);
        }
        this.OverlayImages = arr;
    }

    c.restore();
};

/**
 * Adds a ForegroundDrawFunction (Object={that,function,parameter}) to the PriorityQueue,
 * whose functions will be drawn at the end of the Draw-Function and therefore rendered
 * in the foreground of the canvas
 * @param {object} fdfo - ForegroundDrawFunctionObject
 * @param {number} prior - priority (optional)
 * @returns {reference number}
 */
Anibody.prototype.AddForegroundDrawFunctionObject = function (fdfo, prior) {
    return this.ForegroundDrawFunctionObjects.Enqueue(fdfo, prior);
};

/**
 * Removes the ForegroundDrawFunction that is referenced by the argument
 * @param {number} ref reference number
 * @returns {undefined}
 */
Anibody.prototype.RemoveForegroundDrawFunctionObject = function (ref) {
    this.ForegroundDrawFunctionObjects.DeleteByReferenceNumber(ref);
};

/**
 * @description  downloads (Image)-Data as a png-file
 * @param {string} name of the png-file
 * @param {string} data - (optional) if data not specified then data will be
 * the content currently displayed on the canvas  
 * @returns {undefined}
 */
Anibody.prototype.Download = function (name, data) {

    if (typeof data === "undefined")
        data = this.Canvas.toDataURL();

    var fileName = name || "download_" + Date.now() + ".png";

    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var url = data;
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    saveData(data, fileName);

};

/**
 * Request the fullscreen mode for the canvas and returns true if the browser knows the feature
 * @returns {boolean}
 */
Anibody.prototype.RequestFullscreen = function(){
    // try fullscreen
    var can = this.Canvas;
    var done = false;

    // standard
    if(!done && can.requestFullscreen){
        can.requestFullscreen();
        done = true;
    }

    if(!done && can.webkitRequestFullscreen){
        can.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        done = true;
    }

    if(!done && can.mozRequestFullScreen){
        can.mozRequestFullScreen();
        done = true;
    }

    if(!done && can.msRequestFullscreen){
        can.msRequestFullscreen();
        done = true;
    }

    // TODO : check if canvas has the CSS pseudo-selectors! if not: set them
    // more info: https://developers.google.com/web/updates/2011/10/Let-Your-Content-Do-the-Talking-Fullscreen-API
    /*
    div:-webkit-full-screen {
        width: 100% !important;
    }
    div:-moz-full-screen {
        width: 100% !important;
    }
    div:-ms-fullscreen {
        width: 100% !important;
    }
    div:fullscreen {
        width: 100% !important;
    }
    */

    return done;
};

/**
 * Exit fullscreen mode for the canvas
 * @returns {undefined}
 */
Anibody.prototype.ExitFullscreen = function(){

    var done = false;

    // standard
    if(!done && document.exitFullscreen){
        document.exitFullscreen();
        done = true;
    }

    if(!done && document.webkitExitFullscreen){
        document.webkitExitFullscreen();
        done = true;
    }

    if(!done && document.mozCancelFullScreen){
        document.mozCancelFullScreen();
        done = true;
    }

    if(!done && document.msExitFullscreen){
        document.msExitFullscreen();
        done = true;
    }
};

/**
 * @description Returns the object at index i
 * @param {integer} i
 * @returns {result}
 */
Anibody.prototype.GetObject = function (i) {
    if (i < this.Objects.Queue.heap.length)
        return this.Objects.Queue.heap[i].data;
    else
        return false;
};
/**
 * @description Adds the object to the Objects Queue
 * @param {Object} obj
 * @param {Number} priority you can add an optional priority, which will influence the order of the objects
 * @returns {Number} reference number, can be used to remove the object
 */
Anibody.prototype.AddObject = function (obj, pr) {
    obj.EI = this.EI;
    obj._addrefnr = this.Objects.Queue.Enqueue(obj, pr);
    this.Objects.RegisteredObjects.push(obj);
    return obj._addrefnr;
};

/**
 * @description Remove the object with the give reference number off the Objects Queue
 * @param {Number} ref reference number given when the soon-to-be-removed object was added
 * @returns {result}
 */
Anibody.prototype.RemoveObject = function (ref) {
    var obj = this.Objects.Queue.DeleteByReferenceNumber(ref);
    var i = this.Objects.RegisteredObjects.indexOf(obj);
    if(i >= 0)
        this.Objects.RegisteredObjects.delete(i);
    return obj;
};

/**
 * Sets the selected object ( user input interacts with the selected object or the object needs to be interacted in more thn one scene
 * @param {object} ob
 * @returns {undefined}
 */
Anibody.prototype.SetSelectedObject = function (ob) {
    this.Objects.SelectedObject = ob;
};

/**
 * @description returns the selected object
 * @returns {result}
 */
Anibody.prototype.GetSelectedObject = function () {
    return this.Objects.SelectedObject;
};
/**
 * Registers an id of a HTML-Element to a codename, so that every further,
 * engine-related programming may use the codename instead of the ID.
 * If the ID changes, the programmer only have to adjust one command
 * (this command) 
 * @param {String} id
 * @param {String} codename
 * @returns {Anibody.prototype.AddOutsideElement.el|Boolean}
 */
Anibody.prototype.AddOutsideElement = function (id, codename) {

    var el = {
        element: $("#" + id),
        id: id,
        codename: codename
    };

    if (el.element.length > 0) {
        this.OutsideElement.push(el);
        return el;
    }

    return false;
};

/**
 * Returns the jQuery-applicable HTML-Element, which relates to the given codename
 * @param {type} codename
 * @returns {jQuery-applicable HTML-Element|false}
 */
Anibody.prototype.GetOutsideElement = function (codename) {
    for (var i = 0; i < this.OutsideElement.length; i++)
        if (this.OutsideElement[i].codename === codename)
            return this.OutsideElement[i].element;

    return false;
};
/**
 * empties the object queue (the scene)
 * @returns {undefined}
 */
Anibody.prototype.FlushObjects = function () {
    this.DeregisterAll();
    this.Objects.Queue.Flush();
};

/**
 * @description sets the AniBody's Terrain
 * @param {Terrain} t
 * @returns {result}
 */
Anibody.prototype.SetTerrain = function (t) {
    t.EI = this.EI;
    this.Terrain = t;
};
/**
 * @description Adds extra Attributes and set default values. Register a physic function to the Update()-function so that the objects behaves according to the specified Type 
 * @returns {undefined}
 */
Anibody.prototype.DeregisterAll = function () {
    
    var arr = []; // temp array will be used because RegisteredObjects-Array will get smaller by every loop
    for(var i=0; i<this.Objects.RegisteredObjects.length; i++){
        arr.push(this.Objects.RegisteredObjects[i]);
    }
    for(var i=0; i<arr.length; i++){
        if( arr[i] && arr[i].Deregister)
            arr[i].Deregister();
    }
};
/**
 * @description The Engines way how to handle errors
 * @param {Error} err
 * @returns {undefined}
 */
Anibody.prototype.HandleError = function (err) {
    this.Log.push(err);
};
/**
 * Returns the currently selected camera
 * @returns {Camera}
 */
Anibody.prototype.GetCamera = function () {
    return this.Camera.SelectedCamera;
};
/**
 * Sets the currently selected camera
 * @returns {undefined}
 */
Anibody.prototype.SetCamera = function (cam) {
    this.Camera.SelectedCamera = cam;
};
/**
 * yetTODO
 * @returns {undefined}
 */
Anibody.prototype.ActivateFullScreen_yetTODO = function () {
    var elem = this.Canvas;

    var w = $(window).width();
    var h = $(window).height();

    elem.width = w;
    elem.height = h;

    this.Canvas.ScreenRatio = w / h;

    this.IsCanvasFitToScreen = true;
};
/**
 * Adds an Image for an given number of frames on the top of the canvas
 * @param {HTML-Image} img
 * @param {number} x
 * @param {number} y
 * @param {number} w - width
 * @param {number} h - height
 * @param {number} nof - number of frames
 * @returns {undefined}
 */
Anibody.prototype.AddOverlayImage = function (img, x, y, w, h, nof) {
    nof = nof || 1;
    w = w || img.width;
    h = h || img.height;
    this.OverlayImages.push({image: img, pos: {x: x, y: y, width: w, height: h}, frames: nof});
};

/**
 * Locks the window with a confirm message before unloading
 * @param {function} f costum function but most browsers block costum functions and a default message will be displayed
 * @returns {undefined}
 */
Anibody.prototype.LockUnload = function (f) {

    var onbeforeunload = function (e) {
        return false;
    };

    if (typeof f === "function")
        onbeforeunload = f;

    //window.onbeforeunload = function(){return true;};

    $(window).bind("beforeunload", onbeforeunload);

    // if the script runs on a (same-origin) document within an iframe (or popup?)
    if (window.top != window.self) {
        try {
            $(window.parent.document).bind("beforeunload", onbeforeunload);
        } catch (e) {

        }
    }

};

/**
 * Let's the user leave the window without an confirm message
 * @returns {undefined}
 */
Anibody.prototype.UnlockUnload = function () {

    $(window).unbind("beforeunload");

    // if the script runs on a (same-origin) document within an iframe (or popup?)
    if (window.top != window.self) {
        try {
            $(window.parent.document).unbind("beforeunload");
        } catch (e) {

        }
    }

};

/**
 * prints the image of a given data url or just the image of the current canvas state
 * @param {string} url - data url of an image (optional)
 * @returns {undefined} */
Anibody.prototype.Print = function (url) {
    if (typeof url === "undefined")
        url = this.Canvas.toDataURL();

    var html = "<iframe style='display:none' name='testing__AniBody.Print' id='testing__AniBody__Print'><!DOCTYPE HTML><html><body></body></html></iframe>";

    $("body").append(html);

    var newWin = window.frames["testing__AniBody__Print"];
    var doc = newWin.contentDocument;
    doc.write("<body><img src='{0}' onload='window.print()'</body>".format(url));

    window.setTimeout(function () {
        var ifr = $("#testing__AniBody__Print");
        ifr.remove();
    }, 1000);

};

// Abstract Methods
Anibody.SetPackage = function(/*strings*/){
    var i=0;
    var pp = "";
    for(i=0; i<arguments.length; i++)
        if(typeof arguments[i] !== "string"){
            this.log("Cannot create package", "ArgumentException");
            return;
        }
    
    //var el = window["Anibody"];
    var el = window;
    var newel;
    for(i=0; i<arguments.length; i++){
        newel = el[arguments[i]];
        if(typeof newel === "undefined"){
            el[arguments[i]] = {};
        }
        el = el[arguments[i]];    
    }
    
};

Anibody.CallObject = function(obj, useApply){
    
    if(typeof obj !== "object" || obj === null) // javascript sees null as an object
        return;
    
    useApply = obj.useApply;
    if(typeof useApply === "undefined")
        useApply = false;
    if(typeof obj === "object" && typeof obj.function === "function"){
        if(useApply)
            obj.function.apply(obj.that, obj.parameter);
        else
            obj.function.call(obj.that, obj.parameter);
    }
        
};

Anibody.import = function(packagePath, alias){
    
    if(arguments.length <= 0) return;
    
    
    if(typeof alias !== "string"){
        if(packagePath && packagePath.name)
            alias = packagePath.name;
        else{
            alias = packagePath.constructor.toString();
            var ifunc = alias.indexOf("function ");
            var ibracket = alias.indexOf("(");
            if(ifunc === 0){
                alias = alias.substr(9, ibracket - 9);
            }
        }
    }

    if(alias.length <= 0){
        console.log("Cannot import " + packagePath.toString(), "EmptyStringException");
        return;
    }
    if(alias === "Function"){
        console.log("Cannot import " + alias, "AnonymousFunctionException");
        return;
    }
    
    //check first if it is already imported
    if(typeof window[alias] !== "undefined"){
        return;
    }
    window[alias] = packagePath; 
};

Anibody.importAll = function(packagePath){
    if(arguments.length <= 0) return;
    for(var name in packagePath){
        Anibody.import(packagePath[name]);
    }
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
 * Every object used in the AniBody-Engine should derive from this class if it is used in the background
 * not visible to the user
 * @returns {EngineObject}
 */
Anibody.EngineObject = function EngineObject(){
    this.EI = 0; // Engine Index (the index of the engine, to which this object belongs in the $.EngineArray!
    this.UniqueID = this._getUniqueID();
    this._addrefnr = null;
    
};

Object.defineProperty(Anibody.EngineObject, "name", {value:"EngineObject"});

/**
 * @see README_DOKU.txt
 */
Anibody.EngineObject.prototype.ProcessInput = function(){return false;};
/**
 * @see README_DOKU.txt
 */
Anibody.EngineObject.prototype.Update = function(){return false;};

Anibody.EngineObject.UniqueIDState = 0;
Anibody.EngineObject.prototype._getUniqueID = function(){
    return Anibody.EngineObject.UniqueIDState++;
};

// defining a default getter to the EngineObject constructor function
Object.defineProperty(Anibody.EngineObject.prototype, "Engine", {get: function(){
        return $.AnibodyArray[this.EI];
}});

/**
 * Adds an Object to the engine
 * @param {number} prior - the priority (you can use null if you don't care about priorities)
 * @param {number} ei - index of the engine (default:0) 
 * @returns {undefined}
 */
Anibody.EngineObject.prototype.Register = function(prior, ei){
    if(isNaN(ei))
        ei = 0;

    this.EI = ei;
    var en = $.AnibodyArray[ei];
    if(en){
        this._addrefnr = en.AddObject(this, prior);
    }else{
        this._addrefnr = this.Engine.AddObject(this, prior);
    }
    return this._addrefnr;
};
/**
 * Removes a registered object.
 * This function should be called if the instance won't be used anymore
 * @returns {undefined}
 */
Anibody.EngineObject.prototype.Deregister = function(){
    var ei = this.EI;
    var en = $.AnibodyArray[ei];
    if(en){
        en.RemoveObject(this._addrefnr);
        this._addrefnr = null;
    }
};

/**
 * Every object used in the AniBody-Engine should derive from this class if it is used in the foreground
 * visible to the user
 * @returns {Anibody.ABO}
 */
Anibody.ABO = function ABO(){ // AniBodyObject
    Anibody.EngineObject.call(this);
    this.Name = "";
    this.X = 0;
    this.Y=0;
    this.Width = 0;
    this.Height = 0;
};

Anibody.ABO.prototype = Object.create(Anibody.EngineObject.prototype);
Anibody.ABO.prototype.constructor = Anibody.ABO;

Object.defineProperty(Anibody.ABO, "name", {value:"ABO"});

/**
 * @see README_DOKU.txt
 */
Anibody.ABO.prototype.Draw = function(){return false;};
/**
 * Returns an object that contains the needed value to create an rectangle at
 * the current position of the ABO-Object plus a given offset
 * @param {Number} off, offset to increase the area (in pixel)
 * @param {Number|string} rounding, the rounding of the rectangle in pixel | "circle"
 *  - the rounding transforms the rect to a circle if width and hight are the same 
 * @returns {area object x,y,width,height}
 */
Anibody.ABO.prototype.GetArea = function(off, rounding){
    if(typeof off === "undefined")
        off = 0;
    
    if(typeof rounding === "undefined" || rounding < 0)
        rounding = 0;
    
    var area;
    
    if(rounding !== "circle")
        if(rounding === 0)
            area = {
                x : this.X - off,
                y : this.Y - off,
                width : this.Width + 2*off,
                height : this.Height + 2*off,
                type : "rect"
            };
        else
            area = {
                x : this.X - off,
                y : this.Y - off,
                width : this.Width + 2*off,
                height : this.Height + 2*off,
                rounding : rounding,
                type : "rrect"
            };
    else
        area = {
            x : this.X,
            y : this.Y,
            radius : this.Radius + off,
            type : "circle"
        };
    
    area.background = false;
    return area;
};

/**
 * ABOs that must not be added to the Anibody.Object-Queueu
 * the class can register ProcessInput(), Update() and Draw() by themself
 * - should be deregistered by user of the widget
 * @returns {Anibody.ABO}
 */
Anibody.Widget = function Widget(){ // Widget
    Anibody.ABO.call(this);
    
    this._refIP = null;
    this._ipPriority = 1;
    this._refU = null;
    this._uPriority = 1;
    this._refD = null;
    this._dPriority = 1;
    
};

Anibody.Widget.prototype = Object.create(Anibody.ABO.prototype);
Anibody.Widget.prototype.constructor = Anibody.Widget;

Object.defineProperty(Anibody.Widget, "name", {value:"Widget"});

Anibody.Widget.prototype.Register = function(){
    if(this._refIP === null)
        this._refIP = this.Engine.AddProcessInputFunctionObject({
            function : function(){
                this.ProcessInput();
            },
            that : this
        },this._ipPriority);
    
    if(this._refU === null)
        this._refU = this.Engine.AddUpdateFunctionObject({
            function : function(){
                this.Update();
            },
            that : this
        },this._uPriority);
    
    if(this._refD === null)
        this._refD = this.Engine.AddForegroundDrawFunctionObject({
            function : function(c){
                this.Draw(c);
            },
            that : this
        },this._dPriority);
    
    this.Engine.Objects.RegisteredObjects.push(this);
};
Anibody.Widget.prototype.Deregister = function(){
    if(this._refIP !== null){
        this.Engine.RemoveProcessInputFunctionObject(this._refIP);
        this._refIP = null;
    }
    
    if(this._refU !== null){
        this.Engine.RemoveUpdateFunctionObject(this._refU);
        this._refU = null;
    }
    
    if(this._refD !== null){
        this.Engine.RemoveForegroundDrawFunctionObject(this._refD);
        this._refD = null;
    }
    
    var i = this.Engine.Objects.RegisteredObjects.indexOf(this);
    if(i >= 0)
        this.Engine.Objects.RegisteredObjects.delete(i);    
};
/**
 * @see README_DOKU.txt
 */
Anibody.Widget.prototype.ProcessInput = function(){return false;};
/**
 * @see README_DOKU.txt
 */
Anibody.Widget.prototype.Update = function(){return false;};
/**
 * @see README_DOKU.txt
 */
Anibody.Widget.prototype.Draw = function(c){return false;};

/**
 * Default Camera - used when the user's field of view is not bigger as the canvas
 * @returns {DefaultCamera}
 */
Anibody.DefaultCamera = function DefaultCamera(){
    Anibody.ABO.call(this);
}
Anibody.DefaultCamera.prototype = Object.create(Anibody.ABO.prototype);
Anibody.DefaultCamera.prototype.constructor = Anibody.DefaultCamera;

Object.defineProperty(Anibody.DefaultCamera, "name", {value:"DefaultCamera"});

/**
 * Represents the game environment and can hold the background image of the map
 * @param {string} img_code - codename of the background image (optional)
 * @returns {DefaultTerrain}
 */
Anibody.DefaultTerrain = function DefaultTerrain(img_code) {
    Anibody.ABO.call(this);
    this.Codename = img_code;
    this.NoImage = false;
    this.Initialize();
}
Anibody.DefaultTerrain.prototype = Object.create(Anibody.ABO.prototype);
Anibody.DefaultTerrain.prototype.constructor = Anibody.DefaultTerrain;

Object.defineProperty(Anibody.DefaultTerrain, "name", {value:"DefaultTerrain"});

/**
 * @see README_DOKU.txt
 */
Anibody.DefaultTerrain.prototype.Initialize = function () {

    if (this.Codename) {
        this.Image = this.Engine.MediaManager.GetImage(this.Codename);
        this.Width = this.Image.width;
        this.Height = this.Image.height;
    } else {
        this.NoImage = true;
        this.Width = this.Engine.Canvas.width;
        this.Height = this.Engine.Canvas.height;
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.DefaultTerrain.prototype.Draw = function (c) {

    if (!this.NoImage) {
        var cam = this.Engine.Camera.SelectedCamera;
        c.drawImage(this.Image, this.X - cam.X, this.Y - cam.Y);
    }
};