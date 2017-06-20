
function RPGPath(player){
    
    ABO.call(this);
    
    this.Player = player;
    this.Start;
    this.Target;
    this.Current;;
    
    this.CurrentStep = 0;
    this.Steps = [];
    
    this.TimerRef;
    
    this.Walking = false;
    this.Error = [];
    
this.Initialize();
}
RPGPath.prototype = Object.create(ABO.prototype);
RPGPath.prototype.constructor = RPGPath;

RPGPath.prototype.Initialize = function(){
    if(!this.Player)
        this.Player = this.Engine.Objects.SelectedObject;
};

RPGPath.prototype.SetPlayer = function(p){
    if(!p)
        this.Player = this.Engine.Objects.SelectedObject;
    else
        this.Player = p;
};

RPGPath.prototype.FindPath = function(target){
    
    this.StopWalking();
    this.Target = target;
    this.Start = this.Player.CurrentField;
    this.Current = this.Start;
    this.CurrentStep = 0;
    this.Steps = [];
    this.Error = [];
    
    // if start and target are the same
    if(this.Target.ID.X == this.Start.ID.X && this.Target.ID.Y == this.Start.ID.Y){
        this.Error.push("target = start");
    }
    
    // target is blocked
    if(this.Target.Type == Field.prototype.Types.Blocked){
        this.Error.push("target is blocked");
    }
    
    // if the targeted field is an object, interact with it
    // note here, that a player usually can't interact with an object unless he stands directly in front of it
    if(this.Target.Type == Field.prototype.Types.Object){
        this.Target.User.Interact(this.Player);
    }else{
        //this.AStar();
        this.ProcessPath();
        
    }
};

RPGPath.prototype.ProcessPath = function(){
    
    var possible = true;
    var criteria = 0;
    
    var tx, ty;
    tx = this.Target.ID.X;
    ty = this.Target.ID.Y;
    
    var nf; // current neighbours array
    
    var curx, cury;
    
    var oppdir = {X:0, Y:0}; // the opposite direction of the step before
    var curn; // PriorityQueue wich helps to sort the shortest distance
    var closest;
    this.Steps = [];
    
    // loops as long as:
    // - possible is true
    // - the current field is not the target field ( current field will change with every loop)
    // - the number of loops isn't too high
    while(possible && (this.Current != this.Target) && criteria < 1000){
        criteria++;
        
        // the PriorityQueue - needed to sort out the field with the shortest distance
        // distance will be the priority value
        curn = new PriorityQueue();
        
        // nf will be an array of all neighbouring fields
        nf = this.Engine.Terrain.GetFieldNeighbours(this.Current, false);
        
        // all neighbouring fields will be enqueued into the Queue curn
        for(var i=0; i<nf.length; i++){
            if(nf[i].Field.Type == Field.prototype.Types.Free){
                curx = nf[i].Field.ID.X;
                cury = nf[i].Field.ID.Y;
                curn.Enqueue(nf[i], Math.abs(curx-tx) + Math.abs(cury-ty));
            }
        }
        curn.Sort(false);
        closest = curn.Dequeue();
        
        // making sure that the current closest step doesn't lead to the same field the player comes from
        if(this.Steps.length > 0){
            oppdir = this.GetOppositeDelta(this.Steps[this.Steps.length - 1].Delta);
            // if if-statement is true then the current closest would be a step backwards
            if(closest.Delta.X == oppdir.X && closest.Delta.Y == oppdir.Y)
                closest = curn.Dequeue(); 
        }
        if(closest){
            this.Steps.push(closest);
            oppdir = closest.Delta;
            this.Current = closest.Field;
        }else
            possible = false;
        
    }
    // if the too high number of loops was the ending criteria then there will be an error entry
    if(criteria>=1000)
        this.Error.push("Finding took too long");
    // walking the path even if the path wasn't complete
    this.WalkPath();
};

RPGPath.prototype.WalkPath = function(){
    
    if(this.Error.length>0) return;
    
    if(this.Player.Dialog.Active) return;
    
    var mot = 0; // moving time
    
    mot = 1000/25 * this.Player.AnimationSteps;
    
    var f = function(that){
        
        var tobe = that.Steps[that.CurrentStep].Delta; // to be delta
        var cur = that.Player.Direction; // player's current delta
        
        // turn to the right direction before walking there
        if(cur.X != tobe.X || cur.Y != tobe.Y){
            if(tobe.X == 0 && tobe.Y != 0)
                if( tobe.Y < 0)
                    that.Player.GiveMoveCommand(RPGPlayer.prototype.Commands.TurnUp);
                else
                    that.Player.GiveMoveCommand(RPGPlayer.prototype.Commands.TurnDown);

            if(tobe.X != 0 && tobe.Y == 0)
                if(tobe.X < 0)      
                    that.Player.GiveMoveCommand(RPGPlayer.prototype.Commands.TurnLeft);
                else
                    that.Player.GiveMoveCommand(RPGPlayer.prototype.Commands.TurnRight);
            that.Player.Direction = tobe;    
        }
        that.Player.Stopped = true;
        that.Player.Move(tobe);
        that.CurrentStep++;
        if(that.CurrentStep >= that.Steps.length){
            window.clearInterval(that.TimerRef);
            that.Walking = false;
        }
        
    };
    //f(this);
    this.TimerRef = window.setInterval(f, mot+0, this);
    this.Walking = true;
};

RPGPath.prototype.StopWalking = function(){
    if(this.Walking){
            window.clearInterval(this.TimerRef);
            this.Walking = false;
        }
};

RPGPath.prototype.GetOppositeDelta = function(d){
    var newd = {X:0, Y:0};
    switch(d.X){
        case -1 : newd.X = 1; break;
        case 1 : newd.X = -1; break;
    }
    switch(d.Y){
        case -1 : newd.Y = 1; break;
        case 1 : newd.Y = -1; break;
    }
    
    return newd;
};

// a pathfinding algorithm as well
RPGPath.prototype.AStar = function(){

    /* ++++ START ++++ */

    var f,g,h;
    var criteria = 0;
    var openedQ = new PriorityQueue();
    var closedQ = new PriorityQueue();
    var alln;
    
    var inf = 9999;
    
    // start field gets added to the openQ
    openedQ.Enqueue(this.Current, inf);
    
    while(this.Current != this.Target && criteria < 1000){
        criteria++;
        
        // getting all neighbours of the currently regarded field
        alln = this.Engine.Terrain.GetFieldNeighboursXY(this.Current.ID.X, this.Current.ID.Y, false);
        
        // all neighbouring fields will be enqueued into the Queue open
        for(var i=0; i<alln.length; i++){
            // set the current field as the predecessor of every neighbour
            alln[i].Predecessor = this.Current;            
            if(alln[i].Field.Type == Field.prototype.Types.Free){
                g = 10;
                h = 10* Math.abs(alln[i].Field.ID.X-this.Target.ID.X) + Math.abs(alln[i].Field.ID.Y-this.Target.ID.Y);
                f = g + h;
                if(!openedQ.ElementIsEnqueued(alln[i]))
                    openedQ.Enqueue(alln[i], f);
            }
            
        } // end of for loop
        openedQ.Sort(false);
        var closest = openedQ.Dequeue();
        this.Current = closest.Field;
        
        if(!closedQ.ElementIsEnqueued(closest))
                    closedQ.Enqueue(closest, criteria);
    } // end of while loop
    
    console.log("Astar: " + criteria);
    
};