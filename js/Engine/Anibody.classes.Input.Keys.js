
Anibody.SetPackage("Anibody", "classes", "Input");

Anibody.classes.Input.Keys = function Keys() {
    Anibody.classes.EngineObject.call(this);

   
    this.KeyDownEvent = null;
    this.ParentKeyDownEvent = null;
    this.KeyUpEvent = null;
    this.ParentKeyUpEvent = null;
    
    // Pressed - is a boolean, which describes if the Key is pressed while in current frame
    // FramesPressed - is an Integer between [-1, M], which counts the frames, while being pressed
    // Tipp: use an if-statement "if(FramesPressed==1)" to trigger a function only once
    // "if(Pressed)" triggers a function every frame, in which the key is pressed

    this.Event= {},
    this.Symbol= "",
    this.KeyNotFound= {Pressed: false, FramesPressed: 0},
    this.AnyKey= {Pressed: false, FramesPressed: 0},
    this.A= {Pressed: false, FramesPressed: 0},
    this.B= {Pressed: false, FramesPressed: 0},
    this.C= {Pressed: false, FramesPressed: 0},
    this.D= {Pressed: false, FramesPressed: 0},
    this.E= {Pressed: false, FramesPressed: 0},
    this.F= {Pressed: false, FramesPressed: 0},
    this.G= {Pressed: false, FramesPressed: 0},
    this.H= {Pressed: false, FramesPressed: 0},
    this.I= {Pressed: false, FramesPressed: 0},
    this.J= {Pressed: false, FramesPressed: 0},
    this.K= {Pressed: false, FramesPressed: 0},
    this.L= {Pressed: false, FramesPressed: 0},
    this.M= {Pressed: false, FramesPressed: 0},
    this.N= {Pressed: false, FramesPressed: 0},
    this.O= {Pressed: false, FramesPressed: 0},
    this.P= {Pressed: false, FramesPressed: 0},
    this.Q= {Pressed: false, FramesPressed: 0},
    this.R= {Pressed: false, FramesPressed: 0},
    this.S= {Pressed: false, FramesPressed: 0},
    this.T= {Pressed: false, FramesPressed: 0},
    this.U= {Pressed: false, FramesPressed: 0},
    this.V= {Pressed: false, FramesPressed: 0},
    this.W= {Pressed: false, FramesPressed: 0},
    this.X= {Pressed: false, FramesPressed: 0},
    this.Y= {Pressed: false, FramesPressed: 0},
    this.Z= {Pressed: false, FramesPressed: 0},

    this.Control= {Pressed: false, FramesPressed: 0},
    this.Shift= {Pressed: false, FramesPressed: 0},
    this.Alt= {Pressed: false, FramesPressed: 0},
    this.Tab= {Pressed: false, FramesPressed: 0},
    // Numbers
    this.Num0= {Pressed: false, FramesPressed: 0},
    this.Num1= {Pressed: false, FramesPressed: 0},
    this.Num2= {Pressed: false, FramesPressed: 0},
    this.Num3= {Pressed: false, FramesPressed: 0},
    this.Num4= {Pressed: false, FramesPressed: 0},
    this.Num5= {Pressed: false, FramesPressed: 0},
    this.Num6= {Pressed: false, FramesPressed: 0},
    this.Num7= {Pressed: false, FramesPressed: 0},
    this.Num8= {Pressed: false, FramesPressed: 0},
    this.Num9= {Pressed: false, FramesPressed: 0},
    // Numbers-End
    this.Up= {Pressed: false, FramesPressed: 0},
    this.Right= {Pressed: false, FramesPressed: 0},
    this.Down= {Pressed: false, FramesPressed: 0},
    this.Left= {Pressed: false, FramesPressed: 0},

    this.Backspace= {Pressed: false, FramesPressed: 0},
    this.Space= {Pressed: false, FramesPressed: 0},
    this.Enter= {Pressed: false, FramesPressed: 0},
    this.Esc= {Pressed: false, FramesPressed: 0}


this.Initialize();
};
Anibody.classes.Input.Keys.prototype = Object.create(Anibody.classes.EngineObject.prototype);
Anibody.classes.Input.Keys.prototype.constructor = Anibody.classes.Input.Keys;

Anibody.classes.Input.Keys.prototype.Initialize = function () {

    // register some needed event handler
    if(this.Engine.Flags.KeyboardInput)
        this.RegisterKeyEvents(this.Engine.Flags.PreventKeyboardStrokesToBubbleUp);

};

/**
 * Calculates and saves the mouse position and all its concequential information needed by the user
 * @returns {undefined}
 */
Anibody.classes.Input.Keys.prototype.Update = function () {

    if (this.AnyKey.Pressed)
        this.AnyKey.FramesPressed++;

    if (this.A.Pressed)
        this.A.FramesPressed++;
    if (this.B.Pressed)
        this.B.FramesPressed++;
    if (this.C.Pressed)
        this.C.FramesPressed++;
    if (this.D.Pressed)
        this.D.FramesPressed++;
    if (this.E.Pressed)
        this.E.FramesPressed++;
    if (this.F.Pressed)
        this.F.FramesPressed++;
    if (this.G.Pressed)
        this.G.FramesPressed++;
    if (this.H.Pressed)
        this.H.FramesPressed++;
    if (this.I.Pressed)
        this.I.FramesPressed++;
    if (this.J.Pressed)
        this.J.FramesPressed++;
    if (this.K.Pressed)
        this.K.FramesPressed++;
    if (this.L.Pressed)
        this.L.FramesPressed++;
    if (this.M.Pressed)
        this.M.FramesPressed++;
    if (this.N.Pressed)
        this.N.FramesPressed++;
    if (this.O.Pressed)
        this.O.FramesPressed++;
    if (this.P.Pressed)
        this.P.FramesPressed++;
    if (this.Q.Pressed)
        this.Q.FramesPressed++;
    if (this.R.Pressed)
        this.R.FramesPressed++;
    if (this.S.Pressed)
        this.S.FramesPressed++;
    if (this.T.Pressed)
        this.T.FramesPressed++;
    if (this.U.Pressed)
        this.U.FramesPressed++;
    if (this.V.Pressed)
        this.V.FramesPressed++;
    if (this.W.Pressed)
        this.W.FramesPressed++;
    if (this.X.Pressed)
        this.X.FramesPressed++;
    if (this.Y.Pressed)
        this.Y.FramesPressed++;
    if (this.Z.Pressed)
        this.Z.FramesPressed++;

    if (this.Control.Pressed)
        this.Control.FramesPressed++;
    if (this.Shift.Pressed)
        this.Shift.FramesPressed++;
    if (this.Alt.Pressed)
        this.Alt.FramesPressed++;
    if (this.Tab.Pressed)
        this.Tab.FramesPressed++;

    if (this.Num0.Pressed)
        this.Num0.FramesPressed++;
    if (this.Num1.Pressed)
        this.Num1.FramesPressed++;
    if (this.Num2.Pressed)
        this.Num2.FramesPressed++;
    if (this.Num3.Pressed)
        this.Num3.FramesPressed++;
    if (this.Num4.Pressed)
        this.Num4.FramesPressed++;
    if (this.Num5.Pressed)
        this.Num5.FramesPressed++;
    if (this.Num6.Pressed)
        this.Num6.FramesPressed++;
    if (this.Num7.Pressed)
        this.Num7.FramesPressed++;
    if (this.Num8.Pressed)
        this.Num8.FramesPressed++;
    if (this.Num9.Pressed)
        this.Num9.FramesPressed++;

    if (this.Up.Pressed)
        this.Up.FramesPressed++;
    if (this.Right.Pressed)
        this.Right.FramesPressed++;
    if (this.Down.Pressed)
        this.Down.FramesPressed++;
    if (this.Left.Pressed)
        this.Left.FramesPressed++;

    if (this.Backspace.Pressed)
        this.Backspace.FramesPressed++;
    if (this.Space.Pressed)
        this.Space.FramesPressed++;
    if (this.Enter.Pressed)
        this.Enter.FramesPressed++;
    if (this.Esc.Pressed)
        this.Esc.FramesPressed++;
};

Anibody.classes.Input.Keys.prototype.RegisterKeyEvents = function (lockKeys) {

    var onkeydown = function (e) {

        var keys = e.data;

        keys.Event = e;
        if (e.key)
            keys.Symbol = e.key;
        else {
            keys.Symbol = String.getKeyByEvent(e);
        }
        keys.AnyKey.Pressed = true;

        switch (e.which) {

            case 65 :
                {
                    keys.A.Pressed = true;
                }
                ;
                break;
            case 66 :
                {
                    keys.B.Pressed = true;
                }
                ;
                break;
            case 67 :
                {
                    keys.C.Pressed = true;
                }
                ;
                break;
            case 68 :
                {
                    keys.D.Pressed = true;
                }
                ;
                break;
            case 69 :
                {
                    keys.E.Pressed = true;
                }
                ;
                break;
            case 70 :
                {
                    keys.F.Pressed = true;
                }
                ;
                break;
            case 71 :
                {
                    keys.G.Pressed = true;
                }
                ;
                break;
            case 72 :
                {
                    keys.H.Pressed = true;
                }
                ;
                break;
            case 73 :
                {
                    keys.I.Pressed = true;
                }
                ;
                break;
            case 74 :
                {
                    keys.J.Pressed = true;
                }
                ;
                break;
            case 75 :
                {
                    keys.K.Pressed = true;
                }
                ;
                break;
            case 76 :
                {
                    keys.L.Pressed = true;
                }
                ;
                break;
            case 77 :
                {
                    keys.M.Pressed = true;
                }
                ;
                break;
            case 78 :
                {
                    keys.N.Pressed = true;
                }
                ;
                break;
            case 79 :
                {
                    keys.O.Pressed = true;
                }
                ;
                break;
            case 80 :
                {
                    keys.P.Pressed = true;
                }
                ;
                break;
            case 81 :
                {
                    keys.Q.Pressed = true;
                }
                ;
                break;
            case 82 :
                {
                    keys.R.Pressed = true;
                }
                ;
                break;
            case 83 :
                {
                    keys.S.Pressed = true;
                }
                ;
                break;
            case 84 :
                {
                    keys.T.Pressed = true;
                }
                ;
                break;
            case 85 :
                {
                    keys.U.Pressed = true;
                }
                ;
                break;
            case 86 :
                {
                    keys.V.Pressed = true;
                }
                ;
                break;
            case 87 :
                {
                    keys.W.Pressed = true;
                }
                ;
                break;
            case 88 :
                {
                    keys.X.Pressed = true;
                }
                ;
                break;
            case 89 :
                {
                    keys.Y.Pressed = true;
                }
                ;
                break;
            case 90 :
                {
                    keys.Z.Pressed = true;
                }
                ;
                break;

            case 17 :
                {
                    keys.Control.Pressed = true;
                }
                ;
                break;
            case 16 :
                {
                    keys.Shift.Pressed = true;
                }
                ;
                break;
            case 18 :
                {
                    keys.Alt.Pressed = true;
                }
                ;
                break;
            case 9 :
                {
                    keys.Tab.Pressed = true;
                }
                ;
                break;

            case 48 :
                {
                    keys.Num0.Pressed = true;
                }
                ;
                break;
            case 49 :
                {
                    keys.Num1.Pressed = true;
                }
                ;
                break;
            case 50 :
                {
                    keys.Num2.Pressed = true;
                }
                ;
                break;
            case 51 :
                {
                    keys.Num3.Pressed = true;
                }
                ;
                break;
            case 52 :
                {
                    keys.Num4.Pressed = true;
                }
                ;
                break;
            case 53 :
                {
                    keys.Num5.Pressed = true;
                }
                ;
                break;
            case 54 :
                {
                    keys.Num6.Pressed = true;
                }
                ;
                break;
            case 55 :
                {
                    keys.Num7.Pressed = true;
                }
                ;
                break;
            case 56 :
                {
                    keys.Num8.Pressed = true;
                }
                ;
                break;
            case 57 :
                {
                    keys.Num9.Pressed = true;
                }
                ;
                break;

            case 38 :
                {
                    keys.Up.Pressed = true;
                }
                ;
                break;
            case 39 :
                {
                    keys.Right.Pressed = true;
                }
                ;
                break;
            case 40 :
                {
                    keys.Down.Pressed = true;
                }
                ;
                break;
            case 37 :
                {
                    keys.Left.Pressed = true;
                }
                ;
                break;

            case 8 :
                {
                    keys.Backspace.Pressed = true;
                }
                ;
                break;
            case 32 :
                {
                    keys.Space.Pressed = true;
                }
                ;
                break;
            case 13 :
                {
                    keys.Enter.Pressed = true;
                }
                ;
                break;
            case 27 :
                {
                    keys.Esc.Pressed = true;
                }
                ;
                break;
            default :
                {
                    keys.KeyNotFound.Pressed = true;
                }
                ;
                break;
        }

        if (!lockKeys) {
            // no other elements react to key strokes
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };
    var onkeyup = function (e) {
        var keys = e.data;
        keys.Event = e;
        
        if (e.key)
            keys.Symbol = e.key;
        else {
            keys.Symbol = String.fromCharCode(e.which).toLowerCase();
        }
        keys.AnyKey.Pressed = false;
        keys.AnyKey.FramesPressed = 0;

        switch (e.which) {

            case 65 :
                {
                    keys.A.Pressed = false;
                    keys.A.FramesPressed = 0;
                }
                ;
                break;
            case 66 :
                {
                    keys.B.Pressed = false;
                    keys.B.FramesPressed = 0;
                }
                ;
                break;
            case 67 :
                {
                    keys.C.Pressed = false;
                    keys.C.FramesPressed = 0;
                }
                ;
                break;
            case 68 :
                {
                    keys.D.Pressed = false;
                    keys.D.FramesPressed = 0;
                }
                ;
                break;
            case 69 :
                {
                    keys.E.Pressed = false;
                    keys.E.FramesPressed = 0;
                }
                ;
                break;
            case 70 :
                {
                    keys.F.Pressed = false;
                    keys.F.FramesPressed = 0;
                }
                ;
                break;
            case 71 :
                {
                    keys.G.Pressed = false;
                    keys.G.FramesPressed = 0;
                }
                ;
                break;
            case 72 :
                {
                    keys.H.Pressed = false;
                    keys.H.FramesPressed = 0;
                }
                ;
                break;
            case 73 :
                {
                    keys.I.Pressed = false;
                    keys.I.FramesPressed = 0;
                }
                ;
                break;
            case 74 :
                {
                    keys.J.Pressed = false;
                    keys.J.FramesPressed = 0;
                }
                ;
                break;
            case 75 :
                {
                    keys.K.Pressed = false;
                    keys.K.FramesPressed = 0;
                }
                ;
                break;
            case 76 :
                {
                    keys.L.Pressed = false;
                    keys.L.FramesPressed = 0;
                }
                ;
                break;
            case 77 :
                {
                    keys.M.Pressed = false;
                    keys.M.FramesPressed = 0;
                }
                ;
                break;
            case 78 :
                {
                    keys.N.Pressed = false;
                    keys.N.FramesPressed = 0;
                }
                ;
                break;
            case 79 :
                {
                    keys.O.Pressed = false;
                    keys.O.FramesPressed = 0;
                }
                ;
                break;
            case 80 :
                {
                    keys.P.Pressed = false;
                    keys.P.FramesPressed = 0;
                }
                ;
                break;
            case 81 :
                {
                    keys.Q.Pressed = false;
                    keys.Q.FramesPressed = 0;
                }
                ;
                break;
            case 82 :
                {
                    keys.R.Pressed = false;
                    keys.R.FramesPressed = 0;
                }
                ;
                break;
            case 83 :
                {
                    keys.S.Pressed = false;
                    keys.S.FramesPressed = 0;
                }
                ;
                break;
            case 84 :
                {
                    keys.T.Pressed = false;
                    keys.T.FramesPressed = 0;
                }
                ;
                break;
            case 85 :
                {
                    keys.U.Pressed = false;
                    keys.U.FramesPressed = 0;
                }
                ;
                break;
            case 86 :
                {
                    keys.V.Pressed = false;
                    keys.V.FramesPressed = 0;
                }
                ;
                break;
            case 87 :
                {
                    keys.W.Pressed = false;
                    keys.W.FramesPressed = 0;
                }
                ;
                break;
            case 88 :
                {
                    keys.X.Pressed = false;
                    keys.X.FramesPressed = 0;
                }
                ;
                break;
            case 89 :
                {
                    keys.Y.Pressed = false;
                    keys.Y.FramesPressed = 0;
                }
                ;
                break;
            case 90 :
                {
                    keys.Z.Pressed = false;
                    keys.Z.FramesPressed = 0;
                }
                ;
                break;

            case 48 :
                {
                    keys.Num0.Pressed = false;
                    keys.Num0.FramesPressed = 0;
                }
                ;
                break;
            case 49 :
                {
                    keys.Num1.Pressed = false;
                    keys.Num1.FramesPressed = 0;
                }
                ;
                break;
            case 50 :
                {
                    keys.Num2.Pressed = false;
                    keys.Num2.FramesPressed = 0;
                }
                ;
                break;
            case 51 :
                {
                    keys.Num3.Pressed = false;
                    keys.Num3.FramesPressed = 0;
                }
                ;
                break;
            case 52 :
                {
                    keys.Num4.Pressed = false;
                    keys.Num4.FramesPressed = 0;
                }
                ;
                break;
            case 53 :
                {
                    keys.Num5.Pressed = false;
                    keys.Num5.FramesPressed = 0;
                }
                ;
                break;
            case 54 :
                {
                    keys.Num6.Pressed = false;
                    keys.Num6.FramesPressed = 0;
                }
                ;
                break;
            case 55 :
                {
                    keys.Num7.Pressed = false;
                    keys.Num7.FramesPressed = 0;
                }
                ;
                break;
            case 56 :
                {
                    keys.Num8.Pressed = false;
                    keys.Num8.FramesPressed = 0;
                }
                ;
                break;
            case 57 :
                {
                    keys.Num9.Pressed = false;
                    keys.Num9.FramesPressed = 0;
                }
                ;
                break;

            case 17 :
                {
                    keys.Control.Pressed = false;
                    keys.Control.FramesPressed = 0;
                }
                ;
                break;
            case 16 :
                {
                    keys.Shift.Pressed = false;
                    keys.Shift.FramesPressed = 0;
                }
                ;
                break;
            case 18 :
                {
                    keys.Alt.Pressed = false;
                    keys.Alt.FramesPressed = 0;
                }
                ;
                break;
            case 9 :
                {
                    keys.Tab.Pressed = false;
                    keys.Tab.FramesPressed = 0;
                }
                ;
                break;
            case 8 :
                {
                    keys.Backspace.Pressed = false;
                    keys.Backspace.FramesPressed = 0;
                }
                ;
                break;

            case 38 :
                {
                    keys.Up.Pressed = false;
                    keys.Up.FramesPressed = 0;
                }
                ;
                break;
            case 39 :
                {
                    keys.Right.Pressed = false;
                    keys.Right.FramesPressed = 0;
                }
                ;
                break;
            case 40 :
                {
                    keys.Down.Pressed = false;
                    keys.Down.FramesPressed = 0;
                }
                ;
                break;
            case 37 :
                {
                    keys.Left.Pressed = false;
                    keys.Left.FramesPressed = 0;
                }
                ;
                break;

            case 32 :
                {
                    keys.Space.Pressed = false;
                    keys.Space.FramesPressed = 0;
                }
                ;
                break;
            case 13 :
                {
                    keys.Enter.Pressed = false;
                    keys.Enter.FramesPressed = 0;
                }
                ;
                break;
            case 27 :
                {
                    keys.Esc.Pressed = false;
                    keys.Esc.FramesPressed = 0;
                }
                ;
                break;
            default :
                {
                    keys.KeyNotFound.Pressed = false;
                    keys.KeyNotFound.FramesPressed = 0;
                }
                ;
                break;

        }
        if (!lockKeys) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    this.KeyDownEvent = $(document).keydown(this, onkeydown);
    this.KeyUpEvent = $(document).keyup(this, onkeyup);

    // if the script runs on a (same-origin) document within an iframe (or popup?)
    if (window.top != window.self) {
        try {
            this.ParentKeyDownEvent = $(window.parent.document).keydown(this, onkeydown);
            this.ParentKeyUpEvent = $(window.parent.document).keyup(this, onkeyup);
        } catch (e) {

        }
    }
};

Anibody.classes.Input.Keys.prototype.UnregisterKeyEvents = function () {
    if (this.KeyUpEvent) {
        $(document).unbind(this.KeyUpEvent);
        this.KeyUpEvent = "undefined";
    }
    if (this.KeyDownEvent) {
        $(document).unbind(this.KeyDownEvent);
        this.KeyDownEvent = "undefined";
    }
};