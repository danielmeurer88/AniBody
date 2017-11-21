/**
 * @description Respresents an item, which has an effect on other objects - their ObjectID will be saved in
 * SubjectsIDs, building an Item-Object-Relation with a respective CausalityFunction.
 * @param {type} itemid
 * @returns {RPGCauser}
 */
function RPGCauser(itemid){
    Anibody.classes.EngineObject.call(this);
    this.ItemID = itemid; // 
    // all three have the same length
    this.SubjectIDs = [];
    this.CausalityFunctions = [];
    this.Labels = [];
    
}
RPGCauser.prototype = Object.create(Anibody.classes.EngineObject.prototype);
RPGCauser.prototype.constructor = RPGCauser;

/**
 * Builds an object that can hold, add new or execute Item-Object-Relation
 * @returns {RPGCausalityManager}
 */
function RPGCausalityManager(){
    Anibody.classes.EngineObject.call(this);
    
    this.Causers = new Anibody.util.PriorityQueue();
    
}
RPGCausalityManager.prototype = Object.create(Anibody.classes.EngineObject.prototype);
RPGCausalityManager.prototype.constructor = RPGCausalityManager;

RPGCausalityManager.prototype.CausalityIDState = 0;
RPGCausalityManager.prototype._getUniqueCausalityID = function(){
    return RPGCausalityManager.prototype.CausalityIDState++;
};

/**
 * Adds a new Causer of the given itemid to the CM (1) and...
 * if a causer of that itemid already exists then it returns that causer (2)
 * @param {number} itemid
 * @returns {RPGCauser||false}
 */
RPGCausalityManager.prototype.AddCauser = function(itemid){
    var causer;
    
    //true: if Causer already exists
    if(causer = this.FindCauser(itemid))
        return causer;
            
    causer = new RPGCauser(itemid);
    this.Causers.Enqueue(causer);
    return causer;
};
/**
 * @description Searches for a Causer with the given itemid in the CM
 * @param {number} itemid
 * @returns {RPGCauser|false}
 */
RPGCausalityManager.prototype.FindCauser = function(itemid){
    
    var hel = false; // heap element
    var found = false;
    for(var i=0; !found && i<this.Causers.heap.length; i++){
        hel = this.Causers.heap[i];
        if(hel.data.ItemID == itemid){
            found = true;
            hel.priority++;
        }
    }
    //this.Causers.Sort();
    if(found) return hel.data; else return false;
    
};
/**
 *  Basically saying that all items of a given itemid have the effect, specificed in the causality function
 *  on all subjects of a given objectid and that causality is known in the CM with the string in label"
 * @param {type} itemid the given itemid
 * @param {type} subid the given objectid
 * @param {type} causalityf a function of the form function(a,b,c) where
 * this = the Engine, a = ItemID, b = RPGObject (the actual bonfire,infront of which the player stands, c = the label
 * @param {String} label string of the name
 * @returns {String} the label
 */
RPGCausalityManager.prototype.AddCausality = function(itemid, subid, causalityf, label){
    var causer;
    //if(!(causer = this.FindCauser(itemid)))
    //    return causer;
    
    causer = this.AddCauser(itemid);
    
    var id = this._getUniqueCausalityID();
    
    // adding a label if there is no specific on;
    if(arguments.length <= 3)
        label = id + "-" + Date.now();
    
    causer.SubjectIDs.push(subid);
    causer.CausalityFunctions.push(causalityf);
    causer.Labels.push(label)
    return label;
};
/**
 * @description Checks if there is the item-object-relation and starts it representive causality function
 * @param {type} itemid of the item
 * @param {type} obj the actual object, on which you will use the kind of item - no objectid
 * @returns {undefined}
 */
RPGCausalityManager.prototype.Cause = function(itemid, obj){

    var causer;
    var subject;
    var causalityf;
    var label;
    var found = false;
    // if Cause() was called with the label
    {
        // if Cause() was called with the itemid and objectid (here: objid)
        if(typeof itemid === "number"){

            if(!(causer = this.FindCauser(itemid)))
                return causer;
            
            for(var i=0; !found && i<causer.SubjectIDs.length; i++){
                
                if(causer.SubjectIDs[i] == obj.ObjectID){
                    found = true;
                    
                    subject = obj;
                    causalityf = causer.CausalityFunctions[i];
                    label = causer.Labels[i];
                    causer = itemid; // overwriting causer last
                }
                
            }
            
        }else{ return false;}
        
    }
    
    if(causer && obj && causalityf && label){
        causalityf.call(this.Engine, causer, obj, label);
    }else
        return false;
    
};

/*
RPGCausalityManager.prototype.Cause = function(item_or_label, obj){

    var causer;
    var subject;
    var causalityf;
    var label;
    var found = false;
    // if Cause() was called with the label
    if(typeof item_or_label === "string"){
        
        label = item_or_label;
        for(var i=0;!found && i<this.Causers.heap.length; i++){
            for(var j=0;!found && j<this.Causers.heap[i].Labels.length; j++){
                if(this.Causers.heap[i].Labels[j] == label){
                    found = true;
                    
                    subject = obj;
                    causalityf = this.Causers.heap[i].CausalityFunctions[j];
                    causer = this.Causers.heap[i].ItemID;
                }
            }
        }
    }else{
        // if Cause() was called with the itemid and objectid (here: objid)
        if(typeof item_or_label === "number"){

            if(!(causer = this.FindCauser(item_or_label)))
                return causer;
            
            for(var i=0; !found && i<causer.SubjectIDs.length; i++){
                
                if(causer.SubjectIDs[i] == obj.ObjectID){
                    found = true;
                    
                    subject = obj;
                    causalityf = causer.CausalityFunctions[i];
                    label = causer.Labels[i];
                    causer = item_or_label; // overwriting causer last
                }
                
            }
            
        }else{ return false;}
        
    }
    
    if(causer && obj && causalityf && label){
        causalityf.call(this.Engine, causer, obj, label);
    }else
        return false;
    
};
*/