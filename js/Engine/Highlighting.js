/**
 * Darkens the screen except for the area you want to highlight
 * @param {Object} area object of rectangle or circle
 * @param {Number} flow_ms Amount of milliseconds that needs to darken the screen
 * @param {Number} ms Amount of milliseconds that the screen stays darken
 * @returns {Highlighting}
 */
function Highlighting(area, flow_ms, ms){
    Anibody.classes.ABO.call(this);
    this.X=area.x;
    this.Y=area.y;
    this.Width=area.width || area.radius*2;
    this.Height=area.height || area.radius*2;
    this.Rounding = area.rounding || 0;
    this.Roundings = area.roundings || [area.rounding,area.rounding,area.rounding,area.rounding];
    this.Radius= area.radius || 0;
    
    // a function that draws an area (path)
    this.CallbackAreaFunction = area.function;
    
    this.Type = area.type || "vrrect";
        
    this.Title = "";
    this.TitleFontHeight = 26;
        
    this.Opacity = 0;
    
    this.IsMouseOverCanvas = false;
    
    this.Padding = Highlighting.prototype.DefaultPadding; // the distance between the the border of the black box and the texts
    this.RowSpace = Highlighting.prototype.DefaultRowSpace; // the distance between the text rows
    this.FontHeight = Highlighting.prototype.DefaultFontHeight;
    this.TextImage = false;
    this.TextImageBox = {x:0, y:0, width:0, height:0};
    this._text;
    
    // callback-object that will be called when the highlighting is over
    this.CallbackObject = {that:this, function:function(){return;}, parameter:"default"};
    
    this.FlowMilliseconds = flow_ms;
    this.Milliseconds = ms + this.FlowMilliseconds;
    this._ref_dfo = null;
    this._ref_mhan = null;
    this._ref_timeout = null;
    this._ref_pifo = null;
    
    this._instructionMode = false;
        
}
Highlighting.prototype = Object.create(Anibody.classes.ABO.prototype);
Highlighting.prototype.constructor = Highlighting;

Highlighting.prototype.OutsideColor = "rgba(0,0,0,0.8)";
Highlighting.prototype.TitleColor = "white";
Highlighting.prototype.TextBoxBackgroundColor = "black";
Highlighting.prototype.TextBoxFontColor = "white";

Highlighting.prototype.DefaultPadding = 8; // the distance between the the border of the black box and the texts
Highlighting.prototype.DefaultRowSpace = 5; // the distance between the text rows
Highlighting.prototype.DefaultFontHeight = 14;

/**
 * Starts the process (register a draw function) and ends it automatically (deregister)
 * @returns {undefined}
 */
Highlighting.prototype.Start = function(cbo){
        
    new Flow(this, "Opacity", 1, this.FlowMilliseconds,{
        that:this, parameter:true, function(){
        }
    }).Start();
    
    var dfo = this._createForegroundDrawFunctionObject();
    this._ref_dfo = this.Engine.AddForegroundDrawFunctionObject(dfo);
    
    this._ref_pifo = this.Engine.AddProcessInputFunction({
        that: this, parameter: true, function:
                function () {

                    var area = {
                        function : function(c){
                            c.rect(0,0,c.canvas.width, c.canvas.height);
                        },
                        type : "function"
                    };
                    
                    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverCanvas");
                                        
                }
    });
    
    if(typeof cbo === "object")
        this.CallbackObject = cbo;
    
    var closef= function(high){
                
        high.Engine.RemoveForegroundDrawFunctionObject(high._ref_dfo);
        high._ref_dfo = null;
        high.Engine.RemoveProcessInputFunction(high._ref_pifo);
        high._ref_pifo = null;
        high.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",high._ref_mhan);
        
        window.clearTimeout(high._ref_timeout);
        Callback.CallObject(high.CallbackObject);
    };
    
    this._ref_mhan = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick",{that:this, function:function(){
            closef(this);
    }, parameter: this.Engine});
    
    if(!this._instructionMode)
        this._ref_timeout = window.setTimeout(closef, this.Milliseconds, this);
};

/**
 * Creates a ForegroundDrawFunctionObject, which consists mainly of a drawing function, that will be used by the Engine
 * @returns {Highlighting.prototype._createForegroundDrawFunctionObject.HighlightingAnonym$1}
 */
Highlighting.prototype._createForegroundDrawFunctionObject = function(){
    
    // reaching the whished results through the knowledge of "non-zero winding number rule"
    
    var f = function(c){
        
        var can = this.Engine.Canvas;
        c.save();
        c.globalAlpha = this.Opacity;
        
        c.beginPath();
        c.fillStyle = this.OutsideColor;
        
        // creating a negative winding rectangle path that equals to -1
        c.moveTo(0,0);
        c.lineTo(0, can.height);
        c.lineTo(can.width, can.height);
        c.lineTo(can.width, 0);
        c.lineTo(0, 0);
        
        // then create a positve winding rectangle or circle on top of it that equals to zero again
        var found = false;
        
        if(!found && this.Type === "rect"){
            c.rect(this.X, this.Y, this.Width, this.Height);
            found = true;
        }
        
        if(!found && this.Type === "rrect"){
            c.variousRoundedRect(this.X, this.Y, this.Width, this.Height, this.Rounding);
            found = true;
        }
        
        if(!found && this.Type === "vrrect"){
            var r = this.Roundings;
            c.variousRoundedRect(this.X, this.Y, this.Width, this.Height, r[0]||0, r[1]||0, r[2]||0, r[3]||0);
            found = true;
        }
        
        if(!found && this.Type === "circle"){
            c.circle(this.X, this.Y, this.Radius, true);
            found = true;
        }
        
        if(!found && this.Type === "function"){
            Callback.CallObject(this.CallbackAreaFunction);
            found = true;
        }
        
        // resulting in a path that covers the whole screen except a little area somewhere in the middle
        c.fill();
        
        if(this.TextImage){
            var b = this.TextImageBox;
            c.drawImage(this.TextImage, b.x, b.y);
        }
        
        c.fillStyle = this.TitleColor;
        c.setFontHeight(this.TitleFontHeight);
        c.textAlign = "left";
        c.textBaseline = "top";
        
        c.fillText(this.Title, 10, 10);
        
        c.restore();
    };
    
    return {that: this, parameter:this.Engine, function:f};
    
};

/**
 * Creates a text (white on a black rectangle) and displays it next to highlighted area.
 * An object can be given to the function. It contents the x and y distant to
 * one point when you rectanglize the highlighted area.
 * (creating 4 outer points, which connected have the form of a rectangle)
 * @param {String|String-Array} texts
 * @param {x:Number,y:Number} offset position (optional)
 * @param {type} relpoint [1|2|3|4] (optional)
 * @returns {undefined}
 */
Highlighting.prototype.AddText = function(texts, position, relpoint){
    this._text = texts;
    // making sure that the 1 parameter is an array of strings
    if(typeof texts === "string")
        texts = [texts];
    
    var can = this.Engine.Canvas;
    var c = this.Engine.Context;
    var padding = this.Padding; // the distance between the the border of the black box and the texts
    var rowspace = this.RowSpace; // the distance between the text rows
    var fontheight = this.FontHeight;
    
    // setting the width of the text box
    this.TextImageBox.width = Math.round(can.width / 3);
    var width = this.TextImageBox.width;
    
    c.setFontHeight(fontheight); // setting the font height - needed for correct calculations
    
    var allwords = [];
    var alllengths = [];
    var spacelen = c.measureText(" ").width; // measures the length of the " "-symbol
    var rows = [];
    
    var temp;
    // loops through all elements of the string array
    for(var i=0; i<texts.length; i++){
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for(var j=0; j<temp.length; j++){
            allwords.push(temp[j]);
            alllengths.push( c.measureText(temp[j]).width );
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if(i < texts.length-1){
            allwords.push("\\n");
            alllengths.push( 0 );
        }
    }
    // at the end of the loop - we have two arrays
    // - allwords - which has all words
    // - alllengths - which has all lengths of the string element in 'allwords' with the same index
    
    // now we want to find out how many rows needs to be created so
    // - we use every word
    // - every row won't exceed the width of the box (considering the padding as well)
    // - every "\n" marks the end of the current row
    rows = [];
    var templen=0;
    rows.push("");
    for(var i=0; i<allwords.length; i++){
        
        if(allwords[i] === "\\n"){
            i++;
            rows.push(allwords[i] + " ");
            templen = 0 + alllengths[i] + spacelen;
        }else{
            // true if the current word won't exceed the width+padding of the box
            if(templen + alllengths[i] + spacelen < width-2*padding){
                // adds the word + " " to the current row
                rows[rows.length-1] += allwords[i] + " ";
                templen += alllengths[i] + spacelen;
            }else{
                // removes the last " "-symbol of the current row
                rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
                // begins a new row and adds the current word + " " to it
                rows.push(allwords[i] + " ");
                templen = 0 + alllengths[i] + spacelen;
            }
        }
    }
    // removes the last " "-symbol of the last row
    rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
    
    // now that we know how many rows there are, we can calculate the height
    this.TextImageBox.height = 2*padding + fontheight*rows.length + rowspace*rows.length-1;

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = this.TextImageBox.width;
    off.height = this.TextImageBox.height;
    var coff = off.getContext("2d");
    
    // creating the black box and writing all rows
    // ... 
    coff.setFontHeight(fontheight);
    
    coff.fillStyle=this.TextBoxBackgroundColor;
    coff.fillRect(0,0,off.width, off.height);
    
    coff.textAlign = "left";
    coff.textBaseline = "top";
    coff.fillStyle=this.TextBoxFontColor;
    
    coff.strokeStyle = this.TextBoxFontColor;
    
    var x = padding;
    var y = padding;
    
    for(var i=0; i< rows.length; i++){
        coff.fillText(rows[i], x,y);
        y += fontheight + rowspace;
    }
    
    // saving the drawing as an image
    var url = off.toDataURL();
    this.TextImage = document.createElement("IMG");
    this.TextImage.src = url;

    this._calculateBestTextPosition(position, relpoint);
};

/**
 * Calculates the best position for text or uses an user-defined position for the text
 * @param {x:Number,y:Number} p offset position (optional)
 * @param {Number} rel number of the rectanglized point [1|2|3|4] to which the
 * user-defined position relates (optional)
 * @returns {undefined}
 */
Highlighting.prototype._calculateBestTextPosition = function(p, rel){
    
    var can = this.Engine.Canvas;
    var center = {x:can.width/2, y:can.height/2}; // centroid of canvas
    var p1, p2, p3, p4; // top-left-point, top-right-p, bottom-right-p, bottom-left-p
    
    // the rectanglization
    // - creating the 4 outer points (p1,p2,p3,p4)
    // connected by a 4 lines, they render a rectangle
    if(this.Type === "circle"){
        p1 = {x:this.X - this.Radius, y:this.Y - this.Radius};
        p2 = {x:this.X + this.Radius, y:this.Y - this.Radius};
        p3 = {x:this.X + this.Radius, y:this.Y + this.Radius};
        p4 = {x:this.X - this.Radius, y:this.Y + this.Radius};
    }else{
        p1 = {x:this.X, y:this.Y};
        p2 = {x:this.X + this.Width, y:this.Y};
        p3 = {x:this.X + this.Width, y:this.Y + this.Height};
        p4 = {x:this.X, y:this.Y + this.Height};
    }
    
    // if there is a user-defined position
    if(p){
        // rel = 1 -> top left point
        // rel = 2 -> top right point
        // rel = 3 -> bottom right point
        // rel = 4 -> bottom left point
        
        switch(rel){
            case 1 : {
                this.TextImageBox.x = p1.x + p.x;
                this.TextImageBox.y = p1.y + p.y;
                return;
            }
            case 2 : {
                this.TextImageBox.x = p2.x + p.x;
                this.TextImageBox.y = p2.y + p.y;
                return;
            }
            case 3 : {
                this.TextImageBox.x = p3.x + p.x;
                this.TextImageBox.y = p3.y + p.y;
                return;
            }
            case 4 : {
                this.TextImageBox.x = p4.x + p.x;
                this.TextImageBox.y = p4.y + p.y;
                return;
            }
            default : {
                this.TextImageBox.x = p3.x + p.x;
                this.TextImageBox.y = p3.y + p.y;
                return;
            }
        }
        
    }
    
    // if the algorithm has to find the best position for the text by itself:
    
    // if we divide the canvas in 4 equal areas then now we want to find in which
    // of these 4 areas lies the bigger part of the highlighted area
    // the idea is the following:
    // we take the centroid of the canvas
    // we take the centroid of the rectangleized highlighted area
    // c. of area - c. of canvas = cp (control point)
    
    var cpx = (p1.x+p2.x+p3.x+p4.x)/4;
    var cpy = (p1.y+p2.y+p3.y+p4.y)/4;
    cpx -= center.x;
    cpy -= center.y;
    
    //console.log("cp(" +cpx+ " / " +cpy+ ")");
    
    // the x and y value of the control point tell us
    // in which corner the highlighted area mainly lies
    
    // if we know the corner then we position the text next to the opposite rectanglized point
    if(cpx > 0 && cpy > 0){
        // area is at the bottom right corner
        this.TextImageBox.x = p1.x - this.TextImageBox.width - 10;
        this.TextImageBox.y = p1.y - this.TextImageBox.height - 10;
    }
    
    if(cpx > 0 && cpy < 0){
        // area is at the top right corner
        this.TextImageBox.x = p4.x - this.TextImageBox.width - 10;
        this.TextImageBox.y = p4.y + 10;
    }
    
    if(cpx <= 0 && cpy >= 0){
        // area is at the bottom left corner
        this.TextImageBox.x = p2.x + 10;
        this.TextImageBox.y = p2.y - this.TextImageBox.height - 10;
    }
    
    if(cpx <= 0 && cpy <= 0){
        // area is at the top left corner
        this.TextImageBox.x = p3.x + 10;
        this.TextImageBox.y = p3.y + 10;
    }
    
    
    //some corrections, so that the image can always be completely seen
    if(this.TextImageBox.x < 0)
        this.TextImageBox.x = 0;
    
    if(this.TextImageBox.y < 0)
        this.TextImageBox.y = 0;
    
    if(this.TextImageBox.x + this.TextImageBox.width > can.width)
        this.TextImageBox.x = can.width - this.TextImageBox.width;
    
    if(this.TextImageBox.y + this.TextImageBox.height > can.height)
        this.TextImageBox.y = can.height - this.TextImageBox.height;
};
/**
 * While active a white text will be written on the upper left side of the canvas
 * @param {string} text - the title
 * @param {number} fh - font height of the title
 * @returns {undefined}
 */
Highlighting.prototype.AddTitle = function(text, fh){
    this.Title = text;
    this.TitleFontHeight = fh || 26;
};
/**
 * Highlighted area will be increased
 * @param {number} inc - pixel
 * @returns {undefined}
 */
Highlighting.prototype.IncreaseArea = function(inc){
    if(this.Type === "circle"){
        this.Radius += inc;
    }else{
        this.Width += 2*inc;
        this.Height += 2*inc;
        this.X -= inc;
        this.Y -= inc;
    }
    
    
};
/**
 * rounds the edges of the highlighted area
 * @param {number} r
 * @returns {undefined}
 */
Highlighting.prototype.RoundingArea = function(r){
    this.Rounding = r;
    this.Type = "rrect";
};

/**
 * Moves highlighted area
 * @param {number} dx
 * @param {number} dy
 * @returns {undefined}
 */
Highlighting.prototype.MoveArea = function(dx, dy){
    this.X += dx;
    this.Y += dy;
};
/**
 * adds a callback-object that will be called when the highlighting is over
 * @param {type} cbo
 * @returns {undefined}
 */
Highlighting.prototype.AddCallbackObject = function(cbo){
    this.CallbackObject = cbo;
};
/**
 * Sets Highlighting instance to instruction mode - a mode, in which the highlight won't vanish after a period of time only after a left click
 * @param {type} title
 * @returns {undefined}
 */
Highlighting.prototype.SetInstructionMode = function(bool, title){
    this._instructionMode = bool;
    if(bool && typeof title !== "undefined")
        this.AddTitle(title);
};