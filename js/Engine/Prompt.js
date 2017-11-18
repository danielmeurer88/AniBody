/**
 * Represents a canvas and anibody-based alternative to the javascript prompt dialog
 * @param {string} m - message, that will be displayed above the input field
 * @param {callback-object} cbo - callback-object with the special feature, that the first parameter will be the user's input
 * @param {boolean} numpad - if true then a virtual numpad will be rendered beyond the input field
 * @returns {Prompt}
 */
function Prompt(m, cbo, numpad){
    Anibody.classes.ABO.call(this);
    
    if(typeof numpad === "undefined")
        numpad = false;
    
    this._numPad = numpad;
    
    // message 
    this.Message = m || "Input:";
    
    // an object that capsulates the function, which will be triggered -the user input as first argument- if users presses OK
    this.CallbackObject = cbo || {that:this, parameter:{}, function:function(input, p){console.log("Prompt: "+input);}};
    this.Input = "";
    
    var can = this.Engine.Canvas;
    
    this.X=0;
    this.Y=0;
    this.Width=can.width;
    this.Height=can.height;
    
    this.Opacity = 1;
    this.FontHeight = 16;
    this.FontPadding = 4;
    this.RowSpace = 3;
    this.Rows = [this.Message];
    this.RowLengths = [];
    
    this.BoxPadding = 10;
    
    this.InputField = false;
    
    this.BackgroundColor = Prompt.prototype.DefaultBackgroundColor;
    this.BorderColor = Prompt.prototype.DefaultBorderColor;
    this.FontColor = Prompt.prototype.DefaultFontColor;
    this.ButtonColor = Prompt.prototype.DefaultButtonColor;
    this.ButtonFontColor = Prompt.prototype.DefaultButtonFontColor;
    this.OutsideColor = Prompt.prototype.DefaultOutsideColor;
    
    // standard values for the box
    this.Box = {
        x : this.Width/4,
        y : this.Height/3,
        width: this.Width/2,
        height : this.Height/3,
        rounding : 8,
        type : "rrect"
    };
    
    // message box will have a variable size related to the height of the message
    this.MessageBox = {
        x : this.Box.x + this.BoxPadding,
        y : this.Box.y + this.BoxPadding,
        width: this.Box.width - 2*this.BoxPadding,
        height : this.Rows.length*this.FontHeight + (this.Rows.length-1)*this.RowSpace + 2*this.FontPadding,
        type : "rect"
    };
    
    this.InputBox = {
        height : this.FontHeight + 2*this.FontPadding // Input box is going to be only 1 row
    };
    
    this.NumButtonWidth = 40;
    this.NumButtonHeight = 40;
    
    this.NumFontHeight = (this.NumButtonWidth < this.NumButtonHeight) ? this.NumButtonWidth : this.NumButtonHeight;
    this.NumFontHeight *= 0.8;
    
    this.NumPad = {
        height : this.NumButtonHeight*4 + 3*this.RowSpace // 4 rows, each contain 50px-buttons - 5px space between these rows  
    };
    this.Numbers = [];
    
    this.Delete = {};
    
    
    this.ButtonBox = {
        height : 30 + 2*this.BoxPadding
    };
    
    this.OKButton = {};
    
    this.CancelButton = {};
    
    this.IsMouseOverBox = false;
    this.IsMouseOverInputBox = false;
    this.IsMouseOverOK = false;
    this.IsMouseOverCancel = false;
    this.IsMouseOverBackground = false;
    
    this.IsMouseOverNumber = [false,false,false,false,false,false,false,false,false,false];
    
    this._ref_draw = null;
    this._ref_update = null;
    this._ref_pi = null;
    this._ref_mhan = null;
    
    
this.Initialize();
}

Prompt.prototype = Object.create(Anibody.classes.ABO.prototype);
Prompt.prototype.constructor = Prompt;

Prompt.prototype.DefaultBackgroundColor = "#ccc";
Prompt.prototype.DefaultBorderColor = "#000";
Prompt.prototype.DefaultFontColor = "#222";
Prompt.prototype.DefaultButtonColor = "#aaa";
Prompt.prototype.DefaultButtonFontColor = "#111";

Prompt.prototype.DefaultOutsideColor = "rgba(0,0,0,0.6)";

/**
 * can be seen as an extension of the constructor function
 * @returns {undefined}
 */
Prompt.prototype.Initialize = function(){
    this._calculateRows();
    this._recalculateBoxValues();
    
    if(this._numPad)
        this.DeleteImage = this._getDeleteImage(this.NumButtonWidth,this.NumButtonHeight);
    
    this.InputField = new InputField(this.InputBox.x, this.InputBox.y, this.InputBox.width, this.InputBox.height);
};

/**
 * calculates how many rows are needed to display the message and
 * sets the needed sizes for MessageBox accordingly
 * @returns {undefined}
 */
Prompt.prototype._calculateRows = function(){
    
    // creating an offscreen canvas with the specific width and height
    var off = document.createElement("CANVAS");
    off.width = this.MessageBox.width;
    off.height = this.MessageBox.height;
    var c = off.getContext("2d");
    
    c.font = this.Engine.Context.font; 
    c.setFontHeight(this.FontHeight);
    
    var allwords = [];
    var texts = [this.Message];
    
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
            if(rowlengths[rows.length-1] + alllengths[i] + spacelen < this.MessageBox.width-2*this.FontPadding){
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
    
    this.Box = {
        x : 0, // needs to be calculated at the end of _recalculateBoxValues()
        y : 0, // needs to be calculated at the end of _recalculateBoxValues()
        width: maxw + 2*this.BoxPadding, // maxw was calculated with the width of the messagebox ( = box width without the padding)
        height : -1, // needs to be calculated at the end of _recalculateBoxValues()
        rounding : 8,
        type : "rrect"
    };
    
    this.MessageBox = {
        x : this.BoxPadding, // value relative to the Box.x
        y : this.BoxPadding, // value relative to the Box.y
        width: this.Box.width - 2*this.BoxPadding,
        height : this.Rows.length*this.FontHeight + (this.Rows.length-1)*this.RowSpace + 2*this.FontPadding,
        type : "rect"
    };
    
};

/**
 * the new height of the message box leads to the need to recalculate all values
 * @returns {undefined}
 */
Prompt.prototype._recalculateBoxValues = function(){
    
    // at this point, this.MessageBox has been calculated and the width of this.Box too
    
    this.InputBox = {
        x : this.MessageBox.x, // value relative to the Box.x
        y : this.MessageBox.y + this.MessageBox.height + this.BoxPadding, // value relative to the Box.x
        width: this.MessageBox.width,
        height : this.FontHeight + 2*this.FontPadding, // Input box is going to be only 1 row
        type : "rect"
    };
    
    // fake size numpad ...
    // so that the ButtonBox is able to build on this.NumPad even if the user does not want a numpad
    this.NumPad = {
        x : this.InputBox.x,
        y : this.InputBox.y + this.BoxPadding,
        width: this.MessageBox.width,
        height : 0,
        type : "rect"
    };
    
    // if user wants a numpad
    if(this._numPad){
        // real size numpad - only if user wants a numpad
        this.NumPad = {
            x : this.InputBox.x,
            y : this.InputBox.y + this.InputBox.height + this.BoxPadding,
            width: this.MessageBox.width,
            height : this.NumButtonHeight*4 + 3*this.RowSpace, // 4 rows, each contain 50px-buttons - 5px space between these rows  
            type : "rect"
        };
    
        var rowy = this.NumPad.y;
        this.Numbers = [];

        this.Numbers[7] = {
            x: this.NumPad.x,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        this.Numbers[8] = {
            x: this.NumPad.x + this.NumButtonWidth + this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        this.Numbers[9] = {
            x: this.NumPad.x + 2*this.NumButtonWidth + 2*this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        rowy = this.NumPad.y + this.NumButtonHeight + this.RowSpace;
        this.Numbers[4] = {
            x: this.NumPad.x,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        this.Numbers[5] = {
            x: this.NumPad.x + this.NumButtonWidth + this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        this.Numbers[6] = {
            x: this.NumPad.x + 2*this.NumButtonWidth + 2*this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        rowy = this.NumPad.y + 2*this.NumButtonHeight + 2*this.RowSpace;
        this.Numbers[1] = {
            x: this.NumPad.x,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        this.Numbers[2] = {
            x: this.NumPad.x + this.NumButtonWidth + this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };

        this.Numbers[3] = {
            x: this.NumPad.x + 2*this.NumButtonWidth + 2*this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth, height:this.NumButtonHeight,
            type:"rect"
        };
        
        this.Delete = {
            x: this.NumPad.x + 3*this.NumButtonWidth + 3*this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth*2, height:this.NumButtonHeight,
            type:"rect"
        };

        rowy = this.NumPad.y + 3*this.NumButtonHeight + 3*this.RowSpace;
        this.Numbers[0] = {
            x: this.NumPad.x,
            y: rowy,
            width:(this.NumButtonWidth*3 + this.RowSpace)/2,
            height:this.NumButtonHeight,
            type:"rect"
        };
        
        this.Numbers[10] = {
            x: this.Numbers[0].x + this.Numbers[0].width + this.RowSpace,
            y: rowy,
            width:(this.NumButtonWidth*3 + this.RowSpace)/2,
            height:this.NumButtonHeight,
            type:"rect"
        };
        this.Numbers[11] = {
            x: this.Numbers[10].x + this.Numbers[10].width + this.RowSpace,
            y: rowy,
            width:this.NumButtonWidth,
            height:this.NumButtonHeight,
            type:"rect"
        };
    }
    
    this.ButtonBox = {
        x : this.NumPad.x,
        y : this.NumPad.y + this.NumPad.height + this.BoxPadding,
        width: this.MessageBox.width,
        height : 30 + this.BoxPadding,
        type : "rect",
        background:true
    };
        
    var buttonWidth = this.ButtonBox.width / 3 + 10;
    this.OKButton = {
        x : this.ButtonBox.x + this.ButtonBox.width/4 - buttonWidth/2,
        y : this.ButtonBox.y + 2 + this.BoxPadding,
        width: buttonWidth,
        height : this.ButtonBox.height - 4,
        type : "rrect",
        rounding : 4
    };
    this.CancelButton = {
        x : this.ButtonBox.x + this.ButtonBox.width/4*3 - buttonWidth/2,
        y : this.ButtonBox.y + 2 + this.BoxPadding,
        width: buttonWidth,
        height : this.ButtonBox.height - 4,
        type : "rrect",
        rounding : 4
    };
    
    // adjusting this.Box´height 
    var comph = this.Box.height + this.MessageBox.height + this.InputBox.height + this.NumPad.height + this.ButtonBox.height;
    if(this._numPad)
        comph += 6*this.BoxPadding;
    else
        comph += 4*this.BoxPadding;
    this.Box.height = comph;
    
    // calculating how much the box has to move so that it is centered on the screen
    var dx = (this.Width - this.Box.width) / 2;
    var dy = (this.Height - this.Box.height) / 2;
    
    this.Move(dx, dy);
    
};

/**
 * moves the prompt box
 * @returns {undefined}
 */
Prompt.prototype.Move = function(dx,dy){
    // adjusting the other boxes and objects within these boxes, which are relatively placed to this.Box
    this.Box.x += dx;
    this.Box.y += dy;
    this.MessageBox.x += dx;
    this.MessageBox.y += dy;
    this.InputBox.x += dx;
    this.InputBox.y += dy;
    this.NumPad.x += dx;
    this.NumPad.y += dy;
    for(var i=0; this._numPad && i<this.Numbers.length; i++){
        this.Numbers[i].x += dx;
        this.Numbers[i].y += dy;
    }
    this.Delete.x += dx;
    this.Delete.y += dy;
    this.ButtonBox.x += dx;
    this.ButtonBox.y += dy;
    this.OKButton.x += dx;
    this.OKButton.y += dy;
    this.CancelButton.x += dx;
    this.CancelButton.y += dy;
};

/**
 * Starts/Opens the prompt dialog
 * @returns {undefined}
 */
Prompt.prototype.Start = function(){
    // started the input field already selected
    this.InputField.Selected = true;
    // defines and registers the needed "process input"-function
    var ipfo = this._createProcessInputFunctionObject();
    this._ref_ip = this.Engine.AddProcessInputFunction(ipfo);
    // defines and registers the needed "(foreground)-draw"-function
    var fdfo = this._createForegroundDrawFunctionObject();
    this._ref_draw = this.Engine.AddForegroundDrawFunctionObject(fdfo);
    // defines and registers the needed "update"-function
    var upd = this._createUpdateFunctionObject();
    this._ref_update = this.Engine.AddUpdateFunctionObject(upd);
    // defines and registers the needed "mouse handler"-function
    var mhand = this._createMouseHandlerObject();
    this._ref_mhan = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick",mhand);
    
};

/**
 * Stops the prompt dialog - will be called by the class
 * @returns {undefined}
 */
Prompt.prototype.Stop = function(){
    
    this.InputField.Selected = false;
    
    this.Engine.RemoveForegroundDrawFunctionObject(this._ref_draw);
    this._ref_draw = null;
    
    this.Engine.RemoveUpdateFunctionObject(this._ref_update);
    this._ref_update = null;
    
    this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref_mhan);
    this._ref_mhan = null;
    
    this.Engine.RemoveProcessInputFunction(this._ref_ip);
    this._ref_ip = null;
};

/**
 * creates a Mouse handler object, that is ready to be registered
 * @returns {object}
 */
Prompt.prototype._createMouseHandlerObject = function(){
    
    var f = function(e){
        
        e.GoThrough = false;
        
        if(this.IsMouseOverOK){
            this.ClickOnOK();
        }
        
        if(this.IsMouseOverCancel || this.IsMouseOverBackground){
            this.ClickOnCancel();
        }
        
        for(var i=0; i<this.Numbers.length; i++){
            if(this.IsMouseOverNumber[i]){
                var txt = i.toString();
                if(i==10) txt = ",";
                if(i==11) txt = "-";
                this.InputField.AddLetter(txt);
            }
        }
        
        if(this.IsMouseOverDelete){
            this.InputField.RemoveLetter();
        }
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};

/**
 * creates a foreground draw function object, that is ready to be registered
 * @returns {object}
 */
Prompt.prototype._createForegroundDrawFunctionObject = function(){
    
    var f = function(c){
        c.save();
        
        // outside
        c.globalAlpha = this.Opacity;
        c.fillStyle = this.OutsideColor;
        c.fillRect(0,0,c.canvas.width, c.canvas.height);
        
        c.setFontHeight(this.FontHeight);
        
        // whole box - background
        var box = this.Box;
        c.fillStyle = this.BackgroundColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, box.rounding);
        c.strokeStyle = this.BorderColor;
        c.strokeVariousRoundedRect(box.x, box.y, box.width, box.height, box.rounding);
                
        box = this.MessageBox;
        c.textAlign = "left";
        c.textBaseline = "top";
        c.fillStyle = this.FontColor;
        var rowspace = 0;
        for(var i=0; i<this.Rows.length; i++){
            c.fillText(this.Rows[i], this.MessageBox.x, this.MessageBox.y + i*this.FontHeight + rowspace);
            rowspace += this.RowSpace;
        }

        if(this.InputField)
            this.InputField.Draw(c); 
        c.restore();
        c.save();
        
        if(this._numPad){
            c.setFontHeight(this.NumFontHeight);
            var txt;
            for(var i=0; i<this.Numbers.length; i++){
                box = this.Numbers[i];
                c.fillStyle = this.ButtonColor;
                c.fillRect(box.x, box.y, box.width, box.height);
                c.fillStyle = this.ButtonFontColor;
                txt = i.toString();
                if(i==10) txt = ",";
                if(i==11) txt = "-";
                c.fillSpinnedText(box.x+box.width/2, box.y+box.height/2, txt, 0);
            }
            
            // delete
            box = this.Delete;
            c.fillStyle = this.ButtonColor;
            c.fillRect(box.x, box.y, box.width, box.height);
            c.fillStyle = this.ButtonFontColor;
            
            c.fillArrow2(box.x + box.width*0.9, box.y+box.height/2, box.x + box.width*0.1, box.y+box.height/2, box.height/2);
            

            c.setFontHeight(this.FontHeight);
        }
        
        box = this.OKButton;
        c.fillStyle = this.ButtonColor;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, box.rounding);
        box = this.CancelButton;
        c.fillVariousRoundedRect(box.x, box.y, box.width, box.height, box.rounding);
        
        box = this.OKButton;
        c.fillStyle = this.ButtonFontColor;
        c.fillSpinnedText(box.x+box.width/2, box.y+box.height/2, "OK", 0);
        box = this.CancelButton;
        c.fillSpinnedText(box.x+box.width/2, box.y+box.height/2, "Abbrechen", 0);

        c.restore();
    };
    
    return {that:this, function:f, parameter: this.Engine.Context};
};

/**
 * creates a process input function object, that is ready to be registered
 * @returns {object}
 */
Prompt.prototype._createProcessInputFunctionObject = function(){
    /*
    this.IsMouseOverBox = false;
    this.IsMouseOverInputBox = false;
    this.IsMouseOverOK = false;
    this.IsMouseOverCancel = false;
    */
    var f = function(en){
        
        var key = this.Engine.Input.Key;
        if(key.Enter.FramesPressed == 2){
            this.ClickOnOK();
        }
        
        if(key.Esc.FramesPressed == 2){
            this.ClickOnCancel();
        }
        
        var self = this;
        var area = {
            type:"function",
            function:function(c){
                // creating a negative winding rectangle path that equals to -1
                c.moveTo(0,0);
                c.lineTo(0, c.canvas.height);
                c.lineTo(c.canvas.width, c.canvas.height);
                c.lineTo(c.canvas.width, 0);
                c.lineTo(0, 0);
                // now content box as positive
                c.variousRoundedRect(self.Box.x, self.Box.y, self.Box.width, self.Box.height, self.Box.rounding);
            }
        };
        
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverBackground");
        
        this.Engine.Input.MouseHandler.AddHoverRequest(this.Box, this, "IsMouseOverBox");
        
        this.Engine.Input.MouseHandler.AddHoverRequest(this.Delete, this, "IsMouseOverDelete");
        
        this.Engine.Input.MouseHandler.AddHoverRequest(this.CancelButton, this, "IsMouseOverCancel");
        
        this.Engine.Input.MouseHandler.AddHoverRequest(this.OKButton, this, "IsMouseOverOK");
        
        for(var i=0; i<this.Numbers.length; i++){
            this.Engine.Input.MouseHandler.AddHoverRequest(this.Numbers[i], this.IsMouseOverNumber, i.toString());
        }
        
        if(this.InputField)
            this.InputField.ProcessInput();
        
    };
        
    return {that:this, function:f, parameter: this.Engine};
};

/**
 * creates a update function object, that is ready to be registered
 * @returns {object}
 */
Prompt.prototype._createUpdateFunctionObject = function(){
    
    var f = function(en){
          
        var overpad = false;
        for(var i=0; i<this.Numbers.length; i++){
            overpad = overpad || this.IsMouseOverNumber[i];
        }
        
        if(this.IsMouseOverOK || this.IsMouseOverCancel || overpad || this.IsMouseOverDelete)
            this.Engine.Input.Mouse.Cursor.Set("pointer");
        
        if(this.InputField)
            this.InputField.Update();
        
        this.Input = this._getInput();
        
    };
    
    return {that:this, function:f, parameter: this.Engine};
};

/**
 * Returns the string in the input field
 * @returns {string}
 */
Prompt.prototype._getInput = function(){
    return this.InputField.Text;
};

/**
 * Sets the text in the input field
 * @param {type} txt
 * @returns {undefined}
 */
Prompt.prototype._setInput = function(txt){
    this.InputField.Text = txt;
};

/**
 * Adds a limiter function, that returns if the character, typed by the user, is allowed or not
 * if the chartacter fails, the given callback can be triggered
 * @param {function} lim
 * @param {object} limFailCbo
 * @returns {undefined}
 */
Prompt.prototype.AddCharLimiter = function (lim, limFailCbo) {
        this.InputField.AddCharLimiter(lim, limFailCbo);
};

/**
 * triggers if user clicks on OK or presses enter
 * @returns {undefined}
 */
Prompt.prototype.ClickOnOK = function(){
    var cbo = this.CallbackObject;
    if(cbo)
        cbo.function.call(cbo.that, this.Input, cbo.parameter);
    this.Stop();
};
/**
 * triggers if user clicks on Cancel or presses esc
 * @returns {undefined}
 */
Prompt.prototype.ClickOnCancel = function(){
    this.Stop();
};

/**
 * Creates Delete-Image
 * @returns {undefined}
 */
Prompt.prototype._getDeleteImage = function(width,height){
    var can = document.createElement("canvas");
    can.width = width;
    can.height = height;
    var c = can.getContext("2d");
    
    c.beginPath();
    c.arrow(width*0.9, height*0.5, width*0.3, width*0.8, 180, 0.3, 1, false);
    c.fill();
    
    var url = can.toDataURL();
    var img = document.createElement("IMG");
    img.src = url;
    return img;
};