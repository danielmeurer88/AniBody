 // checks if the object Anibody.util exists and if not creates it
Anibody.SetPackage("Anibody", "util");

/**
 * @description Implementation of a Priority Queue, which can be ascendingly or descendingly sorted in relation to the entry's priority
 * @param {Boolean} nop - Flag if an enqueued element without given priority gets priority of zero (true) or the current highest priority + 1 (false and default)
 * @returns {PriorityQueue}
 */
Anibody.util.PriorityQueue = function PriorityQueue(nop){
    this.heap = [];
    this._desc = true;
    this.HighestPriority = 0;
    // if true and data gets enqueued without priority, it gets priority of Zero 
    // if false it gets the highest priority + 1
    this.NoPriorityThenZero = nop ? nop : false;
    this.Sorted = false;
    this._refnums = 0;
};

Object.defineProperty(Anibody.util.PriorityQueue.prototype, "length", {get: function(){
        return this.heap.length;
}});

Object.defineProperty(Anibody.util.PriorityQueue, "name", {value:"PriorityQueue"});

/**
 * @description Adds a new element of the given data to the queue and returns refnum
 * @param {object} data 
 * @param {number} priority
 * @param {string} name (optional)
 * @returns {Number} the refnum
 */
Anibody.util.PriorityQueue.prototype.Enqueue = function(data, priority, name){
    if(!isNaN(priority) && priority > this.HighestPriority)
        this.HighestPriority = priority;
    
    if(this.NoPriorityThenZero)    
        priority = isNaN(priority) ? 0 : priority;
    else
        priority = priority || typeof priority === "number" ? priority : ++this.HighestPriority;
    
    this.Sorted = false;
    var obj = {data:data, priority:priority, origin:"enqueued", refnum : this._refnums++, name:name};
    this.heap.push(obj);
    return obj.refnum;
};
/**
 * @description Delets the element of the given refnum
 * @param {Number} ref
 * @returns {Number} Number of deleted elements
 */
Anibody.util.PriorityQueue.prototype.DeleteByReferenceNumber = function(ref){
    var found = -1;
    for(var i=0;found < 0 && i<this.heap.length; i++)
        if(this.heap[i].refnum === ref)
            found = i;
    
    found = this.heap.delete(found);
    return found.data;
};

/**
 * @description Delets the element of the given refnum
 * @param {string} name
 * @returns {Number} Number of deleted elements
 */
Anibody.util.PriorityQueue.prototype.DeleteByName = function(name){
    var arr = [];
    var found = 0;
    for(var i=0; i<this.heap.length; i++)
        if(this.heap[i].name !== name)
            arr.push(this.heap[i]);
        else
            found++;
    this.heap = arr;
    return found;
};

/**
 * @description Returns true if the element was found else false
 * @param {object} data element
 * @param {number} priority
 * @returns {Boolean} if successful or not
 */
Anibody.util.PriorityQueue.prototype.ElementIsEnqueued = function(data){
    for(var i=0; i<this.heap.length; i++)
        if(this.heap[i] == data)
            return true;
    
    return false;
};
/**
 * @description returns data of the first element
 * @returns data of the first element
 */
Anibody.util.PriorityQueue.prototype.Dequeue = function(){
    if(this.heap.length>0){
        return this.heap.shift().data;
    }
    else
        return false;
};
/**
 * @description Checks if the queue is empty
 * @returns {Boolean}
 */
Anibody.util.PriorityQueue.prototype.isEmpty = function(){if(this.heap.length<=0)return true; else return false;};
/**
 * @description Sorts the queue by regarding the priority of each element - if no parameter is given with the call then it will be sorted with the highest priority first (in descending order)
 * @param {Boolean} desc if false then sorted in ascending order 
 * @returns {undefined}
 */
Anibody.util.PriorityQueue.prototype.Sort = function(desc){
    if(arguments.length <= 0 || desc){
        this._desc = true;
    }else{
        this._desc = false;
    }
    
    this._quicksort(0, this.heap.length-1);
    this.Sorted = true;
};
/**
 * compare function for the quicksort algorithm
 * @param {object} a
 * @param {object} b
 * @returns {Boolean}
 */
Anibody.util.PriorityQueue.prototype._comp = function(a,b){
    if(this._desc){
        return a.priority > b.priority;
    }else{
        return a.priority < b.priority;
    }
};
/**
 * swap function for the quicksort algorithm
 * @param {object} i
 * @param {object} j
 * @returns {undefined}
 */
Anibody.util.PriorityQueue.prototype._swap = function(i, j){
    // IMPORTANT: Javascript automatically uses internally reference by pointer when it comes to objects
    // switching the pointer
    var temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
};
/**
 * quicksort algorithm that is used by the Sort-method
 * @param {object} left
 * @param {object} right
 * @returns {undefined}
 */
Anibody.util.PriorityQueue.prototype._quicksort = function(left, right) {
 
    if (left < right) {
      var pivot = this.heap[left + Math.floor((right - right) / 2)],
          left_new = left,
          right_new = right;
 
      do {
        while (this._comp(this.heap[left_new], pivot)) {
          left_new += 1;
        }
        while (this._comp(pivot, this.heap[right_new])) {
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

/**
 * @description Factors and returns an array of the PriorityHeap's data (only)
 * @returns {Array of Heap's data}
 */
Anibody.util.PriorityQueue.prototype.FactorArray = function(){
    var arr = [];
    if(!this.Sorted)
        this.Sort(this._desc);
    
    for(var i=0; i<this.heap.length; i++)
        arr.push(this.heap[i].data);
    
    return arr;
};

/**
 * @description Fills the elements of a second PriorityQueue into this one.
 * @param {PriorityQueue} b The 2nd PriorityQueue
 * @returns {undefined}
 */
Anibody.util.PriorityQueue.prototype.Merge = function(b){ 
    this.Sorted = false;
    for(var i=0; i<b.heap.length; i++){
        b.heap[i].origin = "merged";
        this.heap.push( b.heap[i] );
    }
    if(this.HighestPriority < b.HighestPriority)
        this.HighestPriority = b.HighestPriority;
};
/**
 * @description Deletes all elements of the PriorityQueue that originates from merging
 * @returns {undefined}
 */
Anibody.util.PriorityQueue.prototype.DeleteMergedElements = function(){ 
    var temp = [];
    var hp=0; // current highest priority of all none merged elements
    for(var i=0; i<this.heap.length; i++){
        // if the current element is not merged
        if (this.heap[i].origin != "merged"){
            // if the priority of the not merged element is higher than the current one
            if(hp < this.heap[i].priority)
                hp = this.heap[i].priority;
            // add the not merged element to the temp heap
            temp.push( this.heap[i] );
        }
    }
    this.heap = temp;
    this.HighestPriority = hp;
};
/**
 * deletes all entries in the Priority Queue
 * @returns {undefined}
 */
Anibody.util.PriorityQueue.prototype.Flush = function(){
    this.heap = [];
    this.HighestPriority = 0;
    this.Sorted = false;
};

// ########################################################
// ########################################################
// ########################################################

/**
 * @description Encapsulates a function which is called periodically 
 * @param {object} ref - object will be the first parameter of the function f
 * @param {function} f - a function, which will be called the number of times as given in fps 
 * @param {integer} fps - determines how often the function f will be called in a second
 * @param {number} framestotal - determines how often the function will be called in total (optional)
 * @returns {Timer}
 */
Anibody.util.Timer = function Timer(ref, f, fps, framestotal){
    this.ref = ref;
    this.Active = false;
    this.internal = null;
    if(fps <= 0) fps = 1;
    this.Milli = 1000/fps;
    this.Counter = 0;
    this.Total = framestotal;
    
    if(!this.Total || arguments.length > 3){
        this.HasLimit = true;
    }else{
        this.HasLimit = false;
    }
    
    this.Function = function(that){
        that.Counter++;
        
        if(that.HasLimit && that.Counter > that.Total){
            that.Stop();
            return;
        }
        f.call(that.ref, that.ref);
    };
}

Object.defineProperty(Anibody.util.Timer, "name", {value:"Timer"});

/**
 * starts the timer calling the function with the object ref as its first argument and Counter equal to zero
 * @returns {undefined}
 */
Anibody.util.Timer.prototype.Start = function(){
        this.Reset();
        this.internal = window.setInterval(this.Function, this.Milli, this);
        this.Active = true;
};
/**
 * Resets the counter to zero
 * @returns {undefined}
 */
Anibody.util.Timer.prototype.Reset = function(){
        this.Counter = 0;
};
/**
 * stops the timer and reset the counter
 * @returns {undefined}
 */
Anibody.util.Timer.prototype.Stop = function(){
        this.Reset();
        window.clearInterval(this.internal);
        this.Active = false;
};
/**
 * starts the timer calling the function with the object ref as its first argument and Counter same when it was paused
 * @returns {undefined}
 */
Anibody.util.Timer.prototype.Continue = function(){
        this.internal = window.setInterval(this.Function, this.Milli, this);
        this.Active = true;
};
/**
 * pauses the timer (counter stays the same)
 * @returns {undefined}
 */
Anibody.util.Timer.prototype.Pause = function(){
        window.clearInterval(this.internal);
        this.Active = false;
};
/**
 * sets the number of total calls until the timer stops itself
 * @param {type} t
 * @returns {undefined}
 */
Anibody.util.Timer.prototype.SetTotal = function(t){
        this.Total = t;
};

// ########################################################
// ########################################################
// ########################################################

/**
 * Represents a class, which is used to trigger functions every given number of frames
 * @returns {IntervalHandler}
 */
Anibody.util.IntervalHandler = function IntervalHandler(){
    Anibody.EngineObject.call(this);
    // Javascript Integer limit = 2^53 = 9007199254740992
    // (Number of Frames with 25 fps after 5 days) = 25*60*60*24*5 = 10.800.000
    this.Frames = 0;
    this.IntervalFunctions = [];
}
Anibody.util.IntervalHandler.prototype = Object.create(Anibody.EngineObject.prototype);
Anibody.util.IntervalHandler.prototype.constructor = Anibody.util.IntervalHandler;

Object.defineProperty(Anibody.util.IntervalHandler, "name", {value:"IntervalHandler"});

/**
 * @see README_DOKU.txt
 */
Anibody.util.IntervalHandler.prototype.Update = function () {

    this.Frames++;
    var intf = this.IntervalFunctions;
    var d;
    for (var i = 0; i < intf.length; i++) {
        intf[i].that = intf[i].that ? intf[i].that : this.Engine;
        if (this.Frames % intf[i].every == 0)
            Anibody.CallObject(intf[i]);
    }

};

/**
 * Adds function, which is packed in a Interval-Object, is not called every frame but every multiple of the number in co.every
 * returns the ref number, which is needed for removing it
 * @param {counter object} intf - Interval Object, which contents of : { that: that, parameter: obj, function : func, every : frame_number };
 * @param {number} prior - priority within the counter
 * @param {string} name
 * @returns {number}
 */
Anibody.util.IntervalHandler.prototype.AddIntervalFunction = function (intf, every) {
    if(typeof every === "undefined") every = 1;
    intf.every = (typeof intf.every !== "undefined") ? intf.every : 1;
    
    this.IntervalFunctions.push(intf)
    return this.IntervalFunctions.length - 1;
};

/**
 * removes the counter function that belongs to the ref number
 * @param {number} ref
 * @returns {undefined}
 */
Anibody.util.IntervalHandler.prototype.RemoveIntervalFunction = function (ref) {
    this.IntervalFunctions.delete(ref);
};

// ########################################################
// ########################################################
// ########################################################

/**
 * Counts from the beginning of a range to the end of it. Increasing or decreasing every
 * passing time period specified in 'ms' and calling the callbackobject with the current
 * counted value as the first argument of the incapsulated function
 * @param {number-array} range - beginning and end number
 * @param {number} ms - time period
 * @param {callbackobject} cbo - callbackobject, which is called with every counting step
 * @param {callbackobject} endcbo - callbackobject, which is called when the end was reached
 * @returns {Anibody.util.Counter}
 */
Anibody.util.Counter = function Counter(range, ms, cbo, endcbo){
    
    // ++++++++++++++++++
    if(cbo && cbo.that === "self") cbo.that = this;
    if(endcbo && endcbo.that === "self") endcbo.that = this;
    // ++++++++++++++++++
    
    this.StartV = range[0];
    this.EndV = range[1];
    this.CurrentV = range[0];
    this.Milliseconds = ms;
    this.Callbackobject = cbo;
    
    if(typeof endcbo === "object"){
        this.EndCallbackobject = endcbo;
    }else{
        this.EndCallbackobject = {
            function : function(){
                this.Stop();
            },
            that : this
        }
    }
    
    this._intRef = null;
    if(this.StartV < this.EndV)
        this._increasing = true;
    else
        this._increasing = false;
    
    this.Loop = false;
    
};

Object.defineProperty(Anibody.util.Counter, "name", {value:"Counter"});

/**
 * Starts counting
 * @returns {undefined}
 */
Anibody.util.Counter.prototype.Start = function(){
    
    var f = function(that){
        
        var cbo = {function:that.Callbackobject.function, that:that.Callbackobject.that};
        if(that.Callbackobject.useApply){
            cbo.parameter = [that.CurrentV].concat(that.Callbackobject.parameter);
        } 
        else
            cbo.parameter = [that.CurrentV, that.Callbackobject.parameter];
        
        cbo.useApply = true;
        
        Anibody.CallObject(cbo, true);
        
        if(that._increasing){
            that.CurrentV++;
            if(that.CurrentV > that.EndV){
                Anibody.CallObject(that.EndCallbackObject);
                if(that.Loop)
                    that.CurrentV = that.StartV;
                else
                    that.Stop();
            }
        }else{
            that.CurrentV--;
            if(that.CurrentV < that.EndV){
                Anibody.CallObject(that.EndCallbackObject);
                if(that.Loop)
                    that.CurrentV = that.StartV;
                else
                    that.Stop;
            }
        }
        
        
    };
    
    f(this);
    
    this._intRef = window.setInterval(f, this.Milliseconds, this);
};
/**
 * ends counting - will be called automatically from the instance when the end is reached
 * @returns {undefined}
 */
Anibody.util.Counter.prototype.Stop = function(){
    window.clearInterval(this._intRef);
    this._intRef = null;
};
/**
 * sets the the state of counting in a loop
 * @returns {undefined}
 */
Anibody.util.Counter.prototype.SetLoop = function(state){
    this.Loop = state;
};
/**
 * resets
 * @returns {undefined}
 */
Anibody.util.Counter.prototype.Reset = function(){
    this.Stop();
    this.CurrentV = this.StartV;
    this.Start();
};
/**
 * sets the end cbo
 * @param {callbackobject} endcbo - callbackobject, which is called when the end was reached
 * @returns {undefined}
 */
Anibody.util.Counter.prototype.SetEndCallbackObject = function(endcbo){
    if(endcbo && endcbo.that === "self") endcbo.that = this;
    this.EndCallbackObject = endcbo;
};