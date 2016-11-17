
function TouchPie(){
    ABO.call(this);
    
    this.Color = "#bbb";
    this.ColorSelected = "#999";
    this.SelectedPiePiece = -1;
    
    this.Offset = 2.5;
    this.StarAngles = false;
    this.EndAngles = false;
    this.CenterRepositionValue = false;
    this.Value = this.Offset * 2;
    
    this.Enabled = false;
    
    var stdco = {that:this, parameter:false, function:function(){
        
        console.log("Trigger: " + this.Labels[this.SelectedPiePiece]);
    }};
    this.COArray = [stdco,stdco,stdco,stdco];
    this.Labels = ["Right", "Bottom", "Left", "Top"];
    
    // the canvas attributes, to which the touch pie objects relates.
    this.CanvasWidth = 800;
    this.CanvasHeight = 600;
    
    this.Radius = this.CanvasHeight / 6;
    this.BottomMargin = 20;
    
this.Initialize();    
}
TouchPie.prototype = Object.create(ABO.prototype);
TouchPie.prototype.constructor = TouchPie;

TouchPie.prototype.Initialize = function(){
    
    var offset = this.Offset;

    this.StarAngles = [
        this.toRadians(315+offset), // right
        this.toRadians(45+offset), //bottom
        this.toRadians(135+offset), // left
        this.toRadians(225+offset) // top
    ];
    this.EndAngles = [
        this.toRadians(45-offset), // right
        this.toRadians(135-offset), //bottom
        this.toRadians(225-offset), // left
        this.toRadians(315-offset) // top
    ];
    
    var v = this.Value;
    this.CenterRepositionValue= [
        { x : v*1, y : v*0},
        { x : v*0, y : v*1},
        { x : v*(-1), y : v*0},
        { x : v*0, y : v*(-1)}
    ];
};

TouchPie.prototype.Draw = function(c){
    if(!this.Enabled) return;
    
    var piewidth = this.Value*2 + this.Radius*2;
    
    var x = this.Engine.Canvas.width / 2 - piewidth / 2;
    var y = this.Engine.Canvas.height - this.Radius*2 - this.BottomMargin;
    
    c.save();
    
    //offCanvas
    var can = document.createElement("CANVAS");
    can.width = can.height = piewidth;
    var con = can.getContext("2d");
    
    var crp = this.CenterRepositionValue;
    var center = this.Radius+this.Value;
 
    for(var i=0; i<4;i++){
        con.fillStyle = this.Color;
        if(this.SelectedPiePiece == i){
            con.fillStyle = this.ColorSelected;
        }
        con.beginPath();
        con.moveTo(center + crp[i].x,center + crp[i].y);
        con.arc(center,center,this.Radius,this.StarAngles[i],this.EndAngles[i]);
        con.lineTo(center+ crp[i].x,center+ crp[i].y);
        con.fill();
        con.closePath();
    }
    
    con.globalCompositeOperation = "destination-out";
    con.beginPath();
    con.moveTo(center,center);
    con.arc(center,center,this.Radius*0.3,0,2 * Math.PI, false);
    con.lineTo(center,center);
    con.fill();
    con.globalCompositeOperation = "source-over";
    
    // drawing the texts
    con.textAlign = "center";
    con.textBaseline = "middle";
    
    con.fillStyle = "black";
    con.fillText(this.Labels[0], center + this.Radius * 2 / 3, center);
    con.fillText(this.Labels[1], center, center + this.Radius * 2 / 3);
    con.fillText(this.Labels[2], center - this.Radius * 2 / 3, center);
    con.fillText(this.Labels[3], center, center  - this.Radius * 2 / 3);
    
    c.drawImage(can, x, y);
    
    c.restore();
};

TouchPie.prototype.Update = function(){
    var curcan = this.Engine.Canvas;
    if(curcan.width != this.CanvasWidth || curcan.height != this.CanvasHeight){
        this.CanvasWidth = curcan.width;
        this.CanvasHeight = curcan.height;
        
        var relval = this.CanvasHeight; // relating value
        if(this.CanvasWidth < this.CanvasHeight)
            relval = this.CanvasWidth;
        
        this.Radius = relval / 6;
    }
};

TouchPie.prototype.toRadians = function(deg) {
    return deg * Math.PI / 180;
};

TouchPie.prototype.SelectPiece = function(pp){
    if(pp != TouchPie.prototype.Pieces.None){
        this.SelectedPiePiece = pp;
        return this.SelectedPiePiece;
    }
    return this.DeselectPieces();
};

TouchPie.prototype.DeselectPieces = function(){
    return this.SelectedPiePiece = TouchPie.prototype.Pieces.None;
};

TouchPie.prototype.SetPiece = function(dir, label, co){
    if(dir == TouchPie.prototype.Pieces.None) return -1;
    this.COArray[dir] = co;
    this.Labels[dir] = label;
    return dir;
};
/**
 * 
 * @param {type} dir String, which is one of the English words [right, bottom, left, top] or the label description of the respective piece
 * @returns TouchPie.prototype.Piece
 */
TouchPie.prototype.GetPiece = function(dir){
    dir = dir.toLowerCase();
    if(dir == "right")
        return TouchPie.prototype.Pieces.Right;
    if(dir == "bottom")
        return TouchPie.prototype.Pieces.Bottom;
    if(dir == "left")
        return TouchPie.prototype.Pieces.Left;
    if(dir == "top")
        return TouchPie.prototype.Pieces.Top;
    for(var i=0; i<this.Labels.length; i++)
        if(dir == this.Labels[i].toLowerCase())
            return i;
    return -1;
};

TouchPie.prototype.Trigger = function(){
    if(this.SelectedPiePiece == TouchPie.prototype.Pieces.None)
        return;
    
    var co = this.COArray[this.SelectedPiePiece];
    co.function.call(co.that, co.parameter);
    this.Enabled = false;
};

TouchPie.prototype.Pieces = {
    Right : 0,
    Bottom : 1,
    Left : 2,
    Top : 3,
    None : -1
};
