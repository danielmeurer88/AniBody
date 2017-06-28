/**
 * HashTable for Key/Value-pairs
 * @param {type} maxLists
 * @returns {HashTable}
 */
function HashTable(maxLists){
    this._lists = [];
    this._maxLists = maxLists || 25;
}
/**
 * hash function of the HastTable-Class - get the charCode of every letter of the key and returns the sum
 * @param {string} key
 * @returns {Number}
 */
HashTable.prototype._hashFunction = function(key){
    
    if(typeof key === "undefined")
        throw {Message:"HashTable_Error: undefined key"};
    
    if(typeof key !== "string")
        key = key.toString();
    
    var val = 0;
    
    for(var i=0; i<key.length; i++){
        val += key.charCodeAt(i);
    };
    return val;
};

/**
 * Get the index of the list (array), in which the value will be saved or is saved
 * @param {string} key
 * @returns {Number|Object.prototype._hashFunction.val|type}
 */
HashTable.prototype._getListNum = function(key){
    return this._hashFunction(key) % this._maxLists;
};

/**
 * Saves a new key/value-pair
 * @param {string} key
 * @param {object} value
 * @returns {undefined}
 */
HashTable.prototype.Set = function(key, value){
    var listnum = this._getListNum(key);
    
    if(typeof this._lists[listnum] === "undefined"){
        this._lists[listnum] = [];
    }
    this._lists[listnum].push({key:key, value:value});
};

/**
 * Gets the value of a given key
 * @param {string} key
 * @returns {object}
 */
HashTable.prototype.Get = function(key){
    var listnum = this._getListNum(key);
    
    if(typeof this._lists[listnum] === "undefined"){
        throw {Message:"HashTable_Error: undefined list for key: " + key};
    }
    for(var i=0; i<this._lists[listnum].length; i++){
        if(key === this._lists[listnum][i].key)
            return this._lists[listnum][i].value;
    }
    throw {Message:"HashTable_Error: cannot find value for key: " + key};
};

/**
 * Gets the value of a given key along with internal data
 * @param {string} key
 * @returns {object}
 */
HashTable.prototype.DebugGet = function(key){
    var listnum = this._getListNum(key);
    var obj = {Messages : false, key:key, value:false, hashedKey : listnum};
    
    if(typeof this._lists[listnum] === "undefined"){
        obj.Messages = "HashTable_Error: undefined list for key: " + key;
    }
    if(!obj.Messages){
        for(var i=0; i<this._lists[listnum].length; i++){
            if(key === this._lists[listnum][i].key)
                obj.value = this._lists[listnum][i].value;
        }
        if(obj.value === false)
            obj.Messages = "HashTable_Error: cannot find value for key: " + key;
    }
    return obj;
};

/**
 * returns Array of all values and how they are distributed within the hash table
 * @returns {Array}
 */
HashTable.prototype.GetDistribution = function(){
    var arr = [];
    for(var i=0; i<this._lists.length; i++){
        if(typeof this._lists[i] === "undefined")
            arr.push("List " + i + " is empty");
        else
            if(this._lists[i].length > 1)
                arr.push("List " + i + " has " + this._lists[i].length + " key/value-pairs");
            else
                arr.push("List " + i + " has " + this._lists[i].length + " key/value-pair");
    }
    return arr;
};

// ########################################################
// ########################################################
// ########################################################

var Random = {};
/**
 * Returns a number between a minimum and a maximum - both inclusivly
 * @param {number} min
 * @param {number} max
 * @param {number} decimals
 * @returns {Number}
 */
Random.GetNumber = function(min, max, decimals){
    if(typeof min === "undefined" || isNaN(min))
        min = 0;
    if(typeof max === "undefined" || isNaN(max))
        if(Number && Number.MAX_SAFE_INTEGER)
            max = Number.MAX_SAFE_INTEGER;
        else
            max = Math.pow(2, 53) - 1;
        
    if(typeof decimals === "undefined" || isNaN(decimals))
        decimals = 0;
    
    var ran = Math.random() * Math.pow(10, decimals);
    
    return (Math.round((ran * max) + min)/Math.pow(10, decimals));
};
/**
 * Returns a timestamp from now minus a random timespan
 * @param {number} min minimum
 * @param {number} max maximum
 * @param {string} time unit (ms|s|min|h|d|w|y) leapyear not included in calculation
 * @returns {Number}
 */
Random.GetTimestamp = function(min, max, unit){
    if(typeof unit === "undefined")
        unit = "s";
    var num = Random.GetNumber(min, max);
    
    var lim = Date.now();
    if(unit === "ms" || unit === "mil")
        lim -= num;
    
    if(unit === "s")
        lim -= num * 1000;
    
    if(unit === "min")
        lim -= num * 1000 * 60;
    
    if(unit === "h")
        lim -= num * 1000 * 60 * 60;
    
    if(unit === "d")
        lim -= num * 1000 * 60 * 60 * 24;
    
    if(unit === "w")
        lim -= num * 1000 * 60 * 60 * 24 * 7;
    
    if(unit === "y")
        lim -= num * 1000 * 60 * 60 * 24 * 365;
    
    return lim;
    
};

// ########################################################
// ########################################################
// ########################################################

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

Callback.CallObject = function(obj,para2){
    if(typeof obj === "object" && typeof obj.function === "function")
        obj.function.call(obj.that, obj.parameter,para2);
};

Callback.prototype.ToObject = function(){
     return { that:this.that, function:this.function, parameter:this.parameters};
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
    this._refnums = 0;
}
/**
 * @description Adds a new element of the given data to the queue and returns refnum
 * @param {object} data 
 * @param {number} priority
 * @param {string} name (optional)
 * @returns {Number} the refnum
 */
PriorityQueue.prototype.Enqueue = function(data, priority, name){
    if(priority && priority > this.HighestPriority)
        this.HighestPriority = priority;
    
    if(this.NoPriorityThenZero)    
        priority = priority ? priority : 0;
    else
        priority = priority || typeof priority == "number" ? priority : ++this.HighestPriority;
    
    this.Sorted = false;
    this.length++;
    var obj = {data:data, priority:priority, origin:"enqueued", refnum : this._refnums++, name:name};
    this.heap.push(obj);
    return obj.refnum;
};
/**
 * @description Delets the element of the given refnum
 * @param {Number} ref
 * @returns {Number} Number of deleted elements
 */
PriorityQueue.prototype.DeleteByReferenceNumber = function(ref){
    var arr = [];
    var found = 0;
    for(var i=0; i<this.heap.length; i++)
        if(this.heap[i].refnum !== ref)
            arr.push(this.heap[i]);
        else
            found++;
    this.heap = arr;
    return found;
};

/**
 * @description Delets the element of the given refnum
 * @param {string} name
 * @returns {Number} Number of deleted elements
 */
PriorityQueue.prototype.DeleteByName = function(name){
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
        f.call(that.ref, that.ref);
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

/**
 * @deprecated an easy object is simplier to use and it is quicker
 * @param {type} x
 * @param {type} y
 * @returns {Point}
 */
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
    // (Number of Frames with 25 fps after 5 days) = 25*60*60*24*5 = 10.800.000
    this.Frames = 0;
    this.CounterFunctions = new PriorityQueue();
}
Counter.prototype = Object.create(EngineObject.prototype);
Counter.prototype.constructor = Counter;

Counter.prototype.Update = function () {

    this.Frames++;
    var cf = this.CounterFunctions.heap;
    var d;
    for (var i = 0; i < cf.length; i++) {
        d = cf[i].data;
        d.that = d.that ? d.that : this.Engine;
        if (this.Frames % d.every == 0)
            d.function.call(d.that, d.parameter);
    }

};

Counter.prototype.AddCounterFunction = function (co, prior, name) {
    // co - Counter Object, which contents of : { that: that, parameter: obj, function : func, every : frame_number };
    return this.CounterFunctions.Enqueue(co, prior, name);
};

Counter.prototype.RemoveCounterFunction = function (ref) {
    this.CounterFunctions.DeleteByReferenceNumber(ref);
};

// ########################################################
// ########################################################
// ########################################################
