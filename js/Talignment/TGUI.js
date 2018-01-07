function TGUI(){
    Anibody.EngineObject.call(this);

    this.Ts = [];

    this.Widget = null;

    this._keyModulo = 10;

    // touch and mouse related dragging
    this.StartX = 0;
    this.StartY = 0;
    this.LastX = 0;
    this.LastY = 0;
    this.CurrentX = 0;
    this.CurrentY = 0;
    this.MoveStep = 20;
    this.RotateStep = Math.PI * 0.1;
    this.Dragging = false;
    this.Rotating = false;

    var self = this;
    Object.defineProperty(this, "Selected", {
        set: function (newValue) {},
        get: function () {
            if(self.Ts.length !== 4)
                return false;
            else
                return self.Ts[3];
        }
    });

this.Initialize();
}
TGUI.prototype = Object.create(Anibody.EngineObject.prototype);
TGUI.prototype.constructor = TGUI;

TGUI.prototype.Initialize = function(){

    var red = new T("red", this.MoveStep*1, this.MoveStep*1);

    var green = new T("green", this.MoveStep*2, this.MoveStep*2);

    var blue = new T("blue", this.MoveStep*3, this.MoveStep*3);

    var yellow = new T("yellow", this.MoveStep*4, this.MoveStep*4);
    yellow.Shape.Selected = true;
    this.Ts.push(red, green, blue, yellow);

    this.Widget = new Anibody.Widget();
    this.Widget.that = this;

    this._overwriteProcessInputOfWidget();

    this.Widget.Register();

    // register Mouse handler
    this._registerMouseHandler();

    // register Touch 
    this._registerTouchListener();
    
};

TGUI.prototype.ProcessInput = function(){
    var i;

    for(i=0; i<4; i++)
        this.Ts[i].ProcessInput();
};

TGUI.prototype.Update = function(){
    var i;

    for(i=0; i<4; i++){
        this.Ts[i].Update();
    }
        
};

TGUI.prototype.Draw = function(c){
    var i;

    for(i=0; i<4; i++)
        this.Ts[i].Draw(c);
};

/**
 * Selects one of the 4 pieces. Whether by the attribute IsMouseOver or by a given position
 * @param {number} x - optional x value
 * @param {number} y - optional y value
 */
TGUI.prototype.SelectPiece = function(x,y){
    var i;
    var seli = null;

    if(isNaN(x) && isNaN(y)){
        for(i=0; i<4; i++){
            if(this.Ts[i].IsMouseOver){
                this.Ts[3].Shape.Selected = false;
                this.Ts[i].Shape.Selected = true;
                seli = i;
            }
        }
    }else{
        for(i=0; i<4; i++){
            if(this.Ts[i].IsPointInT(x,y)){
                this.Ts[3].Shape.Selected = false;
                this.Ts[i].Shape.Selected = true;
                seli = i;
            }
        }
    }
    

    if(seli !== null){
        var temp = this.Ts.delete(seli);
        this.Ts.push(temp);
    }
        
};

TGUI.prototype._overwriteProcessInputOfWidget = function(){
    this.Widget.keyCounter = 0;
    this.Widget.moveInhancer = 1;

    this.Widget.ProcessInput = function(){
        var keys = this.Engine.Input.Keys;
        var that = this.that;
        

        if (keys.A.FramesPressed > 1 || keys.D.FramesPressed > 1 || keys.W.FramesPressed > 1 || keys.S.FramesPressed > 1) {
            this.keyCounter++;
        }else{
            this.keyCounter = 0;
        }

        this.moveInhancer = 1;
        if(this.keyCounter > 20){
            this.moveInhancer++;
        }
        if(this.keyCounter > 40){
            this.moveInhancer++;
        }
        if(this.keyCounter > 120){
            this.moveInhancer++;
        }
        var movestep = that.Movestep * this.moveInhancer;


        if (keys.A.FramesPressed % that._keyModulo === 1) {
            that.Selected.Move(movestep*(-1), 0);
        }

        if (keys.D.FramesPressed % that._keyModulo === 1) {
            that.Selected.Move(movestep, 0);
        }

        if (keys.W.FramesPressed % that._keyModulo === 1) {
            that.Selected.Move(0, movestep*(-1));
        }

        if (keys.S.FramesPressed % that._keyModulo === 1) {
            that.Selected.Move(0, movestep);
        }

        if (keys.Q.FramesPressed % that._keyModulo === 1) {
            that.Selected.Shape.Rotate(that.RotateStep);
        }

        if (keys.E.FramesPressed % that._keyModulo === 1) {
            that.Selected.Shape.Rotate(that.RotateStep*(-1));
        }
    };
};

TGUI.prototype._registerMouseHandler = function(){
    var onmouseclickcbo = function (event) {

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.SelectPiece();

    }.getCallbackObject(this);

    this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", onmouseclickcbo);
};

TGUI.prototype._registerTouchListener = function(){
    var th = this.Engine.Input.TouchHandler;

    th.FakeMouseClick = false;
    th.Detect.Tap1 = false;
    th.Detect.Tap2 = false;
    th.Detect.LongTap1 = false;
    th.Detect.LongTap2 = false;
    th.Detect.Swipe1 = false;
    th.Detect.Swipe2 = false;
    
    // still improvement needed

    var ontouchstart1 = function(e){
        //console.log("start");

        var x1 = e.TouchHandler.Finger1.X;
        var y1 = e.TouchHandler.Finger1.Y;

        if(!e.TouchHandler.Finger2.Detected){
            this.SelectPiece(x1,y1);
            this.StartX = x1;
            this.StartY = y1;
        }

        this.CurrentX = this.StartX;
        this.CurrentY = this.StartY;
        this.LastX = this.StartX;
        this.LastY = this.StartY;

    }.getCallbackObject(this, "test");
    th.AddEventListener("touchstartfinger1", ontouchstart1);

    var ontouchstart2 = function(e){
        //console.log("start");

        var x2 = e.TouchHandler.Finger2.X;
        var y2 = e.TouchHandler.Finger2.Y;

        if(e.TouchHandler.Finger2.Detected){
            this.StartX = x2;
            this.StartY = y2;
        }

        this.Dragging = false;

        this.CurrentX = this.StartX;
        this.CurrentY = this.StartY;
        this.LastX = this.StartX;
        this.LastY = this.StartY;

    }.getCallbackObject(this, "test");
    th.AddEventListener("touchstartfinger2", ontouchstart2);

    var ontouchmove1 = function(e){
        //console.log("move");

        var x1 = e.TouchHandler.Finger1.X;
        var y1 = e.TouchHandler.Finger1.Y;

        if(!e.TouchHandler.Finger2.Detected){
            this.CurrentX = x1;
            this.CurrentY = y1;
        }

        this.Dragging = true;
        
        if(e.TouchHandler.Finger2.Detected) return;

        // check if current touch x position is "MoveStep"-pixels (threshold) to the right
        if(this.LastX + this.MoveStep <= this.CurrentX ){
            this.LastX += this.MoveStep;
            this.Selected.Move(this.MoveStep, 0);
            return;
        }

        if(this.LastX - this.MoveStep >= this.CurrentX){
            this.LastX -= this.MoveStep;
            this.Selected.Move(this.MoveStep*(-1), 0);
            return;
        }

        if(this.LastY + this.MoveStep <= this.CurrentY ){
            this.LastY += this.MoveStep;
            this.Selected.Move(0, this.MoveStep);
            return;
        }

        if(this.LastY - this.MoveStep >= this.CurrentY){
            this.LastY -= this.MoveStep;
            this.Selected.Move(0, this.MoveStep*(-1));
            return;
        }


    }.getCallbackObject(this, "test");
    th.AddEventListener("movefinger1", ontouchmove1);

    var ontouchmove2 = function(e){
        //console.log("move");

        var x2 = e.TouchHandler.Finger2.X;
        var y2 = e.TouchHandler.Finger2.Y;

        if(e.TouchHandler.Finger2.Detected){
            this.CurrentX = x2;
            this.CurrentY = y2;
        }

        this.Dragging = false;
        this.Rotating = true;

        // check if current touch x position is "MoveStep"-pixels (threshold) to the right
        if(this.LastX + this.MoveStep <= this.CurrentX ){
            this.LastX += this.MoveStep;
            this.Selected.Shape.Rotate(this.RotateStep, true);
            return;
        }

        if(this.LastX - this.MoveStep >= this.CurrentX){
            this.LastX -= this.MoveStep;
            this.Selected.Shape.Rotate(this.RotateStep*(-1), true);
            return;
        }

    }.getCallbackObject(this, "test");
    th.AddEventListener("movefinger2", ontouchmove2);

    var ontouchend1 = function(e){
        this.Dragging = false;
        console.log("end");
    }.getCallbackObject(this, "test");
    th.AddEventListener("touchendfinger1", ontouchend1);

    var ontouchend2 = function(e){
        this.Rotating = false;
        console.log("end");
    }.getCallbackObject(this, "test");
    th.AddEventListener("touchendfinger2", ontouchend2);
};