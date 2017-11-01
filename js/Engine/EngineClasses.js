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

/**
 * a class that provides random numbers
 * @type static class
 */
var Random = {};
/**
 * Returns a number between a minimum and a maximum - both inclusivly
 * @param {number} min
 * @param {number} max
 * @param {number} decimals
 * @returns {Number}
 */
Random.GetNumberOld = function(min, max, decimals){
    
    // Testing needed
    
    if(isNaN(min))
    min = 0;
    if(isNaN(max))
        if(Number && Number.MAX_SAFE_INTEGER)
            max = Number.MAX_SAFE_INTEGER;
        else
            max = Math.pow(2, 53) - 1;
        
    if(isNaN(decimals))
        decimals = 0;
    
    var ran = Math.random() * Math.pow(10, decimals+6);
    min *= Math.pow(10, decimals);
    max *= Math.pow(10, decimals);
    ran = ran % (max - min + 1) + min;
    return (Math.round(ran)/Math.pow(10, decimals));
};

Random.GetNumber = function(min, max, decimals){
    if(window.crypto || window.crypto.getRandomValues){
        return Random.GetNumberOld(min, max, decimals);
    }
    
    if(isNaN(min))
    min = 0;
    if(isNaN(max))
        if(Number && Number.MAX_SAFE_INTEGER)
            max = Number.MAX_SAFE_INTEGER;
        else
            max = Math.pow(2, 53) - 1;
        
    if(typeof decimals === "undefined" || isNaN(decimals))
        decimals = 0;
    
    var array = new Uint32Array(3);
    window.crypto.getRandomValues(array);
    
    var num = array[0] + array[1] + array[2];
    max *= Math.pow(10, decimals);
    min *= Math.pow(10, decimals);
    num = num % (max - min + 1) + min;
    num /= Math.pow(10, decimals);
    return num;
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
/**
 * Figuratively speaking: Drawing 1 lot from a bowl. How many lots of a kind exists in the bowl can be different
 * @example Random.DrawLot(["A","B"],[8, 2]) --> the bowl has 8+2 lots in it.
 * 8x "A" and 2x "B". The call will draw 1 lot and return it
 * @param {object-array} lots
 * @param {number-array} lotschance
 * @returns {object}
 */
Random.DrawLot = function(lots, lotsChances){
    
    if(arguments.length < 1) throw "ArgumentException: Too less arguments";
    
    if(isNaN(lots.length) || isNaN(lotsChances.length))
        throw "ArgumentException: Arguments need to be arrays";
    
    if(lots.length !== lotsChances.length)
        throw "ArgumentException: Arrays need to be the same size";
    
    var i;
    // find out how many decimals are after the dot
    var getDecimals = function(num){
        var str = num.toString();
        var i = str.indexOf(".");
        if(i < 0) return 0;
        str = str.substr(i+1);
        return str.length;
    };
    
    var decimals = 0;
    for(i=0; i<lotsChances.length; i++){
        decimals = Math.max(decimals,getDecimals(lotsChances[i]));
    }
    
    var chanceSum = 0;
    for(i=0; i<lotsChances.length; i++)
        chanceSum += lotsChances[i];
    
    var rnd = Random.GetNumber(0, chanceSum, decimals);
    var classmin = 0;
    var classmax = 0;
    for(i=0; i<lots.length; i++){
        classmax += lotsChances[i];
        if(rnd >= classmin && rnd < classmax)
            return lots[i];
        classmin = classmax;
    }
    return lots[lots.length-1];
};

// ########################################################
// ########################################################
// ########################################################

/**
 * Callback class - capsulates a function with its this-object and parameters
 * @param {type} that
 * @param {type} func
 * @param {type} parameter
 * @returns {Callback}
 */
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
/**
 * Triggers the function
 * @returns {undefined}
 */
Callback.prototype.Call = function(){
    if(this.OneParameter)
        this.function.call(this.that, this.parameters[0]);
    else
        this.function.apply(this.that, this.parameters);
};
/**
 * Calls/triggers a callback-object
 * @type static method
 * @param {type} obj
 * @returns {undefined}
 */
Callback.CallObject = function(obj, extra){
    if(typeof obj === "object" && typeof obj.function === "function"){
        obj.function.call(obj.that, obj.parameter, extra);
    }
        
};

/**
 * Transform an instance of the class into in object and returns it
 * @returns {Callback.prototype.ToObject.EngineClassesAnonym$2}
 */
Callback.prototype.ToObject = function(){
     return { that:this.that, function:this.function, parameter:this.parameters};
};

// ########################################################
// ########################################################
// ########################################################

/**
 * @description Implementation of a Priority Queue, which can be ascendingly or descendingly sorted in relation to the entry's priority
 * @param {Boolean} nop - Flag if an enqueued element without given priority gets priority of zero (true) or the current highest priority + 1 (false and default)
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
/**
 * compare function for the quicksort algorithm
 * @param {object} a
 * @param {object} b
 * @returns {Boolean}
 */
PriorityQueue.prototype._comp = function(a,b){
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
PriorityQueue.prototype._swap = function(i, j){
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
/**
 * deletes all entries in the Priority Queue
 * @returns {undefined}
 */
PriorityQueue.prototype.Flush = function(){
    this.heap = [];
    this.HighestPriority = 0;
    this.Sorted = false;
    this.length = 0;
};

// ########################################################
// ########################################################
// ########################################################

/**
 * represents an ordinary queue - FIFO - first in first out
 * @returns {Queue}
 */
function Queue(){
    this.vals = [];
}
/**
 * enqueues an object
 * @param {object} val
 * @returns {boolean}
 */
Queue.prototype.Enqueue = function(val){return this.vals.push(val);};
/**
 * Dequeues the first enqueued object, deletes it from the queue
 * @returns {object}
 */
Queue.prototype.Dequeue = function(){return this.vals.shift();};
/**
 * returns true if queue is empty, false if otherwise
 * @returns {Boolean}
 */
Queue.prototype.isEmpty = function(){if(this.vals.length<=0)return true; else return false;};

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
/**
 * starts the timer calling the function with the object ref as its first argument and Counter equal to zero
 * @returns {undefined}
 */
Timer.prototype.Start = function(){
        this.Reset();
        this.internal = window.setInterval(this.Function, this.Milli, this);
        this.Active = true;
};
/**
 * Resets the counter to zero
 * @returns {undefined}
 */
Timer.prototype.Reset = function(){
        this.Counter = 0;
};
/**
 * stops the timer and reset the counter
 * @returns {undefined}
 */
Timer.prototype.Stop = function(){
        this.Reset();
        window.clearInterval(this.internal);
        this.Active = false;
};
/**
 * starts the timer calling the function with the object ref as its first argument and Counter same when it was paused
 * @returns {undefined}
 */
Timer.prototype.Continue = function(){
        this.internal = window.setInterval(this.Function, this.Milli, this);
        this.Active = true;
};
/**
 * pauses the timer (counter stays the same)
 * @returns {undefined}
 */
Timer.prototype.Pause = function(){
        window.clearInterval(this.internal);
        this.Active = false;
};
/**
 * sets the number of total calls until the timer stops itself
 * @param {type} t
 * @returns {undefined}
 */
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

/**
 * Represents a class, which is used in the engine
 * it's possible to add a function that is called not every frame but every multiple of a certain number
 * @returns {Counter}
 */
function Counter(){
    EngineObject.call(this);
    // Javascript Integer limit = 2^53 = 9007199254740992
    // (Number of Frames with 25 fps after 5 days) = 25*60*60*24*5 = 10.800.000
    this.Frames = 0;
    this.CounterFunctions = new PriorityQueue();
}
Counter.prototype = Object.create(EngineObject.prototype);
Counter.prototype.constructor = Counter;
/**
 * @see README_DOKU.txt
 */
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

/**
 * Adds function, which is packed in a Counter-Object, is not called every frame but every multiple of the number in co.every
 * returns the ref number, which is needed for removing it
 * @param {counter object} co - Counter Object, which contents of : { that: that, parameter: obj, function : func, every : frame_number };
 * @param {number} prior - priority within the counter
 * @param {string} name
 * @returns {number}
 */
Counter.prototype.AddCounterFunction = function (co, prior, name) {
    return this.CounterFunctions.Enqueue(co, prior, name);
};
/**
 * Adds a callback-object, which is not called every frame but every multiple of the number in 'every'
 * returns the ref number, which is needed for removing it
 * @param {callback object} co - Counter Object, which contents of : { that: that, parameter: obj, function : func, every : frame_number };
 * @param {number} every
 * @param {number} prior - priority within the counter
 * @param {string} name
 * @returns {number}
 */
Counter.prototype.AddCallbackObject = function (cbo, every,  prior, name) {
    cbo.every = every;
    return this.CounterFunctions.Enqueue(cbo, prior, name);
};
/**
 * removes the counter function that belongs to the ref number
 * @param {number} ref
 * @returns {undefined}
 */
Counter.prototype.RemoveCounterFunction = function (ref) {
    this.CounterFunctions.DeleteByReferenceNumber(ref);
};

// ########################################################
// ########################################################
// ########################################################
