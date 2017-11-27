
Anibody.classes.Input.Mouse = function Mouse(){
    Anibody.classes.EngineObject.call(this);
    
    this.MouseDownEvent = null;
    this.MouseUpEvent = null;
    this.MouseMoveEvent = null;
    this.MouseScrollEvent = null;
    
    this.EventObject = 0;
    this.DownEvent = 0;
    this.UpEvent = 0;
    
    this.Left = {
        Up: true,
        Down: false,
        FramesDown: 0,
        FramesUp: 0,
        BusyFrames: 0
    };
    
    this.Right = {
        Up: true,
        Down: false,
        FramesDown: 0,
        FramesUp: 0,
        BusyFrames: 0
    };
    
    this.Position = {
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
    };
    
    this.Cursor = null;
    
this.Initialize();
};
Anibody.classes.Input.Mouse.prototype = Object.create(Anibody.classes.EngineObject.prototype);
Anibody.classes.Input.Mouse.prototype.constructor = Anibody.classes.Input.Mouse;

Anibody.classes.Input.Mouse.prototype.Initialize = function(){
    this.Cursor = new Anibody.classes.Input.Mouse.Cursor();
    this.RegisterMouseEvents(this.Engine.Flags.PreventContextClickBubbleToUp);
};

Anibody.classes.Input.Mouse.prototype.Update = function(){
    
    var e = this.EventObject;

    if (this.Left.BusyFrames > 0)
        this.Left.BusyFrames--;
    if (this.Right.BusyFrames > 0)
        this.Right.BusyFrames--;

    var pos = this.Position;
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
    
    if (this.Left.Down)
        this.Left.FramesDown++;
    if (this.Right.Down)
        this.Right.FramesDown++;
    if (this.Left.Up)
        this.Left.FramesUp++;
    if (this.Right.Up)
        this.Right.FramesUp++;
    
    this.Cursor.Update();
};

Anibody.classes.Input.Mouse.prototype.RegisterMouseEvents = function (lockContextMenu) {

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
    this.MouseWheelEvent = $(window).bind("wheel", this.Engine, function (e) {

        var that = e.data;
        if (that.Canvas.MouseOn) {

            var dy = e.originalEvent.deltaY;
            var dx = e.originalEvent.deltaX;
            
            if(that && that.Input && that.Input.MouseHandler)
                that.Input.MouseHandler.WheelHandler(dx, dy);

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    });

    // cancels the right-click or context menu for the canvas
    if (lockContextMenu)
        this.Engine.Canvas.oncontextmenu = function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
            return false;
        };
};
Anibody.classes.Input.Mouse.prototype.UnregisterMouseEvents = function () {
    if (this.MouseUpEvent !== null) {
        $(document).unbind(this.MouseUpEvent);
        this.MouseUpEvent = null;
    }
    if (this.MouseDownEvent !== null) {
        $(document).unbind(this.MouseDownEvent);
        this.MouseDownEvent = null;
    }
};

Anibody.classes.Input.Mouse.prototype.FakeMouseClick = function (x, y) {
    console.log("fake mouse down at {0},{1}".format( x, y) );
    var releaseLength = 300;

    var fe = {
        pageX: x, pageY: y, clientX: x, clientY: y, which: 1
    };

    this.EventObject = fe;
    this.Left.Down = true;
    this.Up = false;
    this.Left.FramesUp = 0;

    var upf = function () {
        //console.log("fake mouse up: {0},{1}".format( x, y) );
        var fe = {
            pageX: x, pageY: y, clientX: x, clientY: y, which: 1
        };

        this.EventObject = fe;
        this.Left.Down = false;
        this.Left.Up = true;
        this.Left.FramesDown = 0;
    };

    window.setTimeout(upf.bind(this), releaseLength);

};

Anibody.classes.Input.Mouse.prototype.IsMouseOnCanvas = function () {
    
    // check if the mouse is on the canvas
    var mx = this.Position.X;
    var my = this.Position.Y;
    var can = this.Engine.Input.Canvas;
    
    if (can.X <= mx && mx < (can.X + can.Width) && can.Y <= my && my < (can.Y + can.Height)){
        can.MouseOn = true;
        this.Engine.Canvas.MouseOn = true;
    }else{
        can.MouseOn = false;
        this.Engine.Canvas.MouseOn = true;
    }

    return can.MouseOn;
};

Anibody.SetPackage("Anibody", "classes", "Input" ,"Mouse");

Anibody.classes.Input.Mouse.Cursor = function Cursor(){
    Anibody.classes.EngineObject.call(this);
    this.Current = "auto";
    this.OnlyCanvas = true;
};
Anibody.classes.Input.Mouse.Cursor.prototype = Object.create(Anibody.classes.EngineObject.prototype);
Anibody.classes.Input.Mouse.Cursor.prototype.constructor = Anibody.classes.Input.Mouse.Cursor;
Anibody.classes.Input.Mouse.Cursor.prototype.Set = function (css) {$(this.Engine.Canvas).css("cursor", css);};
Anibody.classes.Input.Mouse.Cursor.prototype.alias = function () {this.Current = "alias";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.cell = function () {this.Current = "cell";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.col_resize = function () {this.Current = "col-resize";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.copy = function () {this.Current = "copy";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.crosshair = function () {this.Current = "crosshair";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.default = function () {this.Current = "default";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.ew_resize = function () {this.Current = "ew-resize";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.grab = function () {this.Current = "grab";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.grabbing = function () {this.Current = "grabbing";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.help = function () {this.Current = "help";this.Set(this.Current);};
Anibody.classes.Input.Mouse.Cursor.prototype.move = function () {
    this.Current = "move";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.nesw_resize = function () { // northeast - southwest
    this.Current = "move";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.ns_resize = function () {
    this.Current = "ns-resize";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.nwse_resize = function () { // northwest - southeast
    this.Current = "ns-resize";
};
Anibody.classes.Input.Mouse.Cursor.prototype.no_drop = function () {
    this.Current = "no-drop";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.none = function () {
    this.Current = "none";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.not_allowed = function () {
    this.Current = "not-allowed";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.pointer = function () {
    this.Current = "pointer";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.progress = function () {
    this.Current = "progress";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.row_resize = function () {
    this.Current = "row-resize";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.text = function () {
    this.Current = "text";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.vertical_text = function () {
    this.Current = "vertical-text";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.wait = function () {
    this.Current = "wait";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.zoom_in = function () {
    this.Current = "zoom-in";
    this.Set(this.Current);
};
Anibody.classes.Input.Mouse.Cursor.prototype.zoom_out = function () {
    this.Current = "zoom-out";
    this.Set(this.Current);
};