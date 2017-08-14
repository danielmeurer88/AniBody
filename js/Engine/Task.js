/**
 * A Task capsulates a wanted state of the system, that can be achieved by doing several steps
 * The Task class creates and saves these necessary or optional steps and manages their relations among themselves.
 * @param {string} name (optional)
 * @param {string} desc (optional)
 * @returns {Task}
 */
function Task(name, desc){
    this.Name = name || "task";
    this.Description = desc || "";
    
    this.Steps = [];
    this._stepsDone = [];
    
    this._createImages = false;
    this.CurrentImage = false;
    
    this.DoneCallback = {that:this, parameter:"default", function:function(p){console.log(this.Name + " done: "+p);}};
    this.FailedCallback = {that:this, parameter:"default", function:function(p){console.log(this.Name + " failed: "+p);}};
}
/**
 * Checks if task is done by checking if every non-optional step is done.
 * @returns {Boolean}
 */
Task.prototype.IsDone = function(){
    var done = true;
    for(var i=0; done && i<this.Steps.length; i++)
        if(this.Steps[i].Done || this.Steps[i].Optional)
            done = true;
        else
            done = false;
    return done;
};

/**
 * Sets the callback-object, which will be called when task is done
 * @param {object} cbo
 * @returns {undefined}
 */
Task.prototype.SetCallbackWhenDone = function(cbo){
    this.DoneCallback = cbo;
};
/**
 * Sets the callback-object, which will be called when task has failed
 * @param {object} cbo
 * @returns {undefined}
 */
Task.prototype.SetCallbackWhenFailed = function(cbo){
    this.FailedCallback = cbo;
};

/**
 * @returns {Number} Progress as quotient [0,1]
 */
Task.prototype.GetProgress = function(){
    var steps = 0;
    var stepsDone = 0;
    for(var i=0;i<this.Steps.length; i++){
        if(!this.Steps[i].Optional){
            steps++;
            if(this.Steps[i].Done){
                stepsDone++;
            }
        }
    }
    var progress = 0;
    if(steps !== 0)
        progress = stepsDone/steps;
    
    return progress;
};

/**
 * Checks if task has failed by checking if there is at least one, non-optional step, that has failed.
 * @returns {Boolean}
 */
Task.prototype.HasFailed = function(){
    for(var i=0;i<this.Steps.length; i++)
        if(this.Steps[i].Failed && !this.Steps[i].Optional)
            return true;
    return false;
};
/**
 * Checks if task is done or has failed and calls the respective callback-object
 * @returns {undefined}
 */
Task.prototype._check = function(){
        
    if(this.IsDone()){
        var cbo = this.DoneCallback;
        cbo.function.call(cbo.that, cbo.parameter);
        return;
    }
    
    if(this.HasFailed()){
        var cbo = this.FailedCallback;
        cbo.function.call(cbo.that, cbo.parameter);
        return;
    }
};
/**
 * Adds a Step to the task and saves the required steps
 * @param {Step} step
 * @returns {Object}
 */
Task.prototype.AddStep = function(step/*, [required steps]*/){
    
    var recognized = 0;
    
    step.Task = this;
    
    for(var i=1; i<arguments.length; i++){
        if(arguments[i] instanceof Step){
            step.RequiredSteps.push(arguments[i]);
            recognized++;
        }
    }
    this.Steps.push(step);
    if(this._createImages)
        this._createsImage();
    // returns object, which can be evaluated if there are unrecognized steps
    return {NumRequiredSteps : arguments.length-1, NumRecognizedSteps : recognized};
};

/**
 * Creates a step with simultanious check if Step.Id is unique
 * @param {string} id - unique text string, can be short-description
 * @param {string} desc - description of the step, often holds information that will be rendered to the user somehow
 * @param {string} req_not_met_text - text that will often be rendered to the user when this steps is the reason why another step cannot be done at the moment
 * @param {bool} canfail - boolean if trying to do this step and failing due to not meeting the requirements leads to task failure
 * @param {string} failtext - text that will often be rendered to the user when this steps is the reason why the task fails
 * @returns {Object.prototype.createStep.step|Step|Boolean}
 */
Task.prototype.createStep = function(id, desc, req_not_met_text, canfail, failtext){
    
    if(this.GetStepById(id)){
        console.log(id + " already exists");
        return false;
    }
    
    var step = new Step(id, desc, req_not_met_text, canfail, failtext);
    step.Task = this;
    return step;
};
/**
 * Gets the step, that has the given id
 * @param {string} id
 * @returns {Step|false}
 */
Task.prototype.GetStepById = function(id){
    for(var i=0; i<this.Steps.length; i++)
        if(this.Steps[i].Id === id)
            return this.Steps[i];
    return false;
};

/**
 * "Does" the step of the given id if the required steps are done, if not this step can fail
 * @param {string} id
 * @returns {object}
 */
Task.prototype.DoStep = function(id){
    var step = this.GetStepById(id);
    if(!step) return {step:false, successful: false};
    
    var req = step.GetRequiredUndoneSteps();
    
    if(req.length === 0){
        step.Done = true;
    }else{
        if(step.CanFail){
            step.Failed = true;
        }
    }
    this._check();
    if(this._createImages)
        this._createsImage();
    return {step:step, requiredSteps : req ,successful:step.Done, failed:step.Failed};
};

/**
 * Creates an Image of the undone, done and failed steps of the Task
 * @returns {object}
 */
Task.prototype._createsImage = function(){
    
    var fontColor = "black";
    var padding = 5;
    var rowspace = 3;
    var width = 400;
    var fh = 14;
    
    // first offscreen canvas is only for measuring the texts - height is not important yet
    var can = document.createElement("CANVAS");
    can.width = width;
    can.height = 200;
    var c = can.getContext("2d");
    c.setFontHeight(fh);
    
    var checkedBallot = decodeURI("%E2%98%91");
    var uncheckedBallot = decodeURI("%E2%98%90");
    var cross = decodeURI("%F0%9F%97%99");
    
    var texts = [];
    
    for(var i=0; i<this.Steps.length; i++){
        if(this.Steps[i].Done)
            texts[i] = checkedBallot + " " + this.Steps[i].Description;
        else
            if(this.Steps[i].Failed)
                texts[i] = cross + " " + this.Steps[i].Description;
            else
                texts[i] = uncheckedBallot + " " + this.Steps[i].Description;
    }


    var allwords = [];
    var alllengths = [];
    // measures the length of the " "-symbol
    var spacelen = c.measureText(" ").width;

    var temp;
    // loops through all elements of the string array
    for (var i = 0; i < texts.length; i++) {
        // splits them into single elements (words)
        temp = texts[i].split(" ");
        // and loops through them
        for (var j = 0; j < temp.length; j++) {
            allwords.push(temp[j]);
            alllengths.push(c.measureText(temp[j]).width);
        }
        // at the end of every string element of the array will be a "\n"
        // * if it is not the last element of the array
        if (i < texts.length - 1) {
            allwords.push("\\n");
            alllengths.push(0);
        }
    }
    // at the end of the loop - we have two arrays
    // - allwords - which has all words
    // - alllengths - which has all lengths of the string element in 'allwords' with the same index

    // now we want to find out how many rows needs to be created so
    // - we use every word
    // - every row won't exceed the width of the box (considering the padding as well)
    // - every "\n" marks the end of the current row

    var rows = [];
    var templen = 0;
    rows.push("");
    for (var i = 0; i < allwords.length; i++) {

        if (allwords[i] === "\\n") {
            i++;
            rows.push(allwords[i] + " ");
            templen = 0 + alllengths[i] + spacelen;
        } else {
            // true if the current word won't exceed the width+padding of the box
            if (templen + alllengths[i] + spacelen < width - 2 * padding) {
                // adds the word + " " to the current row
                rows[rows.length - 1] += allwords[i] + " ";
                templen += alllengths[i] + spacelen;
            } else {
                // removes the last " "-symbol of the current row
                rows[rows.length - 1] = rows[rows.length - 1].substr(0, rows[rows.length - 1].length - 1);
                // begins a new row and adds the current word + " " to it
                rows.push(allwords[i] + " ");
                templen = 0 + alllengths[i] + spacelen;
            }
        }
    }
    // removes the last " "-symbol of the last row
    rows[rows.length - 1] = rows[rows.length - 1].substr(0, rows[rows.length - 1].length - 1);

    // now that we know how many rows there are, we can calculate the height
    // 
    // the height only for the toaster text
    var realHeight = 2 * padding + fh * rows.length + rowspace * (rows.length - 1);
    // plus the extra height for the title with closing "x"
    
    
    // CREATING THE PICTURE
    can = document.createElement("CANVAS");
    can.width = width;
    can.height = realHeight;
    c = can.getContext("2d");
    c.setFontHeight(fh);
    
    c.textAlign = "left";
    c.textBaseline = "top";
    c.fillStyle = fontColor;
    
    var x = padding;
    var y = padding;

    /* ++++++++++ creating the text ++++++++ */
    for (var i = 0; i < rows.length; i++) {
        c.fillText(rows[i], x, y);
        y += fh + rowspace;
    }
    
    
    // saving the drawing as an image
    var url = can.toDataURL();
    this.CurrentImage = document.createElement("IMG");
    this.CurrentImage.src = url;

    var fileName = "test.png";
    
    var saveImg = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var url = data;
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    //saveImg(url, fileName);
    
};


// ##############################################################################################

/**
 * @param {string} id - unique text string, can be short-description
 * @param {string} desc - description of the step, often holds information that will be rendered to the user somehow
 * @param {string} req_not_met_text - text that will often be rendered to the user when this steps is the reason why another step cannot be done at the moment
 * @param {bool} canfail - boolean if trying to do this step and failing due to not meeting the requirements leads to task failure
 * @param {string} failtext - text that will often be rendered to the user when this steps is the reason why the task fails
 * @returns {Step}
 */
function Step(id, desc, req_not_met_text, canfail, failtext){
    
    if(typeof canfail === "undefined")
        canfail = false;
    
    this.Done = false;
    this.Failed = false;
    this.FailText = failtext;
    this.CanFail = canfail;
    
    this.Id = id;
    this.Task = null;
    this.Description = desc;
    
    this.RequiredSteps = [];
    this.RequirementNotMetText = req_not_met_text;
    
    this.Optional = false;
}
/**
 * Returns array of all required steps, which are undone
 * @returns {Array[Steps]}
 */
Step.prototype.GetRequiredUndoneSteps = function(){
    var req = [];
    for(var i=0;i<this.RequiredSteps.length; i++)
        if(!this.RequiredSteps[i].Done)
            req.push(this.RequiredSteps[i]);
    return req;
};
