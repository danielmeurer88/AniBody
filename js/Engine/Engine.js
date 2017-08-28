
function Engine(html_id) {

    // ### INFO
    this.Info = {
        Engine: "AniBody",
        Version: "0.96",
        Author: "Daniel Meurer",
        Project: "Developing",
        LastUpdated: "2017_08_08_h17" // year_month_day_hhour
    };

    // Check if jQuery framework is active - $.fn is typicall for jQuery but not a difinite proof for jQuery
    if ($ && $.fn) {
        if (!$.EngineArray) {
            $.EngineArray = [];
        }
        this.EI = $.EngineArray.length;
        $.EngineArray.push(this);
        $.Engine = this;
    } else {
        this.Info.Error = "jQuery is probably not set up";
        return false;
    }

    // ### FLAGS
    this.Flags = {};
    this.Flags.ConstantLoop = true; // flag if developer wants to have a timer, which constantly triggers Frame() (input, update, draw) or self responsible
    this.Flags.PreventKeyboardStrokesToBubbleUp = true;
    this.Flags.PreventContextClickBubbleToUp = true;
    this.Flags.MediaManager = true;
    this.Flags.TouchHandler = true;
    this.Flags._useFakeMouseClick = true;
    this.Flags.AntiHoverEffect = false;

    // ### PROPERTIES - STATE OF ENGINE
    this.Paused = false;

    // ### PROPERTIES

    // the Object Loop, where all external objects will be saved and the currently important/selected one
    this.Objects = {
        Queue: null,
        SelectedObject: null
    };

    this.CanvasID = html_id;// the id string
    this.Canvas = {};// the canvas object
    this.Canvas.ScreenRatio = 0;

    // after the user uses the first touch event, it will be true
    this.IsTouchDevice = false;
    this.IsCanvasFitToScreen = false;

    this.Context;// the context of the canvas object
    this.Camera = {SelectedCamera: false, Cameras: false};// place holder for all needed camera (in later progress it will be possible to have more than just one camera)
    this.Counter;// the variable for the counter object
    this.Log = [];// most error messages are sent here
    this.ProcessInputFunctions = new PriorityQueue();// array of all functions, which the user added and which concern the input processing
    this.UpdateFunctions = new PriorityQueue();
    ; // PriorityQueue of all functions, which the user added and which concern the update process
    this.ForegroundDrawFunctionObjects = new PriorityQueue();// PriorityQueue of Callback-Objects to draw the functions in the background
    this.ImageData = null;// the variable for the ImageData of the canvas, if need be. maybe deprecated
    this.FPS = 25;// the amount of frames per second (default: 25)
    this.Timer; // wildcard for the Timer, which regulates, that the frame-functions is called 'this.FPS' times per second

    this.MediaManager = {};
    // terrain holds the data of a game world. if not further declared a default terrain with the same size as the canvas object will be set
    this.Terrain = {};
    this.DebugWindow = {};

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
 * <i>every new instance is saved in $.EngineArray</i>
 * @returns {Engine.prototype}
 */
Engine.prototype.GetEngine = function () {
    return this;
};

/**
 * @description Getter so that an Engine instance does not have to call a global variable
 */
Object.defineProperty(Engine.prototype, "Engine", {get: function () {
        return $.EngineArray[this.EI];
    }});

// Takes up the role of the constructor
Engine.prototype.Initialize = function () {

    if (this.Flags.MediaManager) {
        this.MediaManager = new MediaManager();
        this.MediaManager.EI = this.EI;
    }
    // it checks if it's a div container
    // if so it creates a new canvas element inside of it and goes on
    var pseudo = $("#" + this.CanvasID)[0];
    var width = $("#" + this.CanvasID).width();
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

    this.Input.Engine = this;
    this.Input.Mouse.Cursor.Engine = this;
    this.Input.Initialize();

    this.Objects.Queue = new PriorityQueue();

    // set the Counter function running
    this.Counter = new Counter();// the variable for the counter object
    this.AddUpdateFunctionObject({function: this.Counter.Update, parameter: this.Counter, that: this.Counter});

    if (this.Flags.ConstantLoop)
        this.Timer = new Timer(this, this.Frame, this.FPS);

    this.Storage.Engine = this;
    this.Storage.InitStorage();

    this.DebugWindow = new DebugWindow();

};
/**
 * @description before it starts the Engine, it checks if there is a Terrain object and a Camera selected, if not default objects are initialized
 */
Engine.prototype.Start = function () {

    if (!this.Engine.Terrain.Type)
        this.Engine.SetTerrain(new DefaultTerrain());

    if (!this.Engine.Camera.SelectedCamera || !this.Engine.Camera.SelectedCamera.Type)
        this.Engine.Camera.SelectedCamera = this.GetNewCamera("default");

    this.Engine.Objects.Queue.Sort();
    if (this.Flags.ConstantLoop)
        this.Engine.Timer.Start();
};

/**
 * @description stops the Engine
 */
Engine.prototype.Stop = function () {
    if (this.Flags.ConstantLoop)
        this.Timer.Stop();
};
/**
 * continues updating objects
 * @returns {undefined}
 */
Engine.prototype.Continue = function () {
    this.Paused = false
};
/**
 * pauses updating objects
 * @returns {undefined}
 */
Engine.prototype.Pause = function () {
    this.Paused = true
};

/**
 * function applies the game loop - it starts
 * ProcessInput(), Update() and Draw()
 * @returns {undefined}
 */
Engine.prototype.Frame = function () {
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
Engine.prototype.AddProcessInputFunction = function (pio, prio) {
    var ref = this.ProcessInputFunctions.Enqueue(pio, prio);
    this.ProcessInputFunctions.Sort();
    return ref;
};
/**
 * @description The functions adds an object to the ProcessInput(), which is a part of the Frame()
 * @param {Object} pio = { function : func, parameter : obj } the function of this object is regularly triggered once per frame with the specific parameter as the first argument
 * @returns {undefined}
 */
Engine.prototype.RemoveProcessInputFunction = function (ref) {
    this.ProcessInputFunctions.DeleteByReferenceNumber(ref);
};
/**
 * @description the function, which calls all functions concerning to process the user input
 * @returns {undefined}
 */
Engine.prototype.ProcessInput = function () {

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
    for (var i = 0; i < this.ProcessInputFunctions.heap.length; i++) {
        pif = this.ProcessInputFunctions.heap[i].data;
        pif.function.call(pif.that, pif.parameter);
    }

    if (this.Input.MouseHandler && this.Input.MouseHandler.ResolveHoverRequest)
        this.Input.MouseHandler.ResolveHoverRequest();

    if (this.Input.MouseHandler && this.Input.MouseHandler.MouseClickHandler)
        this.Input.MouseHandler.MouseClickHandler();

};

/**
 * Adds an UpdateFunction (Object={that,function,parameter}) to an PriorityQueue,
 * whose functions will be updated in the Update-Function
 * @param {object} ufo - UpdateFunctionObject
 * @param {number} prior - priority (optional)
 * @returns {reference number}
 */
Engine.prototype.AddUpdateFunctionObject = function (ufo, prior) {
    return this.UpdateFunctions.Enqueue(ufo, prior);
};
/**
 * Removes the UpdateFunction that is referenced by the argument
 * @param {number} ref reference number
 * @returns {undefined}
 */
Engine.prototype.RemoveUpdateFunctionObject = function (ref) {
    this.UpdateFunctions.DeleteByReferenceNumber(ref);
};
/**
 * @description the function, which calls all functions concerning to have the need to be updated every frame
 * @returns {undefined}
 */
Engine.prototype.Update = function () {

    // get the actual position of the canvas
    this.Input.CalculateCanvasPosition();

    if (!this.Objects.Queue.Sorted)
        this.Objects.Queue.Sort();

    if (this.Terrain && this.Terrain.Update)
        this.Terrain.Update();

    var o;
    // invoke update functions, which are externly included by the programmer of the engine
    for (var i = 0; i < this.UpdateFunctions.heap.length; i++) {
        o = this.UpdateFunctions.heap[i].data;
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
Engine.prototype.Draw = function () {

    var c = this.Context;
    c.save();
    c.clearRect(0, 0, this.Canvas.width, this.Canvas.height); // clear the complete canvas
    var o;

    this.Terrain.Draw(c); // draws the terrain first as a back-background

    // draws all Objects in the ObjQ if they own a Draw()-function and are not hidden
    // if the objects are drawn relative to the camera or statically to the canvas (HUD-like) is up to the Draw() in the certain object
    for (var i = 0; i < this.Objects.Queue.heap.length; i++) {
        o = this.GetObject(i);
        if (o && o.Draw)
            o.Draw(c);
    }

    if (this.Flags.MediaManager)
        this.MediaManager.Draw(c);

    if (this.DebugWindow)
        this.DebugWindow.Draw();

    for (var i = 0; i < this.ForegroundDrawFunctionObjects.heap.length; i++) {
        o = this.ForegroundDrawFunctionObjects.heap[i].data;
        o.function.call(o.that, c, o.parameter);
    }

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
 * Adds a ForegroundDrawFunction (Object={that,function,parameter}) to an PriorityQueue,
 * whose functions will be drawn at the end of the Draw-Function and therefore rendered
 * in the foreground of the canvas
 * @param {object} fdfo - ForegroundDrawFunctionObject
 * @param {number} prior - priority (optional)
 * @returns {reference number}
 */
Engine.prototype.AddForegroundDrawFunctionObject = function (fdfo, prior) {
    return this.ForegroundDrawFunctionObjects.Enqueue(fdfo, prior);
};

/**
 * Removes the ForegroundDrawFunction that is referenced by the argument
 * @param {number} ref reference number
 * @returns {undefined}
 */
Engine.prototype.RemoveForegroundDrawFunctionObject = function (ref) {
    this.ForegroundDrawFunctionObjects.DeleteByReferenceNumber(ref);
};

/**
 * @description  downloads what is currently displayed on the canvas as a png
 * @param {string} name of the file 
 * @returns {undefined}
 */
Engine.prototype.Download = function (name, data) {

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
Engine.prototype.RequestFullscreen = function(){
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
Engine.prototype.ExitFullscreen = function(){

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
Engine.prototype.GetObject = function (i) {
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
Engine.prototype.AddObject = function (obj, pr) {
    obj.EI = this.EI;
    return this.Objects.Queue.Enqueue(obj, pr);
};

/**
 * @description Remove the object with the give reference number off the Objects Queue
 * @param {Number} ref reference number given when the soon-to-be-removed object was added
 * @returns {result}
 */
Engine.prototype.RemoveObject = function (ref) {
    return this.Objects.Queue.DeleteByReferenceNumber(ref);
};

/**
 * Sets the selected object ( user input interacts with the selected object or the object needs to be interacted in more thn one scene
 * @param {object} ob
 * @returns {undefined}
 */
Engine.prototype.SetSelectedObject = function (ob) {
    this.Objects.SelectedObject = ob;
};

/**
 * @description returns the selected object
 * @returns {result}
 */
Engine.prototype.GetSelectedObject = function () {
    return this.Objects.SelectedObject;
};
/**
 * Registers an id of a HTML-Element to a codename, so that every further,
 * engine-related programming may use the codename instead of the ID.
 * If the ID changes, the programmer only have to adjust one command
 * (this command) 
 * @param {String} id
 * @param {String} codename
 * @returns {Engine.prototype.AddOutsideElement.el|Boolean}
 */
Engine.prototype.AddOutsideElement = function (id, codename) {

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
Engine.prototype.GetOutsideElement = function (codename) {
    for (var i = 0; i < this.OutsideElement.length; i++)
        if (this.OutsideElement[i].codename === codename)
            return this.OutsideElement[i].element;

    return false;
};
/**
 * empties the object queue (the scene)
 * @returns {undefined}
 */
Engine.prototype.FlushQueue = function () {
    this.Objects.Queue.Flush();
    this.length = 0;
    this.SelectedObject = "undefined";
};

/**
 * @description sets the AniBody's Terrain
 * @param {Terrain} t
 * @returns {result}
 */
Engine.prototype.SetTerrain = function (t) {
    t.EI = this.EI;
    this.Terrain = t;
};
/**
 * @description Adds extra Attributes and set default values. Register a physic function to the Update()-function so that the objects behaves according to the specified Type 
 * @param {Object} obj EngineObjects
 * @param {String} the type of the physic
 * @returns {undefined}
 */
Engine.prototype.FlushScene = function () {
    this.Objects.Queue.Flush();
    this.MediaManager.Flush();
};
/**
 * @description The Engines way how to handle errors
 * @param {Error} err
 * @returns {undefined}
 */
Engine.prototype.HandleError = function (err) {
    this.Log.push(err);
};
/**
 * Creates and returns a new camera of a certain type or default
 * @param {string} type (optional)
 * @returns {Camera}
 */
Engine.prototype.GetNewCamera = function (type) {
    var cam;

    if (!type || type == "default") {
        cam = new DefaultCamera();
    }

    if (type == "platform") {
        cam = new PlatformCamera();
    }

    if (type == "rpg") {
        cam = new RPGCamera();
    }

    cam.EI = this.EI;
    return cam;
};
/**
 * Returns the currently selected camera
 * @returns {Camera}
 */
Engine.prototype.GetCamera = function () {
    return this.Camera.SelectedCamera;
};
/**
 * Sets the currently selected camera
 * @returns {undefined}
 */
Engine.prototype.SetCamera = function (cam) {
    this.Camera.SelectedCamera = cam;
};
/**
 * yetTODO
 * @returns {undefined}
 */
Engine.prototype.ActivateFullScreen_yetTODO = function () {
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
Engine.prototype.AddOverlayImage = function (img, x, y, w, h, nof) {
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
Engine.prototype.LockUnload = function (f) {

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
Engine.prototype.UnlockUnload = function () {

    $(window).unbind("beforeunload");

    // if the script runs on a (same-origin) document within an iframe (or popup?)
    if (window.top != window.self) {
        try {
            $(window.parent.document).unbind("beforeunload");
        } catch (e) {

        }
    }

};

//#################################### Input
// holds information and provides functions around user input
Engine.prototype.Input = {

    // will be the anibody engine
    Engine: false,

    // all event handlers, which are registered, are saved here
    MouseDownEvent: {},
    KeyDownEvent: {},
    ParentKeyDownEvent: {},

    MouseUpEvent: {},
    KeyUpEvent: {},
    ParentKeyUpEvent: {},

    MouseMoveEvent: {},
    MouseScrollEvent: {},

    ResizeEvent: {},
    // end of event handler attributes
    
    // placeholder for the instance of the MouseHandler and the TouchHandler classes
    MouseHandler: {},
    TouchHandler: {},
    
    // object that holds information about the mouse of the user
    Mouse: {
        EventObject: 0,
        DownEvent: 0,
        UpEvent: 0,
        Left: {
            Up: true,
            Down: false,
            FramesDown: 0,
            FramesUp: 0,
            BusyFrames: 0
        },
        Right: {
            Up: true,
            Down: false,
            FramesDown: 0,
            FramesUp: 0,
            BusyFrames: 0
        },
        Position: {
            X: 0, // X-Coordinate to the 0/0-Point of the page
            Y: 0,
            Xold: 0,
            Yold: 0,
            Relative: {
                X: 0, // X-Coordinate relative to the 0/0-Point of the canvas
                Y: 0       // used in Selecting Objects and such
            },
            Camera: {
                X: 0, // X-Coordinate relative to the 0/0-Point of the camera, which relates to the Terrain-object
                Y: 0       // used for example for drawing objects on the Terrain
            },
            Delta: {X: 0, Y: 0} // the difference of the mouse position of the old frame and the current frame
            // used for example with drag & drop
        },
        Cursor: {

            Current: "auto",
            OnlyCanvas: true,

            Update: function () {
                $(this.Engine.Canvas).css("cursor", this.Current);
            },
            Set: function (css) {
                $(this.Engine.Canvas).css("cursor", css);
            },
            alias: function () {
                this.Current = "alias";
                this.Set(this.Current);
            },
            cell: function () {
                this.Current = "cell";
                this.Set(this.Current);
            },
            col_resize: function () {
                this.Current = "col-resize";
                this.Set(this.Current);
            },
            copy: function () {
                this.Current = "copy";
                this.Set(this.Current);
            },
            crosshair: function () {
                this.Current = "crosshair";
                this.Set(this.Current);
            },
            default: function () {
                this.Current = "default";
                this.Set(this.Current);
            },
            ew_resize: function () { // east-west resize
                this.Current = "ew-resize";
                this.Set(this.Current);
            },
            grab: function () {
                this.Current = "grab";
                this.Set(this.Current);
            },
            grabbing: function () {
                this.Current = "grabbing";
                this.Set(this.Current);
            },
            help: function () {
                this.Current = "help";
                this.Set(this.Current);
            },
            move: function () {
                this.Current = "move";
                this.Set(this.Current);
            },
            nesw_resize: function () { // northeast - southwest
                this.Current = "move";
                this.Set(this.Current);
            },
            ns_resize: function () {
                this.Current = "ns-resize";
                this.Set(this.Current);
            },
            nwse_resize: function () { // northwest - southeast
                this.Current = "ns-resize";
            },
            no_drop: function () {
                this.Current = "no-drop";
                this.Set(this.Current);
            },
            none: function () {
                this.Current = "none";
                this.Set(this.Current);
            },
            not_allowed: function () {
                this.Current = "not-allowed";
                this.Set(this.Current);
            },
            pointer: function () {
                this.Current = "pointer";
                this.Set(this.Current);
            },
            progress: function () {
                this.Current = "progress";
                this.Set(this.Current);
            },
            row_resize: function () {
                this.Current = "row-resize";
                this.Set(this.Current);
            },
            text: function () {
                this.Current = "text";
                this.Set(this.Current);
            },
            vertical_text: function () {
                this.Current = "vertical-text";
                this.Set(this.Current);
            },
            wait: function () {
                this.Current = "wait";
                this.Set(this.Current);
            },
            zoom_in: function () {
                this.Current = "zoom-in";
                this.Set(this.Current);
            },
            zoom_out: function () {
                this.Current = "zoom-out";
                this.Set(this.Current);
            }
        }
    },

    // Pressed - is a boolean, which describes if the Key is pressed while in current frame
    // FramesPressed - is an Integer between [-1, M], which counts the frames, while being pressed
    // Tipp: use an if-statement "if(FramesPressed==1)" to trigger a function only once
    // "if(Pressed)" triggers a function every frame, in which the key is pressed
    Key: {

        Event: {},
        Symbol: "",
        KeyNotFound: {Pressed: false, FramesPressed: 0},
        AnyKey: {Pressed: false, FramesPressed: 0},
        A: {Pressed: false, FramesPressed: 0},
        B: {Pressed: false, FramesPressed: 0},
        C: {Pressed: false, FramesPressed: 0},
        D: {Pressed: false, FramesPressed: 0},
        E: {Pressed: false, FramesPressed: 0},
        F: {Pressed: false, FramesPressed: 0},
        G: {Pressed: false, FramesPressed: 0},
        H: {Pressed: false, FramesPressed: 0},
        I: {Pressed: false, FramesPressed: 0},
        J: {Pressed: false, FramesPressed: 0},
        K: {Pressed: false, FramesPressed: 0},
        L: {Pressed: false, FramesPressed: 0},
        M: {Pressed: false, FramesPressed: 0},
        N: {Pressed: false, FramesPressed: 0},
        O: {Pressed: false, FramesPressed: 0},
        P: {Pressed: false, FramesPressed: 0},
        Q: {Pressed: false, FramesPressed: 0},
        R: {Pressed: false, FramesPressed: 0},
        S: {Pressed: false, FramesPressed: 0},
        T: {Pressed: false, FramesPressed: 0},
        U: {Pressed: false, FramesPressed: 0},
        V: {Pressed: false, FramesPressed: 0},
        W: {Pressed: false, FramesPressed: 0},
        X: {Pressed: false, FramesPressed: 0},
        Y: {Pressed: false, FramesPressed: 0},
        Z: {Pressed: false, FramesPressed: 0},

        Control: {Pressed: false, FramesPressed: 0},
        Shift: {Pressed: false, FramesPressed: 0},
        Alt: {Pressed: false, FramesPressed: 0},
        Tab: {Pressed: false, FramesPressed: 0},
        // Numbers
        Num0: {Pressed: false, FramesPressed: 0},
        Num1: {Pressed: false, FramesPressed: 0},
        Num2: {Pressed: false, FramesPressed: 0},
        Num3: {Pressed: false, FramesPressed: 0},
        Num4: {Pressed: false, FramesPressed: 0},
        Num5: {Pressed: false, FramesPressed: 0},
        Num6: {Pressed: false, FramesPressed: 0},
        Num7: {Pressed: false, FramesPressed: 0},
        Num8: {Pressed: false, FramesPressed: 0},
        Num9: {Pressed: false, FramesPressed: 0},
        // Numbers-End
        Up: {Pressed: false, FramesPressed: 0},
        Right: {Pressed: false, FramesPressed: 0},
        Down: {Pressed: false, FramesPressed: 0},
        Left: {Pressed: false, FramesPressed: 0},

        Backspace: {Pressed: false, FramesPressed: 0},
        Space: {Pressed: false, FramesPressed: 0},
        Enter: {Pressed: false, FramesPressed: 0},
        Esc: {Pressed: false, FramesPressed: 0}

    },
    Canvas: new function () {
        this.X = 0;
        this.Y = 0,
                this.Width = 0;
        this.Height = 0;
        this.MouseOn = false;
    },
    /**
     * Calculates and saves the mouse position and all its concequential information needed by the user
     * @returns {undefined}
     */
    Update: function () {

        /* ++++++++++++++++++++++++++++++ */
        /* ++++++++++ Mouse +++++++++++++ */
        {
            var e = this.Engine.Input.Mouse.EventObject;

            var mouse = this.Engine.Input.Mouse;
            if (mouse.Left.BusyFrames > 0)
                mouse.Left.BusyFrames--;
            if (mouse.Right.BusyFrames > 0)
                mouse.Right.BusyFrames--;

            var pos = mouse.Position;
            pos.Xold = pos.X;
            pos.Yold = pos.Y;
            if (e && e.pageX) {
                pos.X = e.pageX;
                pos.Y = e.pageY;
            } else {
                pos.X = 0;
                pos.Y = 0;
            }
            pos.Relative.X = pos.X - this.Engine.Input.Canvas.X;
            pos.Relative.Y = pos.Y - this.Engine.Input.Canvas.Y;
            pos.Camera.X = pos.X - this.Engine.Input.Canvas.X + this.Engine.Camera.SelectedCamera.X;
            pos.Camera.Y = pos.Y - this.Engine.Input.Canvas.Y + this.Engine.Camera.SelectedCamera.Y;
            pos.Delta.X = pos.X - pos.Xold;
            pos.Delta.Y = pos.Y - pos.Yold;

            // check if the mouse is on the canvas
            var mx = this.Engine.Input.Mouse.Position.X;
            var my = this.Engine.Input.Mouse.Position.Y;
            if (this.Canvas.X <= mx && mx < (this.Canvas.X + this.Canvas.Width) && this.Canvas.Y <= my && my < (this.Canvas.Y + this.Canvas.Height))
                this.Canvas.MouseOn = true;
            else
                this.Canvas.MouseOn = false;
            // cursor update
            this.Mouse.Cursor.Update();
        }

        /* ++++++++++++++++++++++++++++++ */
        /* ++++++++++ Keys ++++++++++++++ */
        {
            var input = this.Engine.Input;

            if (input.Key.AnyKey.Pressed)
                input.Key.AnyKey.FramesPressed++;

            if (input.Key.A.Pressed)
                input.Key.A.FramesPressed++;
            if (input.Key.B.Pressed)
                input.Key.B.FramesPressed++;
            if (input.Key.C.Pressed)
                input.Key.C.FramesPressed++;
            if (input.Key.D.Pressed)
                input.Key.D.FramesPressed++;
            if (input.Key.E.Pressed)
                input.Key.E.FramesPressed++;
            if (input.Key.F.Pressed)
                input.Key.F.FramesPressed++;
            if (input.Key.G.Pressed)
                input.Key.G.FramesPressed++;
            if (input.Key.H.Pressed)
                input.Key.H.FramesPressed++;
            if (input.Key.I.Pressed)
                input.Key.I.FramesPressed++;
            if (input.Key.J.Pressed)
                input.Key.J.FramesPressed++;
            if (input.Key.K.Pressed)
                input.Key.K.FramesPressed++;
            if (input.Key.L.Pressed)
                input.Key.L.FramesPressed++;
            if (input.Key.M.Pressed)
                input.Key.M.FramesPressed++;
            if (input.Key.N.Pressed)
                input.Key.N.FramesPressed++;
            if (input.Key.O.Pressed)
                input.Key.O.FramesPressed++;
            if (input.Key.P.Pressed)
                input.Key.P.FramesPressed++;
            if (input.Key.Q.Pressed)
                input.Key.Q.FramesPressed++;
            if (input.Key.R.Pressed)
                input.Key.R.FramesPressed++;
            if (input.Key.S.Pressed)
                input.Key.S.FramesPressed++;
            if (input.Key.T.Pressed)
                input.Key.T.FramesPressed++;
            if (input.Key.U.Pressed)
                input.Key.U.FramesPressed++;
            if (input.Key.V.Pressed)
                input.Key.V.FramesPressed++;
            if (input.Key.W.Pressed)
                input.Key.W.FramesPressed++;
            if (input.Key.X.Pressed)
                input.Key.X.FramesPressed++;
            if (input.Key.Y.Pressed)
                input.Key.Y.FramesPressed++;
            if (input.Key.Z.Pressed)
                input.Key.Z.FramesPressed++;

            if (input.Key.Control.Pressed)
                input.Key.Control.FramesPressed++;
            if (input.Key.Shift.Pressed)
                input.Key.Shift.FramesPressed++;
            if (input.Key.Alt.Pressed)
                input.Key.Alt.FramesPressed++;
            if (input.Key.Tab.Pressed)
                input.Key.Tab.FramesPressed++;

            if (input.Key.Num0.Pressed)
                input.Key.Num0.FramesPressed++;
            if (input.Key.Num1.Pressed)
                input.Key.Num1.FramesPressed++;
            if (input.Key.Num2.Pressed)
                input.Key.Num2.FramesPressed++;
            if (input.Key.Num3.Pressed)
                input.Key.Num3.FramesPressed++;
            if (input.Key.Num4.Pressed)
                input.Key.Num4.FramesPressed++;
            if (input.Key.Num5.Pressed)
                input.Key.Num5.FramesPressed++;
            if (input.Key.Num6.Pressed)
                input.Key.Num6.FramesPressed++;
            if (input.Key.Num7.Pressed)
                input.Key.Num7.FramesPressed++;
            if (input.Key.Num8.Pressed)
                input.Key.Num8.FramesPressed++;
            if (input.Key.Num9.Pressed)
                input.Key.Num9.FramesPressed++;

            if (input.Key.Up.Pressed)
                input.Key.Up.FramesPressed++;
            if (input.Key.Right.Pressed)
                input.Key.Right.FramesPressed++;
            if (input.Key.Down.Pressed)
                input.Key.Down.FramesPressed++;
            if (input.Key.Left.Pressed)
                input.Key.Left.FramesPressed++;

            if (input.Key.Backspace.Pressed)
                input.Key.Backspace.FramesPressed++;
            if (input.Key.Space.Pressed)
                input.Key.Space.FramesPressed++;
            if (input.Key.Enter.Pressed)
                input.Key.Enter.FramesPressed++;
            if (input.Key.Esc.Pressed)
                input.Key.Esc.FramesPressed++;

            if (input.Mouse.Left.Down)
                input.Mouse.Left.FramesDown++;
            if (input.Mouse.Right.Down)
                input.Mouse.Right.FramesDown++;
            if (input.Mouse.Left.Up)
                input.Mouse.Left.FramesUp++;
            if (input.Mouse.Right.Up)
                input.Mouse.Right.FramesUp++;
        }

        if (this.Engine.Flags.TouchHandler)
            this.TouchHandler.Update();
        
    },
    // registers mouse events (those events are not bound to the frame() - the callback function is triggered when the user activates them )
    Initialize: function () {

        this.CalculateCanvasPosition();

        // register some needed event handler
        //this.RegisterKeyEvents(this.Flags.PreventKeyboardStrokesToBubbleUp);
        this.RegisterKeyEvents(this.Engine.Flags.PreventKeyboardStrokesToBubbleUp);
        //this.RegisterMouseEvents();
        this.RegisterMouseEvents(this.Engine.Flags.PreventContextClickBubbleToUp);

        this.RegisterResizeEvent();

        this.MouseHandler = new MouseHandler();
        
        if(this.Engine.Flags.TouchHandler)
            this.TouchHandler = new TouchHandler();
        
    },
    CalculateCanvasPosition: function () {
        // getting the real position of the canvas 
        var ele = this.Engine.Canvas;
        var x = 0, y = 0;
        this.Canvas.Width = ele.width;
        this.Canvas.Height = ele.height;
        // Mozilla Only
        //var test = this.Engine.Canvas.getBoundingClientRect();

        var i = 200;
        x += ele.offsetLeft;
        y += ele.offsetTop;

        while (ele.offsetParent && ele.offsetParent.nodeName != "BODY" && i > 0) {
            i--;
            x += ele.offsetLeft;
            y += ele.offsetTop;
            ele = ele.parentNode;
        }
        this.Canvas.X = x;
        this.Canvas.Y = y;

    },
    RegisterKeyEvents: function (lockKeys) {

        var onkeydown = function (e) {

            var input = e.data.Input;

            input.Key.Event = e;
            if (e.key)
                input.Key.Symbol = e.key;
            else {
                input.Key.Symbol = String.getKeyByEvent(e);
            }
            input.Key.AnyKey.Pressed = true;

            switch (e.which) {

                case 65 :
                    {
                        input.Key.A.Pressed = true;
                    }
                    ;
                    break;
                case 66 :
                    {
                        input.Key.B.Pressed = true;
                    }
                    ;
                    break;
                case 67 :
                    {
                        input.Key.C.Pressed = true;
                    }
                    ;
                    break;
                case 68 :
                    {
                        input.Key.D.Pressed = true;
                    }
                    ;
                    break;
                case 69 :
                    {
                        input.Key.E.Pressed = true;
                    }
                    ;
                    break;
                case 70 :
                    {
                        input.Key.F.Pressed = true;
                    }
                    ;
                    break;
                case 71 :
                    {
                        input.Key.G.Pressed = true;
                    }
                    ;
                    break;
                case 72 :
                    {
                        input.Key.H.Pressed = true;
                    }
                    ;
                    break;
                case 73 :
                    {
                        input.Key.I.Pressed = true;
                    }
                    ;
                    break;
                case 74 :
                    {
                        input.Key.J.Pressed = true;
                    }
                    ;
                    break;
                case 75 :
                    {
                        input.Key.K.Pressed = true;
                    }
                    ;
                    break;
                case 76 :
                    {
                        input.Key.L.Pressed = true;
                    }
                    ;
                    break;
                case 77 :
                    {
                        input.Key.M.Pressed = true;
                    }
                    ;
                    break;
                case 78 :
                    {
                        input.Key.N.Pressed = true;
                    }
                    ;
                    break;
                case 79 :
                    {
                        input.Key.O.Pressed = true;
                    }
                    ;
                    break;
                case 80 :
                    {
                        input.Key.P.Pressed = true;
                    }
                    ;
                    break;
                case 81 :
                    {
                        input.Key.Q.Pressed = true;
                    }
                    ;
                    break;
                case 82 :
                    {
                        input.Key.R.Pressed = true;
                    }
                    ;
                    break;
                case 83 :
                    {
                        input.Key.S.Pressed = true;
                    }
                    ;
                    break;
                case 84 :
                    {
                        input.Key.T.Pressed = true;
                    }
                    ;
                    break;
                case 85 :
                    {
                        input.Key.U.Pressed = true;
                    }
                    ;
                    break;
                case 86 :
                    {
                        input.Key.V.Pressed = true;
                    }
                    ;
                    break;
                case 87 :
                    {
                        input.Key.W.Pressed = true;
                    }
                    ;
                    break;
                case 88 :
                    {
                        input.Key.X.Pressed = true;
                    }
                    ;
                    break;
                case 89 :
                    {
                        input.Key.Y.Pressed = true;
                    }
                    ;
                    break;
                case 90 :
                    {
                        input.Key.Z.Pressed = true;
                    }
                    ;
                    break;

                case 17 :
                    {
                        input.Key.Control.Pressed = true;
                    }
                    ;
                    break;
                case 16 :
                    {
                        input.Key.Shift.Pressed = true;
                    }
                    ;
                    break;
                case 18 :
                    {
                        input.Key.Alt.Pressed = true;
                    }
                    ;
                    break;
                case 9 :
                    {
                        input.Key.Tab.Pressed = true;
                    }
                    ;
                    break;

                case 48 :
                    {
                        input.Key.Num0.Pressed = true;
                    }
                    ;
                    break;
                case 49 :
                    {
                        input.Key.Num1.Pressed = true;
                    }
                    ;
                    break;
                case 50 :
                    {
                        input.Key.Num2.Pressed = true;
                    }
                    ;
                    break;
                case 51 :
                    {
                        input.Key.Num3.Pressed = true;
                    }
                    ;
                    break;
                case 52 :
                    {
                        input.Key.Num4.Pressed = true;
                    }
                    ;
                    break;
                case 53 :
                    {
                        input.Key.Num5.Pressed = true;
                    }
                    ;
                    break;
                case 54 :
                    {
                        input.Key.Num6.Pressed = true;
                    }
                    ;
                    break;
                case 55 :
                    {
                        input.Key.Num7.Pressed = true;
                    }
                    ;
                    break;
                case 56 :
                    {
                        input.Key.Num8.Pressed = true;
                    }
                    ;
                    break;
                case 57 :
                    {
                        input.Key.Num9.Pressed = true;
                    }
                    ;
                    break;

                case 38 :
                    {
                        input.Key.Up.Pressed = true;
                    }
                    ;
                    break;
                case 39 :
                    {
                        input.Key.Right.Pressed = true;
                    }
                    ;
                    break;
                case 40 :
                    {
                        input.Key.Down.Pressed = true;
                    }
                    ;
                    break;
                case 37 :
                    {
                        input.Key.Left.Pressed = true;
                    }
                    ;
                    break;

                case 8 :
                    {
                        input.Key.Backspace.Pressed = true;
                    }
                    ;
                    break;
                case 32 :
                    {
                        input.Key.Space.Pressed = true;
                    }
                    ;
                    break;
                case 13 :
                    {
                        input.Key.Enter.Pressed = true;
                    }
                    ;
                    break;
                case 27 :
                    {
                        input.Key.Esc.Pressed = true;
                    }
                    ;
                    break;
                default :
                    {
                        input.Key.KeyNotFound.Pressed = true;
                    }
                    ;
                    break;
            }

            if (!lockKeys) {
                // no other elements react to key strokes
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        var onkeyup = function (e) {
            var input = e.data.Input;
            input.Key.Event = e;
            if (e.key)
                input.Key.Symbol = e.key;
            else {
                input.Key.Symbol = String.fromCharCode(e.which).toLowerCase();
            }
            input.Key.AnyKey.Pressed = false;
            input.Key.AnyKey.FramesPressed = 0;

            switch (e.which) {

                case 65 :
                    {
                        input.Key.A.Pressed = false;
                        input.Key.A.FramesPressed = 0;
                    }
                    ;
                    break;
                case 66 :
                    {
                        input.Key.B.Pressed = false;
                        input.Key.B.FramesPressed = 0;
                    }
                    ;
                    break;
                case 67 :
                    {
                        input.Key.C.Pressed = false;
                        input.Key.C.FramesPressed = 0;
                    }
                    ;
                    break;
                case 68 :
                    {
                        input.Key.D.Pressed = false;
                        input.Key.D.FramesPressed = 0;
                    }
                    ;
                    break;
                case 69 :
                    {
                        input.Key.E.Pressed = false;
                        input.Key.E.FramesPressed = 0;
                    }
                    ;
                    break;
                case 70 :
                    {
                        input.Key.F.Pressed = false;
                        input.Key.F.FramesPressed = 0;
                    }
                    ;
                    break;
                case 71 :
                    {
                        input.Key.G.Pressed = false;
                        input.Key.G.FramesPressed = 0;
                    }
                    ;
                    break;
                case 72 :
                    {
                        input.Key.H.Pressed = false;
                        input.Key.H.FramesPressed = 0;
                    }
                    ;
                    break;
                case 73 :
                    {
                        input.Key.I.Pressed = false;
                        input.Key.I.FramesPressed = 0;
                    }
                    ;
                    break;
                case 74 :
                    {
                        input.Key.J.Pressed = false;
                        input.Key.J.FramesPressed = 0;
                    }
                    ;
                    break;
                case 75 :
                    {
                        input.Key.K.Pressed = false;
                        input.Key.K.FramesPressed = 0;
                    }
                    ;
                    break;
                case 76 :
                    {
                        input.Key.L.Pressed = false;
                        input.Key.L.FramesPressed = 0;
                    }
                    ;
                    break;
                case 77 :
                    {
                        input.Key.M.Pressed = false;
                        input.Key.M.FramesPressed = 0;
                    }
                    ;
                    break;
                case 78 :
                    {
                        input.Key.N.Pressed = false;
                        input.Key.N.FramesPressed = 0;
                    }
                    ;
                    break;
                case 79 :
                    {
                        input.Key.O.Pressed = false;
                        input.Key.O.FramesPressed = 0;
                    }
                    ;
                    break;
                case 80 :
                    {
                        input.Key.P.Pressed = false;
                        input.Key.P.FramesPressed = 0;
                    }
                    ;
                    break;
                case 81 :
                    {
                        input.Key.Q.Pressed = false;
                        input.Key.Q.FramesPressed = 0;
                    }
                    ;
                    break;
                case 82 :
                    {
                        input.Key.R.Pressed = false;
                        input.Key.R.FramesPressed = 0;
                    }
                    ;
                    break;
                case 83 :
                    {
                        input.Key.S.Pressed = false;
                        input.Key.S.FramesPressed = 0;
                    }
                    ;
                    break;
                case 84 :
                    {
                        input.Key.T.Pressed = false;
                        input.Key.T.FramesPressed = 0;
                    }
                    ;
                    break;
                case 85 :
                    {
                        input.Key.U.Pressed = false;
                        input.Key.U.FramesPressed = 0;
                    }
                    ;
                    break;
                case 86 :
                    {
                        input.Key.V.Pressed = false;
                        input.Key.V.FramesPressed = 0;
                    }
                    ;
                    break;
                case 87 :
                    {
                        input.Key.W.Pressed = false;
                        input.Key.W.FramesPressed = 0;
                    }
                    ;
                    break;
                case 88 :
                    {
                        input.Key.X.Pressed = false;
                        input.Key.X.FramesPressed = 0;
                    }
                    ;
                    break;
                case 89 :
                    {
                        input.Key.Y.Pressed = false;
                        input.Key.Y.FramesPressed = 0;
                    }
                    ;
                    break;
                case 90 :
                    {
                        input.Key.Z.Pressed = false;
                        input.Key.Z.FramesPressed = 0;
                    }
                    ;
                    break;

                case 48 :
                    {
                        input.Key.Num0.Pressed = false;
                        input.Key.Num0.FramesPressed = 0;
                    }
                    ;
                    break;
                case 49 :
                    {
                        input.Key.Num1.Pressed = false;
                        input.Key.Num1.FramesPressed = 0;
                    }
                    ;
                    break;
                case 50 :
                    {
                        input.Key.Num2.Pressed = false;
                        input.Key.Num2.FramesPressed = 0;
                    }
                    ;
                    break;
                case 51 :
                    {
                        input.Key.Num3.Pressed = false;
                        input.Key.Num3.FramesPressed = 0;
                    }
                    ;
                    break;
                case 52 :
                    {
                        input.Key.Num4.Pressed = false;
                        input.Key.Num4.FramesPressed = 0;
                    }
                    ;
                    break;
                case 53 :
                    {
                        input.Key.Num5.Pressed = false;
                        input.Key.Num5.FramesPressed = 0;
                    }
                    ;
                    break;
                case 54 :
                    {
                        input.Key.Num6.Pressed = false;
                        input.Key.Num6.FramesPressed = 0;
                    }
                    ;
                    break;
                case 55 :
                    {
                        input.Key.Num7.Pressed = false;
                        input.Key.Num7.FramesPressed = 0;
                    }
                    ;
                    break;
                case 56 :
                    {
                        input.Key.Num8.Pressed = false;
                        input.Key.Num8.FramesPressed = 0;
                    }
                    ;
                    break;
                case 57 :
                    {
                        input.Key.Num9.Pressed = false;
                        input.Key.Num9.FramesPressed = 0;
                    }
                    ;
                    break;

                case 17 :
                    {
                        input.Key.Control.Pressed = false;
                        input.Key.Control.FramesPressed = 0;
                    }
                    ;
                    break;
                case 16 :
                    {
                        input.Key.Shift.Pressed = false;
                        input.Key.Shift.FramesPressed = 0;
                    }
                    ;
                    break;
                case 18 :
                    {
                        input.Key.Alt.Pressed = false;
                        input.Key.Alt.FramesPressed = 0;
                    }
                    ;
                    break;
                case 9 :
                    {
                        input.Key.Tab.Pressed = false;
                        input.Key.Tab.FramesPressed = 0;
                    }
                    ;
                    break;
                case 8 :
                    {
                        input.Key.Backspace.Pressed = false;
                        input.Key.Backspace.FramesPressed = 0;
                    }
                    ;
                    break;

                case 38 :
                    {
                        input.Key.Up.Pressed = false;
                        input.Key.Up.FramesPressed = 0;
                    }
                    ;
                    break;
                case 39 :
                    {
                        input.Key.Right.Pressed = false;
                        input.Key.Right.FramesPressed = 0;
                    }
                    ;
                    break;
                case 40 :
                    {
                        input.Key.Down.Pressed = false;
                        input.Key.Down.FramesPressed = 0;
                    }
                    ;
                    break;
                case 37 :
                    {
                        input.Key.Left.Pressed = false;
                        input.Key.Left.FramesPressed = 0;
                    }
                    ;
                    break;

                case 32 :
                    {
                        input.Key.Space.Pressed = false;
                        input.Key.Space.FramesPressed = 0;
                    }
                    ;
                    break;
                case 13 :
                    {
                        input.Key.Enter.Pressed = false;
                        input.Key.Enter.FramesPressed = 0;
                    }
                    ;
                    break;
                case 27 :
                    {
                        input.Key.Esc.Pressed = false;
                        input.Key.Esc.FramesPressed = 0;
                    }
                    ;
                    break;
                default :
                    {
                        input.Key.KeyNotFound.Pressed = false;
                        input.Key.KeyNotFound.FramesPressed = 0;
                    }
                    ;
                    break;

            }
            if (!lockKeys) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        this.KeyDownEvent = $(document).keydown(this.Engine, onkeydown);
        this.KeyUpEvent = $(document).keyup(this.Engine, onkeyup);

        // if the script runs on a (same-origin) document within an iframe (or popup?)
        if (window.top != window.self) {
            try {
                this.ParentKeyDownEvent = $(window.parent.document).keydown(this.Engine, onkeydown);
                this.ParentKeyUpEvent = $(window.parent.document).keyup(this.Engine, onkeyup);
            } catch (e) {

            }
        }
    },
    RegisterMouseEvents: function (lockContext) {

        this.MouseMoveEvent = $(document).mousemove(this.Engine, function (e) {
            e.data.Input.Mouse.EventObject = e;
        });
        this.MouseDownEvent = $(document).mousedown(this.Engine, function (e) {

            e.data.Input.Mouse.DownEvent = e;

            var input = e.data.Input.Mouse;
            if (e.which == 1) {
                input.Left.Down = true;
                input.Left.Up = false;
                input.Left.FramesUp = 0;
            }
            if (e.which == 3) {
                input.Right.Down = true;
                input.Right.Up = false;
                input.Right.FramesUp = 0;
            }
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;

        });
        this.MouseUpEvent = $(document).mouseup(this.Engine, function (e) {

            e.data.Input.Mouse.UpEvent = e;

            var input = e.data.Input.Mouse;
            if (e.which == 1) {
                input.Left.Down = false;
                input.Left.Up = true;
                input.Left.FramesDown = 0;
            }
            if (e.which == 3) {
                input.Right.Down = false;
                input.Right.Up = true;
                input.Right.FramesDown = 0;
            }
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
        });

        this.MouseWheelEvent = $(window).bind("wheel", this, function (e) {

            var that = e.data;
            if (that.Canvas.MouseOn) {

                var dy = e.originalEvent.deltaY;
                var dx = e.originalEvent.deltaX;

                that.MouseHandler.WheelHandler(dx, dy);

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        });


        // cancels the right-click or context menu for the canvas
        if (lockContext)
            this.Engine.Canvas.oncontextmenu = function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.cancelBubble = true;
                return false;
            };
    },
    RegisterResizeEvent: function () {
        this.ResizeEvent = $(window).resize(this.Engine, function (d) {
            d.data.Input.CalculateCanvasPosition();
            d.data.Engine.IsCanvasFitToScreen = false;
        });
    },
    UnregisterKeyEvents: function () {
        if (this.KeyUpEvent) {
            $(document).unbind(this.KeyUpEvent);
            this.KeyUpEvent = "undefined";
        }
        if (this.KeyDownEvent) {
            $(document).unbind(this.KeyDownEvent);
            this.KeyDownEvent = "undefined";
        }
    },
    UnregisterMouseEvents: function () {
        if (this.MouseUpEvent) {
            $(document).unbind(this.MouseUpEvent);
            this.MouseUpEvent = "undefined";
        }
        if (this.MouseDownEvent) {
            $(document).unbind(this.MouseDownEvent);
            this.MouseDownEvent = "undefined";
        }
    },
    UnregisterResizeEvent: function () {
        if (this.ResizeEvent) {
            $(window).unbind(this.ResizeEvent);
            this.ResizeEvent = "undefined";
        }
    },

    FakeMouseClick: function (x, y) {
        //console.log("fake mouse down: {0},{1}".format( x, y) );
        var releaseLength = 300;

        var fe = {
            pageX: x, pageY: y, clientX: x, clientY: y, which: 1
        };

        this.Engine.Input.Mouse.EventObject = fe;
        this.Engine.Input.Mouse.Left.Down = true;
        this.Engine.Input.Mouse.Left.Up = false;
        this.Engine.Input.Mouse.Left.FramesUp = 0;

        var upf = function () {
            //console.log("fake mouse up: {0},{1}".format( x, y) );
            var fe = {
                pageX: x, pageY: y, clientX: x, clientY: y, which: 1
            };

            this.Input.Mouse.EventObject = fe;
            this.Input.Mouse.Left.Down = false;
            this.Input.Mouse.Left.Up = true;
            this.Input.Mouse.Left.FramesDown = 0;
        };

        window.setTimeout(upf.bind(this.Engine), releaseLength);

    }
};

// ################################### Storage Manager
/**
 * @description Adding a local storage function to the Engine, so values can be saved beyond sessions
 * @returns 
 */
Engine.prototype.Storage = {
    Pre: "AniBody_",
    // flag wether browser allows html5-local storage or engine needs to use cookies as pieces
    BrowserAllowsLocalStorage: false,
    Object: {},
    ObjectString: "",

    Engine: false,

    /**
     * @description Function initiliazes the storage by testing wether the HTML5-Local Storage feature is availible or not and invokes the needed functions for restoring the storage
     * @returns {undefined}
     */
    InitStorage: function () {
        if (this.IsLocalStorageAvailable())
            this.BrowserAllowsLocalStorage = true;
        else
            this.BrowserAllowsLocalStorage = false;

        //GetStorageFromBrowser
        if (this.BrowserAllowsLocalStorage) {
            var str = localStorage[this.Pre];
            if (!str)
                this.ObjectString = "{}";
            else
                this.ObjectString = str;
        }

        // UpdateObject();
        if (this.ObjectString.length < 3) {
            this.Engine.HandleError({code: 101, msg: "Storage is empty"});
        } else {
            var str = this.ObjectString;
            this.Object = JSON.parse(str);
        }

        $(window).unload(this.Engine, function (e) {
            var engine = e.data;
            engine.Storage.WriteStorageToBrowser();
        });

    },

    /**
     * @description easy test if html 5 local storage is active or not
     */
    IsLocalStorageAvailable: function () {
        var test = this.Pre + 'test' + Date.now();
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * @description searches if the object has an attribte "name" and returnes its value or false if not found
     * @returns Value
     */
    Read: function (name) {
        var res = this.Object[name];
        var e;
        if (res)
            return res;
        else {
            e = {code: 404, msg: "Storage has no attribute called " + name};
            this.Engine.HandleError(e);
            return e;
        }
    },

    /**
     * @description writes the value "val" to the attribute "name"
     * @returns val
     */
    Write: function (key, val) {
        this.Object[key] = val;
        // updating ObjectString by stringify complete Object
        this.ObjectString = JSON.stringify(this.Object);
        return val;
    },

    /**
     * @description Deletes the key and the key-value - if no key is specified, function deletes whole storage
     * @param {String} Key that will be deleted 
     * @returns {undefined}
     */
    Delete: function (key) {
        if (arguments.length === 0) {
            this.Object = {};
            this.ObjectString = "{}";
        } else
            try {
                this.Object[key] = "undefined";
            } catch (e) {
                e = {code: 403, msg: "Storage has no attribute called " + key};
                this.Engine.HandleError(e);
            }
    },

    /**
     * @description writes the ObjectString to the LocalStorage so the Storage can be used the next time
     * @returns undefined
     */
    WriteStorageToBrowser: function () {
        if (this.BrowserAllowsLocalStorage) {
            localStorage[this.Pre] = this.ObjectString;
        }
    }

};

Engine.prototype.Font = {

    Default: "10px sans-serif",

    Type: {
        Arial: "Arial",
        Verdana: "Verdana",
        TimesNewRoman: "Times New Roman",
        CourierNew: "Courier New",
        serif: "serif",
        sans_serif: "sans-serif",
        BrowserSpecific: {
            Caption: "caption",
            Icon: "icon",
            Menu: "menu",
            MessageBox: "message-box",
            SmallCaption: "small-caption",
            StatusBar: "status-bar"
        }
    },

    Variant: {
        normal: "normal",
        small_caps: "small-caps"
    },

    Style: {
        normal: "normal",
        italic: "italic",
        oblique: "oblique"
    },

    Weight: {
        normal: "normal",
        bold: "bold",
        bolder: "bolder",
        lighter: "lighter"
    },

    getContextFontString: function () {
        if (arguments.length == 0)
            return this.Default;
        var str = "";
        for (var i = 0; i < arguments.length; i++)
            if (typeof arguments[i] == "number")
                str += arguments[i] + "px ";
            else
                str += arguments[i] + " ";
        return str;
    },

    setContextFontString: function (c) {
        if (arguments.length == 0)
            return false;
        if (arguments.length == 1)
            c.font = this.Default;
        var str = "";
        for (var i = 1; i < arguments.length; i++)
            if (typeof arguments[i] == "number")
                str += arguments[i] + "px ";
            else
                str += arguments[i] + " ";
        c.font = str;
    }
};
/**
 * prints the image of a given data url or just the image of the current canvas state
 * @param {string} url - data url of an image (optional)
 * @returns {undefined} */
Engine.prototype.Print = function (url) {
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