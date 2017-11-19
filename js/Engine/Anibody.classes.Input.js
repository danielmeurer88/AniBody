Anibody.SetPackage("Anibody", "classes");

Anibody.classes.Input = function Input() {
    Anibody.classes.EngineObject.call(this);
    
    this.ResizeEvent = null;
    // end of event handler attributes

    // placeholder for the instance of the MouseHandler and the TouchHandler classes
    this.MouseHandler = null;
    this.TouchHandler = null;

    // object that holds information about the mouse of the user
    this.Mouse = null;
    

    // Pressed - is a boolean, which describes if the Key is pressed while in current frame
    // FramesPressed - is an Integer between [-1, M], which counts the frames, while being pressed
    // Tipp: use an if-statement "if(FramesPressed==1)" to trigger a function only once
    // "if(Pressed)" triggers a function every frame, in which the key is pressed
    this.Keys = null;

    this.Canvas = {
        X : 0,
        Y : 0,
        Width : 0,
        Height : 0,
        MouseOn : false
    };

this.Initialize();
};
Anibody.classes.Input.prototype = Object.create(Anibody.classes.EngineObject.prototype);
Anibody.classes.Input.prototype.constructor = Anibody.classes.Input;

// registers mouse events (those events are not bound to the frame() - the callback function is triggered when the user activates them )
Anibody.classes.Input.prototype.Initialize = function () {

    this.CalculateCanvasPosition();

    // register some needed event handler
    if(this.Engine.Flags.KeyboardInput)
        this.Keys = new Anibody.classes.Input.Keys();

    if(this.Engine.Flags.MouseInput){
        this.Mouse = new Anibody.classes.Input.Mouse();
        this.MouseHandler = new MouseHandler();
    }
    
    this.RegisterResizeEvent();

    if(this.Engine.Flags.TouchHandler)
        this.TouchHandler = new TouchHandler();

};

/**
 * Calculates and saves the mouse position and all its concequential information needed by the user
 * @returns {undefined}
 */
Anibody.classes.Input.prototype.Update = function () {

    this.Canvas.MouseOn = false;

    if(this.Engine.Flags.MouseInput)
    {
        this.Mouse.Update();
        this.Canvas.MouseOn = this.Mouse.IsMouseOnCanvas();
    }
    
    

    /* ++++++++++ Keys ++++++++++++++ */
    if(this.Engine.Flags.KeyboardInput)
    {
        this.Keys.Update();
    }

    if (this.Engine.Flags.TouchHandler)
        this.TouchHandler.Update();

};

/**
 * getting the real position of the canvas
 * @returns {undefined}
 */
Anibody.classes.Input.prototype.CalculateCanvasPosition = function () {

    var ele = this.Engine.Canvas; // ele = canvas, the html-element
    var x = 0, y = 0;
    this.Canvas.Width = ele.width;
    this.Canvas.Height = ele.height;

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

};

Anibody.classes.Input.prototype.RegisterResizeEvent = function () {
    this.ResizeEvent = $(window).resize(this.Engine, function (d) {
        d.data.Input.CalculateCanvasPosition();
        d.data.Engine.IsCanvasFitToScreen = false;
    });
};
Anibody.classes.Input.prototype.UnregisterResizeEvent = function () {
    if (this.ResizeEvent) {
        $(window).unbind(this.ResizeEvent);
        this.ResizeEvent = "undefined";
    }
};
