/**
 * Stellt eine Switch in dem Versuch "Elektrolytischer Trog" dar.
 * Wird automatisch von der Klasse "Wanne" erstellt
 * @param {type} x
 * @param {type} y
 * @param {type} width
 * @param {type} height
 * @param {type} type - "Stab" oder "Zylinder"
 * @returns {Switch}
 */
function Switch(x, y, width, height, cbo, on){
    ABO.call(this);
    
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
    this._innerRectDepth = Math.ceil( Math.min(width,height) * 0.1);
    
    if(typeof on !== "undefined" && on)
        this.ON = true;
    else
        this.ON = false;
    
    if(typeof cbo === "undefined" || !cbo)
        cbo = {that:this,function:function(){}};
    this.CallbackObject = cbo;
    
    this.Cover = {
        x : this.X,
        y : this.Y,
        width : this.Width*0.6,
        height : this.Height
    };
    this.CoverLayer = false;
    
    this.CoverX = {
        Off : this.X,
        On : this.X + this.Width - this.Cover.width
    };
    
    this.BackgroundColor = Switch.prototype.DefaultBackgroundColor;
    this.CoverColor = Switch.prototype.DefaultCoverColor;
    
    this.IsMouseOver = false;
    
    this.TextOn = "An";
    this.TextOff = "Aus";
    this.FontHeight = this.Height*0.5;
    
    this.ColorOn = Switch.prototype.DefaultColorOn;
    this.ColorOff = Switch.prototype.DefaultColorOff;
    this.SwitchFontColor = Switch.prototype.DefaultFontColor;
    this.LabelFontColor = Switch.prototype.DefaultLabelFontColor;
    
    this.Label = "";
    this.LabelPos = "top"; // top, right, bottom, left
    
    this._ref = null;
    
this.Initialize();
}
Switch.prototype = Object.create(ABO.prototype);
Switch.prototype.constructor = Switch;

Switch.prototype.DefaultBackgroundColor = "grey";
Switch.prototype.DefaultCoverColor = false;

Switch.prototype.DefaultLabelFontColor = "black";

Switch.prototype.DefaultFontColor = "white";
Switch.prototype.DefaultColorOn = "green";
Switch.prototype.DefaultColorOff = "red";

Switch.prototype.DefaultRounding = 4;


Switch.prototype.Initialize = function(){
    this.AddMouseHandler();
    
    if(!this.CoverColor)
        this.CoverColor = this._getRGBA(this.BackgroundColor,1,0.3);
    
    if(this.ON){
        this.Cover.x = this.CoverX.On;
    }else{
        this.Cover.x = this.CoverX.Off;
    }
    
    this._createCoverLayer();
};

Switch.prototype.Switch = function(cbo){
    
    this.ON = !this.ON;
    var target;
    var ms = 300;
    
    if(this.ON){
        target = this.CoverX.On;
    }else{
        target = this.CoverX.Off;
    }
    
    new Flow(this.Cover, "x", target, ms).Start();
    
    if(typeof cbo === "undefined")
        cbo = this.CallbackObject;
    
    window.setTimeout(function(cbo){
        Callback.CallObject(cbo);
    }, ms/2, cbo);
};

Switch.prototype.SetOn = function(state){
    
    this.ON = state;
    var target;
    
    if(this.ON){
        target = this.CoverX.On;
    }else{
        target = this.CoverX.Off;
    }
    
    this.Cover.x = target;
};

Switch.prototype.SetCallbackObject = function(cbo){
    
    this.CallbackObject = cbo;
};

Switch.prototype.Draw = function(c){
    c.save();
    var ir = this._innerRectDepth;
    
    c.fillStyle = this.BackgroundColor;
    c.fillRect(this.X, this.Y, this.Width, this.Height);
    
    c.fillStyle = this.ColorOn;
    c.fillRect(this.X + ir, this.Y + ir, (this.Width/2)-ir, this.Height-2*ir);
    
    c.fillStyle = this.ColorOff;
    c.fillRect(this.X + (this.Width/2), this.Y + ir, (this.Width/2)-ir, this.Height-2*ir);
    
    // Text
    c.fillStyle = this.SwitchFontColor;
    c.setFontHeight(this.FontHeight);
    c.textBaseline = "middle";
    
    c.textAlign = "left";
    c.fillText(this.TextOn, this.X+2*ir, this.Y+this.Height/2);
    
    c.textAlign = "right";
    c.fillText(this.TextOff, this.X+this.Width-2*ir, this.Y+this.Height/2);
    
    // COVER
    c.fillStyle = this.CoverColor;
    c.fillRect(this.Cover.x, this.Cover.y, this.Cover.width, this.Cover.height);
    if(this.CoverLayer)
        c.drawImage(this.CoverLayer, this.Cover.x, this.Cover.y);
    
    
    
    if(this.IsMouseOver){
        // direction arrows
        var x1 = this.Cover.x + this.Cover.width*0.2;
        var x2 = this.Cover.x + this.Cover.width*0.8;
        var y = this.Y + this.Height/2;
        c.fillStyle = "white";
        c.beginPath();
        if(this.ON){
            // arrow to the left
            c.arrow2(x2,y,x1,y,this.Cover.height*0.5,0.5);
        }else{
            // arrow to the right
            c.arrow2(x1,y,x2,y,this.Cover.height*0.5,0.5);
        }
        c.fill();
        // hover shade
        c.fillStyle = "rgba(0,0,0,0.2)";
        c.fillRect(this.Cover.x, this.Cover.y, this.Cover.width, this.Cover.height);
        
        
    }
        
    
    // Label
    if(this.Label.length > 0){
        var fh = 16;
        c.setFontHeight(fh);
        var tw = c.measureText(this.Label).width;
        var tx, ty;

        switch(this.LabelPos){
            case "top" : {
                c.textAlign = "center";
                tx = this.X + this.Width/2;
                ty = this.Y - ir - fh/2;    
                break;
            }
        }
        c.fillStyle = this.LabelFontColor;
        c.fillText(this.Label, tx, ty);
        
    }
    
    c.restore();
};

Switch.prototype.Update = function(){
    if(this.IsMouseOver){
        this.Engine.Input.Mouse.Cursor.Set("pointer");
    }
};

Switch.prototype.ProcessInput = function(){
    this.Engine.Input.MouseHandler.AddHoverRequest(this.GetArea(0,this.Rounding), this, "IsMouseOver");    
};

Switch.prototype.AddMouseHandler = function(){

    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter: this.Engine,
        that: this,
        function: function (e, engine) {
            if(this.IsMouseOver){
                e.GoThrough=false;
                this.Switch();
            }
        }
    }, 5);

};

Switch.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref); this._ref= null;};

Switch.prototype._createCoverLayer = function(depth, stops){
    if(isNaN(depth))
        depth = this._innerRectDepth;
    
    if(typeof stops === "undefined" || stops.length <= 0)
        stops = [
            {stop:0, color:"rgba(255,255,255,0.5)"},
            {stop:0.5, color:"rgba(255,255,255,0.25)"},
            {stop:1, color:"rgba(255,255,255,0)"}
        ];
    //stops sort
    stops = stops.sort(function(a,b){
        if(a.stop > b.stop) return 1; else return -1;
    });
    
    var stops_b = [
            {stop:0, color:"rgba(0,0,0,0.5)"},
            {stop:0.5, color:"rgba(0,0,0,0.25)"},
            {stop:1, color:"rgba(0,0,0,0)"}
        ];
    //stops sort
    stops_b = stops_b.sort(function(a,b){
        if(a.stop > b.stop) return 1; else return -1;
    });
    
    // shorter variables
    var w = this.Cover.width;
    var h = this.Cover.height;
    
    // ------------------------------ Boxes
    var top = {x:0, y:0, width: w, height: depth};
    var bottom = {x:0, y: h - depth, width: w, height: depth};
    // ---------------------------------
    
    // creating an offscreen canvas to draw upon
    var can = document.createElement("CANVAS");
    can.width = w;
    can.height = h;
    var c = can.getContext("2d");
    
    // drawing top
    var ling = c.createLinearGradient(top.x,top.y,top.x,top.height);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops[i].stop, stops[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(top.x, top.y, top.width, top.height);
    
    // drawing bottom
    ling = c.createLinearGradient(bottom.x,bottom.y+bottom.height,bottom.x,bottom.y);
    for(var i=0; i<stops.length ;i++){
        ling.addColorStop(stops_b[i].stop, stops_b[i].color);
    }
    // drawing linear gradient
    c.fillStyle = ling;
    c.fillRect(bottom.x, bottom.y, bottom.width, bottom.height);
    
    
    
    // creating the image
    var url = can.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    
    this.CoverLayer = img;
    
};

Switch.prototype._getRGBA = function(color, alpha, inc_quot){
    
    var rgbaCode;
    
    if(typeof color !== "string"){
        return false;
    }
    
    if(typeof alpha === "undefined" || alpha < 0 && alpha > 1){
        alpha = 1;
    }
    
    if(typeof inc_quot === "undefined" && isNaN(inc_quot)){
        inc_quot = 0;
    }
        
    var can = document.createElement("CANVAS");
    can.width = 1;
    can.height = 1;
    var c = can.getContext("2d");
    c.fillStyle = color;
    c.fillRect(0,0,1,1);
    var imageData = c.getImageData(0, 0, 1, 1).data;
    
    imageData[0] += 255*inc_quot;
    if(imageData[0] > 255) imageData[0] = 255;
    if(imageData[0] < 0) imageData[0] = 0;
    
    imageData[1] += 255*inc_quot;
    if(imageData[1] > 255) imageData[1] = 255;
    if(imageData[1] < 0) imageData[1] = 0;
    
    imageData[2] += 255*inc_quot;
    if(imageData[2] > 255) imageData[2] = 255;
    if(imageData[2] < 0) imageData[2] = 0;
    
    rgbaCode = "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + "," +alpha+")";
    
    return rgbaCode;
};

Switch.prototype.SetLabel = function(text, pos){
    
    if(typeof text === "string")
        this.Label = text;
    
    if(pos==="left"||pos==="top"||pos==="right"||pos==="bottom")
        this.LabelPos = pos;
    
};