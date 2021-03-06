/**
 * @description Represents a moveable player object on an rpg terrain
 * @param {number} width width of the image/s
 * @param {number} height height of the image/s
 * @returns {RPGPlaer}
 */
function RPGPlayer(width, height, sprite) {

    Anibody.ABO.call(this);

    this.DebugCurrentField = true;
    this.Height = height;
    this.Width = width;
    this.Center = 0;
    this.CurrentField;
    this.NextField;
    this.Direction = {};

    this.Dialog;

    this.ItemBag;

    this.SuccessfulMoveFunction = function () {
    };
    this.MoveFunction = function () {
    };
    this.MoveQ;
    this.AnimationSteps = 12; // the amount of steps it takes for the player to move to the next field
    // the less the quicker

    this.Type = "RPGPlayer";

    this.Sprite = sprite;
    this.SpriteProcessInputWidget = null;
    
    this.Codename;

    this.Stopped = true;

    this.Initialize();
}
RPGPlayer.prototype = Object.create(Anibody.ABO.prototype);
RPGPlayer.prototype.constructor = RPGPlayer;

RPGPlayer.prototype.Initialize = function () {

    this.MoveQ = new Queue();

    this.Dialog = new RPGDialog();
    this.Dialog.Owner = this;
    this.Dialog.EI = this.EI;
    
    this.ItemBag = new RPGItemBag("main");
    this.ItemBag.EI = this.EI;
    this.ItemBag.Owner = this;
    
    this.SpriteProcessInputWidget = new Anibody.Widget();
    
    this.SpriteProcessInputWidget.PlayerRef = this;
    
    this.Sprite.SetFlag("right", true);
    
    this.SpriteProcessInputWidget.ProcessInput = function(){
        
        var keys = this.Engine.Input.Keys;
        var sr = this.PlayerRef.Sprite;
        var p = this.PlayerRef;
        var min = 2;
        
        if(keys.A.FramesPressed > min || keys.D.FramesPressed > min || keys.W.FramesPressed > min || keys.S.FramesPressed > min){
            sr.SetFlag("walking", true);
            
        }else{
            sr.SetFlag("walking", false);
        }
        
        if(keys.A.FramesPressed > min){
            sr.SetFlag("left", true);
            p.Move({X:-1,Y:0});
        }
        
        if(keys.D.FramesPressed > min){
            sr.SetFlag("right", true);
            p.Move({X:1,Y:0});
        }
        
        if(keys.W.FramesPressed > min){
            sr.SetFlag("up", true);
            p.Move({X:0,Y:-1});
        }
        
        if(keys.S.FramesPressed > min){
            sr.SetFlag("down", true);
            p.Move({X:0,Y:1});
        }
        
        if(keys.I.FramesPressed == 1 && this.Engine.Objects.SelectedObject){
                if(p.ItemBag.isOpen()){
                    sr.Unlock();
                    p.ItemBag.Close();
                }else{
                    sr.Lock();
                    p.ItemBag.Open();
                }
            }
            
            if(keys.U.FramesPressed == 1 && this.Engine.Objects.SelectedObject){
                p.ItemBag.UseItem();
            }
            
            if(keys.Space.FramesPressed == 1){
                 p.Interact();
            }
        
    };
    this.SpriteProcessInputWidget.Register();
    
};
/**
 * 
 * @param {DirectionObject} delta {X:number,Y:number}
 * @returns {undefined}
 */
RPGPlayer.prototype.Move = function (delta /* direction [-1,0, 1] */) {

    // it can't move while player is already moving
    if (!this.Stopped)
        return;
    // player shoudn't move while the player's dialog is active
    if (this.Dialog.Active)
        return;

    // vertical moving of the inventory cursor (arrow)
    if (this.ItemBag && this.ItemBag.isOpen()) {
        if (delta.X == 0 && delta.Y != 0){
            if (delta.Y < 0){
                this.ItemBag.DecreaseImageIndex(); // Arrow Up
            }else{
                this.ItemBag.IncreaseImageIndex(); // Arrow Down
            }
        }        
        return;
    }
        // player shoudn't move while the player's item bag is open
    if (this.ItemBag.isOpen())
        return;

    // determin on which side the player has to turn and do that.
    // GiveMoveCommand() only changes the attributes for the sprite to change
    if (delta.X == 0 && delta.Y != 0){
        if (delta.Y < 0)
            this.GiveMoveCommand(this.Commands.TurnUp);
        else
            this.GiveMoveCommand(this.Commands.TurnDown);
    }


    if (delta.X != 0 && delta.Y == 0)
        if (delta.X < 0)
            this.GiveMoveCommand(this.Commands.TurnLeft);
        else
            this.GiveMoveCommand(this.Commands.TurnRight);



    var target = this.Engine.Terrain.GetFieldNeighbour(this.CurrentField, delta);

    // push only if now is the same direction as it was before
    if(delta.X == this.Direction.X && delta.Y == this.Direction.Y)
        // if the user of target field is an rpgobject 
        if (target.Type == Field.prototype.Types.Object) {
            target.User.ReceivePush(this);
        }

    this.MoveFunction();

    // player won't move unless he turned to the right Direction
    if (target.Type == Field.prototype.Types.Free && this.Direction.X == delta.X && this.Direction.Y == delta.Y) {
        this.Direction = delta;
        this.Stopped = false;
        this.NextField = target;

        var range = {X: target.X - this.CurrentField.X, Y: target.Y - this.CurrentField.Y};
        var step = {X: range.X / this.AnimationSteps, Y: range.Y / this.AnimationSteps};

        for (var i = 0; i < this.AnimationSteps; i++)
            this.MoveQ.Enqueue({Step: step, KeyFrame: i});
    } else {
        this.Direction = delta;
    }

    

};
RPGPlayer.prototype.Draw = function (c) {
    c.save();

    var cam = this.Engine.Camera.SelectedCamera;
    if (this.Sprite === null) {
        c.fillStyle = this.Color;
        c.fillRect(this.X - cam.X, this.Y - cam.Y, this.Width, this.Height);
        c.fillStyle = "black";
        var txt = "Field[{0}][{1}]".format(this.CurrentField.ID.X, this.CurrentField.ID.Y);
        c.fillText(txt, this.X + 2 - cam.X, this.Y + 15 - cam.Y);
        txt = "XY: ({0}/{1})".format(this.X, this.Y);
        c.fillText(txt, this.X + 2 - cam.X, this.Y + 15 * 2 - cam.Y);
    }
    else {
        var s = this.Sprite;
        if (s && s.SpriteImage) {
            s.X = this.X - cam.X;
            s.Y = this.Y - cam.Y;
            s.Draw(c);
        }
        if (this.DebugCurrentField) {
            c.fillStyle = "red";
            c.fillText("Field({0},{1})".format(this.CurrentField.ID.X, this.CurrentField.ID.Y), this.X - cam.X, this.Y + this.Height + 10 - cam.Y);
        }
    }

    // ItemBag & Dialog 
    this.ItemBag.Draw(c);
    this.Dialog.Draw(c);

    c.restore();
};
RPGPlayer.prototype.Update = function () {

    var move = {Step: {X: 0, Y: 0}};
    this.Center = {X: this.X + (this.Width / 2), Y: this.Y + (this.Height / 2)};
    
    this.Sprite.Update();
    
    if (!this.MoveQ.isEmpty()) {
        move = this.MoveQ.Dequeue();
        this.X += move.Step.X;
        this.Y += move.Step.Y;
        this.Sprite.Lock();

        this.GiveMoveCommand(this.Commands.Walk);

        // if the player reached its goal - 
        if (move.KeyFrame >= this.AnimationSteps - 1) {
            this.Stopped = true;
            this.Sprite.Unlock();
            this.GiveMoveCommand(this.Commands.Stop);
            this.SuccessfulMoveFunction();
            this.SetCurrentField(this.NextField);
            this.Engine.Terrain.MoveCounter++;
        }
    }
    
    // ItemBag & Dialog 
    this.ItemBag.Update();
    this.Dialog.Update();
    
    return;
};

RPGPlayer.prototype.ProcessInput = function () {

    this.Sprite.ProcessInput();
    // ItemBag & Dialog 
    this.ItemBag.ProcessInput();
    this.Dialog.ProcessInput();
};

RPGPlayer.prototype.SetCurrentField = function (cf) {
    if (this.CurrentField) {
        this.CurrentField.User = false;
        this.CurrentField.Type = Field.prototype.Types.Free;
    }
    this.CurrentField = cf;
    this.NextField = this.CurrentField;
    this.CurrentField.User = this;
    this.X = this.CurrentField.X;
    this.Y = this.CurrentField.Y + this.CurrentField.Size - this.Height;
};
RPGPlayer.prototype.Interact = function () {
    
    if(this.ItemBag.isOpen()){
        this.ItemBag.SelectItem();
        return;
    }
    
    // getting the field in front of the player
    var target = this.Engine.Terrain.GetFieldNeighbour(this.CurrentField, this.Direction);
    
    // testing if target is the same field as the field on which the player is standing - if true then return
    if (target.ID.X == this.CurrentField.ID.X && target.ID.Y == this.CurrentField.ID.Y)
        return false;
    
    // OffTalking
    if(this.Dialog && this.Dialog.Active && this.Dialog.OffTalking){
        this.Dialog.Interact();
    }
    
    // making sure that the target field has a user
    if (!target.HasUser())
        return false;
    
    // interact with the user
    if (target.User.Interact)
        target.User.Interact(this);
};
RPGPlayer.prototype.SetSprite = function (sprite) {
    this.Sprite = sprite;
};
RPGPlayer.prototype.FindPath = function (target) {
    this.PathObject.FindPath(target);
};

/**
 * @description To change the needed sprite attributes
 * @param {RPGPlayer.prototype.Commands} cmd
 * @returns {Boolean}
 */
RPGPlayer.prototype.GiveMoveCommand = function (cmd) {
    return false;
};
// enumeration of player commands
RPGPlayer.prototype.Commands = {
    Stop: 0,
    Walk: 1,
    Run: 2,
    TurnUp: 5,
    TurnRight: 6,
    TurnDown: 7,
    TurnLeft: 8,
    Interact: 9
};