function TGUI(){
    Anibody.EngineObject.call(this);

    this.Ts = [];
    this.BlockSize = 50;

    this.Widget = null;

    this._keyModulo = 10;

    // touch and mouse related dragging
    this.StartX = 0;
    this.StartY = 0;
    this.LastX = 0;
    this.LastY = 0;
    this.CurrentX = 0;
    this.CurrentY = 0;
    this.MoveStep = 5;
    this.RotateStep = Math.PI * 0.05;
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

    var len = this.BlockSize*9 + 25;
    var start = 50;

    this._tl = {x:start, y:start};
    this._tr = {x:start+len, y:start};
    this._br = {x:start+len, y:start+len};
    this._bl = {x:start, y:start+len};

    this.Button = {
        Test : null,
        Cam : null
    };

this.Initialize();
}
TGUI.prototype = Object.create(Anibody.EngineObject.prototype);
TGUI.prototype.constructor = TGUI;

TGUI.prototype.Initialize = function(){

    var red = new T("red", this.MoveStep*2, this.MoveStep*2, this.BlockSize);
    red.Name = "Red";

    var green = new T("green", this.MoveStep*4, this.MoveStep*4, this.BlockSize);
    green.Name = "Green";

    var blue = new T("blue", this.MoveStep*8, this.MoveStep*8, this.BlockSize);
    blue.Name = "Blue";

    var yellow = new T("yellow", this.MoveStep*16, this.MoveStep*16, this.BlockSize);
    yellow.Name = "Yellow";
    yellow.Shape.Selected = true;
    this.Ts.push(red, green, blue, yellow);

    this.Widget = new Anibody.Widget();
    this.Widget.that = this;

    this._createButtons();

    this._overwriteProcessInputOfWidget();

    this.Widget.Register();

    // register Mouse handler
    this._registerMouseHandler();

    // register Touch 
    this._registerTouchListener();
    
};

TGUI.prototype.ProcessInput = function(){
    var i;

    for(var key in this.Button)
        this.Button[key].ProcessInput();

    for(i=0; i<4; i++)
        this.Ts[i].ProcessInput();
};

TGUI.prototype.Update = function(){
    var i;

    for(var key in this.Button)
        this.Button[key].Update();

    for(i=0; i<4; i++){
        this.Ts[i].Update();
    }
        
};

TGUI.prototype.Draw = function(c){
    var i;

    c.save();
    c.fillStyle = "white";
    c.fillRect(0,0,c.canvas.width, c.canvas.height);

    c.beginPath();
    c.moveTo(this._tl.x, this._tl.y);
    c.lineTo(this._tr.x, this._tr.y);
    c.lineTo(this._br.x, this._br.y);
    c.lineTo(this._bl.x, this._bl.y);
    c.closePath();
    c.stroke();

    for(var key in this.Button)
        this.Button[key].Draw(c);

    for(i=0; i<4; i++)
        this.Ts[i].Draw(c);

    c.restore();
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

TGUI.prototype._createButtons = function(){
    
    var can = this.Engine.Canvas;
    var portrait = false;

    if(can.height > can.width)
        portrait = true;

    if(!portrait){
        // landscape canvas

        // test
        this.Button.Test = new Button(can.width - 100, can.height/2 - 60,
            {
                Label: "Test",
                Width: 80,
                Height: 40,
                DisplayType: "color",
                ColorCode: "red",
                TriggerCallbackObject: function (gui) {
                    var inlim = false;
                    var col = gui._getCollision()
                    if(!col){
                        inlim = gui._inLimits();
                    }

                    var res = inlim && !col;

                    //new Anibody.ui.Alert(res).Start();
                    console.log(`In Limits: ${inlim} and No collision: ${!col}`);

                }.getCallbackObject("self",this),
                HoverText: "Tests if the pieces are colliding".decodeURI()
        });
        this.Button.Test.AddButtonEffect();

        this.Button.Cam = new Button(can.width - 60, can.height - 60,
            {
                Width: 50,
                Height: 50,
                DisplayType: "both",
                Codename: "cam",
                ColorCode: "#d77",
                TriggerCallbackObject: function () {
                    
                    this.Engine.Context.download();

                }.getCallbackObject("self"),
                HoverText: "Tests if the pieces are colliding".decodeURI()
        });
        this.Button.Cam.ClickEasement = 20;
        this.Button.Cam.AddButtonEffect();

    }

};

TGUI.prototype._getCollision = function(){
    var collision = false;

    // more collision checks than necessary but still a bug exists
    // still a pair of two Ts - (often different color)
    // if one of the pair and the other one collides - it won't be detected
    // TODO

    //console.log(`Order: ${this.Ts[0].Name}, ${this.Ts[1].Name}, ${this.Ts[2].Name}, ${this.Ts[3].Name}`);

    collision = this.Ts[0].IsThereCollision([this.Ts[1], this.Ts[2], this.Ts[3]]);

    return collision;
};

TGUI.prototype._inLimits = function(){

    var s,p, pok;
    
    var tl = this._tl;
    var br = this._br;

    pok = true;

    for(var j=0;pok && j<4; j++){
        s = this.Ts[j].Shape;
        for(var i=0;pok && i<s.Points.length; i++){
            pok = false;
            p = s.Points[i];
            if(tl.x <= p.x && br.x >= p.x && tl.y <= p.y && br.y >= p.y)
                pok = true;
            else{
                console.log(["j", j, "i", i, "topleft", tl, "bottomright", br, "p", p]);
            }
        }
    }

    return pok;
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
        var movestep = that.MoveStep * this.moveInhancer;


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
            that.Selected.Shape.Rotate(that.RotateStep*(-1));
        }

        if (keys.E.FramesPressed % that._keyModulo === 1) {
            that.Selected.Shape.Rotate(that.RotateStep);
        }
    };
};

TGUI.prototype._registerMouseHandler = function(){
    var mh = this.Engine.Input.MouseHandler;


    var onmousedowncbo = function (event) {
        var mpos = event.Mouse.Position;
        event.Handled = true;

        var x = mpos.X;
        var y = mpos.Y;

        this.StartX = x;
        this.StartY = y;
        this.CurrentX = this.StartX;
        this.CurrentY = this.StartY;
        this.LastX = this.StartX;
        this.LastY = this.StartY;
        
        if(event.Type === "left"){
            this.SelectPiece();
            this.Dragging = true;
        }else{
            this.Rotating = true;
        }

    }.getCallbackObject(this);

    var onmousemovecbo = function(event){

        if(!this.Dragging && !this.Rotating) return;

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.CurrentX = mpos.X;
        this.CurrentY = mpos.Y;

        if(event.Type === "left"){
            this.Dragging = true;
            this.Rotating = false;
        }else{
            this.Dragging = false;
            this.Rotating = true;
        }
        
        // check if current touch x position is "MoveStep"-pixels (threshold) to the right
        if(this.LastX + this.MoveStep <= this.CurrentX ){
            this.LastX += this.MoveStep;
            if(this.Dragging)
                this.Selected.Move(this.MoveStep, 0);
            else
                this.Selected.Shape.Rotate(this.RotateStep, true);
            return;
        }

        if(this.LastX - this.MoveStep >= this.CurrentX){
            this.LastX -= this.MoveStep;
            if(this.Dragging)
                this.Selected.Move(this.MoveStep*(-1), 0);
            else
                this.Selected.Shape.Rotate(this.RotateStep*(-1), true);
            return;
        }

        if(this.Dragging && this.LastY + this.MoveStep <= this.CurrentY ){
            this.LastY += this.MoveStep;
            this.Selected.Move(0, this.MoveStep);
            return;
        }

        if(this.Dragging && this.LastY - this.MoveStep >= this.CurrentY){
            this.LastY -= this.MoveStep;
            this.Selected.Move(0, this.MoveStep*(-1));
            return;
        }


    }.getCallbackObject(this);

    var onmouseupcbo = function(event){
        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.CurrentX = mpos.X;
        this.CurrentY = mpos.Y;
        
        this.Dragging = false;
        this.Rotating = false;
        

    }.getCallbackObject(this);

    mh.AddMouseHandler("mousedown", onmousedowncbo, 12);

    mh.AddMouseHandler("mousemove", onmousemovecbo, 12);
    
    mh.AddMouseHandler("mouseup", onmouseupcbo, 12);

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