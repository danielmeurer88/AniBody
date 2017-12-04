/**
 * @description Represents an interactable object on an rpg terrain
 * @param {number} width width of the image/s
 * @param {type} height width of the image/s
 * @param {type} am_needed amount of interactions needed to successfully interact
 * @returns {RPGObject}
 */
function RPGObject(objectid, width,height, am_needed){
    Anibody.ABO.call(this);
    
    this.ObjectID = objectid;
    
    this.Height = height;
    this.Width = width;
    this.Center = 0;
    
    this.CurrentField;
    this.NextField;
    
    this.Pushable = true;
    this.Interactable = true;
    
    // from where is the player able to interact
    this.InteractableFrom = { up : true, right : true, down : true, left : true };
    // counter of interactions already happened to the object
    this.NumberOfInteraction = 0;
    
    // callback-object the function, which the object is going to start when one interacts with it
    this.InteractionFunction = {
        function: function(who, whom, para, from){},
        that : this,
        parameter : false
    };   
    
    this.UpdateFunction;
    // an callback-object which is called when the object reiceved a push but is not pushable
    this.PushFailFunction = {
        that : this,
        parameter : false,
        function : function(){}
    };
    // an callback-object which is called when the object reiceved a push and is pushed
    this.PushSuccessFunction = {
        that : this,
        parameter : true,
        function : function(){}
    };
    
    this.Type = "RPGObject";
    
    // the codename of the image, the object has before any interactions
    this.CodenameBefore;
    // the amount of needed interactions to count the objects as interacted
    this.AmountOfInteractionsNeeded = am_needed ? am_needed : 1;
    // flag if interacted or not
    this.Interacted = false;
    // the codename of the image, the object has after the needed amount of interactions
    this.CodenameAfter;
    
    // attributes for the still images
    this.ImageBefore = false;
    this.ImageAfter = false;
    this.RefreshCallback = false;
    
    // attribute for the sprite
    this.Sprite = false;
    this.DrawSprite = true; // Flag if Sprites will be drawn or not
    this.SpriteProcessInputWidget = null;
    
    this.Stopped = true;
    this.AnimationSteps = 12;
    this.MoveQ;
    
this.Initialize();
}
RPGObject.prototype = Object.create(Anibody.ABO.prototype);
RPGObject.prototype.constructor = RPGObject;

/* ++++ unique to every game +++++++++++ */
RPGObject.prototype.ObjectIDs = {
    
    player : 1,
    bonfire : 10,
    girl : 11,
    crate : 12,
    chest : 13
    
};
/**
 * @description Instanziert nötige Daten
 * @returns {undefined}
 */
RPGObject.prototype.Initialize = function(){
    this.MoveQ = new Queue();
};
RPGObject.prototype.Draw = function(c){
    c.save();
    var cam = this.Engine.Camera.SelectedCamera;
    
    // true if Sprites should be drawn and exists
    if(this.Sprite){
            // if interacted or not will be visually handled in the Sprite Attributes
            var s = this.Sprite;
            if( s && s.SpriteImage){
                s.X = this.X - cam.X;
                s.Y = this.Y - cam.Y;
                s.Draw(c);
            }
    }else{
        
        if(this.ImageBefore == false || this.ImageAfter == false){
            this.RefreshStillImages();
        }
        
        // still images will 
        if(!this.Interacted){
            
            if(this.ImageBefore)
                c.drawImage(this.ImageBefore, this.X - cam.X , this.Y - cam.Y);
        }else{
            if(this.ImageAfter)
                c.drawImage(this.ImageAfter, this.X - cam.X , this.Y - cam.Y);
        }
    }
    
    c.restore();
};
RPGObject.prototype.Update = function(){
    var move = {Step : {X:0,Y:0}};
    
    if(this.Sprite)
        this.Sprite.Update();
    
    // if MoveQ is not empty it will be emptied frame by frame
    if(!this.MoveQ.isEmpty()){
        move = this.MoveQ.Dequeue();
        this.X += move.Step.X;
        this.Y += move.Step.Y;
        if(this.Sprite)
            this.Sprite.Lock();
                
        // if the player reached its goal - 
        if(move.KeyFrame >= this.AnimationSteps -1){
            // player reached its target
            // if Stopped true - Move() is possible again
            this.Stopped = true;
            this.SetCurrentField(this.NextField);
            if(this.Sprite)
                this.Sprite.Unlock();
        }
    }
    
    if(this.UpdateFunction)
        Anibody.CallObject(this.UpdateFunction);
    
};
/**
 * @description Adds a new function that will called every frame in the Update phase as long as the Terrain is active
 * @param {type} f the function which will be the new function
 * @param {type} para the first parameter the function will use
 * @returns {undefined}
 */
RPGObject.prototype.SetUpdateFunction = function(f, para){
    this.UpdateFunction = {that:this, function: f, parameter: para};
};
/**
 * @description Will be called when a player walks against an object.
 * If it is pushable - the object will be reposition in the walking direction of the player and the PushSuccessFunction will be called
 * if it is not pushable it will stay in this position and the PushFailFunction will be called
 * @param {RPGPlayer} Pushor is the player, which pushes the object
 * @returns {undefined}
 */
RPGObject.prototype.ReceivePush = function(Pushor){
    var f;
    if(!this.Pushable){
        f = this.PushFailFunction;
        Anibody.CallObject(f);
        return;
    } 
    if(!this.Stopped) return;
    
    f = this.PushSuccessFunction;
    Anibody.CallObject(f);
    
    var delta = Pushor.Direction;
    var target = this.Engine.Terrain.GetFieldNeighbour(this.CurrentField, delta);
    
    if(target.Type == Field.prototype.Types.Free){
        this.Stopped = false;
        this.NextField = target;
        
        var range = { X : target.X - this.CurrentField.X, Y : target.Y - this.CurrentField.Y};
        var step = { X : range.X / this.AnimationSteps, Y : range.Y / this.AnimationSteps};
        
        for(var i=0; i< this.AnimationSteps; i++)
            this.MoveQ.Enqueue({Step : step, KeyFrame : i});
    }
    
};
/**
 * @description Sets a new CurrentField for the object and "cleans" the terrain
 * @param {Field} the new CurrentField of the object
 * @returns {undefined}
 */
RPGObject.prototype.SetCurrentField = function(cf){

    if(this.CurrentField){
        this.CurrentField.User = false;
        this.CurrentField.Type = Field.prototype.Types.Free;
    }
    this.CurrentField = cf;
    this.CurrentField.User = this;
    cf.Type = Field.prototype.Types.Object;
    this.X = this.CurrentField.X;
    this.Y = this.CurrentField.Y + this.CurrentField.Size - this.Height;


};
/**
 * @description answers the question from where does the player interact with the object and if it is allowed
 * if yes then the InteractionFunction of this object will be called
 * @param {RPGPlayer} Interactor the player who interacts with the object
 * @returns {undefined}
 */
RPGObject.prototype.Interact = function(Interactor){
    
    if(!this.Interactable || !Interactor || Interactor.Dialog.OffTalking) return;
    
    var iaf = Interactor.CurrentField; //interactor field = iaf
    
    var intx =  iaf.ID.X - this.CurrentField.ID.X;
    var inty =  iaf.ID.Y - this.CurrentField.ID.Y;
    // intx:0, inty:1 => interactable from 1 field below (down)
    
    var notyetok = true;
    var from = "nowhere";
    
    if(notyetok && this.InteractableFrom.down && intx == 0 && inty == 1){
        notyetok = false;
        from = "down";
    }
    if(notyetok && this.InteractableFrom.right && intx == 1 && inty == 0){
        notyetok = false;
        from = "right";
    }
    if(notyetok && this.InteractableFrom.up && intx == 0 && inty == -1){
        notyetok = false;
        from = "up";
    }
    if(notyetok && this.InteractableFrom.left && intx == -1 && inty == 0){
        notyetok = false;
        from = "left";
    }
    if(!notyetok){
        this.NumberOfInteraction++;
        var infu = this.InteractionFunction;
        infu.function.call(infu.that, Interactor, this, infu.parameter, from);
        if(this.NumberOfInteraction >= this.AmountOfInteractionsNeeded)
            this.Interacted = true;
    }
    
};
/**
 * @description changes the Interactabillity of this object with the use of key words
 * @param {keywords as strings} 
 * @returns {undefined}
 */
RPGObject.prototype.SetInteractabillity = function(){
    var words = [];
    for(var i=0; i<arguments.length; i++)
        words.push(arguments[i]);
    words = words.join();
    
    if(words.indexOf("anywhere") >= 0 || words.indexOf("everywhere") >= 0){
        this.InteractableFrom.up = true;
        this.InteractableFrom.right = true;
        this.InteractableFrom.down = true;
        this.InteractableFrom.left = true;
    }
    
    if(words.indexOf("nowhere") >= 0 || words.indexOf("none") >= 0){
        this.InteractableFrom.up = false;
        this.InteractableFrom.right = false;
        this.InteractableFrom.down = false;
        this.InteractableFrom.left = false;
    }
    
    if(words.indexOf("sideway") >= 0 || words.indexOf("horizontal") >= 0){
        this.InteractableFrom.up = false;
        this.InteractableFrom.right = true;
        this.InteractableFrom.down = false;
        this.InteractableFrom.left = true;
    }

    if(words.indexOf("vertical") >= 0){
        this.InteractableFrom.up = true;
        this.InteractableFrom.right = false;
        this.InteractableFrom.down = true;
        this.InteractableFrom.left = false;
    }
    
    // exact words and o'clock
    if(words.indexOf("up") >= 0 || words.indexOf("12") >= 0){
        this.InteractableFrom.up = true;
    }
    
    if(words.indexOf("right") >= 0 || words.indexOf("3") >= 0){
        this.InteractableFrom.right = true;
    }
    
    if(words.indexOf("down") >= 0 || words.indexOf("6") >= 0){
        this.InteractableFrom.down = true;
    }
    
    if(words.indexOf("left") >= 0 || words.indexOf("9") >= 0){
        this.InteractableFrom.left = true;
    }
    
};
/**
 * @description Sets new still images for the object and activates it so that the still images will be drawn in Draw()
 * @param {type} codename_before a String, with which the before-interaction image is registered in the MediaManager
 * @param {type} codename_after a String, with which the after-interaction image is registered in the MediaManager
 * @returns {undefined}
 */
RPGObject.prototype.SetStillImages = function(codename_before, codename_after){
    this.ActivateImages();
    this.CodenameBefore = codename_before;
    this.CodenameAfter = codename_after;
    this.ImageBefore = this.Engine.MediaManager.GetImage(this.CodenameBefore);
    this.ImageAfter = this.Engine.MediaManager.GetImage(this.CodenameAfter);
    
    this.RefreshCallback = new Callback(this, function(codename_before, codename_after){
        this.ActivateImages();
        this.CodenameBefore = codename_before;
        this.CodenameAfter = codename_after;
        this.ImageBefore = this.Engine.MediaManager.GetImage(this.CodenameBefore);
        this.ImageAfter = this.Engine.MediaManager.GetImage(this.CodenameAfter);
    }, codename_before, codename_after);
    
};
/**
 * @description Sets new still images for the object and activates it so that the still images will be drawn in Draw()
 * @param {type} codename_before a String, with which the before-interaction image is registered in the MediaManager
 * @param {type} codename_after a String, with which the after-interaction image is registered in the MediaManager
 * @returns {undefined}
 */
RPGObject.prototype.RefreshStillImages = function(){
    if(!this.RefreshCallback)
        return false;
    this.RefreshCallback.Call();
};
/**
 * @description Activates that the Sprite will be drawn
 * @returns {undefined}
 */
RPGObject.prototype.ActivateSprite = function(){
    this.DrawSprite = true;
};
/**
 * @description Activates that the Still Images will be drawn
 * @returns {undefined}
 */
RPGObject.prototype.ActivateImages = function(){
    this.DrawSprite = false;
};