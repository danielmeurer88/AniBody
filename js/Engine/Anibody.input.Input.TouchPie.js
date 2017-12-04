Anibody.SetPackage("Anibody", "input", "Input");

// -------------------- 
// Do not use this at the moment!!

/**
 * represents a pie with 4 slices (pieces). Each slice can be selected by touchmove
 * functions, in the form of callback objecs, can be registered to each slice
 * @returns {TouchPie}
 */
Anibody.input.Input.TouchPie = function TouchPie(){
    Anibody.ABO.call(this);
    
    this.Color = "#bbb";
    this.ColorSelected = "#999";
    this.SelectedPiePiece = -1;
    
    this.Offset = 2.5;
    this.StartAngles = false;
    this.EndAngles = false;
    this.CenterRepositionValue = false;
    this.Value = this.Offset * 2;
    
    this.Enabled = false;
    
    var stdcbo = function(where){
        return {that:this, parameter:where,
            function:function(where){console.log("Trigger: " + where);}};
    };
    this.COArray = [stdcbo("right"),stdcbo("bottom"),stdcbo("left"),stdcbo("top")];
    this.Labels = ["Right", "Bottom", "Left", "Top"];
    
    // the canvas attributes, to which the touch pie objects relates.
    this.CanvasWidth = 800;
    this.CanvasHeight = 600;
    
    this.Radius = this.CanvasHeight / 6;
    this.BottomMargin = 20;
    
this.Initialize();    
};
Anibody.input.Input.TouchPie.prototype = Object.create(Anibody.ABO.prototype);
Anibody.input.Input.TouchPie.prototype.constructor = Anibody.input.Input.TouchPie;
/**
 * @see README_DOKU.txt
 */
Anibody.input.Input.TouchPie.prototype.Initialize = function(){
    
    var offset = this.Offset;
    var _toRadians = function(deg) {return deg * Math.PI / 180;};

    this.StartAngles = [
        _toRadians(315+offset), // right
        _toRadians(45+offset), //bottom
        _toRadians(135+offset), // left
        _toRadians(225+offset) // top
    ];
    this.EndAngles = [
        _toRadians(45-offset), // right
        _toRadians(135-offset), //bottom
        _toRadians(225-offset), // left
        _toRadians(315-offset) // top
    ];
    
    var v = this.Value;
    this.CenterRepositionValue= [
        { x : v*1, y : v*0},
        { x : v*0, y : v*1},
        { x : v*(-1), y : v*0},
        { x : v*0, y : v*(-1)}
    ];
};
/**
 * @see README_DOKU.txt
 */
Anibody.input.Input.TouchPie.prototype.Draw = function(c){
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
        con.arc(center,center,this.Radius,this.StartAngles[i],this.EndAngles[i]);
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
    con.closePath();
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
/**
 * @see README_DOKU.txt
 */
Anibody.input.Input.TouchPie.prototype.Update = function(){
    // checks if the canvas size has changed
    var curcan = this.Engine.Canvas;
    if(curcan.width != this.CanvasWidth || curcan.height != this.CanvasHeight){
        
        // if it has, size will be saved and pie radius will be adjusted
        
        this.CanvasWidth = curcan.width;
        this.CanvasHeight = curcan.height;
        
        var relval = Math.min(this.CanvasHeight,this.CanvasWidth) ; // relating value        
        this.Radius = relval / 6;
    }
};

/**
 * Sets the given pie piece as the selected pie piece
 * @param {object} pp - given pie piece
 * @returns {Anibody.input.Input.TouchPie.prototype.Pieces.None|Number|.Object@call;create.Pieces.None|Object.prototype.Pieces.None}
 */
Anibody.input.Input.TouchPie.prototype.SelectPiece = function(pp){
    if(pp != Anibody.input.Input.TouchPie.prototype.Pieces.None){
        this.SelectedPiePiece = pp;
        return this.SelectedPiePiece;
    }
    return this.DeselectPieces();
};

/**
 * Deselects the currently selected piece
 * @returns {Anibody.input.Input.TouchPie.prototype.Pieces.None}
 */
Anibody.input.Input.TouchPie.prototype.DeselectPieces = function(){
    return this.SelectedPiePiece = Anibody.input.Input.TouchPie.prototype.Pieces.None;
};

Anibody.input.Input.TouchPie.prototype.SetPiece = function(dir, label, co){
    if(dir == Anibody.input.Input.TouchPie.prototype.Pieces.None) return -1;
    this.COArray[dir] = co;
    this.Labels[dir] = label;
    return dir;
};
/**
 * Returns the respective pie piece or its index according to given string in 'dir'
 * @param {string} dir - returns respective pie piece if you use 'right','bottom', 'left', or 'top'
 * returns the label description of the respective piece
 * @returns {Anibody.input.Input.TouchPie.prototype.Piece|| number}
 */
Anibody.input.Input.TouchPie.prototype.GetPiece = function(dir){
    dir = dir.toLowerCase();
    if(dir === "right")
        return Anibody.input.Input.TouchPie.prototype.Pieces.Right;
    if(dir === "bottom")
        return Anibody.input.Input.TouchPie.prototype.Pieces.Bottom;
    if(dir === "left")
        return Anibody.input.Input.TouchPie.prototype.Pieces.Left;
    if(dir === "top")
        return Anibody.input.Input.TouchPie.prototype.Pieces.Top;
    
    return -1;
};
/**
 * triggers the registered callback object of the currently selected pie piece
 * @returns {undefined}
 */
Anibody.input.Input.TouchPie.prototype.Trigger = function(){
    if(this.SelectedPiePiece === Anibody.input.Input.TouchPie.prototype.Pieces.None)
        return;
    
    var cbo = this.COArray[this.SelectedPiePiece];
    Anibody.CallObject(cbo);
    this.Enabled = false;
};

/**
 * enum of the pieces
 */
Anibody.input.Input.TouchPie.prototype.Pieces = {
    Right : 0,
    Bottom : 1,
    Left : 2,
    Top : 3,
    None : -1
};
