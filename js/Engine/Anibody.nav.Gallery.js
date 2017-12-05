Anibody.SetPackage("Anibody", "nav");

/**
 * Represents a user definable sized horizontal box, which can display ABO-items
 * the user is always able to reach every item through horizontal scrolling
 * @param {type} x x-value of the box
 * @param {type} y y-value of the box
 * @param {type} w width of the box
 * @param {type} h complete height of the box (including the title height)
 * @param {String} t string of the title
 * @param {type} th height of the title stripe
 * @returns {Gallery}
 */
Anibody.nav.Gallery = function Gallery(x,y,w,h, t, th){
    Anibody.ABO.call(this);
    
    this.X = x;
    this.Y = y;
    this.Width = w;
    this.Height = h;
    this.TitleHeight = th || 20;
    this.TitleRounding = this.TitleHeight / 4;
    this.DisplayHeight = this.Height - 2*this.TitleHeight; // the title bar + the scroll bar
    
    this.ItemsWidth = 0;
    
    this.OffsetX = 0; // the value, to which the position of all items relate - and the value which can be changed by scrolling 
    
    this.Title = t || "Galerie";
    
    this._minimized = false;
    
    this.PreItemUpdateCBO = {that:this,function(item, index, parameter){return;},parameter:{}};
    this.Items = [];
    this.PostItemUpdateCBO = {that:this,function(item, index, parameter){return;},parameter:{}};
    
    this.HandleHeight = 20;
    this.Fac = 0;
    this.Handle = {
        x : this.X,
        y : this.Y + this.Height - this.TitleHeight,
        width : this.Width,
        height : this.TitleHeight,
    };
    this.HandleRounding = 4;
    
    // will be zero after user dragged or scrolled - it will be used to detect an intented click on "minimize" or "close"
    this._framesAfterDragging = 0;
    
    this.Draggable = true;
    
    this._dragging = false;
    this._scrolling = false;
    
    this.IsMouseOver = false;
    this.IsMouseOverTitle = false;
    this.IsMouseOverHandle = false;
    this.IsMouseOverClose = false;
    this.IsMouseOverMinimize = false;
    this.IsMouseOverDisplay = false;
    this.TrueClosing = true; // if true instance won't be accessable anymore when user presses on close
    // if false - box will minimize and move to the bottom of the screen
    
    this.Closed = false;
    this.TrulyClosed = false;
    this.PositionBeforeClosing = {x:0, y:0};
    
    this._ref = null;
    this._ref_PIF = null;
    this._ref_W = null;
    
this.Initialize();
}
Anibody.nav.Gallery.prototype = Object.create(Anibody.ABO.prototype);
Anibody.nav.Gallery.prototype.constructor = Anibody.nav.Gallery;

Object.defineProperty(Anibody.nav.Gallery, "name", {value:"Gallery"});

Anibody.nav.Gallery.prototype.TitleColor = "#ddd";
Anibody.nav.Gallery.prototype.Color = "#eee";
Anibody.nav.Gallery.prototype.HandleColor = "#999";

/**
 * @see README_DOKU.txt
 */
Anibody.nav.Gallery.prototype.Initialize = function(){
    
    // the registration of the mouse click

    this.AddProcessInputFunctionObject();
    
    this.AddMouseHandler();
};

Anibody.nav.Gallery.prototype.SetDraggable = function(val){
    
    // if the state of draggable changes ...
    if(this.Draggable !== val){
        // will it be from true to false
        if(this.Draggable){
            // deactivate
            this.Draggable = false;
        }else{
            // activate
            this.Draggable = true;
        }
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.nav.Gallery.prototype.AddMouseHandler = function(){

    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter : this.Engine,
        that : this,
        function : function(e, engine){
            
            if(this.IsMouseOverMinimize){
                if(this._framesAfterDragging > 1)
                    this.ClickOnMinimize();
                e.Handled = true;
            }
            
            if(this.IsMouseOverClose){
                if(this._framesAfterDragging > 1)
                    this.ClickOnClose();
                e.Handled = true;
            }
            
        }
    }, 100);
    this._ref_W = this.Engine.Input.MouseHandler.AddMouseHandler("wheel", {
        parameter : this.Engine,
        that : this,
        function : function(e, engine){
            
            if(this.IsMouseOver){
                // transform vertical scrolling into horizontal movement
                var d = { X : e.Delta.Y, Y: e.Delta.X};
                this._scrolling = true;
                this.UpdateHandle(d);
                e.Handled = true;
            }
                        
        }
    }, 100);
};
/**
 * Checks the input information (mouse info) and manages the attributes of the BoxMenu
 * which allows scrolling the handle or dragging/moving the whole box
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.AddProcessInputFunctionObject = function(){

    this._ref_PIF = this.Engine.AddProcessInputFunctionObject({
        parameter: this.Engine,
        that: this,
        function: function (engine) {
                        
            var mouse = engine.Input.Mouse;
            
            if(this.IsMouseOverHandle && mouse.Left.Down){
                this._scrolling = true;
            }
            
            if(this.Draggable && this.IsMouseOverTitle  && mouse.Left.Down){
                this._dragging = true;
            }
            
            if(mouse.Left.Up){
                this._scrolling = false;
                this._dragging = false;
            }
        }
    }, 5);
};
/**
 * @see README_DOKU.txt
 */
Anibody.nav.Gallery.prototype.RemoveMouseHandler = function(){
    if(this._ref!=null){
        this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref);
        this._ref=null;
    }
};
/**
 * Removes the Process Input Function - called when the BoxMenu is supposed to be deleted
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.RemoveProcessInputFunctionObject = function(){
    if(this._ref_PIF!= null){
        this.Engine.RemoveProcessInputFunctionObject(this._ref_PIF);
        this._ref_PIF = null;
    }
};
/**
 * @see README_DOKU.txt
 */
Anibody.nav.Gallery.prototype.Draw = function(c){
    c.save();
    
    // title
    c.fillStyle = this.TitleColor;
    c.fillVariousRoundedRect(this.X, this.Y, this.Width, this.TitleHeight, this.TitleRounding,this.TitleRounding,0,0);
    
    if(this.Draggable && this.IsMouseOverTitle){
        c.fillStyle = "rgba(0,0,0,0.2)";
        c.fillVariousRoundedRect(this.X, this.Y, this.Width - 10 - 2*this.TitleHeight, this.TitleHeight, 5,0,0,0);
    }
    
    // title items
    var off = this.TitleHeight / 5;
    var box = {
        x : this.X + this.Width - 5 - this.TitleHeight + off,
        y : this.Y + off,
        width : this.TitleHeight-2*off,
        height : this.TitleHeight - off*2
    };
    
    if(this.Draggable){
    
        // closing X
        c.strokeStyle = "black";
        c.beginPath();
        c.moveTo(box.x, box.y);
        c.lineTo(box.x+box.width, box.y + box.height);
        c.moveTo(box.x, box.y + box.height);
        c.lineTo(box.x + box.width, box.y);
        c.stroke();
        c.closePath();

        if(this.IsMouseOverClose){
            c.fillStyle = "rgba(0,0,0,0.2)";
            c.fillRect(box.x-off, box.y-off, box.width+2*off, box.height+2*off);
        }

        // the minimizing icon
        box.x -= (this.TitleHeight+5);
        if(this._minimized){
            c.strokeRect(box.x, box.y, box.width, box.height);
        }else{
            c.beginPath();
            c.moveTo(box.x, box.y + box.height-this.TitleHeight*0.15);
            c.lineTo(box.x+box.width, box.y + box.height-this.TitleHeight*0.15);
            c.stroke();
            c.closePath();
    }
    
        if(this.IsMouseOverMinimize){
            c.fillStyle = "rgba(0,0,0,0.2)";
            c.fillRect(box.x-off, box.y-off, box.width+2*off, box.height+2*off);
        }
    }
    
    
    // drawing the title text
    c.textAlign = "left";
    c.textBaseline = "top";
    c.fillStyle = "black";
    c.setFontHeight(this.TitleHeight-off);
    c.fillText(this.Title, this.X+10, this.Y+off);
    
    if(!this._minimized){
        
        //box body
        c.fillStyle = this.Color;
        c.fillRect(this.X, this.Y + this.TitleHeight, this.Width, this.Height - this.TitleHeight);

        // seperate line between display und scrollbar
        c.strokeStyle = "rgba(0,0,0,0.6)";
        c.beginPath();
        c.moveTo(this.X, this.Y + this.TitleHeight + this.DisplayHeight);
        c.lineTo(this.X + this.Width, this.Y + this.TitleHeight + this.DisplayHeight);
        c.stroke();
        c.closePath();

        c.fillStyle = this.HandleColor;
        c.fillVariousRoundedRect(this.Handle.x, this.Handle.y, this.Handle.width, this.Handle.height, this.HandleRounding);
        // the handle
        if(this.IsMouseOverHandle){
            c.fillStyle = "rgba(0,0,0,0.2)";
            c.fillVariousRoundedRect(this.Handle.x, this.Handle.y, this.Handle.width, this.Handle.height, 4);
        }

        // clipping
        c.beginPath();
        c.rect(this.X, this.Y + this.TitleHeight, this.Width, this.DisplayHeight);
        c.clip();

        // items
        for(var i=0; i<this.Items.length; i++){
            this.Items[i].item.Draw(c);
        }
    }
    c.restore();
};
/**
 * gets the combined width of all items
 * @returns {Number}
 */
Anibody.nav.Gallery.prototype.GetItemsWidth = function(){
    var max = 0;
    for(var i=0; i<this.Items.length; i++){
        max += this.Items[i].item.Width + this.Items[i].offset.x;
    }
    
    if(max > this.Width)
        return max;
    else
        return this.Width;
    
};
/**
 * @see README_DOKU.txt
 */
Anibody.nav.Gallery.prototype.ProcessInput = function(){
        
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // adding a hover Request for: the whole box
    var area = this.GetArea();
    area.type = "vrrect";
    area.roundings = [this.TitleRounding,this.TitleRounding,0,0];
    // the area of the whole box containts other areas, with which we are going to add further hover requests
    // but the area of the box is in the background and the others are overlapping
    area.background = true;
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");
    
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    if(this.Draggable){
        area = {
            x: this.X,
            y: this.Y,
            width : this.Width,
            height : this.TitleHeight,
            type : "vrrect",
            roundings : [this.TitleRounding,this.TitleRounding,0,0]
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverTitle");
    }
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if(this.Draggable){
        area = {
            x: this.X+this.Width-5-this.TitleHeight,
            y: this.Y,
            width : this.TitleHeight,
            height : this.TitleHeight,
            type : "rect"
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverClose");
    }
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if(this.Draggable){
        area = {
            x: this.X+this.Width-10-2*this.TitleHeight,
            y: this.Y,
            width : this.TitleHeight,
            height : this.TitleHeight,
            type : "rect"
        };
        this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverMinimize");
    }
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    area = {
        x: this.X,
        y: this.Y + this.TitleHeight,
        width : this.Width,
        height : this.DisplayHeight,
        type : "rect"
    };
    area.background = true;
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverDisplay");
    
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    area = {
        x: this.Handle.x,
        y: this.Handle.y,
        width : this.Handle.width,
        height : this.Handle.height,
        rounding : this.HandleRounding,
        type : "rrect"
    };
    this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverHandle");
    
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    if(!this._minimized){
        
        var item;
        // update all items if mouse is over display
        for(var i=0; this.IsMouseOverDisplay && i<this.Items.length; i++){
            item = this.Items[i].item;
            item.ProcessInput();
            
        }
    }
    
};
/**
 * @see README_DOKU.txt
 */
Anibody.nav.Gallery.prototype.Update = function(){
    
    var item;

    this._framesAfterDragging++;
    if(this._dragging || this._scrolling)
        this._framesAfterDragging = 0;
    
    var m = this.Engine.Input.Mouse.Position;
    
    this.UpdateBox(m.Delta);
      
    // if it is NOT minimized
    if(!this._minimized){
        
        // update all items if mouse is over display
        for(var i=0; this.IsMouseOverDisplay && this._framesAfterDragging > 1 && i<this.Items.length; i++){
            item = this.Items[i].item;
            item.Update();
        }
                
        // update the scrolling of the handle
        this.UpdateHandle(m.Delta);
        
    }
    
    // adjust the position of the items
    this.AdjustItemsPosition();
    
    if(this.IsMouseOverTitle || this.IsMouseOverHandle || this.IsMouseOverMinimize || this.IsMouseOverClose)
        this.Engine.Input.Mouse.Cursor.Set("pointer");
    
};
/**
 * updates the handle (position and height) according the displayed items
 * should be called by the programmer when the number or the position of items has changed
 * will be called automatically when the user scrolls the box
 * @param {object} d - holds the scroll information
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.UpdateHandle = function(d){
    var refresh = false;
    if(arguments.length <= 0 || !d){
        d = {Y:0};
        refresh = true;
    }
    
    this.ItemsWidth = this.GetItemsWidth();
    this.Fac = this.Width / this.ItemsWidth;
    this.Handle.width = this.Width * this.Fac;
    
    if(refresh || this._scrolling && !isNaN(d.X)){
        // scrolls the handle 
        this.Handle.x += d.X;
        
        // scrolls the content of the box
        this.OffsetX -= d.X / this.Fac;
        
        this.AdjustHandle();
        
    }
    
    
};
/**
 * drags the box according to the information and checks if the title bar of the box is within the canvas borders
 * @param {object} d - hold the dragging information
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.UpdateBox = function(d){
    
    if(this._dragging && !isNaN(d.Y)){
        
        var reldistance = {x: this.Handle.x - this.X, y: this.Handle.y - this.Y};
        
        this.X += d.X;
        this.Handle.x += d.X;
        this.Y += d.Y;
        this.Handle.y += d.Y;
        
        var can = this.Engine.Canvas;
        // not draggable offscreen
        if(this.X < 0){
            this.X = 0;
        }
        if(this.X + this.Width > can.width){
            this.X = can.width - this.Width;
        }
        if(this.Y < 0){
            this.Y = 0; 
        }
        if(this.Y + this.TitleHeight > can.height){
            this.Y = can.height - this.TitleHeight;
        }
        
        this.Handle.x = this.X + reldistance.x;
        this.Handle.y = this.Y + reldistance.y;
        
    }
};
/**
 * checks if the handle is within the borders of the underlining bar - if not, it will be adjusted
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.AdjustHandle = function(){
    
    if(this.Handle.x < this.X){
        this.Handle.x = this.X;
    }
    
    if(this.Handle.x > this.X + this.Width - this.Handle.width)
        this.Handle.x = this.X + this.Width - this.Handle.width;

    if(this.OffsetX > 0)
        this.OffsetX = 0;

    if(this.OffsetX < this.Width - this.ItemsWidth)
        this.OffsetX = this.Width - this.ItemsWidth;
};
/**
 * adds an item 
 * @param {ABO} item
 * @param {number} offsetx - free area left of the item
 * @param {number} offsety - free area top of the item
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.AddItem = function(item, offsetx, offsety){
    if(arguments.length <= 1)
        offsetx = 0;
    
    if(arguments.length <= 2)
        offsety = offsetx;
    
    if(item instanceof Anibody.ABO){
        this.Items.push({item:item, offset: {x:offsetx, y:offsety} });
        this.AdjustItemsPosition();
    }
    
};
/**
 * Deletes all items but before will call the given function for each item
 * @param {function} itemDeleteFunc - function(item, engine)
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.DeleteItems = function(itemDeleteFunc){
    var item;
    
    if(typeof itemDeleteFunc === "undefined")
        itemDeleteFunc = function(item, engine){return};
    
    for(var i=0; i<this.Items.length; i++){
        item = this.Items[i].item;
        itemDeleteFunc(item, this.Engine);
    }
    this.Items = [];
};

/**
 * Sets the items into a horizontal array
 * - sets the items offscreen when the box is minimized so that there is no accidental clicking
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.AdjustItemsPosition = function(){
    
    var item, off;
    var curx = 0;
    
    for(var i=0; i<this.Items.length; i++){
        item = this.Items[i].item;
        off = this.Items[i].offset;
        
        item.X = this.X + off.x + curx + this.OffsetX;
        item.Y = this.Y + off.y + this.TitleHeight ;
        curx += item.Width + off.x;
        
        if(this._minimized)
            item.Y += 2*this.Engine.Canvas.height;
    }
    
};
/**
 * function is triggered if user clicks on the minimization button
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.ClickOnMinimize = function(){
    this._minimized = !this._minimized;
    if(this._minimized){
        this.Height = this.TitleHeight;
    }else{
        this.Height = this.TitleHeight + this.DisplayHeight;
    }
};
/**
 * function is triggered if user clicks on the closing button
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.ClickOnClose = function(){
    console.log("Close Box");
    if(this.TrueClosing){
        if(confirm("M{oe}chtest du dieses Men{ue} schlie{ss}en?".decodeURI())){
            this.Close();
        }
    }else{
        
        var can = this.Engine.Canvas;
        
        if(this.Closed){
            this.MoveTo(this.PositionBeforeClosing.x, this.PositionBeforeClosing.y);
        }else{
            this.PositionBeforeClosing.x = this.X;
            this.PositionBeforeClosing.y = this.Y;
            this.MoveTo(can.width - this.Width - 50, can.height - this.TitleHeight);
        }
    }
    
    
    
};
/**
 * Moves the box in an animated motion to a given position
 * @param {number} x
 * @param {number} y
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.MoveTo = function(x,y){

    var reldistance = {x: this.Handle.x - this.X, y: this.Handle.y - this.Y};
    
    var mf = new Anibody.util.MultiFlow(
        [this, this],
        ["X", "Y"],
        [x, y],
        500,
        {that:this, function:function(p){
                this.Closed = !this.Closed;
                this._minimized = true;
                if(this.Y + this.TitleHeight < this.Engine.Canvas.height){
                    this._minimized = false;
                }
        }, parameter:true},
        {that:this, function:function(p){
                this.Handle.x = this.X + reldistance.x;
                this.Handle.y = this.Y + reldistance.y;
        }, parameter:true}
    );
    
    mf.Start();
    
    
};
/**
 * Truly closes the box
 * @returns {undefined}
 */
Anibody.nav.Gallery.prototype.Close = function(x,y){
    this.RemoveMouseHandler();
    this.RemoveProcessInputFunctionObject();
    // TODO ...
    this.Closed = true;
    this.TrulyClosed = true;
    this._minimized = true;
};