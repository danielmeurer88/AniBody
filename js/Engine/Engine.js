
function Engine(html_id){

    // ### INFO
    this.Info = {
        Engine : "AniBody",
        Version : "0.942",
        Author : "Daniel Meurer",
        Project : "Developing",
        LastUpdated : "2016_11_17:16" // year_month_day:hour
    };
    
    // Check if jQuery framework is active - $.fn is typicall for jQuery but not a difinite proof for jQuery
    if($ && $.fn){
        if(!$.EngineArray){
            $.EngineArray = [];
        }
        this.EI = $.EngineArray.length;
        $.EngineArray.push(this);
        $.Engine = this;
    }
    else{
        this.Info.Error = "jQuery is probably not set up";
        return false;
    }
    
    // ### FLAGS
    this.ConstantLoop = true; // flag if developer wants to have a timer, which constantly triggers Frame() (input, update, draw) or self responsible
    this.PreventKeyboardStrokesToBubbleUp = true;
    this.PreventContextClickBubbleToUp = true;
    
    this.Modul = {};
    this.Modul.MediaManager = true;
    this.Modul.CausalityManager = true;
    
    this.Touch = {
        DetectionEnabled : true, // flag if touch handle will be registered
        PreventScrolling : true, // flag if a touch move should cause scrolling
        FakeMouseClick : true, // flag if an object will be saved where the mouse event is expected causing that it looks like a mouse click when tapped
        PiesAllowed : false, // flag if pies should be used instead of long taps
        LongTapThreshold : 300, // millisecond difference between normal tap and long
        MovementStabilizer : 50,
        SwipeThreshold : 150
    };
    
    // ### PROPERTIES - STATE OF ENGINE
    this.Paused = false;
    
    // ### PROPERTIES
    
    // the Object Loop, where all external objects will be saved and the currently important/selected one
    this.Objects = {
        Queue : null,
        SelectedObject : null 
    };
    
    this.CanvasID = html_id;// the id string
    this.Canvas = {};// the canvas object
    this.Canvas.ScreenRatio = 0;
    
    this.CausalityManager;

    
    // after the user uses the first touch event, it will be true
    this.IsTouchDevice = false;
    this.IsCanvasFitToScreen = false;

    this.Context;// the context of the canvas object
    this.Camera = {SelectedCamera : false, Cameras: false};// place holder for all needed camera (in later progress it will be possible to have more than just one camera)
    this.Counter;// the variable for the counter object
    this.Log = [];// most error messages are sent here
    this.ProcessInputFunctions = [];// array of all functions, which the user added and which concern the input processing
    this.UpdateFunctions = []; // array of all functions, which the user added and which concern the update process
    this.ImageData = null;// the variable for the ImageData of the canvas, if need be. maybe deprecated
    this.FPS = 25;// the amount of frames per second (default: 25)
    this.Timer; // wildcard for the Timer, which regulates, that the frame-functions is called 'this.FPS' times per second
    
    this.MediaManager = {};
    this.Terrain = {};
    this.DebugList = {};
        
    // unique Alert-look
    this.Alert = { 
        FramesLeft : 0,
        Text : "",
        TextHeight : 16,
        TextWidth : 0,
        ColorBackground : "rgba(99,99,99,0.4)",
        ColorBox : "rgb(240,240,240)",
        ColorText : "rgb(0,0,0)",
        X : 0,
        Y : 0,
        Padding : 20,
        Width : 0,
        Height : 0
};

this.Initialize();

}

/**
 * @description Returns the engine and can be saved in a new variable. Needed when there are more Engines in a website
 * Every new instance of Engine overwrites $.Engine
 * <i>every new instance is saved in $.EngineArray</i>
 * @returns {Engine.prototype}
 */
Engine.prototype.GetEngine = function(){
    return this;
};

/**
 * @description Getter so that an Engine instance does not have to call a global variable
 */
Object.defineProperty(Engine.prototype, "Engine", {get: function(){
        return $.EngineArray[this.EI];
}});

// Takes up the role of the constructor
Engine.prototype.Initialize = function(){
    this.MediaManager = new MediaManager();
    this.MediaManager.EI = this.EI;
    
    this.Canvas = document.getElementById(this.CanvasID);

    this.Canvas.PosNew = {x:0, y:0};
    this.Canvas.PosOld = {x:0, y:0};

    this.Canvas.ScreenRatio = this.Canvas.width / this.Canvas.height;

    this.Context = this.Canvas.getContext("2d");
    
    this.Input.Engine = this;
    this.Input.Mouse.Cursor.Engine = this;
    this.Input.Initialize();
    
    this.Objects.Queue = new PriorityQueue();

    // set the Counter function running
    this.Counter = new Counter();// the variable for the counter object
    this.AddUpdateFunction( new Callback({ function : this.Counter.Update, parameter : this.Counter, that:this.Counter }) );
    
    if(this.ConstantLoop)
        this.Timer = new Timer(this, this.Frame, this.FPS);
    
    this.Storage.Engine = this;
    this.Storage.InitStorage();
    
    this.CausalityManager = new RPGCausalityManager();

    this.DebugList = new DebugList();
};
 /**
 * @description before it starts the Engine, it checks if there is a Terrain object and a Camera selected, if not default objects are initialized
 */
Engine.prototype.Start = function(){
        
    if(!this.Engine.Terrain.Type)
        this.Engine.SetTerrain(new DefaultTerrain());

    if(!this.Engine.Camera.SelectedCamera || !this.Engine.Camera.SelectedCamera.Type)
        this.Engine.Camera.SelectedCamera = this.GetNewCamera("default");
    
    this.Engine.Objects.Queue.Sort();
    if(this.ConstantLoop)
        this.Engine.Timer.Start();
};

/**
 * 
 * @param {type} imgs Array of path-codename-objects
 * @description Loads the images specified in imgs first and then starts the Engine
 */
Engine.prototype.StartWithImages = function(imgs){

    this.Engine.MediaManager.AddImages(
        //MediaManagerImage-Object-Array
        imgs,
        //callback-function-object
        { function : this.Start, parameter: this, that: this }
    );

}
/**
 * @description stops the Engine
 */
Engine.prototype.Stop = function(){
    if(this.ConstantLoop)
        this.Timer.Stop();
};

// pauses and continues drawing and processing user input but not updating objects
Engine.prototype.Continue = function(){ this.Paused = false};
Engine.prototype.Pause = function(){ this.Paused = true};

// the beating heart of the Engine
Engine.prototype.Frame = function(){
    var e = arguments[0];
    e.ProcessInput();
    if(!e.Paused){
        e.Update();    
    }
    e.Draw();
};

/**
 * @description The functions adds an object to the ProcessInput(), which is a part of the frame()
 * @param {Object} pio = { function : func, parameter : obj } the function of this object is regularly triggered once per frame with the specific parameter as the first argument
 * @returns {undefined}
 */
Engine.prototype.AddProcessInputFunction = function(pio){this.ProcessInputFunctions.push(pio);};
/**
 * @description the function, which calls all functions concerning to process the user input
 * @returns {undefined}
 */
Engine.prototype.ProcessInput = function(){

    // set cursor to default - maybe an other object changes the cursor later in the same frame.
    this.Input.Mouse.Cursor.default();

    this.Input.Update();
    for(var i=0; i<this.ProcessInputFunctions.length;i++){
        this.ProcessInputFunctions[i].function(this.ProcessInputFunctions[i].parameter);
    }
};

/**
 * @description The functions adds an object to the Update(), which is a part of the frame()
 * @param {Object} fo = { function : func, parameter : obj } the function of this object is regularly triggered once per frame with the specific parameter as the first argument
 * @returns {undefined}
 */
Engine.prototype.AddUpdateFunction = function(fo){this.UpdateFunctions.push(fo);};
/**
 * @description the function, which calls all functions concerning to have the need to be updated every frame
 * @returns {undefined}
 */
Engine.prototype.Update = function(){

    if(this.IsTouchDevice && !this.IsCanvasFitToScreen){
        this.FitToScreen();
    }

    // get the actual position of the canvas
    this.Input.CalculateCanvasPosition();

    if(!this.Objects.Queue.Sorted)
        this.Objects.Queue.Sort();

    if(this.Terrain && this.Terrain.Update)
        this.Terrain.Update();

    // invoke update functions, which are externly included by the programmer of the engine
    for(var i=0; i<this.UpdateFunctions.length;i++){
        if(!this.UpdateFunctions[i].that)
            this.UpdateFunctions[i].function(this.UpdateFunctions[i].parameter);
        else
            this.UpdateFunctions[i].Call();
    }

    // invoke update functions of every object in the object queue as long as they have one
    var o;
    for(var i=0; i<this.Objects.Queue.heap.length;i++){
        o = this.GetObject(i);
        if(o && o.Update)
            o.Update();
    }
    
    if(this.Modul.MediaManager)
        this.MediaManager.Update();

    if(this.Touch.DetectionEnabled && this.Input.Touch.PieEnabled){
            this.Input.Touch.Pie.Update();
            this.Input.Touch.Pie2.Update();
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
Engine.prototype.Draw = function(){

    var c = this.Context;
    c.save();
    c.clearRect(0,0,this.Canvas.width, this.Canvas.height); // clear the complete canvas
    var o;

    this.Terrain.Draw(c); // draws the terrain first as a back-background

    // draws all Objects in the ObjQ if they own a Draw()-function and are not hidden
    // if the objects are drawn relative to the camera or statically to the canvas (HUD-like) is up to the Draw() in the certain object
    for(var i=0; i<this.Objects.Queue.heap.length;i++){
        o = this.GetObject(i);
        if(o && o.Draw)
            o.Draw(c);
    }
    
    if(this.Modul.MediaManager)
        this.MediaManager.Draw(c);
    
    if(this.Touch.DetectionEnabled && this.Input.Touch.PieEnabled){
//        this.Input.Touch.Pie.Draw(c);
//        this.Input.Touch.Pie2.Draw(c);
        this.Input.Touch.SelectedPie.Draw(c);
    }
    
    // the Alert Dialog is supposed to be on the top and if not hidden then always viewable
    if(this.Alert.FramesLeft > 0){
        this.DrawAlert(c);
        this.Alert.FramesLeft--;
    }
    
    this.DebugList.Draw(c);
    c.restore();
};

/**
 * @description function is used to set up the text, which is displayed and how many seconds
 * @param {String} text
 * @param {Integer} seconds
 * @returns {undefined}
 */
Engine.prototype.ShowAlert = function(text, seconds){

    var a = this.Alert;

    var c = this.Context;
    a.Text = text;
    a.FramesLeft = seconds * this.FPS;

    c.save();
    c.font = a.TextHeight + "px sans-serif";
    a.TextWidth = c.measureText(a.Text).width;
    c.restore();

    a.X = this.Canvas.width/2;
    a.Y = this.Canvas.height/2;
    a.Width = a.TextWidth + a.Padding*2;
    if(a.Width < this.Canvas.width/4) a.Width = this.Canvas.width/4;
    a.Height = a.TextHeight + a.Padding*2;
    if(a.Height < this.Canvas.height/4) a.Height = this.Canvas.height/4;


};
/**
 * @description function is only called by the Draw() function
 * @param {context} context of the Engine.Canvas
 * @returns {undefined}
 */
Engine.prototype.DrawAlert = function(c){
    var a = this.Alert;

    c.save();

    c.fillStyle = a.ColorBackground;
    c.fillRect(0,0,this.Canvas.width, this.Canvas.height);

    c.font = a.TextHeight + "px sans-serif";

    c.fillStyle = a.ColorBox;
    c.fillVariousRoundedRect(a.X - a.Width/2, a.Y - a.Height/2, a.Width, a.Height, 10);
    //c.fillVariousRoundedRect(a.X - a.Width/2, a.Y - a.Height/2, a.Width, a.Height, 10, 10, 10, 10);

    c.fillStyle = a.ColorText;
    c.textBaseline = "middle";
    c.fillText(a.Text, a.X - a.TextWidth/2, a.Y - a.TextHeight/2);

    c.restore();
};

/**
 * @description creates a link to download current canvas state as a png
 * @param {string|object} jQuery Selector
 * @param {string} the text of the Link 
 * @returns {undefined}
 */
Engine.prototype.CreateDownloadLink = function(selwhere,innerText){
    
    var a = document.createElement("A");
    var date = Date.now();
    
    $(a).text(innerText || "Download " + date);
    $(selwhere || "body").append(a);
    
    var data = this.Canvas.toDataURL();
    
    $(a).click(function(){
        this.href = data;
        this.download = "screenshot_{0}.png".format(date);
    });
    $(a).click();
};

/**
 * @description Returns the object at index i
 * @param {integer} i
 * @returns {result}
 */
Engine.prototype.GetObject = function(i){
    if(i < this.Objects.Queue.heap.length)
        return this.Objects.Queue.heap[i].data;
    else
        return false;
};
/**
 * @description Adds the object to the Objects Queue
 * @param {Object} obj
 * @param {Number} priority you can add an optional priority, which will influence the order of the objects
 * @returns {result}
 */
Engine.prototype.AddObject = function(obj, pr){
    obj.EI = this.EI;
    return this.Objects.Queue.Enqueue(obj, pr);
};
Engine.prototype.FlushQueue = function(){
    this.Objects.Queue.Flush();
    this.length = 0;
    this.SelectedObject="undefined";
};

/**
 * @description Adds the object to the ObjectQueue
 * @param {Object} obj
 * @returns {result}
 */
Engine.prototype.SetTerrain = function(t){
    t.EI = this.EI;
    this.Terrain = t;
};
/**
 * @description Adds extra Attributes and set default values. Register a physic function to the Update()-function so that the objects behaves according to the specified Type 
 * @param {Object} obj EngineObjects
 * @param {String} the type of the physic
 * @returns {undefined}
 */
Engine.prototype.FlushScene = function(){
    this.Objects.Queue.Flush();
    this.MediaManager.Flush();
};
/**
 * @description The Engines way how to handle errors
 * @param {Error} err
 * @returns {undefined}
 */
Engine.prototype.HandleError = function(err){
    this.Log.push(err);
};

Engine.prototype.GetNewCamera = function(type){
    var cam;
    
    if(!type || type == "default"){
        cam = new DefaultCamera();
    }
    
    if(type == "platform"){
        cam = new PlatformCamera();
    }
    
    if(type == "rpg"){
        cam = new RPGCamera();
    }
    
    cam.EI = this.EI;
    return cam;
};

Engine.prototype.GetCamera = function(){
    return this.Camera.SelectedCamera;
};

Engine.prototype.SetCamera = function(cam){
    this.Camera.SelectedCamera = cam;
};

Engine.prototype.FitToScreen = function(){
    var elem = this.Canvas;

        var w = $(window).width();
        var h = $(window).height();
        
        elem.width = w;
        elem.height = h;
        
        this.Canvas.ScreenRatio = w/h;
        
        this.IsCanvasFitToScreen = true;
};


//#################################### Input
Engine.prototype.Input = {
    
    Pie : false,
    Engine : false,
    
    MouseDownEvent : {},
    TouchStartEvent : {},
    KeyDownEvent : {},
    
    MouseUpEvent : {},
    TouchEndEvent : {},
    KeyUpEvent : {},
    
    MouseMoveEvent : {},
    TouchMoveEvent : {},
    
    ResizeEvent : {},
    
    Mouse : {
        EventObject : 0,
        
        Left : {
            Up : true,
            Down : false,
            FramesDown : 0,
            FramesUp : 0,
        },
        Right : {
            Up : true,
            Down : false,
            FramesDown : 0,
            FramesUp : 0
        },
        Position : {
            X : 0, // X-Coordinate to the 0/0-Point of the page
            Y : 0,
            Xold : 0,
            Yold : 0,
            Relative : {
                X : 0,       // X-Coordinate relative to the 0/0-Point of the canvas
                Y : 0       // used in Selecting Objects and such
            },
            Camera : {
                X : 0,       // X-Coordinate relative to the 0/0-Point of the camera, which relates to the Terrain-object
                Y : 0       // used for example for drawing objects on the Terrain
            }, 
            Delta : {X : 0, Y : 0} // the difference of the mouse position of the old frame and the current frame
                        // used for example with drag & drop
        },
        Cursor : {
    
            Current : "auto",
            OnlyCanvas : true,

            Update : function(){
                    $(this.Engine.Canvas).css("cursor", this.Current);  
            },
            Set : function(css){
                    $(this.Engine.Canvas).css("cursor", css);  
            },
            alias : function(){ 
                this.Current="alias"; this.Set(this.Current);
            },
            cell : function(){ 
                this.Current="cell";this.Set(this.Current);
            },
            col_resize : function(){ 
                this.Current="col-resize";this.Set(this.Current);
            },
            copy : function(){ 
                this.Current="copy";this.Set(this.Current);
            },
            crosshair : function(){ 
                this.Current="crosshair";this.Set(this.Current);
            },
            default : function(){ 
                this.Current="default";this.Set(this.Current);
            },
            ew_resize : function(){ // east-west resize
                this.Current="ew-resize";this.Set(this.Current);
            },
            grab : function(){ 
                this.Current="grab";this.Set(this.Current);
            },
            grabbing : function(){ 
                this.Current="grabbing";this.Set(this.Current);
            },
            help : function(){ 
                this.Current="help";this.Set(this.Current);
            },
            move : function(){ 
                this.Current="move";this.Set(this.Current);
            },
            nesw_resize : function(){ // northeast - southwest
                this.Current="move";this.Set(this.Current);
            },
            ns_resize : function(){ 
                this.Current="ns-resize";this.Set(this.Current);
            },
            nwse_resize : function(){ // northwest - southeast
                this.Current="ns-resize";
            },
            no_drop : function(){ 
                this.Current="no-drop";this.Set(this.Current);
            },
            none : function(){ 
                this.Current="none";this.Set(this.Current);
            },
            not_allowed : function(){ 
                this.Current="not-allowed";this.Set(this.Current);
            },
            pointer : function(){ 
                this.Current="pointer";this.Set(this.Current);
            },
            progress : function(){ 
                this.Current="progress";this.Set(this.Current);
            },
            row_resize : function(){ 
                this.Current="row-resize";this.Set(this.Current);
            },
            text : function(){ 
                this.Current="text";this.Set(this.Current);
            },
            vertical_text : function(){ 
                this.Current="vertical-text";this.Set(this.Current);
            },
            wait : function(){ 
                this.Current="wait";this.Set(this.Current);
            },
            zoom_in : function(){ 
                this.Current="zoom-in";this.Set(this.Current);
            },
            zoom_out : function(){ 
                this.Current="zoom-out";this.Set(this.Current);
            }
    },
    },
    
    Touch : {
        Expect : false,
        PieEnabled : false,
        Pie : false,
        Pie2 : false,
        SelectedPie : false,
        Touches : false,
        EventObject : false,
        
        StartTimeStamp : Date.now(), // start time of the current touch
        TimeStamp : Date.now(), // current time of the current touch
        TimeDelta : Date.now(), // current time difference between start and current time
        
        SecondFingerDetected : false,
        
        // the start position of finger 1
        X : 0,
        Y : 0,
        // and finger 2
        X2 : 0,
        Y2 : 0,
        
        TapFunctions : new PriorityQueue(false),
        LongTapFunctions : new PriorityQueue(false),
        SwipeFunctions : new PriorityQueue(false),
        Tap2Functions : new PriorityQueue(false),
        LongTap2Functions : new PriorityQueue(false),
        Swipe2Functions : new PriorityQueue(false),
        
        FirstTouch : false,
        SecondTouch : false,
        LastSwipe : {X:0,Y:0},
        /**
         * @description Register functions, which are triggered when there is a tap
         * @param {function} f
         * @param {Object} that - the objects is going to be the "this" in the function
         * @param {Object} parameter - will be the first parameter of the registered function
         * @param {Number} priority - the higher the priority the sooner it gets triggered
         * @returns {undefined}
         */
        RegisterTapFunction : function(f, priority, that, parameter){
            this.TapFunctions.Enqueue({function:f, that:that, parameter:parameter}, priority);
        },
        RegisterLongTapFunction : function(f, priority, that, parameter){
            this.LongTapFunctions.Enqueue({function:f, that:that, parameter:parameter}, priority);
        },
        RegisterTap2Function : function(f, priority, that, parameter){
            this.Tap2Functions.Enqueue({function:f, that:that, parameter:parameter}, priority);
        },
        RegisterLongTap2Function : function(f, priority, that, parameter){
            this.LongTap2Functions.Enqueue({function:f, that:that, parameter:parameter}, priority);
        },
        RegisterSwipeFunction : function(f, priority, that, parameter){
            this.SwipeFunctions.Enqueue({function:f, that:that, parameter:parameter}, priority);
        },
        RegisterSwipe2Function : function(f, priority, that, parameter){
            this.Swipe2Functions.Enqueue({function:f, that:that, parameter:parameter}, priority);
        },
        OnTap : function(){
            var arr = this.TapFunctions.heap;
            for(var i=0; i<arr.length; i++)
                arr[i].data.function.call(arr[i].data.that, arr[i].data.parameter);
        },
        OnTap2 : function(){
            var arr = this.Tap2Functions.heap;
            for(var i=0; i<arr.length; i++)
                arr[i].data.function.call(arr[i].data.that, arr[i].data.parameter);
        },
        OnLongTap : function(){
            var arr = this.LongTapFunctions.heap;
            for(var i=0; i<arr.length; i++)
                arr[i].data.function.call(arr[i].data.that, arr[i].data.parameter);
        },
        OnLongTap2 : function(){
            var arr = this.LongTap2Functions.heap;
            for(var i=0; i<arr.length; i++)
                arr[i].data.function.call(arr[i].data.that, arr[i].data.parameter);
        },
        OnSwipe : function(dir){
            this.LastSwipe = dir;
            var arr = this.SwipeFunctions.heap;
            for(var i=0; i<arr.length; i++)
                arr[i].data.function.call(arr[i].data.that, dir, arr[i].data.parameter);
        },
        OnSwipe2 : function(dir){
            this.LastSwipe = dir;
            var arr = this.Swipe2Functions.heap;
            for(var i=0; i<arr.length; i++)
                arr[i].data.function.call(arr[i].data.that, dir, arr[i].data.parameter);
        }
    },
       
       // Pressed - is a boolean, which describes if the Key is pressed while in current frame
       // FramesPressed - is an Integer between [-1, M], which counts the frames, while being pressed
       // Tipp: use an if-statement "if(FramesPressed==1)" to trigger a function only once
       // "if(Pressed)" triggers a function every frame, in which the key is pressed
    Key : {
        
        Event : {},
        Symbol : "",
        KeyNotFound : { Pressed : false, FramesPressed : 0 },
        AnyKey : { Pressed : false, FramesPressed : 0 },
        A : { Pressed : false, FramesPressed : 0 },
        B : { Pressed : false, FramesPressed : 0 },
        C : { Pressed : false, FramesPressed : 0 },
        D : { Pressed : false, FramesPressed : 0 },
        E : { Pressed : false, FramesPressed : 0 },
        F : { Pressed : false, FramesPressed : 0 },
        G : { Pressed : false, FramesPressed : 0 },
        H : { Pressed : false, FramesPressed : 0 },
        I : { Pressed : false, FramesPressed : 0 },
        J : { Pressed : false, FramesPressed : 0 },
        K : { Pressed : false, FramesPressed : 0 },
        L : { Pressed : false, FramesPressed : 0 },
        M : { Pressed : false, FramesPressed : 0 },
        N : { Pressed : false, FramesPressed : 0 },
        O : { Pressed : false, FramesPressed : 0 },
        P : { Pressed : false, FramesPressed : 0 },
        Q : { Pressed : false, FramesPressed : 0 },
        R : { Pressed : false, FramesPressed : 0 },
        S : { Pressed : false, FramesPressed : 0 },
        T : { Pressed : false, FramesPressed : 0 },
        U : { Pressed : false, FramesPressed : 0 },
        V : { Pressed : false, FramesPressed : 0 },
        W : { Pressed : false, FramesPressed : 0 },
        X : { Pressed : false, FramesPressed : 0 },
        Y : { Pressed : false, FramesPressed : 0 },
        Z : { Pressed : false, FramesPressed : 0 },

        Control : { Pressed : false, FramesPressed : 0 },
        Shift : { Pressed : false, FramesPressed : 0 },
        Alt : { Pressed : false, FramesPressed : 0 },
        Tab : { Pressed : false, FramesPressed : 0 },
        // Numbers
        Num0 : { Pressed : false, FramesPressed : 0 },
        Num1 : { Pressed : false, FramesPressed : 0 },
        Num2 : { Pressed : false, FramesPressed : 0 },
        Num3 : { Pressed : false, FramesPressed : 0 },
        Num4 : { Pressed : false, FramesPressed : 0 },
        Num5 : { Pressed : false, FramesPressed : 0 },
        Num6 : { Pressed : false, FramesPressed : 0 },
        Num7 : { Pressed : false, FramesPressed : 0 },
        Num8 : { Pressed : false, FramesPressed : 0 },
        Num9 : { Pressed : false, FramesPressed : 0 },
        // Numbers-End
        Up : { Pressed : false, FramesPressed : 0 },
        Right : { Pressed : false, FramesPressed : 0 },
        Down : { Pressed : false, FramesPressed : 0 },
        Left : { Pressed : false, FramesPressed : 0 },
        
        Backspace : { Pressed : false, FramesPressed : 0 },
        Space : { Pressed : false, FramesPressed : 0 },
        Enter : { Pressed : false, FramesPressed : 0 },
        Esc : { Pressed : false, FramesPressed : 0 }
        
    },
    Canvas : new function(){
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
    Update : function(){
        
        /* ++++++++++++++++++++++++++++++ */
        /* ++++++++++ Mouse +++++++++++++ */
        {
            var e = this.Engine.Input.Mouse.EventObject;
            if(e == "undefined") return false;
            var pos = this.Engine.Input.Mouse.Position;
            pos.Xold = pos.X;
            pos.Yold = pos.Y;
            pos.X = e.pageX;
            pos.Y = e.pageY;
            pos.Relative.X = pos.X - this.Engine.Input.Canvas.X;
            pos.Relative.Y = pos.Y - this.Engine.Input.Canvas.Y;
            pos.Camera.X = pos.X - this.Engine.Input.Canvas.X + this.Engine.Camera.SelectedCamera.X;
            pos.Camera.Y = pos.Y - this.Engine.Input.Canvas.Y + this.Engine.Camera.SelectedCamera.Y;
            pos.Delta.X = pos.X - pos.Xold;
            pos.Delta.Y = pos.Y - pos.Yold;

            // check if the mouse is on the canvas
            var mx = this.Engine.Input.Mouse.Position.X;
            var my = this.Engine.Input.Mouse.Position.Y;
            if(this.Canvas.X <= mx && mx < (this.Canvas.X + this.Canvas.Width) && this.Canvas.Y <= my && my < (this.Canvas.Y + this.Canvas.Height))
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

            if(input.Key.AnyKey.Pressed) input.Key.AnyKey.FramesPressed++;

            if(input.Key.A.Pressed) input.Key.A.FramesPressed++;
            if(input.Key.B.Pressed) input.Key.B.FramesPressed++;
            if(input.Key.C.Pressed) input.Key.C.FramesPressed++;
            if(input.Key.D.Pressed) input.Key.D.FramesPressed++;
            if(input.Key.E.Pressed) input.Key.E.FramesPressed++;
            if(input.Key.F.Pressed) input.Key.F.FramesPressed++;
            if(input.Key.G.Pressed) input.Key.G.FramesPressed++;
            if(input.Key.H.Pressed) input.Key.H.FramesPressed++;
            if(input.Key.I.Pressed) input.Key.I.FramesPressed++;
            if(input.Key.J.Pressed) input.Key.J.FramesPressed++;
            if(input.Key.K.Pressed) input.Key.K.FramesPressed++;
            if(input.Key.L.Pressed) input.Key.L.FramesPressed++;
            if(input.Key.M.Pressed) input.Key.M.FramesPressed++;
            if(input.Key.N.Pressed) input.Key.N.FramesPressed++;
            if(input.Key.O.Pressed) input.Key.O.FramesPressed++;
            if(input.Key.P.Pressed) input.Key.P.FramesPressed++;
            if(input.Key.Q.Pressed) input.Key.Q.FramesPressed++;
            if(input.Key.R.Pressed) input.Key.R.FramesPressed++;
            if(input.Key.S.Pressed) input.Key.S.FramesPressed++;
            if(input.Key.T.Pressed) input.Key.T.FramesPressed++;
            if(input.Key.U.Pressed) input.Key.U.FramesPressed++;
            if(input.Key.V.Pressed) input.Key.V.FramesPressed++;
            if(input.Key.W.Pressed) input.Key.W.FramesPressed++;
            if(input.Key.X.Pressed) input.Key.X.FramesPressed++;
            if(input.Key.Y.Pressed) input.Key.Y.FramesPressed++;
            if(input.Key.Z.Pressed) input.Key.Z.FramesPressed++;

            if(input.Key.Control.Pressed) input.Key.Control.FramesPressed++;
            if(input.Key.Shift.Pressed) input.Key.Shift.FramesPressed++;
            if(input.Key.Alt.Pressed) input.Key.Alt.FramesPressed++;
            if(input.Key.Tab.Pressed) input.Key.Tab.FramesPressed++;

            if(input.Key.Num0.Pressed) input.Key.Num0.FramesPressed++;
            if(input.Key.Num1.Pressed) input.Key.Num1.FramesPressed++;
            if(input.Key.Num2.Pressed) input.Key.Num2.FramesPressed++;
            if(input.Key.Num3.Pressed) input.Key.Num3.FramesPressed++;
            if(input.Key.Num4.Pressed) input.Key.Num4.FramesPressed++;
            if(input.Key.Num5.Pressed) input.Key.Num5.FramesPressed++;
            if(input.Key.Num6.Pressed) input.Key.Num6.FramesPressed++;
            if(input.Key.Num7.Pressed) input.Key.Num7.FramesPressed++;
            if(input.Key.Num8.Pressed) input.Key.Num8.FramesPressed++;
            if(input.Key.Num9.Pressed) input.Key.Num9.FramesPressed++;

            if(input.Key.Up.Pressed) input.Key.Up.FramesPressed++;
            if(input.Key.Right.Pressed) input.Key.Right.FramesPressed++;
            if(input.Key.Down.Pressed) input.Key.Down.FramesPressed++;
            if(input.Key.Left.Pressed) input.Key.Left.FramesPressed++;

            if(input.Key.Backspace.Pressed) input.Key.Backspace.FramesPressed++;
            if(input.Key.Space.Pressed) input.Key.Space.FramesPressed++;
            if(input.Key.Enter.Pressed) input.Key.Enter.FramesPressed++;
            if(input.Key.Esc.Pressed) input.Key.Esc.FramesPressed++;

            if(input.Mouse.Left.Down) input.Mouse.Left.FramesDown++;
            if(input.Mouse.Right.Down) input.Mouse.Right.FramesDown++;
            if(input.Mouse.Left.Up) input.Mouse.Left.FramesUp++;
            if(input.Mouse.Right.Up) input.Mouse.Right.FramesUp++;
        }
        /* ++++++++++++++++++++++++++++++ */
        /* ++++++++++ Touch +++++++++++++ */
        
        if(!this.Engine.Touch.DetectionEnabled) return;
        
        input.Touch.TimeStamp = Date.now();
        
        if(input.Touch.Expect){
            
            // time difference between touch start and current
            var timedelta = input.Touch.TimeDelta = input.Touch.TimeStamp - input.Touch.StartTimeStamp;
            
            // last current pos of 1st finger - start pos of 1st finger
            var xdelta = input.Touch.FirstTouch.clientX - input.Touch.X;
            var ydelta = input.Touch.FirstTouch.clientY - input.Touch.Y;

            if (input.Touch.EventObject.touches.length >= 2) { // 2nd finger identfier = 1; 1st = 0
                // 2nd finger is on the screen => pos of 1st is not important anymore
                // 2nd finger pos is important now, that's why we override xdelta,ydelta
                input.Touch.SecondFingerDetected = true;
                xdelta = input.Touch.SecondTouch.clientX - input.Touch.X2;
                ydelta = input.Touch.SecondTouch.clientY - input.Touch.Y2;
            } // if end
            else{
                input.Touch.SecondFingerDetected = false;
            }
            
            input.Touch.Pie.Enabled = false;
            input.Touch.Pie2.Enabled = false;
            
            // which Pie will be used
            input.Touch.SelectedPie = input.Touch.Pie;
            if(input.Touch.SecondFingerDetected)
                input.Touch.SelectedPie = input.Touch.Pie2;
            
            if (this.Engine.Touch.PiesAllowed && input.Touch.TimeDelta >= this.Engine.Touch.LongTapThreshold) {
                input.Touch.PieEnabled = true;
                //console.log("Open Pie");
                //console.log("Current Pie Decision");
                
                
                input.Touch.SelectedPie.Enabled = true;
                
                // true: no clear direction was made
                // false: clear decision was made - now decide direction
                if (Math.abs(xdelta) < this.Engine.Touch.MovementStabilizer && Math.abs(ydelta) < this.Engine.Touch.MovementStabilizer) {
                    //console.log("No Pie Direction");
                    input.Touch.SelectedPie.DeselectPieces();
                } else {
                    
                    var pp;
                    // true: horizontal desicion
                    // false: vertical decision
                    if (Math.abs(xdelta) > Math.abs(ydelta)) {

                        if (xdelta > 0) {
                            // right piece
                            //console.log("Right Piece");
                            pp = TouchPie.prototype.Pieces.Right;
                        } else {
                            // left piece
                            //console.log("Left Piece");
                            pp = TouchPie.prototype.Pieces.Left;
                        }

                    } else {

                        if (ydelta > 0) {
                            // buttom piece
                            //console.log("Buttom Piece");
                            pp = TouchPie.prototype.Pieces.Bottom;
                        } else {
                            // top piece
                            //console.log("Top Piece");
                            pp = TouchPie.prototype.Pieces.Top;
                        }

                    }
                    input.Touch.SelectedPie.SelectPiece(pp);

                }// ends pie direction decision
                
            } else {
                input.Touch.PieEnabled = false;
                //input.Touch.SelectedPie.Enabled = false;
            }
            
            
            
        }
        
    },
    // registers mouse events (those events are not bound to the frame() - the callback function is triggered when the user activates them )
    Initialize : function(){
    
        this.CalculateCanvasPosition();
        
        // register some needed event handler
        //this.RegisterKeyEvents(this.PreventKeyboardStrokesToBubbleUp);
        this.RegisterKeyEvents(true);
        //this.RegisterMouseEvents(this.PreventContextClickToBubbleUp);
        this.RegisterMouseEvents(true);
        this.RegisterTouchEvents();
        
        
        this.RegisterResizeEvent();
        
        if(this.Engine.Touch.PiesAllowed){
            this.Touch.Pie = new TouchPie();
            this.Touch.Pie2 = new TouchPie();
        }
        
    },
    CalculateCanvasPosition : function(){
        // getting the real position of the canvas 
        var ele = this.Engine.Canvas;
        var x = 0, y=0;
        this.Canvas.Width = ele.width;
        this.Canvas.Height = ele.height;
        // Mozilla Only
        //var test = this.Engine.Canvas.getBoundingClientRect();

        var i = 200;
        while(ele.nodeName != "BODY" && i > 0){
            i--;
            x += ele.offsetLeft;
            y += ele.offsetTop;
            ele = ele.parentNode;
        }
        this.Canvas.X = x;
        this.Canvas.Y = y;
        
    },
    RegisterKeyEvents : function(lockKeys){
        this.KeyDownEvent = $(document).keydown(this.Engine,function(e){
            
            var input = e.data.Input;
            
            input.Key.Event = e;
            if(e.key)
                input.Key.Symbol = e.key;
            else{
                input.Key.Symbol = String.getKeyByEvent(e);
            }
            input.Key.AnyKey.Pressed = true;
            
            switch(e.which){

                case 65 : { input.Key.A.Pressed = true;}; break;
                case 66 : { input.Key.B.Pressed = true;}; break;
                case 67 : { input.Key.C.Pressed = true;}; break;
                case 68 : { input.Key.D.Pressed = true;}; break;
                case 69 : { input.Key.E.Pressed = true;}; break;
                case 70 : { input.Key.F.Pressed = true;}; break;
                case 71 : { input.Key.G.Pressed = true;}; break;
                case 72 : { input.Key.H.Pressed = true;}; break;
                case 73 : { input.Key.I.Pressed = true;}; break;
                case 74 : { input.Key.J.Pressed = true;}; break;
                case 75 : { input.Key.K.Pressed = true;}; break;
                case 76 : { input.Key.L.Pressed = true;}; break;
                case 77 : { input.Key.M.Pressed = true;}; break;
                case 78 : { input.Key.N.Pressed = true;}; break;
                case 79 : { input.Key.O.Pressed = true;}; break;
                case 80 : { input.Key.P.Pressed = true;}; break;
                case 81 : { input.Key.Q.Pressed = true;}; break;
                case 82 : { input.Key.R.Pressed = true;}; break;
                case 83 : { input.Key.S.Pressed = true;}; break;
                case 84 : { input.Key.T.Pressed = true;}; break;
                case 85 : { input.Key.U.Pressed = true;}; break;
                case 86 : { input.Key.V.Pressed = true;}; break;
                case 87 : { input.Key.W.Pressed = true;}; break;
                case 88 : { input.Key.X.Pressed = true;}; break;
                case 89 : { input.Key.Y.Pressed = true;}; break;
                case 90 : { input.Key.Z.Pressed = true;}; break;
                
                case 17 : { input.Key.Control.Pressed = true;}; break;
                case 16 : { input.Key.Shift.Pressed = true;}; break;
                case 18 : { input.Key.Alt.Pressed = true;}; break;
                case 9 : { input.Key.Tab.Pressed = true;}; break;
                
                case 48 : { input.Key.Num0.Pressed = true;}; break;
                case 49 : { input.Key.Num1.Pressed = true;}; break;
                case 50 : { input.Key.Num2.Pressed = true;}; break;
                case 51 : { input.Key.Num3.Pressed = true;}; break;
                case 52 : { input.Key.Num4.Pressed = true;}; break;
                case 53 : { input.Key.Num5.Pressed = true;}; break;
                case 54 : { input.Key.Num6.Pressed = true;}; break;
                case 55 : { input.Key.Num7.Pressed = true;}; break;
                case 56 : { input.Key.Num8.Pressed = true;}; break;
                case 57 : { input.Key.Num9.Pressed = true;}; break;
                
                case 38 : { input.Key.Up.Pressed = true;}; break;
                case 39 : { input.Key.Right.Pressed = true;}; break;
                case 40 : { input.Key.Down.Pressed = true;}; break;
                case 37 : { input.Key.Left.Pressed = true;}; break;
                
                case 8 :  { input.Key.Backspace.Pressed = true;}; break;
                case 32 : { input.Key.Space.Pressed = true;}; break;
                case 13 : { input.Key.Enter.Pressed = true;}; break;
                case 27 : { input.Key.Esc.Pressed = true;}; break;
                default : { input.Key.KeyNotFound.Pressed = true;}; break;
            }
            
            if(!lockKeys){
                // no other elements react to key strokes
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
        this.KeyUpEvent = $(document).keyup(this.Engine, function(e){
            var input = e.data.Input;
            input.Key.Event = e;
            if(e.key)
                input.Key.Symbol = e.key;
            else{
                input.Key.Symbol = String.fromCharCode(e.which).toLowerCase();
            }
            input.Key.AnyKey.Pressed = false;
            input.Key.AnyKey.FramesPressed = 0;
            
            switch(e.which){

                case 65 : { input.Key.A.Pressed = false; input.Key.A.FramesPressed=0;}; break;
                case 66 : { input.Key.B.Pressed = false; input.Key.B.FramesPressed=0;}; break;
                case 67 : { input.Key.C.Pressed = false; input.Key.C.FramesPressed=0;}; break;
                case 68 : { input.Key.D.Pressed = false; input.Key.D.FramesPressed=0;}; break;
                case 69 : { input.Key.E.Pressed = false; input.Key.E.FramesPressed=0;}; break;
                case 70 : { input.Key.F.Pressed = false; input.Key.F.FramesPressed=0;}; break;
                case 71 : { input.Key.G.Pressed = false; input.Key.G.FramesPressed=0;}; break;
                case 72 : { input.Key.H.Pressed = false; input.Key.H.FramesPressed=0;}; break;
                case 73 : { input.Key.I.Pressed = false; input.Key.I.FramesPressed=0;}; break;
                case 74 : { input.Key.J.Pressed = false; input.Key.J.FramesPressed=0;}; break;
                case 75 : { input.Key.K.Pressed = false; input.Key.K.FramesPressed=0;}; break;
                case 76 : { input.Key.L.Pressed = false; input.Key.L.FramesPressed=0;}; break;
                case 77 : { input.Key.M.Pressed = false; input.Key.M.FramesPressed=0;}; break;
                case 78 : { input.Key.N.Pressed = false; input.Key.N.FramesPressed=0;}; break;
                case 79 : { input.Key.O.Pressed = false; input.Key.O.FramesPressed=0;}; break;
                case 80 : { input.Key.P.Pressed = false; input.Key.P.FramesPressed=0;}; break;
                case 81 : { input.Key.Q.Pressed = false; input.Key.Q.FramesPressed=0;}; break;
                case 82 : { input.Key.R.Pressed = false; input.Key.R.FramesPressed=0;}; break;
                case 83 : { input.Key.S.Pressed = false; input.Key.S.FramesPressed=0;}; break;
                case 84 : { input.Key.T.Pressed = false; input.Key.T.FramesPressed=0;}; break;
                case 85 : { input.Key.U.Pressed = false; input.Key.U.FramesPressed=0;}; break;
                case 86 : { input.Key.V.Pressed = false; input.Key.V.FramesPressed=0;}; break;
                case 87 : { input.Key.W.Pressed = false; input.Key.W.FramesPressed=0;}; break;
                case 88 : { input.Key.X.Pressed = false; input.Key.X.FramesPressed=0;}; break;
                case 89 : { input.Key.Y.Pressed = false; input.Key.Y.FramesPressed=0;}; break;
                case 90 : { input.Key.Z.Pressed = false; input.Key.Z.FramesPressed=0;}; break;

                case 48 : { input.Key.Num0.Pressed = false; input.Key.Num0.FramesPressed=0;}; break;
                case 49 : { input.Key.Num1.Pressed = false; input.Key.Num1.FramesPressed=0;}; break;
                case 50 : { input.Key.Num2.Pressed = false; input.Key.Num2.FramesPressed=0;}; break;
                case 51 : { input.Key.Num3.Pressed = false; input.Key.Num3.FramesPressed=0;}; break;
                case 52 : { input.Key.Num4.Pressed = false; input.Key.Num4.FramesPressed=0;}; break;
                case 53 : { input.Key.Num5.Pressed = false; input.Key.Num5.FramesPressed=0;}; break;
                case 54 : { input.Key.Num6.Pressed = false; input.Key.Num6.FramesPressed=0;}; break;
                case 55 : { input.Key.Num7.Pressed = false; input.Key.Num7.FramesPressed=0;}; break;
                case 56 : { input.Key.Num8.Pressed = false; input.Key.Num8.FramesPressed=0;}; break;
                case 57 : { input.Key.Num9.Pressed = false; input.Key.Num9.FramesPressed=0;}; break;
                
                case 17 : { input.Key.Control.Pressed = false; input.Key.Control.FramesPressed=0;}; break;
                case 16 : { input.Key.Shift.Pressed = false; input.Key.Shift.FramesPressed=0;}; break;
                case 18 : { input.Key.Alt.Pressed = false; input.Key.Alt.FramesPressed=0;}; break;
                case 9 : { input.Key.Tab.Pressed = false; input.Key.Tab.FramesPressed=0;}; break;
                case 8 : { input.Key.Backspace.Pressed = false; input.Key.Backspace.FramesPressed=0;}; break;

                case 38 : { input.Key.Up.Pressed = false; input.Key.Up.FramesPressed=0;}; break;
                case 39 : { input.Key.Right.Pressed = false; input.Key.Right.FramesPressed=0;}; break;
                case 40 : { input.Key.Down.Pressed = false; input.Key.Down.FramesPressed=0;}; break;
                case 37 : { input.Key.Left.Pressed = false; input.Key.Left.FramesPressed=0;}; break;

                case 32 : { input.Key.Space.Pressed = false; input.Key.Space.FramesPressed=0;}; break;
                case 13 : { input.Key.Enter.Pressed = false; input.Key.Enter.FramesPressed=0;}; break;
                case 27 : { input.Key.Esc.Pressed = false; input.Key.Esc.FramesPressed=0;}; break;
                default : { input.Key.KeyNotFound.Pressed = false; input.Key.KeyNotFound.FramesPressed=0;}; break;

            }
            if(!lockKeys){
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    },
    RegisterMouseEvents : function(lockContext){
        
        this.MouseMoveEvent = $(document).mousemove(this.Engine, function(e){
            e.data.Input.Mouse.EventObject = e;
        });
        this.MouseDownEvent = $(document).mousedown(this.Engine, function(e){
            var input = e.data.Input.Mouse;
            if(e.which==1){
                input.Left.Down = true;
                input.Left.Up = false;
                input.Left.FramesUp = 0;
            }
            if(e.which==3){
                input.Right.Down = true;
                input.Right.Up = false;
                input.Right.FramesUp = 0;
            }
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
            
        });
        this.MouseUpEvent = $(document).mouseup(this.Engine, function(e){
            var input = e.data.Input.Mouse;
            if(e.which==1){
                input.Left.Down = false;
                input.Left.Up = true;
                input.Left.FramesDown = 0;
            }
            if(e.which==3){
                input.Right.Down = false;
                input.Right.Up = true;
                input.Right.FramesDown = 0;
            }
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
        });
        
        // cancels the right-click or context menu for the canvas
        if(lockContext)
            this.Engine.Canvas.oncontextmenu = function(e){
                e.preventDefault();
                e.stopPropagation();
                e.cancelBubble = true;
                return false;
            };
    },
    RegisterResizeEvent : function(){
        this.ResizeEvent = $(window).resize(this.Engine, function(d){
            d.data.Input.CalculateCanvasPosition();
            d.data.Engine.IsCanvasFitToScreen = false;
        });
    },
    RegisterTouchEvents : function(){
        
        if(!this.Engine.Touch.DetectionEnabled)
            return false;
        
        // listener of the touchstart event
        var f = function (e) {
            // this = Engine

            this.IsTouchDevice = true;

            this.Input.Touch.Expect = true;

            this.Input.Touch.EventObject = e;
            this.Input.Touch.StartTimeStamp = Date.now();
            
            // first touch
            // reason of this command: there are no touches in the touchend event
            this.Input.Touch.FirstTouch = e.touches[0];
            
            // saving the starting event position in the Touch variable, which represents
            // the current touch in touchstart, touchmove and touch end (this.Input.Touch)
            this.Input.Touch.X = e.touches[0].clientX;
            this.Input.Touch.Y = e.touches[0].clientY;

            this.Input.Touch.SecondFingerDetected = false;

            // if 2nd touch then get info as well
            if (e.touches.length >= 2) {
                // reason of this command: there are no touches in the touchend event
                this.Input.Touch.SecondTouch = e.touches[1];
                
                this.Input.Touch.X2 = e.touches[1].clientX;
                this.Input.Touch.Y2 = e.touches[1].clientY;
                
                this.Input.Touch.SecondFingerDetected = true;
            }
            // cancels the default mouse click
            e.preventDefault();
        };
        
        // register touchstart
        this.TouchStartEvent = this.Engine.Canvas.addEventListener("touchstart",
                f.bind(this.Engine), false);

        // listener of the touchmove event
        f = function (e) {
            // this = Engine
            
            this.Input.Touch.EventObject = e;
            // reason of this command: there are no touches in the touchend event
            this.Input.Touch.FirstTouch = e.touches[0];
            
            this.Input.Touch.SecondFingerDetected = false;
            
            if(e.touches.length >= 2){
                this.Input.Touch.SecondTouch = e.touches[1];
                this.Input.Touch.SecondFingerDetected = true;
            }
            
            if (this.Touch.PreventScrolling) {
                e.preventDefault(); // prevent scrolling when touch inside Canvas
            }
        };
        
        // register touchmove
        this.TouchMoveEvent = this.Engine.Canvas.addEventListener("touchmove", f.bind(this.Engine), false);

        // listener of the touchend event
        f = function (e) {
            // this = Engine

            // time difference between touch start and end
            var timedelta = this.Input.Touch.TimeDelta;
            
            // last current pos - start pos
            var xdelta = this.Input.Touch.FirstTouch.clientX - this.Input.Touch.X;
            var ydelta = this.Input.Touch.FirstTouch.clientY - this.Input.Touch.Y;
            
            this.Input.Touch.SecondFingerDetected = false;
            
            if (this.Input.Touch.EventObject.touches.length >= 2) { // 2nd finger identfier = 1; 1st = 0
                this.Input.Touch.SecondFingerDetected = true;
                xdelta = this.Input.Touch.SecondTouch.clientX - this.Input.Touch.X2;
                ydelta = this.Input.Touch.SecondTouch.clientY - this.Input.Touch.Y2;
            } // if end
            
            // now we don't need the last event of the touchmove or the event of touchstart anymore
            this.Input.Touch.EventObject = e;

            // a pie was made
            if (this.Input.Touch.Expect && this.Input.Touch.PieEnabled) {
                
                this.Input.Touch.SelectedPie = this.Input.Touch.Pie;
                if(this.Input.Touch.SecondFingerDetected )
                    this.Input.Touch.SelectedPie = this.Input.Touch.Pie2;
                
                // true: no clear direction was made
                // false: clear decision was made - now decide direction
                if (Math.abs(xdelta) < this.Engine.Touch.MovementStabilizer && Math.abs(ydelta) < this.Engine.Touch.MovementStabilizer) {
                    //console.log("No Pie Direction");
                    this.Input.Touch.SelectedPie.DeselectPieces();
                } else {
                    var pp;
                    // true: horizontal desicion
                    // false: vertical decision
                    if (Math.abs(xdelta) > Math.abs(ydelta)) {

                        if (xdelta > 0) {
                            // right piece
                            //console.log("Right Piece");
                            pp = TouchPie.prototype.Pieces.Right;
                        } else {
                            // left piece
                            //console.log("Left Piece");
                            pp = TouchPie.prototype.Pieces.Left;
                        }

                    } else {

                        if (ydelta > 0) {
                            // buttom piece
                            //console.log("Bottom Piece");
                            pp = TouchPie.prototype.Pieces.Bottom;
                        } else {
                            // top piece
                            //console.log("Top Piece");
                            pp = TouchPie.prototype.Pieces.Top;
                        }

                    }
                    this.Input.Touch.SelectedPie.SelectPiece(pp);
                    this.Input.Touch.SelectedPie.Trigger();
                }// ends pie direction decision

                this.Input.Touch.Expect = false;
                this.Input.Touch.PieEnabled = false;
            }// ends pie decision

            // testing if it is a shorter touch => tap
            if (this.Input.Touch.Expect && timedelta < this.Engine.Touch.LongTapThreshold && Math.abs(xdelta) < this.Engine.Touch.MovementStabilizer && Math.abs(ydelta) < this.Engine.Touch.MovementStabilizer) {
                // touch tap

                if (!this.Input.Touch.SecondFingerDetected) {
                    this.Input.Touch.OnTap();
                    if (this.Touch.FakeMouseClick)
                        this.Input.FakeMouseClick(this.Input.Touch.FirstTouch.clientX, this.Input.Touch.FirstTouch.clientY);
                } else {
                    this.Input.Touch.OnTap2();
                }

                this.Input.Touch.Expect = false;
            }

            // testing if it is a longer touch => long tap
            if (this.Input.Touch.Expect && this.Engine.Touch.LongTapThreshold <= timedelta && timedelta <= 3000 && Math.abs(xdelta) < this.Engine.Touch.MovementStabilizer && Math.abs(ydelta) < this.Engine.Touch.MovementStabilizer) {
                // touch long tap
                if (!this.Input.Touch.SecondFingerDetected) {
                    this.Input.Touch.OnLongTap();
                } else {
                    this.Input.Touch.OnLongTap2();
                }
                this.Input.Touch.Expect = false;
            }

            if (this.Input.Touch.Expect && timedelta < 600 && (Math.abs(xdelta) > this.Engine.Touch.SwipeThreshold || Math.abs(ydelta) > this.Engine.Touch.SwipeThreshold)) {
                // swipe
                var dir;
                if (Math.abs(xdelta) > Math.abs(ydelta)) {
                    // horizontal swipe was bigger
                    if (xdelta > 0) {
                        // right
                        //console.log("swipe right");
                        dir = {X: 1, Y: 0};
                    } else {
                        // left
                        //console.log("swipe left");
                        dir = {X: -1, Y: 0};
                    }

                } else {
                    // vertical swipe was bigger
                    if (ydelta > 0) {
                        // down
                        //console.log("swipe down");
                        dir = {X: 0, Y: 1};
                    } else {
                        // up
                        //console.log("swipe up");
                        dir = {X: 0, Y: -1};
                    }
                }
                if (!this.Input.Touch.SecondFingerDetected)
                    this.Input.Touch.OnSwipe(dir);
                else
                    this.Input.Touch.OnSwipe2(dir);

                this.Input.Touch.Expect = false;
            }// if swipe end

        };
        
        // register touchend
        this.TouchEndEvent = this.Engine.Canvas.addEventListener("touchend",
                f.bind(this.Engine),
                false);
        
    },
    UnregisterKeyEvents : function(){
        if(this.KeyUpEvent){
            $(document).unbind(this.KeyUpEvent);
            this.KeyUpEvent = "undefined";
        }
        if(this.KeyDownEvent){
            $(document).unbind(this.KeyDownEvent);
            this.KeyDownEvent = "undefined";
        }
    },
    UnregisterMouseEvents : function(){
        if(this.MouseUpEvent){
            $(document).unbind(this.MouseUpEvent);
            this.MouseUpEvent = "undefined";
        }
        if(this.MouseDownEvent){
            $(document).unbind(this.MouseDownEvent);
            this.MouseDownEvent = "undefined";
        }
    },
    UnregisterResizeEvent : function(){
        if(this.ResizeEvent){
            $(window).unbind(this.ResizeEvent);
            this.ResizeEvent = "undefined";
        }
    },
    
    FakeMouseClick : function(x,y){
        //console.log("fake mouse down: {0},{1}".format( x, y) );
        var releaseLength = 300;
        
        var fe = {
            pageX : x, pageY : y, clientX : x, clientY : y, which : 1
        };
        
        this.Engine.Input.Mouse.EventObject = fe;
        this.Engine.Input.Mouse.Left.Down = true;
        this.Engine.Input.Mouse.Left.Up = false;
        this.Engine.Input.Mouse.Left.FramesUp = 0;

        var upf = function(){
            //console.log("fake mouse up: {0},{1}".format( x, y) );
            var fe = {
                pageX : x, pageY : y, clientX : x, clientY : y, which : 1
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
 * @param {String} subtype
 * @returns 
 */
Engine.prototype.Storage = {    
    Pre : "AniBody_",
    // flag wether browser allows html5-local storage or engine needs to use cookies as pieces
    BrowserAllowsLocalStorage : false,
    Object : {},
    ObjectString : "",
    
    Engine : false,
    
    /**
    * @description Function initiliazes the storage by testing wether the HTML5-Local Storage feature is availible or not and invokes the needed functions for restoring the storage
    * @returns {undefined}
    */
    InitStorage : function(){
        if(this.IsLocalStorageAvailable())
            this.BrowserAllowsLocalStorage = true;
        else
            this.BrowserAllowsLocalStorage = false;

        //GetStorageFromBrowser
        if(this.BrowserAllowsLocalStorage){
            var str = localStorage[this.Pre];
            if(!str)
                this.ObjectString = "{}";
            else
                this.ObjectString = str;
        }

        // UpdateObject();
        if(this.ObjectString.length < 3){
            this.Engine.HandleError({code:101, msg:"Storage is empty"});
        }else{
            var str = this.ObjectString;
            this.Object = JSON.parse(str);
        }

        $( window ).unload(this.Engine, function(e){
            var engine = e.data;
            engine.Storage.WriteStorageToBrowser();
        });

    },
    
    /**
     * @description easy test if html 5 local storage is active or not
     */
    IsLocalStorageAvailable : function(){
        var test = this.Pre + 'test' + Date.now();
        try {
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch(e) {
          return false;
        }
    },
    
    /**
    * @description searches if the object has an attribte "name" and returnes its value or false if not found
    * @returns Value
    */
   ReadFromStorage : function(name){
       var res = this.Object[name];
       var e;
       if(res)
           return res;
       else{
           e = {code:404, msg:"Storage has no attribute called " + name};
           this.Engine.HandleError(e);
           return e;
       }
   },
   
   /**
     * @description writes the value "val" to the attribute "name"
     * @returns undefined
     */
    WriteToStorage : function(key, val){
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
    DeleteFromStorage : function(key){
        if(arguments.length === 0){
            this.Object = {};
            this.ObjectString = "{}";
        }else
            try{
                this.Object[key] = "undefined";
            }catch(e){
               e = {code:403, msg:"Storage has no attribute called " + key};
               this.Engine.HandleError(e);
            }
    },
    
    /**
    * @description writes the ObjectString to the LocalStorage so the Storage can be used the next time
    * @returns undefined
    */
   WriteStorageToBrowser : function(){
       if(this.BrowserAllowsLocalStorage){
           localStorage[this.Pre] = this.ObjectString;
       }
   }
    
};

Engine.prototype.Font = {
    
    Default : "10px sans-serif",
    
    Type : {
        Arial : "Arial",
        Verdana : "Verdana",
        TimesNewRoman : "Times New Roman",
        CourierNew : "Courier New",
        serif : "serif",
        sans_serif : "sans-serif",
        BrowserSpecific : {
            Caption : "caption",
            Icon : "icon",
            Menu : "menu",
            MessageBox : "message-box",
            SmallCaption : "small-caption",
            StatusBar : "status-bar"
        }
    },
    
    Variant : {
        normal : "normal",
        small_caps : "small-caps"      
    },
    
    Style : {
        normal : "normal",
        italic : "italic",
        oblique : "oblique"
    },
    
    Weight : {
        normal : "normal",
        bold : "bold",
        bolder : "bolder",
        lighter : "lighter"
    },
    
    getContextFontString : function(){
        if(arguments.length==0) return this.Default;
        var str = "";
        for(var i=0; i<arguments.length; i++)
            if(typeof arguments[i] == "number")
                str += arguments[i]+"px ";
            else
                str += arguments[i]+" ";
        return str;
    },
    
    setContextFontString : function(c){
        if(arguments.length==0) return false;
        if(arguments.length==1) c.font = this.Default;
        var str = "";
        for(var i=1; i<arguments.length; i++)
            if(typeof arguments[i] == "number")
                str += arguments[i]+"px ";
            else
                str += arguments[i]+" ";
        c.font = str;
    },
};

