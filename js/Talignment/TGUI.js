function TGUI(){
    Anibody.EngineObject.call(this);

    this.Ts = [];

    this.Widget = null;

    this._movestep = 25;
    this._keyModulo = 10;

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

    this.Initialization();
}
TGUI.prototype = Object.create(Anibody.EngineObject.prototype);
TGUI.prototype.constructor = TGUI;

TGUI.prototype.Initialization = function(){

    var red = new T("red", 0, 0);

    var green = new T("green", 0, 245);

    var blue = new T("blue", 300, 140);

    var yellow = new T("yellow", 200, 200);
    yellow.Shape.Selected = true;
    this.Ts.push(red, green, blue, yellow);

    this.Widget = new Anibody.Widget();
    this.Widget.that = this;
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
        var movestep = that._movestep * this.moveInhancer;


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
    };

    this.Widget.Register();

    var onmouseclickcbo = function (event) {

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.SelectPiece();

    }.getCallbackObject(this);

    this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", onmouseclickcbo);

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

TGUI.prototype.SelectPiece = function(){
    var i;
    var seli = null;

    for(i=0; i<4; i++){
        if(this.Ts[i].IsMouseOver){
            this.Ts[3].Shape.Selected = false;
            this.Ts[i].Shape.Selected = true;
            seli = i;
        }

    }

    if(seli !== null){
        var temp = this.Ts.delete(seli);
        this.Ts.push(temp);
    }
        
};