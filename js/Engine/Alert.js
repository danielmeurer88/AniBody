/**
 * Presents a dialog
 * @param {type} abo
 * @returns {Alert}
 */
function Alert(text){
    ABO.call(this);
    
    this.X=0;
    this.Y=0;
    this.Width;
    this.Height;

    // the quotient, which will be multiplied with the canvas width to calculate the width of the alert box
    this.ContentWidthQuotient = 0.6;
    
    this.Text = text;
    this.ImageText = false;
    this.Rows = [];
    this.RowLengths = [];
            
    this.Rounding = Alert.prototype.DefaultRounding;
    this.FontHeight = Alert.prototype.DefaultFontHeight;
    this.BoxPadding = Alert.prototype.DefaultBoxPadding;
    this.RowSpace = Alert.prototype.DefaultRowSpace;
    this.FontPadding = this.BoxPadding;
    
    // the whole confirm dialog box
    this.ContentBox = {};
    
    this.OkBox = {
        x:0,
        y:0,
        width:60,
        height:40
    };
        
    this.IsMouseOverOk = false;;
    this.IsMouseOverContent = false;
    this.IsMouseOverBackground = false;
        
    this.Opacity = 0;
    
    this._ref_ip = null;
    this._ref_draw = null;
    this._ref_upd = null;
    this._ref_mhan = null;
    
    this._cbo = false;
    
this.Initialize();
}
Alert.prototype = Object.create(ABO.prototype);
Alert.prototype.constructor = Alert;

Alert.prototype.ContentBoxColor = "#999";
Alert.prototype.BoxBorderColor = "black";
Alert.prototype.BoxColor = "#ccc";
Alert.prototype.BoxFontColor = "#fff";
Alert.prototype.OutsideColor = "rgba(0,0,0,0.8)";
Alert.prototype.DefaultRounding = 10;
Alert.prototype.DefaultFontHeight = 18;
Alert.prototype.DefaultBoxPadding = 5;
Alert.prototype.DefaultRowSpace = 4;

/**
 * Can be seen as an extension of the constructor function
 * @returns {undefined}
 */
Alert.prototype.Initialize = function () {
    
    this._createTextImage();
    
    this._recalculateSizes();
    
};

Alert.prototype._createTextImage = function () {
    
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = this.Engine.Canvas.width*this.ContentWidthQuotient;
    off.height = 300;
    var c = off.getContext("2d");
    
    c.font = this.Engine.Context.font; 
    c.setFontHeight(this.FontHeight);
    
    var allwords = [];
    if(typeof this.Text === "string")
        var texts = [this.Text];
    else
        var texts = this.Text;
    
    var temp;
    // loops through all elements of the string array
    for(var i=0; i<texts.length; i++){
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for(var j=0; j<temp.length; j++){
            allwords.push(temp[j]);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if(i < texts.length-1){
            allwords.push("\\n");
        }
    }
    
    var spacelen = c.measureText(" ").width; // measures the length of the " "-symbol
    var alllengths = [];

    for(var i=0; i<allwords.length; i++){
        if(allwords[i] !== "\\n")
            alllengths.push( c.measureText(allwords[i]).width );
        else
            alllengths.push(0);
    }

    var rows = [];
    var rowlengths = [];
    rows.push("");
    rowlengths.push(0);

    for(var i=0; i<allwords.length; i++){

        if(allwords[i] === "\\n"){
            i++;
            rows.push(allwords[i] + " ");
            rowlengths.push(0 + alllengths[i] + spacelen);
        }else{
            // true if the current word won't exceed the width+padding of the box
            if(rowlengths[rows.length-1] + alllengths[i] + spacelen < off.width-2*this.FontPadding){
                // adds the word + " " to the current row
                rows[rows.length-1] += allwords[i] + " ";
                rowlengths[rows.length-1] += alllengths[i] + spacelen;
            }else{
                // removes the last " "-symbol of the current row
                rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
                rowlengths[rows.length-1] -= spacelen;
                // begins a new row and adds the current word + " " to it
                rows.push(allwords[i] + " ");
                rowlengths.push(alllengths[i] + spacelen);
            }
        }
    }
    // removes the last " "-symbol of the last row
    rows[rows.length-1] = rows[rows.length-1].substr(0,rows[rows.length-1].length-1);
    // now that we know how many rows there are, we can calculate the height

    this.Rows = rows;
    this.RowLengths = rowlengths;
    
    // finding the maximum length among the rows...
    var maxw = 0;
    for(var i=0; i<rows.length; i++){
        if(rowlengths[i] > maxw)
            maxw = rowlengths[i];
    }
    // and resize the width
        
    var box = {
        x : this.BoxPadding,
        y : this.BoxPadding,
        width: maxw + 2*this.BoxPadding,
        height : this.Rows.length*this.FontHeight + (this.Rows.length-1)*this.RowSpace + 2*this.FontPadding,
        type : "rect"
    };
    
    // creating an offscreen canvas AGAIN with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = box.width;
    off.height = box.height;
    var c = off.getContext("2d");
    c.setFontHeight(this.FontHeight);
    c.textAlign = "left";
    c.textBaseline = "top";
    
    for(var i=0; i<this.Rows.length; i++){
        c.fillText(this.Rows[i], box.x, box.y + this.FontHeight*i + this.RowSpace*i);
    }
    this.ImageText = document.createElement("IMG");
    this.ImageText.width = off.width;
    this.ImageText.height = box.height;
    this.ImageText.src = off.toDataURL();
    
};

/**
 * recalculate the necessary size of the Alert.
 * @returns {undefined}
 */
Alert.prototype._recalculateSizes = function () {
    
    var margin = this.BoxPadding;    
    var can = this.Engine.Canvas;
    
    this.Width = can.width;
    this.Height = can.height;

    this.ContentBox.width = this.ImageText.width;
    this.ContentBox.height = this.ImageText.height + this.OkBox.height + 2*margin;
    
    this.ContentBox.x = can.width/2 - this.ContentBox.width/2;
    this.ContentBox.y = can.height/2 - this.ContentBox.height/2;
    
    // 
    this.OkBox.x = this.ContentBox.x+(this.ContentBox.width/2) - this.OkBox.width/2;
    this.OkBox.y = this.ContentBox.y+this.ContentBox.height - this.OkBox.height - margin;
    
};
/**
 * creates a foreground draw function object, that is ready to be registered
 * @returns {object}
 */
Alert.prototype._createForegroundDrawFunctionObject = function(){
    
    var f = function(c){
        c.save();

        c.globalAlpha = this.Opacity;
        c.fillStyle = this.OutsideColor;
        c.fillRect(0,0,c.canvas.width, c.canvas.height);
        
        
        var box = this.ContentBox;
        c.beginPath();
        c.variousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding);
        c.clip();
        
        c.fillStyle = this.ContentBoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, 0);
        
        // drawing text
        c.drawImage(this.ImageText, this.ContentBox.x, this.ContentBox.y)

        c.restore();
        c.save();

        
        // Ok
        var box = this.OkBox;
        c.setFontHeight(box.height*0.5);
        
        c.fillStyle = this.BoxColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding/3*2);
        c.fillStyle = this.BoxFontColor;
        c.fillSpinnedText(box.x + box.width/2, box.y + box.height/2,"OK",0);
        
        c.restore();
        
        c.save();
        c.strokeStyle = this.BoxBorderColor;
        c.lineWidth = 5;
        
        var box = this.ContentBox;
        c.strokeVariousRoundedRect(box.x, box.y, box.width, box.height, this.Rounding);
        c.restore();
        
    };
    
    return {that:this, function:f, parameter: this.Engine.Context};
};
/**
 * creates a process input function object, that is ready to be registered
 * @returns {object}
 */
Alert.prototype._createProcessInputFunctionObject = function(){
    
    var f = function(en){
                
        var box = this.ContentBox;
        
        var area = {
            function:function(c){
                // creating a negative winding rectangle path that equals to -1
                c.moveTo(0,0);
                c.lineTo(0, c.canvas.height);
                c.lineTo(c.canvas.width, c.canvas.height);
                c.lineTo(c.canvas.width, 0);
                c.lineTo(0, 0);
                // now content box as positive
                c.rect(box.x, box.y, box.width, box.height);
            },
            type:"function"
        };
        
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverBackground");
        
        var area = {
            x:box.x, y:box.y, width:box.width, height:box.height, rounding:0,
            type:"rrect"
        };
        
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverContent");
        
        box = this.OkBox;
        area = {
            x:box.x, y:box.y, width:box.width, height:box.height, rounding:0,
            type:"rrect"
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverOk");
        
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};
/**
 * creates a update function object, that is ready to be registered
 * @returns {object}
 */
Alert.prototype._createUpdateFunctionObject = function(){
    
    var f = function(en){
        
        this._recalculateSizes();
                
        if(this.IsMouseOverOk)
            this.Engine.Input.Mouse.Cursor.Set("pointer");
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};
/**
 * creates a Mouse handler object, that is ready to be registered
 * @returns {object}
 */
Alert.prototype._createMouseHandlerObject = function(){
    
    var f = function(e){
        
        e.GoThrough = false;
        
        if(this.IsMouseOverOk){
            this.Stop();
        }
        
        if(this.IsMouseOverBackground){
            this.Stop();
        }
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};

/**
 * Starts/Opens the Presenter dialog box
 * @returns {undefined}
 */
Alert.prototype.Start = function (cbo) {
    this.Active = true;
    
    new Flow(this, "Opacity", 1, 600,{
        that:this, parameter:true, function: function(p){}
    }).Start();
    
    var ipfo = this._createProcessInputFunctionObject();
    this._ref_ip = this.Engine.AddProcessInputFunction(ipfo);
    
    var fdfo = this._createForegroundDrawFunctionObject();
    this._ref_draw = this.Engine.AddForegroundDrawFunctionObject(fdfo);
    
    var upd = this._createUpdateFunctionObject();
    this._ref_upd = this.Engine.AddUpdateFunctionObject(upd);
    
    var mhand = this._createMouseHandlerObject();
    this._ref_mhan = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick",mhand);
    
    this._cbo = cbo;
};
/**
 * Stops the presenter dialog - will be called by the class
 * @returns {undefined}
 */
Alert.prototype.Stop = function () {
    this.Active = false;
    
    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_draw);
    this._ref_draw = null;
    this.Engine.RemoveUpdateFunctionObject(this._ref_upd);
    this._ref_upd = null;
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref_mhan);
    this._ref_mhan = null;
    this.Engine.RemoveProcessInputFunction(this._ref_ip);
    this._ref_ip = null;
    
    Callback.CallObject(this._cbo);
};