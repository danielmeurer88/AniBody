
/**
 * Represents a Tab of the SlideMenu, can be opened and arrays and displays further items
 * @param {String} label the label of the Tab
 * @returns {Tab}
 */
function Tab(label, owner){
    Anibody.classes.ABO.call(this);
    
    this.TIN = this.UniqueID; // tab indentification number
    this.Label = label;
    
    this.SlideMenu = owner;
    
    this.Items = [];
    
    this.X = 0;
    this.Y = 0;
    this.OldX = -1;
    
    this.Width = 35;
    this.Height = 90;
    this.IsMouseOver = false;
    this.IsMouseOverMenu = false;
    
    this.FontSize = 18;
    this.LabelPadding = 10;
    this.Rounding = 4;
    
    
    this.Selected = false;
    
    this.Menu = { 
        Depth : 100, // the amount of pixel, which the menu will overlap on the canvas, 100 by default;
        X : 0,
        Y : 20,
        Width : 0 // with attachedSide == "left", menu's width would be the height of the menu's rectangle
    };
    
    this._stops = [
            {stop:0, color:"rgba(0,0,0,0.5)"},
            {stop:0.5, color:"rgba(0,0,0,0.25)"},
            {stop:1, color:"rgba(0,0,0,0)"}
        ];
    this._ling;
    
    this.IsOpen = false;
        
    this._ref = null;
    
this.Initialize();
}
Tab.prototype = Object.create(Anibody.classes.ABO.prototype);
Tab.prototype.constructor = Tab;

Tab.prototype.FontColor = "#000";
Tab.prototype.BackgroundColor = "#aaa";
Tab.prototype.BackgroundColorSelected = "#ccc";
Tab.prototype.BreaklineColor = "#666";

/**
 * @see README_DOKU.txt
 */
Tab.prototype.Initialize = function(){
    
    // the registration of the mouse click
    this.AddMouseHandler();
    
    // measuring height, which is label width
    var c = this.Engine.Context;
    c.save();
    c.setFontHeight(this.FontSize);
    var w = c.measureText(this.Label).width;
    c.restore();
    
    // recalculated the position values for the menu of a tab pinned to the left side
    if(this.SlideMenu.AttachedSide == "left"){
        this.Menu.X = (-1) * this.Menu.Depth;
        this.Menu.Width = this.Engine.Canvas.height - (this.Menu.Y*2);
        this.Height = w + 2*this.LabelPadding;
        
    }
};

Tab.prototype.AddMouseHandler = function(){

    this._ref = this.Engine.Input.MouseHandler.AddMouseHandler("leftclick", {
        parameter : this.Engine,
        that : this,
        function : function(e, engine){
            
                if(this.IsMouseOver){
                    e.GoThrough = false;
                    if(!this.IsOpen)
                        this.Open();
                    else
                        this.Close();
                }

                if(this.IsMouseOverMenu){
                    e.GoThrough = false;
                }
        }
    }, 1000);

};

Tab.prototype.RemoveMouseHandler = function(){this.Engine.Input.MouseHandler.RemoveMouseHandler("leftclick",this._ref);};

/**
 * Tab is drawn.
 * NOTICE : items are not objects in the Object Loop. They will be drawn here
 * @param {type} c Engine's canvas
 * @returns {undefined}
 */
Tab.prototype.Draw = function(c){
    var x = this.X;
    var y = this.Y;
    
    c.fillStyle = (this.Selected) ? this.BackgroundColorSelected : this.BackgroundColor;
    c.fillVariousRoundedRect(
        x,
        y,
        this.Width,
        this.Height,
        0,this.Rounding,this.Rounding,0
    );

    c.fillStyle = this.FontColor;
    c.setFontHeight(this.FontSize, "px");
    c.fillSpinnedText(x + (this.Width/2), y + (this.Height/2), this.Label, 270);
    
    if(this.IsOpen){
        c.fillStyle = this.BackgroundColorSelected;
        //c.fillRect(this.Menu.X, this.Menu.Y, this.Menu.Depth, this.Menu.Width);
        c.fillRect(0,this.Menu.Y, this.SlideMenu.NeededDepth, this.Menu.Width);
        
        for(var i=0; i<this.Items.length; i++){
            if(this.Items[i].item != "break")
                this.Items[i].item.Draw(c);
            else{
                
                try{
                    var pi = this.Items[i-1].item; // previous item

                    if(this.Items.length >= i+1){
                        var ni = this.Items[i+1].item; // next item

                        var halfdif = (ni.Y - (pi.Y + pi.Height)) / 2; // the half of the difference between the prev. and next item
                        var y = (pi.Y + pi.Height) + halfdif; // between those two items where the break line will be drawn

                        c.beginPath();
                        c.moveTo(this.Menu.X + 10,y);
                        c.lineWidth = 3;
                        c.strokeStyle = Tab.prototype.BreaklineColor;
                        c.lineTo(this.Menu.X + this.Menu.Depth - 10, y);
                        c.stroke();

                    }
                }catch(e){
                    console.log("problem with the breakline in a tab");
                }
                
            }
        }
        
    }else{
        this._ling = this.Engine.Context.createLinearGradient(this.X,this.Y,this.X+5,this.Y);
        for(var i=0; i<this._stops.length ;i++){
            this._ling.addColorStop(this._stops[i].stop, this._stops[i].color);
        }
        // drawing linear gradient
        c.fillStyle = this._ling;
        c.fillRect(this.X, this.Y, 5, this.Height);
    }
    
};

/**
 * Tab is updated.
 * NOTICE : items are not objects in the Object Loop. They will be updated here
 * @param {type} c Engine's canvas
 * @returns {undefined}
 */
Tab.prototype.Update = function(){
    
    if(this.IsMouseOver){
        this.Engine.Input.Mouse.Cursor.Set("pointer");
    }
    
    // making sure that the tab is behind the slide menu
    this.X = this.SlideMenu.NeededDepth;
    
    // now rearrange the indivdual tab menu
    this.Menu.X = this.X - this.Menu.Depth;
    // then readjust items if there is need
    if(this.X !== this.OldX)
        this.AdjustItemsPosition();
    this.OldX = this.X;
    
    // check if tab is open
    if(this.SlideMenu.OpenTab === null || this.SlideMenu.OpenTab !== this){
        this.IsOpen = false;
        this.Selected = false;
    }
    
    // items updating
    for(var i=0; i<this.Items.length; i++){
        if(this.Items[i].item != "break")
            this.Items[i].item.Update();
    }
    
};
/**
 * @see README_DOKU.txt
 */
Tab.prototype.ProcessInput = function(){
    
    // adding request for the tab
    var area = {
         x:this.X,
         y:this.Y,
         width:this.Width,
         height:this.Height,
         roundings: [0,this.Rounding,this.Rounding,0],
         type : "vrrect"
     };
     this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOver");
    
    // adding request for the menu if tap is open
    if(this.IsOpen){
        area = {
             x:this.Menu.X,
             y:this.Menu.Y,
             width:(this.Menu.X+this.Menu.Depth),
             height:(this.Menu.Y+this.Menu.Width),
             type : "rect"
         };
         this.Engine.Input.MouseHandler.AddHoverRequest(area, this, "IsMouseOverMenu");
    }
    
    // items processing
    if(this.IsOpen)
        for(var i=0; i<this.Items.length; i++){
            if(this.Items[i].item != "break")
                this.Items[i].item.ProcessInput();
        }
};

//TO EDIT
Tab.prototype.Open = function(){
    this.IsOpen = true;
    this.Selected = true;
    this.SlideMenu.OpenTab = this;
    
    var aim = this.Menu.Depth;
    
    new Anibody.util.Flow(this.SlideMenu, "NeededDepth", aim, 700, {that: this, function:function(){   
    }}).Start();
};

Tab.prototype.Close = function(){
    
    var aim = 0;
    
    new Anibody.util.Flow(this.SlideMenu, "NeededDepth", aim, 700, {that: this, function:function(){
        this.IsOpen = false;
        this.Selected = false;
        this.IsMouseOverMenu = false;
        this.SlideMenu.OpenTab = null;
        
    }}).Start();
    
};

Tab.prototype.QuickClose = function(){
    
    this.SlideMenu.NeededDepth = 0;
    
    this.IsOpen = false;
    this.Selected = false;
    this.IsMouseOverMenu = false;
    this.SlideMenu.OpenTab = null;
    
};

Tab.prototype.SetDepth = function(val){
    this.Menu.Depth = val;
    this.Menu.X = (-1)*this.Menu.Depth;
};

Tab.prototype.SetNeededDepth = function(){
    var max =this.Menu.Depth;
    var item;
    
    if(this.SlideMenu.AttachedSide == "left")
        for(var i=0; i<this.Items.length; i++){
            item = this.Items[i].item;
            if(item !== "break" && max < item.Width)
                max = item.Width;
        }
    
    this.SetDepth(max);
};

Tab.prototype.AddItem = function(item, offsetx, offsety, depthcorrection){
    if(arguments.length <= 1)
        offsetx = 0;
    
    if(arguments.length <= 2)
        offsety = offsetx;
    
    if(item === "break" && this.Items.length > 0){
        this.Items.push({item:item, offset: {x:offsetx, y:offsety} });
    }
    
    if(item instanceof Anibody.classes.ABO){
        if(item === "break" && this.Items.length <= 0)return;
        
        this.Items.push({item:item, offset: {x:offsetx, y:offsety} });
    }
    
    if(depthcorrection){
        this.SetNeededDepth();
    }
};

Tab.prototype.AdjustItemsPosition = function(){
    
    var item;
    var cury = 0;
    var margin = 5;
    
    if(this.SlideMenu.AttachedSide == "left")
        for(var i=0; i<this.Items.length; i++){
            item = this.Items[i].item;
            if(item !== "break"){
                item.X = this.Menu.X + this.Items[i].offset.x;
                item.Y = this.Menu.Y + cury + this.Items[i].offset.y + margin;
                cury += margin + item.Height + this.Items[i].offset.y;
            }
            
        }
    
};

Tab.prototype.Delete = function(){
    
    this.RemoveMouseHandler();
    
};

Tab.prototype.DeleteItems = function(itemDeleteFunc, from, to){
    var item;
    
    if(typeof itemDeleteFunc === "undefined" || !itemDeleteFunc)
        itemDeleteFunc = function(item, engine){return};
    
    if(typeof from === "undefined")
        from = 0;
    
    if(typeof to === "undefined")
        to = this.Items.length;
    
    var tmp = [];
    
    for(var i=0; i<from; i++){
        tmp.push(this.Items[i]);
    }
    
    for(var i=from; i<to; i++){
        item = this.Items[i].item;
        itemDeleteFunc(item, this.Engine);
    }
    this.Items = tmp;
};