
/**
 * @description Represents an Item in the RPGItemBag
 * @param {type} itemid every Item-type has an unique number that serves as indentifier among items
 * @param {type} name a String, which will be drawn in the ItemBag.Draw() (Inventory)
 * @param {type} quantity the number of the current quantity of the item
 * @param {type} uf the use function, which will be called when the item is used
 * @returns {RPGItem}
 */
function RPGItem(itemid, name, quantity, uf){
    Anibody.ABO.call(this);
    this.Type = "Item";
    
    this.ItemID = itemid;
    
    this.Selected = false;
    this.Codename; // image codename - no need to link to an actual image
    this.Name = name;
    this.Image = false;
    
    
    this.NoQuantity = quantity == 0 ? true : false;
    this.Quantity = quantity ? quantity : 1;
    
    //UseFunction = callback-object = {that:owner, function:f, parameter:para};
    this.UseFunction = uf; // function(player, targetfield, targetobject);
};
RPGItem.prototype = Object.create(Anibody.ABO.prototype);
RPGItem.prototype.constructor = RPGItem;

/* ++++++++++++ The Item IDs +++++++++++ */
/* +++++++++++++++++++++++++++++++++++++ */
/* ++++ unique to every game +++++++++++ */
RPGItem.prototype.ItemIDs = {
    _previous : 0,
    lighter : 50,
    apple : 96,
    banana : 97,
    chocolate : 98,
    water : 99
};
/**
 * @description Combines the Item with an image
 * @param {String} imgcn MediaManager-codename
 * @returns {undefined}
 */
RPGItem.prototype.SetImage = function(imgcn){
    //this.Codename = newimg
    this.Image = this.Engine.MediaManager.GetImage(imgcn);
};
/**
 * @description Sets a new UseFunction
 * @param {type} uf
 * @returns {undefined}
 */
RPGItem.prototype.SetUseFunction = function(uf){
    this.UseFunction = uf;
};

/* +++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++ */


function PreviousItem(){
    RPGItem.call(this, RPGItem.prototype.ItemIDs._previous, "<< Return" ,1);
    // only one kind of Previous item must exist - so:
    // receiving the itemid in the constructor function is ok
    //this.ItemID = RPGItem.prototype.ItemIDs._previous;
    this.NoQuantity = true;
}
PreviousItem.prototype = Object.create(RPGItem.prototype);
PreviousItem.prototype.constructor = PreviousItem;

PreviousItem.prototype.UseFunction = function(user){
    user.ItemBag.Previous();
};

/* +++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++ */

function ConsumableItem(itemid, name, quantity){
    RPGItem.call(this, itemid, name, quantity);
    this.EffectFunction = function(user, field, object, amount){
        
        user.ItemBag.Close();
        
        user.Dialog.Reset();
        //user.Dialog.AddBasicText("Delicious...yummi!");
        user.Dialog.Active = true;
        user.Dialog.OffTalking = true;
        
    };
    
    this.UseFunction = function(user, field, object, amount){
        if(arguments.length < 4)
            amount = 1;
        user.ItemBag.RemoveItem(this, false, amount);
        this.EffectFunction(user, field, object, amount);
    };
}
ConsumableItem.prototype = Object.create(RPGItem.prototype);
ConsumableItem.prototype.constructor = ConsumableItem;

ConsumableItem.prototype.SetEffectFunction = function(f){this.EffectFunction = f;};