/**
 * @description Represents the Player's Inventory of classic RPG-Games.
 * Every ItemBag can hold unlimted Items and further ItemBags as sub itembags.
 * @param {type} name The name of the ItemBag, especially important for sub item bags
 * @returns {RPGItemBag}
 */
function RPGItemBag(name){
    ABO.call(this);
    
    this.Type = "ItemBag";
    
    this.Name = name;
    this.Items = []; // the array that saves the items and itembags
    this.Parent;
    this.Owner = {}; // usually the player
    
    // the currently selected item - itembags can't selected - only the root itembag saves the selected item
    this.SelectedItem; 
    
    this.Display = false; // Flag if the ItemBag will be drawn
    this.Sorted = false; // Flag if the items are sorted or not
    this._alphabetical = true; // Flag if it will sorted alphabetically or against
    
    this.Margin = 24; // the true canvas-sized span of margin - it doesn't not consider the Factor
    this.Spacing = 6; // the true canvas-sized space between item names - it doesn't not consider the Factor
    // best: same number as the font height
    this.CursorSize = 46; // the true canvas-sized size of the cursor (arrow) - it doesn't not consider the Factor
    
    /*
    this.CursorIndex = 0; // the index of the cursor (arrow)
    variable is not in use because ImageIndex represents which image is used to display the itembag with current cursor position
    */
    
    this.MaxWidth = 0; // the max width of the inventory box
    
    // minimizing factor - if minimized and increased with NN-Alg - it causes the pixel charm
    this.Factor = 4;
    
    // the number of items, that can be displayed on one image
    this.Items2Display = 0; // number of items, which can be displayerd in the list
    this.FontHeight = 46; // the true canvas-sized size font height - it doesn't not consider the Factor
    this.CanvasFont;
    
    this.Images = []; // array for the images that will be rendered before hand
    this.ImageIndex = 0; // the index for this array
    // true: cursor position can be changed
    this.CursorIsReady = true; 
    
    // a function that will be called a few milliseconds after a increase or decrease
    //of the cursor position, so it can be easier controlled
    this.CursorGetsReadyFunction = function(bag){
        bag.CursorIsReady = true;
    };
    
    
    
this.Initialize();
};
RPGItemBag.prototype = Object.create(ABO.prototype);
RPGItemBag.prototype.constructor = RPGItemBag;
/**
 * @description Works as the "class" constructor
 * @returns {undefined}
 */
RPGItemBag.prototype.Initialize = function(){
    // getting the height of the canvas - the margins = availible height for the list
    var ah = this.Engine.Canvas.height - this.Margin*2;
    var nod = ah / (this.FontHeight+this.Spacing);
    this.Items2Display = Math.floor(nod);
    
    // adding the RETURN item
    var ret = new PreviousItem();
    this.AddItem(ret);
};

RPGItemBag.prototype.Update = function(){};

/**
 * @description Draws the Inventory
 * @param {type} c context
 * @returns {undefined}
 */
RPGItemBag.prototype.Draw = function(c){
    if(!this.isOpen()) return;
    if(this.Images.length>0)    
        c.drawImage(this.Images[this.ImageIndex], 0, 0, this.Engine.Canvas.width, this.Engine.Canvas.height);
};

/**
 * @description Activates drawing
 * @returns {undefined}
 */
RPGItemBag.prototype.Open = function(){
    this.Display = true;
};

/**
 * @description Deactivates drawing
 * @returns {undefined}
 */
RPGItemBag.prototype.Close = function(){
    this.Display = false;
};

/**
 * @description Returns true if the Inventory is open (ItemBag)
 * @returns {Boolean}
 */
RPGItemBag.prototype.isOpen = function(){
    return this.Display;
};

/**
 * @description Consider all the item names in the ItemBag and calculates the maxWidth of Inventory Box.
 * @returns {undefined}
 */
RPGItemBag.prototype.calculateMaxWidth = function(){
    
    var cmw = 0; // current max width
    
    if(this.Items.length <= 0){
        this.MaxWidth = this.Margin*2 + this.CursorSize;
        return ;
    }
    
    // offscreen canvas to meizure the width of the item's names
    var can = document.createElement("CANVAS");
    can.width = this.Engine.Canvas.width / this.Factor;
    can.height = this.Engine.Canvas.height / this.Factor;
    var con = can.getContext("2d");
    var cw = 0; // current width;
    
    var cfh = this.FontHeight / this.Factor;
    con.font = cfh + "px sans-serif";
    this.CanvasFont = con.font;
    
    // finding out the width of every item's name - save the biggest (max)
    for(var i=0; i<this.Items.length; i++){
        cw = con.measureText(this.Items[i].Name + "   x" + this.Items[i].Quantity).width;
        if(cw > cmw)
            cmw = cw;
    }
    
    this.MaxWidth = cmw + this.Margin*2/this.Factor + this.CursorSize/this.Factor;
    
};

/**
 * @description Creates a ItemBag and adds it to this ItemBag as a Child
 * @param {type} name
 * @returns {RPGItemBag}
 */
RPGItemBag.prototype.AddChildItemBag = function(name) {
    
    var newbag = new RPGItemBag(name);
    newbag.Parent = this;
    newbag.Owner = this.Owner;    
    newbag.EI = this.EI;
    
    this.Engine.AddObject(newbag, -1);
    
    this.Items.push(newbag);
    this.calculateMaxWidth();
    this.Sort();
    this.renderImages();
    
    return newbag;
};

RPGItemBag.prototype.AddItem = function(item){
    
    var searched = this.SearchItem(item.ItemID, true);

    // searched == the already found item
    // true: increase Quantity of the searched item
    // false: add new item
    if(searched){
        searched.Item.Quantity += item.Quantity;
        item = searched.Item;
        
        searched.Bag.calculateMaxWidth();
        searched.Bag.renderImages();
    }else{
        item.EI = this.EI;
        this.Items.push(item);
        this.Sort();
        
        this.calculateMaxWidth();
        this.renderImages();
    }
    
    return item;
};

RPGItemBag.prototype.AddItems = function(/*List of Items*/){
    var item;
    var searched;
    
    // array of all itembags which were changed in the progress and need recalculation and new images
    var changedBags = [];
    
    for(var i=0; i<arguments.length; i++){
        
        item = arguments[i];
        searched = this.SearchItem(item.ItemID, true);
        
        if(searched){
            searched.Item.Quantity += item.Quantity;
            item = searched.Item;
            
            if(changedBags.indexOf(searched.Bag) < 0)
                changedBags.push(searched.Bag);
            
        }else{
            item.EI = this.EI;
            this.Items.push(item);
            
            if(changedBags.indexOf(this) < 0)
                changedBags.push(this);
        }
    }
    
    // method does not ensures (yet) that the elements of changedBags are unique
    // causing to sort, recalculate and render more than necessary
    for(var i=0; i<changedBags.length; i++){
        if(changedBags[i] == this)
            this.Sort();
        changedBags[i].calculateMaxWidth();
        changedBags[i].renderImages();
    }
    
    this.calculateMaxWidth();
    
    this.renderImages();
    
    return true;
};

RPGItemBag.prototype.RemoveItem = function(item, removeAll, quantity){
    
    var itsbag;
    var temp;
    
    if(arguments.length < 2)
        removeAll = false;
    
    if(arguments.length < 3)
        quantity = 1;
    
    item.Quantity -= quantity;
    
    if(removeAll || item.Quantity <= 0){
        // find the bag, to which the item belongs
        itsbag = this.SearchItem(item.ItemID, true).Bag;
        
        // removing the item from the Items-Array
        temp = [];
        for(var i=0;i < itsbag.Items.length; i++)
            if(item != itsbag.Items[i])
                temp.push(itsbag.Items[i]);
        itsbag.Items = temp;
        
        itsbag.DecreaseImageIndex();
        this.calculateMaxWidth();
    }

    // if the new quantity is zero or smaller
    if(!removeAll && item.Quantity <= 0){
        
    }
    
    // if the new quantity has changed and after calculateMaxWidth() and Sort()
    this.renderImages();
};

RPGItemBag.prototype.Sort = function(alphabetical){
    
    if(arguments.length <= 0 || alphabetical){
        this._alphabetical = true;
    }else{
        this._alphabetical = false;
    }
    
    // element 0 is the RETURN item, which shall not be sorted
    this._quicksort(1, this.Items.length-1);
    this.Sorted = true;
};

RPGItemBag.prototype._comp = function(a,b){
    if(this._alphabetical){
        return a.Name < b.Name;
    }else{
        return a.Name > b.Name;
    }
};

RPGItemBag.prototype._swap = function(i, j){

    var temp = this.Items[i];
    this.Items[i] = this.Items[j];
    this.Items[j] = temp;
};

RPGItemBag.prototype._quicksort = function(left, right) {
    var left_new, right_new;
    if (left < right) {
      var pivot = this.Items[left + Math.floor((right - right) / 2)],
          left_new = left,
          right_new = right;
 
      do {
        while (this._comp(this.Items[left_new], pivot)) {
          left_new += 1;
        }
        while (this._comp(pivot, this.Items[right_new])) {
          right_new -= 1;
        }
        if (left_new <= right_new) {
          this._swap(left_new, right_new);
          left_new += 1;
          right_new -= 1;
        }
      } while (left_new <= right_new);
 
      this._quicksort(left, right_new);
      this._quicksort(left_new, right);
 
    }
  };

RPGItemBag.prototype.renderImages = function() {
    
    this.Images = [];
    
    // offscreen canvas to meizure the width of the item's names
    var can = document.createElement("CANVAS");
    can.width = this.Engine.Canvas.width / this.Factor;
    can.height = this.Engine.Canvas.height / this.Factor;
    var con = can.getContext("2d");
    var fh = this.FontHeight / this.Factor;
    con.font = fh + "px sans-serif";
    this.CanvasFont = con.font;
    con.textBaseline = "top";
    
    var i; // loops the images needed to make
    var j; // loops all items
    var ci; // current item;
    
    var x = can.width - this.MaxWidth;
    var y = 0;
    var sp = this.Spacing / this.Factor;
    var mar = this.Margin / this.Factor;
    var curs = this.CursorSize / this.Factor;
    var quanw; // current item's quantity width
        
    for(i=0; i<this.Items.length; i++){
        
        con.clearRect(0, 0, can.width, can.height);
        // for testing reasons - a simple layout first
        con.fillStyle = "#ffffff";
        con.fillVariousRoundedRect(x,y, this.MaxWidth, can.height, 8, 0, 0, 8);
        con.strokeStyle = "#000000";
        con.strokeVariousRoundedRect(x,y, this.MaxWidth, can.height, 8, 0, 0, 8);
        
        // text would be the same color as the background box
        con.fillStyle = "#000000";
        
        // drawing index Arrow
        con.beginPath();
        con.moveTo(mar + x, mar + (y + sp + fh)*i );
        con.lineTo(mar + curs + x, curs/2 + mar + (y + sp + fh)*i );
        con.lineTo(mar + x, curs + mar + (y + sp + fh)*i);
        con.closePath();
        con.fill();
        
         // drawing the current image (name, quantity) loops all items
        for(j=0; j<this.Items.length; j++){
            ci = this.Items[j];
            
            // Item name
            if(ci.Selected){
                con.fillStyle = "#660000";
                con.font = this.CanvasFont + "italic";
            }else{
                con.font = this.CanvasFont;
                con.fillStyle = "#000000";
            }
            con.fillText(ci.Name,
                        mar + curs + x,
                        mar + (y + sp + fh) * j
            );
            
            
            con.fillStyle = "#333333";
            
            // true: ItemBag, false: anything else (e.g. item)
            if(ci.Type == this.Type){
                quanw = con.measureText(">>").width + mar;
                con.fillText(">>", can.width - quanw, mar + (y + sp + fh) * j);
            }else{
                // true: no quantity item, false: quantity item
                if(ci.NoQuantity){
                    
                }else{
                    // Item quantity
                    quanw = con.measureText(" x" + ci.Quantity).width + mar;
                    con.fillText("x" + ci.Quantity,can.width - quanw,mar + (y + sp + fh) * j);
                }
                
            }
            
        } // END drawing the current image loops all items
                
        this.Images.push(createImageNN(can, this.Factor));
    }
    
    
};

RPGItemBag.prototype.IncreaseImageIndex = function() {
    
    if(!this.CursorIsReady)
        return false;
    
    this.ImageIndex++;
    if(this.ImageIndex > this.Images.length-1){
        this.ImageIndex = this.Images.length-1;
        return false;
    }
    
    window.setTimeout(this.CursorGetsReadyFunction, 200, this);
    this.CursorIsReady = false;
    return true;
};

RPGItemBag.prototype.DecreaseImageIndex = function() {
    
    if(!this.CursorIsReady)
        return false;
    
    this.ImageIndex--;
    if(this.ImageIndex < 0){
        this.ImageIndex = 0;
        return false;
    }
    
    window.setTimeout(this.CursorGetsReadyFunction, 200, this);
    this.CursorIsReady = false;
    return true;
};

RPGItemBag.prototype.SelectItem = function() {
    
    if(!this.Display){return;}
    
    var ci = this.Items[this.ImageIndex]; // cursor item; the item, to which the cursor points
    
    // if the item, the cursor points to, is a Return-item
    if(ci.ItemID == RPGItem.prototype.ItemIDs._previous){
        this.Previous();
        return;
    }
    
    // if the item, the cursor points to, is another itembag
    if(ci.Type == this.Type){
        this.Next(ci);
        return;
    }
    
    var rootbag = this.GetRootBag(); // the item bag of the owner and the only itembag that really saves the selected item
    
    // if the cursor item is the current selected item
    if(rootbag.SelectedItem && rootbag.SelectedItem == ci){
        rootbag.SelectedItem.Selected = false;
        rootbag.SelectedItem = false;
    }else{
        
        if(rootbag.SelectedItem)
            rootbag.SelectedItem.Selected = false;
    
        ci.Selected = true;
        rootbag.SelectedItem = ci;
        
    }
    
    this.renderImages();
    
};

RPGItemBag.prototype.UseItem = function() {
    
    var rootbag = this.GetRootBag(); // the item bag of the owner and the only itembag that really saves the selected item
    var ci; // current item which will be used
    
    // if the item bag is open
    if(this.isOpen()){
        // then current item is the current iten, on which the cursor points
        ci = this.Items[this.ImageIndex]; // cursor item; the item, to which the cursor points
    }else{
        // if it is closed - the currently selected item will be used
        if(rootbag.SelectedItem)
            ci = rootbag.SelectedItem;
        else{
            this.Engine.ShowAlert("There is no selected item to use.", 1);
            return; // maybe a notice that no item is selected?
        }
    }
    
    var user = rootbag.Owner;
    
    // the field in front of the user (player)
    var targetfield = this.Engine.Terrain.GetFieldNeighbour(user.CurrentField, user.Direction);
    var targetobject = targetfield.User;
    
    if(ci && ci.UseFunction){
        ci.UseFunction.call(ci, user, targetfield, targetobject);
        // the quantity needs to be removed in the user function
        // there are items which can be used infinitly like child-itembags or the previous/return item
    }
    
    if(this.Engine.CausalityManager){
        this.Engine.CausalityManager.Cause(ci.ItemID, targetobject);
    }
    
    this.renderImages();
    
};
/**
 * @description This Method is needed and will be called when an itembag item is used or selected
 * this - referece to the new itembag
 * @param {type} user
 * @param {type} field
 * @param {type} object
 * @returns {undefined}
 */
RPGItemBag.prototype.UseFunction = function(user, field, object){
    user.ItemBag = this;
    //user.ItemBag.ImageIndex = 0;
};

RPGItemBag.prototype.GetRootBag = function() {
    
    var cutparent = this;
    
    while(cutparent.Parent && cutparent.Parent.Type == this.Type){
        cutparent = this.Parent;
    }
    
    return cutparent;
};

RPGItemBag.prototype.SearchItem = function(itemid, withbag) {
    
    withbag = withbag ? true : false;
    
    var rbag = this.GetRootBag();
    var cbag = this;
    var found = false;
    
    var res = rbag._recursiveSearch(itemid, withbag);
    return res;
};

RPGItemBag.prototype._recursiveSearch = function(itemid, withbag) {
    var cur; // current item
    for(var i=0; i<this.Items.length; i++){
        cur = this.Items[i];
        if(cur.ItemID == itemid){
            if(withbag)
                return {Item: cur, Bag: this};
            else
                return cur;
        }
        if(cur.Type == "ItemBag"){
            return cur._recursiveSearch(itemid, withbag);
        }
    } // end for loop
    return false;
};

RPGItemBag.prototype.Previous = function() {
    if(this.Parent){
        this.Close();
        this.Owner.ItemBag = this.Parent;
        this.Owner.ItemBag.Open();
    }else{
        this.Close();
    }
};

RPGItemBag.prototype.Next = function() {
    var ci = this.Items[this.ImageIndex];
    this.Close();
    this.Owner.ItemBag = ci;    
    ci.Open();
};
