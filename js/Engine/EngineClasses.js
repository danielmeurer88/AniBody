function Callback(that, func, parameter){
    
    // if Callback was instanciated with an object
    if(that.function){
        this.that = that.that;
        this.function = that.function;
        this.parameters = [that.parameter];
    }else{
        this.function = func;
        this.that = that;
        this.parameters = [parameter];
    }
    
    this.OneParameter = true;
    if(arguments.length > 3){
        this.OneParameter = false;
        for(var i = 3; i < arguments.length; i++)
            this.parameters.push(arguments[i]);
    }
};


Callback.prototype.Call = function(){
    if(this.OneParameter)
        this.function.call(this.that, this.parameters[0]);
    else
        this.function.apply(this.that, this.parameters);
};


// ########################################################
// ########################################################
// ########################################################

/**
 * @description Implementation of a Priority Queue, which can be ascendingly or descendingly sorted in relation to the entry's priority
 * @param {Boolean} nop Flag if an enqueued element without given priority gets priority of zero (true) or the current highest priority + 1 (false and default)
 * @returns {PriorityQueue}
 */
function PriorityQueue(nop){
    this.heap = [];
    this._desc = true;
    this.HighestPriority = 0;
    // if true and data gets enqueued without priority, it gets priority of Zero 
    // if false it gets the highest priority + 1
    this.NoPriorityThenZero = nop ? nop : false;
    this.Sorted = false;
    this.length = 0;
}
/**
 * @description Adds a new element of the given data to the queue
 * @param {object} data 
 * @param {number} priority
 * @returns {Boolean} if successful or not
 */
PriorityQueue.prototype.Enqueue = function(data, priority){
    if(priority && priority > this.HighestPriority)
        this.HighestPriority = priority;
    
    if(this.NoPriorityThenZero)    
        priority = priority ? priority : 0;
    else
        priority = priority || typeof priority == "number" ? priority : ++this.HighestPriority;
    
    this.Sorted = false;
    this.length++;
    return this.heap.push({data:data, priority:priority, origin:"enqueued"});
};
/**
 * @description Returns true if the element was found else false
 * @param {object} data element
 * @param {number} priority
 * @returns {Boolean} if successful or not
 */
PriorityQueue.prototype.ElementIsEnqueued = function(data){
    for(var i=0; i<this.heap.length; i++)
        if(this.heap[i] == data)
            return true;
    
    return false;
};
/**
 * @description returns data of the first element
 * @returns data of the first element
 */
PriorityQueue.prototype.Dequeue = function(){
    if(this.heap.length>0){
        this.length--;
        return this.heap.shift().data;
    }
    else
        return false;
};
/**
 * @description Checks if the queue is empty
 * @returns {Boolean}
 */
PriorityQueue.prototype.isEmpty = function(){if(this.heap.length<=0)return true; else return false;};
/**
 * @description Sorts the queue by regarding the priority of each element - if no parameter is given with the call then it will be sorted with the highest priority first (in descending order)
 * @param {Boolean} desc if false then sorted in ascending order 
 * @returns {undefined}
 */
PriorityQueue.prototype.Sort = function(desc){
    
    if(arguments.length <= 0 || desc){
        this._desc = true;
    }else{
        this._desc = false;
    }
    
    this._quicksort(0, this.heap.length-1);
    this.Sorted = true;
};

PriorityQueue.prototype._comp = function(a,b){
    if(this._desc){
        return a.priority > b.priority;
    }else{
        return a.priority < b.priority;
    }
};

PriorityQueue.prototype._swap = function(i, j){
    // IMPORTANT: Javascript automatically uses internally reference by pointer when it comes to objects
    // switching the pointer
    var temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
};

PriorityQueue.prototype._quicksort = function(left, right) {
 
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
PriorityQueue.prototype.FactorArray = function(){
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
PriorityQueue.prototype.Merge = function(b){ 
    this.Sorted = false;
    for(var i=0; i<b.heap.length; i++){
        b.heap[i].origin = "merged";
        this.heap.push( b.heap[i] );
    }
    this.length = this.heap.length;
    if(this.HighestPriority < b.HighestPriority)
        this.HighestPriority = b.HighestPriority;
};
/**
 * @description Deletes all elements of the PriorityQueue that originates from merging
 * @returns {undefined}
 */
PriorityQueue.prototype.DeleteMergedElements = function(){ 
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
    this.length = this.heap.length;
};

PriorityQueue.prototype.Flush = function(){
    this.heap = [];
    this.HighestPriority = 0;
    this.Sorted = false;
    this.length = 0;
};

// ########################################################
// ########################################################
// ########################################################

function Queue(){
    this.vals = [];
}
Queue.prototype.Enqueue = function(val){return this.vals.push(val);};
Queue.prototype.Dequeue = function(){return this.vals.shift();};
Queue.prototype.isEmpty = function(){if(this.vals.length<=0)return true; else return false;};

// ########################################################
// ########################################################
// ########################################################

/**
 * @description Encapsulates a function which is called periodically 
 * @param {object} ref object will be the first parameter of the function f
 * @param {type} f a function, which will be called the number of times as given in fps 
 * @param {type} fps determines how often the function f will be called in a second
 * @param {type} [optional] framestotal determines how often the function will be called in total
 * @returns {Timer}
 */
function Timer(ref, f, fps, framestotal){
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
        f(that.ref);    
    };
}
Timer.prototype.Start = function(){
        this.Reset();
        this.internal = window.setInterval(this.Function, this.Milli, this);
        this.Active = true;
};
Timer.prototype.Reset = function(){
        this.Counter = 0;
};
Timer.prototype.Stop = function(){
        window.clearInterval(this.internal);
        this.Active = false;
};
Timer.prototype.Continue = function(){
        this.internal = window.setInterval(this.Function, this.Milli, this);
        this.Active = true;
};
Timer.prototype.Pause = function(){
        window.clearInterval(this.internal);
        this.Active = false;
};
Timer.prototype.SetTotal = function(t){
        this.Total = t;
};

// ########################################################
// ########################################################
// ########################################################

function Point(x,y){
    this.X = x;
    this.Y = y;
}

// ########################################################
// ########################################################
// ########################################################

function Counter(){
    EngineObject.call(this);
    // Javascript Integer limit = 2^53 = 9007199254740992
    // (25 fps ) 25*60*60*24*5 (5 days) = 10.800.000
    
    this.Limit = 1800000000;
    this.Frames = 0;
    
    this.CounterFunctions = [];
        
    this.Update = function(){
        
        this.Frames++;
        
        for(var i=0; i<this.CounterFunctions.length; i++){
            this.CounterFunctions[i].that = this.CounterFunctions[i].that ? this.CounterFunctions[i].that : this.Engine;
            if( this.Frames % this.CounterFunctions[i].every == 0)
                this.CounterFunctions[i].function.call( this.CounterFunctions[i].that, this.CounterFunctions[i].parameter);
        }
        
    };
    
    this.AddCounterFunction = function(co){
        // co - Counter Object, which contents of : { that: that, parameter: obj, function : func, every : frame_number };
        this.CounterFunctions.push(co);
    };
    
}
Counter.prototype = Object.create(EngineObject.prototype);
Counter.prototype.constructor = Counter;

// ########################################################
// ########################################################
// ########################################################