/**
 * Represents a dialog box, in which the user can choose from different options
 * @param {string|string-array} text
 * @param {string-array} labels
 * @param {callobject-array} cbos
 * @returns {MultipleChoice}
 */
function MultipleChoice(text,labels, cbos){
    ABO.call(this);
    
    this.X=0;
    this.Y=0;
    this.Width;
    this.Height;
    
    // the quotient, which will be multiplied with the canvas width to calculate the width of the alert box
    this.ContentWidthQuotient = 0.7;

    this.Text = text;
    this.ImageText = false;
    this.Rows = [];
    this.RowLengths = [];
    
    this.CallbackObjects = [];
    for(var i=0; i<cbos.length; i++){
        this.CallbackObjects[i] = {
            that:this,
            parameter:cbos[i],
            function:function(cbo){
                Callback.CallObject(cbo);
                this.Stop();
            }
        };
    }
    this.Labels = labels;
        
    this.Rounding = MultipleChoice.prototype.DefaultRounding;
    this.FontHeight = MultipleChoice.prototype.DefaultFontHeight;
    this.BoxPadding = MultipleChoice.prototype.DefaultBoxPadding;
    this.RowSpace = MultipleChoice.prototype.DefaultRowSpace;
    this.FontPadding = this.BoxPadding;
    
    // the whole dialog box
    this.ContentBox = {};
    
    this.Buttons = [];
    
    this.IsMouseOverContent = false;
    this.IsMouseOverBackground = false;
        
    this.Opacity = 0;
    
    this._ref_ip = null;
    this._ref_draw = null;
    this._ref_upd = null;
    this._ref_mhan = null;
    
this.Initialize();
}
MultipleChoice.prototype = Object.create(ABO.prototype);
MultipleChoice.prototype.constructor = MultipleChoice;

MultipleChoice.prototype.ContentBoxColor = "#999";
MultipleChoice.prototype.BoxBorderColor = "black";
MultipleChoice.prototype.BoxColor = "#ccc";
MultipleChoice.prototype.BoxFontColor = "#fff";
MultipleChoice.prototype.OutsideColor = "rgba(0,0,0,0.8)";
MultipleChoice.prototype.DefaultRounding = 10;
MultipleChoice.prototype.DefaultFontHeight = 18;
MultipleChoice.prototype.DefaultBoxPadding = 5;
MultipleChoice.prototype.DefaultRowSpace = 4;

/**
 * Can be seen as an extension of the constructor function
 * @returns {undefined}
 */
MultipleChoice.prototype.Initialize = function () {
    
    this._createTextImage();
    this._initSizes();
    this._recalculateSizes();
    
};

MultipleChoice.prototype._createTextImage = function () {
    
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

MultipleChoice.prototype._initSizes = function () {
    
    var margin = this.BoxPadding;    
    var can = this.Engine.Canvas;
    var c = this.Engine.Context;
    
    // width, height = complete screen
    this.Width = can.width;
    this.Height = can.height;
    
    var boxh = this.FontHeight*2; // height of a single box
    var fh = this.FontHeight;
    
    this.ContentBox.width = this.ImageText.width;
    this.ContentBox.height = this.ImageText.height + (this.Labels.length*boxh) + ((this.Labels.length-1)*this.RowSpace) + 2*margin;
    
    c.save();
    c.setFontHeight(fh);
    var txtw;
    var bpad;
    // looping all choices
    for(var i=0; i<this.Labels.length; i++){
        txtw = c.measureText(this.Labels[i]).width;
        bpad = (this.ContentBox.width - txtw)/2;
        this.Buttons[i] = new Button(
                margin, //x
                margin + this.ImageText.height + (i*boxh) + (i*this.RowSpace), //y
                this.ContentBox.width - 2*margin, // width
                boxh, // height
                {
                    DisplayType: "color", TextColor: "white", FontHeight: fh,
                    Label : this.Labels[i], Padding:bpad,
                    TriggerCallbackObject: this.CallbackObjects[i],
                    HoverText: this.Labels[i]
                }
        );
        
    }
    
    c.restore();
};

/**
 * recalculate the necessary size of the MultipleChoice.
 * @returns {undefined}
 */
MultipleChoice.prototype._recalculateSizes = function () {
    
    var margin = this.BoxPadding;    
    var can = this.Engine.Canvas;
    
    // width, height = complete screen
    this.Width = can.width;
    this.Height = can.height;
    
    var boxh = this.FontHeight*2; // height of a single box
    
    this.ContentBox.width = this.ImageText.width;
    this.ContentBox.height = this.ImageText.height + (this.Labels.length*boxh) + ((this.Labels.length-1)*this.RowSpace) + 2*margin;
    
    this.ContentBox.x = this.Width/2 - (this.ContentBox.width/2);
    this.ContentBox.y = this.Height/2 - (this.ContentBox.height/2);
        
    // looping all choices
    for(var i=0; i<this.Labels.length; i++){
        this.Buttons[i].X = this.ContentBox.x + margin;
        this.Buttons[i].Y = this.ContentBox.y + margin + this.ImageText.height + (i*boxh) + (i*this.RowSpace);
    };
};
/**
 * creates a foreground draw function object, that is ready to be registered
 * @returns {object}
 */
MultipleChoice.prototype._createForegroundDrawFunctionObject = function(){
    
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
        
        for(var i=0; i<this.Buttons.length; i++){
            this.Buttons[i].Draw(c);
        }
        
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
MultipleChoice.prototype._createProcessInputFunctionObject = function(){
    
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
        
        for(var i=0; i<this.Buttons.length; i++){
            this.Buttons[i].ProcessInput();
        }
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};
/**
 * creates a update function object, that is ready to be registered
 * @returns {object}
 */
MultipleChoice.prototype._createUpdateFunctionObject = function(){
    
    var f = function(en){
        
        this._recalculateSizes();
                
        for(var i=0; i<this.Buttons.length; i++){
            this.Buttons[i].Update();
        }
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};
/**
 * creates a Mouse handler object, that is ready to be registered
 * @returns {object}
 */
MultipleChoice.prototype._createMouseHandlerObject = function(){
    
    var f = function(e){
        
        
        
        if(this.IsMouseOverBackground){
            this.Stop();
            e.GoThrough = false;
        }
        
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};

/**
 * Starts/Opens the Presenter dialog box
 * @returns {undefined}
 */
MultipleChoice.prototype.Start = function () {
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
    
};
/**
 * Stops the presenter dialog - will be called by the class
 * @returns {undefined}
 */
MultipleChoice.prototype.Stop = function () {
    this.Active = false;
    
    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_draw);
    this._ref_draw = null;
    this.Engine.RemoveUpdateFunctionObject(this._ref_upd);
    this._ref_upd = null;
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref_mhan);
    this._ref_mhan = null;
    this.Engine.RemoveProcessInputFunction(this._ref_ip);
    this._ref_ip = null;
};
