
/**
 * @description Usually a RPGDialog is a attribute of a RPGPlayer object and represents
 * a dialog box, in which a given text is displayed.
 * @returns {RPGDialog}
 */
function RPGDialog(){
    ABO.call(this);
    
    // a flag that says if the images will be displayed or not
    this.Active = false;
    // usually, player can only interact with another object but if OffTalking is true
    // then interacting is always possible - will be false when Images are done
    this.OffTalking = false;
    
    
    this.Owner;
    // the images created, will be saved here,...
    this.Images = [];
    this.ImageTypes = [];
    // and there current index
    this.ImageIndex = -1;
    
    this.BasicTextFactor = 6;
    this.PolarQuestionFactor = 5;
    this.QuestionMulti = 0.75; // the multiplicator for the factorized data in case of a polar question
    this.AnswerBoxHeight = 120;// the height of the box with the answer buttons
    this.WaitingForInput = false;
    
    // the actual data the image will have later when the image is displayed
    this.FontSize = 36;
    this.Ratio = 0.3; // = Height / Width
    this.Width = 0;
    this.Height = 200;
    this.Spacing = 5;
    this.SpacingBetweenLines = 5;
    this.Margin = 36;
    
    this.MouseOverImage = false; // even if the variable name suggests that this is a flag for when the mouse is over the image
    // this is now not the case - now it is a flag if the mouse is over the cancel box
    
    // data needed for the polar question
    // ------------------------------------
    // after the function Initialize(), it's an object that has the data for the minimal answer button
    this.InputButton;
    this.MouseOverYes = false;
    this.MouseOverNo = false;
    this.InputFunctionYes = function(){
        this.WaitingForInput = false;
    };
    this.InputFunctionNo = function(){
        this.WaitingForInput = false;
    };

    this.CSSMouseCursorWhenOverButton = "pointer";
    
    this.Colors = {
        Font : "#030303",
        Background : "#fff",
        Border : "#030303",
        AnswerBoxBackground : "#f3f3f3",
        AnswerBoxShadow : "#333"
        
    };
    
this.Initialize();
}
RPGDialog.prototype = Object.create(ABO.prototype);
RPGDialog.prototype.constructor = RPGDialog;


/*
 * @description calculates the needed numbers
 * @returns {undefined}
 */
RPGDialog.prototype.Initialize = function(){
        
    this.Width = this.Engine.Canvas.width; // 100% width
    this.Height = this.Width * this.Ratio; // height as the width with a certain ratio
    
    this.SpacingBetweenLines = this.Height / 8;
    
    this.Margin = this.Height / 4 - (this.SpacingBetweenLines / 2);
    this.FontSize = this.Height / 4;
    
    this.X = 0;
    this.Y = this.Engine.Canvas.height - this.Height;
    
};
RPGDialog.prototype.Update = function(){
    
    if(this.ImageIndex >= this.Images.length){
        this.Active = false;
        this.OffTalking = false;
        return;
    }
    
    if(this.ImageTypes[this.ImageIndex] == this.Types.CallbackFunction){
        // callback-object
        var cbo = this.ImageTypes[this.ImageIndex+1];
        cbo.function.call(cbo.that, cbo.parameter);
        
    }
    
    // if the current image (state) is a Polar Question
    if(this.ImageTypes[this.ImageIndex] == this.Types.PolarQuestion)
        // wait for no other input then a mouse click/touch 
        this.WaitingForInput = true;
    else{
        this.WaitingForInput = false;
        this.MouseOverYes = false;
        this.MouseOverNo = false;
    }
    // shortcuts
    var m = this.Engine.Input.Mouse;
    var p = m.Position.Relative; //relative position to the 0/0-to the canvas html element
    
    var b; // current image (click) box which relates to the state
    
    if(this.ImageTypes[this.ImageIndex] == this.Types.PopupImage){
        b = this.Images[this.ImageIndex].ImageBox;
            if(b && b.X <= p.X && p.X <= b.X+b.Width && b.Y <= p.Y && p.Y <= b.Y + b.Height){
                    this.MouseOverImage = true;
                        this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursorWhenOverButton);
            }else
                this.MouseOverImage = false;

        if(m.Left.FramesUp == 1 && this.MouseOverImage){
                this.Interact();
            }
    }
    if(this.WaitingForInput){
        
        b = this.Images[this.ImageIndex];
        b = b.AnswerBoxYes;
        if(b && b.X <= p.X && p.X <= b.X+b.Width && b.Y <= p.Y && p.Y <= b.Y + b.Height){
                this.MouseOverYes = true;
                this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursorWhenOverButton);
        }else
            this.MouseOverYes = false;
        
        b = this.Images[this.ImageIndex].AnswerBoxNo;
        if(b && b.X <= p.X && p.X <= b.X+b.Width && b.Y <= p.Y && p.Y <= b.Y + b.Height){
                this.MouseOverNo = true;
                    this.Engine.Input.Mouse.Cursor.Set(this.CSSMouseCursorWhenOverButton);
        }else
            this.MouseOverNo = false;
        
        
        
        if(m.Left.FramesUp == 1 && this.MouseOverYes){
            this.WaitingForInput = false;
            this.InputFunctionYes.function.call(this.InputFunctionYes.that, this.InputFunctionYes.parameter);
            this.Interact();
                
        }
        if(m.Left.FramesUp == 1 && this.MouseOverNo){
            this.WaitingForInput = false;
            this.InputFunctionNo.function.call(this.InputFunctionNo.that, this.InputFunctionNo.parameter);
            this.Interact();
        }
        
        
    }//if(this.WaitingForInput)
    
};
RPGDialog.prototype.Draw = function(c){
    
    if(!this.Active)
        return;
    c.save();
    
    var eng = this.Engine;
    
    if(this.ImageTypes[this.ImageIndex] == this.Types.BasicText){
        // automatically streches the images by "this.FactorizedData.Factor"
        //c.drawImage(this.Images[this.ImageIndex], 0, 0, this.Width, this.Height);
        c.drawImage(this.Images[this.ImageIndex],0, 0, this.Engine.Canvas.width, this.Engine.Canvas.height);
    }
    
    if(this.ImageTypes[this.ImageIndex] == this.Types.PopupImage){
        // automatically streches the images by "this.FactorizedData.Factor"
        //c.drawImage(this.Images[this.ImageIndex], 0, 0, this.Width, this.Height);
        c.drawImage(this.Images[this.ImageIndex],
        0, 0,
        this.Engine.Canvas.width, this.Engine.Canvas.height);
    }
    
    if(this.ImageTypes[this.ImageIndex] == this.Types.PolarQuestion){
        // automatically streches the images by "this.FactorizedData.Factor"
        //c.drawImage(this.Images[this.ImageIndex], 0, 0, this.Width, this.Height);
        c.drawImage(this.Images[this.ImageIndex],
        0, 0 , this.Engine.Canvas.width, this.Engine.Canvas.height);
        if(this.WaitingForInput){
            c.fillStyle = "rgba(66,66,66,0.3)";
            var b;
            if(this.MouseOverYes){
                b = this.Images[this.ImageIndex].AnswerBoxYes;
                c.fillVariousRoundedRect(b.X, b.Y, b.Width, b.Height, b.Rounding);
            }
            if(this.MouseOverNo){
                b = this.Images[this.ImageIndex].AnswerBoxNo;
                c.fillVariousRoundedRect(b.X, b.Y, b.Width, b.Height, b.Rounding);
            }
        }
    }
    
    c.restore();
    
};

/**
 * if the Text Dialog is active, it increases the image index and therefore the next image will be drawn henceforth or it will be deactivated
 * @returns {Boolean}
 */
RPGDialog.prototype.Interact = function(){
    if(this.WaitingForInput) return;
    if(this.ImageIndex == -1 || this.Images.length <= 0){
        this.Engine.HandleError({msg:"Cannot open text dialog - no text added"});
        return false;
    }

    if(this.Active){
          this.ImageIndex++;
          if(this.ImageIndex >= this.Images.length){
              this.Active = false;
              this.OffTalking = false;
          }
    }else{
        this.Active = true;
    }
};

/**
 * @description Resets the EntryArray
 * @param [string,...] n-many strings, which will be printed on the images.
 * @returns {undefined}
 */
RPGDialog.prototype.Reset = function(){
    
    this.Images = [];
    this.ImageTypes = [];
    this.ImageIndex = 0; 
};

/**
 * @description Creates images of the parameter strings
 * @param [string,...] n-many strings, which will be printed on the images.
 * @returns {undefined}
 */
RPGDialog.prototype.AddBasicText = function(){
    
    var fac = this.BasicTextFactor;
    var width = this.Engine.Canvas.width / fac;
    var height = this.Engine.Canvas.height / fac;
    var boxheight = this.Height / fac;
    var y = height - boxheight;
    var fontSize = this.FontSize / fac;
    var margin = this.Margin / fac;
    var spacing = this.SpacingBetweenLines / fac;
    var rounding_box = 3;
    
    // an offsight canvas of minirized size will be created
    var can = document.createElement("CANVAS");
    can.width = width;
    can.height = height;
    var con = can.getContext("2d");

    // setting the canvas state
    con.textBaseline = "top";
    con.font = fontSize + "px Verdana";
    
    var words;
    var wordslen;
    var i,j,k;
    var url, img;
    var maxwidth = width - 2*margin;
    var curwidth = 0;
    var lines = [];
    
    // getting al strings and transform then into text lines in the right length
    for(var i=0; i<arguments.length; i++){ // arguments is not a true array therefore no split methode exists
        words = arguments[i];
        words = words.split(" ");
        
        // calculate the length of every word
        wordslen = [];
        for(j=0; j<words.length; j++){
            wordslen.push( con.measureText(words[j]).width);
        }
        
        lines.push("");
        k = lines.length-1;
        curwidth = 0;
        
        for(j = 0; j< words.length; j++){
            if(j == 0)
                curwidth = con.measureText(lines[k] + words[j]).width; // calculates the length of the current
            else
                curwidth = con.measureText(lines[k] + " " + words[j]).width; // calculates the length of the current
            
            if(curwidth <= maxwidth){ // ok
                if(j == 0)
                    lines[k] += words[j];
                else
                    lines[k] += " " + words[j];
            }else{
                k++;
                lines.push(words[j]);
            }
        }
    }
    
    
    
    for(j=0; j<lines.length; j+=2){
        
        con.clearRect(0,0,can.width, can.height);
        con.fillStyle = this.Colors.Background;
        con.fillVariousRoundedRect(0,y, width, boxheight, rounding_box, rounding_box, 0, 0);
        con.strokeStyle = this.Colors.Border;
        con.lineWidth=2;
        con.strokeVariousRoundedRect(0,y, width, boxheight, rounding_box, rounding_box, 0, 0);
        con.fillStyle = this.Colors.Font;
        
        var l=0;
        
        for(k=j; k<j+2 && k<lines.length; k++){
            
            con.fillText(lines[k],
                margin,
                y+margin+ l*fontSize + l*spacing
                        );
            l++;
        }
        
        this.Images.push(createImageNN(can, this.BasicTextFactor));
        this.ImageTypes.push(this.Types.BasicText);
    }
     
};

/**
 * @description Creates images of the image with the codename string
 * @param [string,...] n-many strings, which will be printed on the images.
 * @returns {undefined}
 */
RPGDialog.prototype.AddPopupImage = function(cn, scale){
    
    var img = this.Engine.MediaManager.GetImage(cn);
    
    
    if(!img) return;
    
    var margin = 50;
    
    // an offsight canvas of minirized size will be created
    var can = document.createElement("CANVAS");
    can.width = this.Engine.Canvas.width;
    can.height = this.Engine.Canvas.height;
    var con = can.getContext("2d");
    con.fillStyle = "rgba(100,100,100,0.5)";
    con.fillRect(0,0,can.width, can.height);
        
    //supposed values, starting with the original sizes
    var sup = {width:img.width, height:img.height, factor : 1}; 
    
    //resizing the image if its heights is too big
    if(sup.height > can.height - 2*margin){
        // the new height / the old height = factor
        sup.factor = (can.height - 2*margin) / sup.height;
        // the old height changes to the new height
        sup.height = can.height - 2*margin;
        
        sup.width = sup.width * sup.factor;
    }
    
    //resizing the image if its width is too big
    if(sup.width > can.width - 2*margin){
        // the new height / the old height = factor
        sup.factor = (can.width - 2*margin) / sup.width;
        // the old height changes to the new height
        sup.width = can.width - 2*margin;
        
        sup.height = sup.height * sup.factor;
    }
    
    
    img.width = sup.width;
    img.height = sup.height;
    var box = con.drawRoundedImage(img, 50);
    //
    
    // rounding box values - the border
    box = {
        X : box.X + box.Width + 5,
        Y : box.Y - 5,
        Width : 40,
        Height : 40
    };
    
    con.fillStyle = "#ff0000";
    con.fillVariousRoundedRect(box.X, box.Y, box.Width, box.Height, box.Width/2);
    con.strokeStyle = "#ffffff";
    con.lineWidth = 6;
    con.strokeVariousRoundedRect(box.X, box.Y, box.Width, box.Height, box.Width/2);
    
    var url = can.toDataURL();
    var newimg = document.createElement("IMG");
    newimg.src = url;
    newimg.ImageBox = box;
    this.Images.push(newimg);
    this.ImageTypes.push(this.Types.PopupImage);
    
};

/**
 * @description Creates an image representing a Yes/No Question
 * @param [string,...] a single strings, which will be asked on the image.
 * @returns {undefined}
 */
RPGDialog.prototype.AddPolarQuestion = function(question, yes, no){
    
    var fac = this.PolarQuestionFactor;
    var qmul = this.QuestionMulti;
    
    // an offsight canvas of minirized size will be created
    var can = document.createElement("CANVAS");
    can.width = this.Engine.Canvas.width / fac;
    can.height = this.Engine.Canvas.height / fac;
    var con = can.getContext("2d");

    // setting the canvas state
    con.textBaseline = "top";
    var qfontsize = this.FontSize / fac * qmul;
    var qmargin = this.Margin / fac * qmul;
    con.font = qfontsize + "px Verdana";
    var qvertspacing = this.Spacing / fac * qmul;
    var aboxheight = this.AnswerBoxHeight/fac * qmul;
    
    var words;
    var wordslen;
    var j,k;
    var url;
    var maxwidth = can.width - 2*qmargin;
    var curwidth = 0;
    var lines = [];
    
    var img = document.createElement("IMG");
    
    // calculating the DEFAULT sizes of the input buttons
    // used for the answer boxes and later for the update process to find out if a box was clicked/taped
    var inputButton = {
        Width : this.Engine.Canvas.width / 4,
        Height : this.AnswerBoxHeight / 2,
        Xyes : this.Engine.Canvas.width / 4,
        Xno : this.Engine.Canvas.width / 4 * 3,
        Y : this.Engine.Canvas.height - this.AnswerBoxHeight / 2,
        Rounding : 15
    };
    inputButton.Xyes -= inputButton.Width / 2;
    inputButton.Xno -= inputButton.Width / 2;
    inputButton.Y -= inputButton.Height / 2;
    
    // the answer boxes and later for the update process to find out if a box was clicked/taped
    // will be saved within the image
    img.AnswerBoxNo = {
        X : inputButton.Xno,
        Y : inputButton.Y,
        Width : inputButton.Width,
        Height : inputButton.Height,
        Rounding : inputButton.Rounding
    };
    img.AnswerBoxYes = {
        X : inputButton.Xyes,
        Y : inputButton.Y,
        Width : inputButton.Width,
        Height : inputButton.Height,
        Rounding : inputButton.Rounding
    };
    
    // arguments is not a true array therefore no split methode exists
    words = question.split(" ");

    // calculate the length of every word
    wordslen = [];
    for(j=0; j<words.length; j++){
        wordslen.push( con.measureText(words[j]).width);
    }

    lines.push("");
    k = 0;
    curwidth = 0;

    for(j = 0; j< words.length; j++){
        if(j == 0)
            curwidth = con.measureText(lines[k] + words[j]).width; // calculates the length of the current
        else
            curwidth = con.measureText(lines[k] + " " + words[j]).width; // calculates the length of the current

        if(curwidth <= maxwidth){ // ok
            if(j == 0)
                lines[k] += words[j];
            else
                lines[k] += " " + words[j];
        }else{
            k++;
            lines.push(words[j]);
        }
    }
    
    // new question text y orientated to the amount of lines
    var qy =  can.height - (lines.length * qfontsize) - // the added heights of the font of every line
                    (lines.length-1)*qvertspacing - // every space between two lines
                    qmargin * 2 -
                    aboxheight; // the height of the answerbox
    
    // the whole box
    con.fillStyle = this.Colors.Background;
    con.fillVariousRoundedRect(0, qy, can.width, can.height - qy, 8, 8, 0, 0);
    
    // the whole box border
    con.strokeStyle = this.Colors.Border;
    con.lineWidth=2;
    con.strokeVariousRoundedRect(0, qy, can.width, can.height - qy, 8, 8, 0, 0);
    
    con.fillStyle = this.Colors.Font;
    
    for(j=0; j<lines.length; j++){
        
        con.fillText(lines[j],
                qmargin,
                qy + qmargin + j*qfontsize + j*qvertspacing
                        );
        
    }
    
    var sidemargin = 10 / fac;
    yes = yes ? yes : "Yes";
    var yeslen = con.measureText(yes).width;  
        
    var no = no ? no : "No";
    var nolen = con.measureText(no).width;
    
    // calculating the actual sizes needed for the current question and answers
    // keeping the minirizing factor in mind
    var xyes = inputButton.Xyes/fac;
    var xno = inputButton.Xno/fac;
    var y = inputButton.Y/fac;
    var w = inputButton.Width/fac;
    var h = inputButton.Height/fac;
    var off = 2; 
    var rounding = inputButton.Rounding/fac;
    
    var wyes = w;
    var wno = w;
    
    // adjustments if the yes text is too long
    if(w < yeslen){
        wyes = yeslen + sidemargin*2;
        xyes = can.width*0.25 - wyes/2;
        
        img.AnswerBoxYes.X = xyes*fac;
        img.AnswerBoxYes.Width = wyes*fac;
    }
    
    // adjustments if the no text is too long
    if(w < nolen){
        wno = nolen + sidemargin*2;
        xno = can.width*0.75 - wno/2;
        
        img.AnswerBoxNo.X = xno*fac;
        img.AnswerBoxNo.Width = wno*fac;
        
    }
       
    // answer box shadow
    con.fillStyle = this.Colors.AnswerBoxShadow;
    con.fillVariousRoundedRect(xyes+off, y+off, wyes, h, rounding);
    con.fillVariousRoundedRect(xno+off, y+off, wno, h, rounding);
    // answer box background
    con.fillStyle = this.Colors.AnswerBoxBackground;
    con.fillVariousRoundedRect(xyes, y, wyes, h, rounding);
    con.fillVariousRoundedRect(xno, y, wno, h, rounding);
    // answer box text
    con.textBaseline = "middle";
    con.fillStyle = this.Colors.Font;

    con.fillText(yes,xyes+wyes/2-yeslen/2,y + h/2);
    con.fillText(no,xno+wno/2-nolen/2,y + h/2);
    
    var newimg = createImageNN(can, this.PolarQuestionFactor);
    newimg.AnswerBoxNo = img.AnswerBoxNo;
    newimg.AnswerBoxYes = img.AnswerBoxYes;
    
    this.Images.push(newimg);
    this.ImageTypes.push(this.Types.PolarQuestion);
     
};

RPGDialog.prototype.AddCallbackFunction = function(f, that, para){
    
    this.ImageTypes.push(this.Types.CallbackFunction);
    this.ImageTypes.push({function:f, that: that, parameter:para});
};

RPGDialog.prototype.AddInputFunctionYes = function(f, para){
    this.InputFunctionYes = {
        function:f,
        that:this,
        parameter:para};
};
RPGDialog.prototype.AddInputFunctionNo = function(f, para){ this.InputFunctionNo = {
        function:f,
        that:this,
        parameter:para}; };

RPGDialog.prototype.AddInputFunctions = function(yf, nf, para){
    this.AddInputFunctionYes(yf, para);
    this.AddInputFunctionNo(nf, para);
};

RPGDialog.prototype.Types = {
    
    BasicText : 0,
    PopupImage : 1,
    PolarQuestion : 2,
    CallbackFunction : 3
    
};