

document.addEventListener("DOMContentLoaded", function () {

    var engine = new Anibody("PlayDiv");

    Anibody.import(Anibody.util.ImageFile, "ImgF");

    var waterglass = new ImgF({ path: "./img_rpg/water_glass.jpg", codename: "water_glass", group: "room3" });
    waterglass.AddGroup("room1");

    var mediapack = [
        new ImgF("./img_rpg/logo.png", "logo"),
        new ImgF("./img_rpg/button_0.png", "button_state_0"),
        new ImgF("./img_rpg/button_1.png", "button_state_1"),
        new ImgF("./img_rpg/button_2.png", "button_state_2"),
        new ImgF("./img_rpg/sprite_test.png", "sprite_test"),
        new ImgF({ path: "./img_rpg/rpg_img2.png", codename: "rpg_img", group: ["room1"] }),
        new ImgF({ path: "./img_rpg/rpg_structure2.png", codename: "rpg_structure" }),
        new ImgF({ path: "./img_rpg/rpg_subimg2.jpg", codename: "rpg_subimg", group: "room2" }),
        new ImgF({ path: "./img_rpg/rpg_substructure.png", codename: "rpg_substructure" }),
        new ImgF({ path: "./img_rpg/grey_sprite_3x4.png", codename: "rpg_testsprite" }),
        new ImgF({ path: "./img_rpg/tresure_closed.png", codename: "tresure_closed" }),
        new ImgF({ path: "./img_rpg/tresure_opened.png", codename: "tresure_opened" }),
        new ImgF({ path: "./img_rpg/girl.png", codename: "girl", group: "room2" }),
        new ImgF({ path: "./img_rpg/da_racoon.jpg", codename: "da_racoon", group: "room2" }),
        new ImgF({ path: "./img_rpg/crate.png", codename: "crate", group: "room2" }),
        new ImgF({ path: "./img_rpg/crate_pad.png", codename: "pad", group: "room2" }),
        new ImgF({ path: "./img_rpg/fire_sprite.png", codename: "bonfire", group: "room1" }),
        waterglass,
        new ImgF({ path: "./img_rpg/litte_click_sprite.png", codename: "little_click_sprite", group: "room1" }),
        new Anibody.util.SoundFile({ path: "./music/portal_activate.mp3", codename: "portal_activate", group:["room1", "soundtest"] }),
        new Anibody.util.SoundFile({ path: "./music/alongway.mp3", codename: "girl_background", group: "room2" })
    ];

    engine.MediaManager.SetMediaPack(mediapack, menu_callback.getCallbackObject(engine, engine));


});

function menu_callback(engine) {

    // ------------------------------------------------ adding objects to the engine
    /* BUTTON RPG */

    Anibody.import(Anibody.ui.Button);

    // there will be three buttons in this screen so
    // the button template will be modified to preset the common values among those three buttons
    // !! x and y cannot be set in the template - every instance of Button has to set them individually
    Anibody.ui.Button.SetTemplateByObject({
        Width: 250, Height: 60,
        Codename: ["button_state_0", "button_state_1", "button_state_2"],
        TextColor: "white", FontHeight: 18, DisplayType: "image"
    });

    // ---------------------------------------------------------------------------
    // BUTTON 1 - Initiation
    var b1 = new Button("center", 120, {
        Label: "RPG Example Start",
        TriggerCallbackObject: function (engine) {
            level_rpg(engine);
        }.getCallbackObject(engine, engine),
        HoverText: "Starts the RPG Proof of Concept"
    });
    b1.AddButtonEffect();
    b1.Register();

    // ---------------------------------------------------------------------------
    // BUTTON 2 - Test Button 1 - Initiation
    var b2 = new Button("center", 220,
        {
            Label: "T Alignment (in dev)",
            TriggerCallbackObject: function (engine) {
                button2(engine);
            }.getCallbackObject("self", engine),
            HoverText: "Starts T Alignment puzzle."
        });
    b2.AddButtonEffect();
    b2.Register();

    // ---------------------------------------------------------------------------
    // BUTTON 3 - Test Button 2 - Initiation
    var b3 = new Button("center", 320,
        {
            Label: "Current Test",
            TriggerCallbackObject: function (engine) {
                button3(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Wird auch zum Testen unterschiedlicher Dinge benutzt."
        });
    b3.AddButtonEffect();
    b3.Register();

    // ---------------------------------------------------------------------------
    // BUTTON MOUSECLICK - Test Button 2 - Initiation
    var bmc = new Button(engine.Canvas.width - 60, engine.Canvas.height - 60,
        {
            Label: "max",
            Width: 50,
            Height: 50,
            DisplayType: "color",
            FontHeight: 14,
            ColorCode: "red",
            TriggerCallbackObject: function (engine) {
                console.log("Anibody.Scale = " + this.Scale);
            }.getCallbackObject(engine, engine),
            HoverText: "Toggles between original and max scales - not correctly working.".decodeURI()
        });
    bmc.AddButtonEffect();
    bmc.Register();

    bmc.SetFullScreenButton(false);
    bmc._withMaxScale = true;

    bmc.SetCopyTextButton("Das ist nicht wunderbar");
    bmc._copyText = "Das ist ja wunderbar";
    
    createTestButtons(engine);

    // Engine gets started
    engine.Start();

}


function button2(engine) {
    engine.FlushObjects();

    var tgui = new TGUI();
    tgui.Register();
        
}

function button3(engine) {

    var a = { key : 0};
    var b1 = {key : 50};
    var b2 = {key : 100};

    var flow = new Anibody.util.Flow(a, "key", 1, 600,{
        that:this, parameter:true, function: function(p){
            console.log("Flowing");
        }
    });

    var mon = new Anibody.debug.Monitor(a, "key");
    mon.Start();
    flow.Start();
    
    var alert = new Anibody.ui.Alert("test"); alert.Start();
}

function createTestButtons(engine){

    Anibody.ui.Button.SetTemplateByObject({
        Width: 25, Height: 25,
        Codename: ["button_state_0", "button_state_1", "button_state_2"],
        TextColor: "white", FontHeight: 14, DisplayType: "image"
    });

    var testbuttons = [];

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 1
    testbuttons[0] = new Button(20, engine.Canvas.height - 150,
        {
            Label: "T1",
            TriggerCallbackObject: function (engine) {
                testRect(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.shapes.Rect"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 2
    testbuttons[1] = new Button(50, engine.Canvas.height - 150,
        {
            Label: "T2",
            TriggerCallbackObject: function (engine) {
                testShape(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.shapes.Shape"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 3
    testbuttons[2] = new Button(80, engine.Canvas.height - 150,
        {
            Label: "T3",
            TriggerCallbackObject: function (engine) {
                testSprite(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.visual.Sprite"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 4
    testbuttons[3] = new Button(110, engine.Canvas.height - 150,
        {
            Label: "T4",
            TriggerCallbackObject: function (engine) {
                testRandom(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.static.Random.SetRandomInterval"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 5
    testbuttons[4] = new Button(140, engine.Canvas.height - 150,
        {
            Label: "T5",
            TriggerCallbackObject: function (engine) {
                testSpline(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.visual.Spline"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 6
    testbuttons[5] = new Button(20, engine.Canvas.height - 110,
        {
            Label: "T6",
            TriggerCallbackObject: function (engine) {
                testSoundWrapper(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.util.SoundWrapper"
        });
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 7
    testbuttons[6] = new Button(50, engine.Canvas.height - 110,
        {
            Label: "T7",
            TriggerCallbackObject: function (engine) {
                testImageWrapper(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.util.ImageWrapper"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 8
    testbuttons[7] = new Button(80, engine.Canvas.height - 110,
        {
            Label: "T8",
            TriggerCallbackObject: function (engine) {
                testNewCallObjectOptions(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.CallObject()"
        });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST BUTTON 9
    testbuttons[8] = new Button(110, engine.Canvas.height - 110,
        {
            Label: "T9",
            TriggerCallbackObject: function (engine) {
                testInputField(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Test Anibody.ui.InputField"
        });


    for(var i=0; i<testbuttons.length; i++){
        testbuttons[i].AddButtonEffect();
        testbuttons[i].Register();
    }
    

}

//###########################################
//##############    TESTS     ###############
//###########################################

function testRect(engine){
    
    var background = Anibody.shapes.GetGradientCode("rgba(255,0,0,0.25)", "rgba(0, 255,0,0.25)", "rgba(0,0,255,0.25)");

    var r = new Anibody.shapes.Rectangle(5, 395, 200, 200);
    
    //x1,x2 = rate of the width of the surrounding rectangle
    //y1,y2 = rate of the height of the surrounding rectangle
    //r1,r2 = rate of the min(width,height) of the surrounding rectangle
    r.RadialGradientRates = {
        x1 : 0.25, y1 : 0.25, r1 : 0.25,
        x2 : 0.25, y2 : 0.25, r2 : 0.95
    };

    r.FillType = "radialGradient"; // none, color, image, linearGradient, radialGradient
    r.FillCode = background; // none, colorCode, codename, stops-object
    
    r.BorderWidth = 3;
    r.BorderType = "color";
    r.BorderCode = "#966";

    r._drawPoints = true;
    r._drawCentroid = true;
    r._drawArea = true;
    r._drawSurroundingRectangle = true;

    r.VisualRotation = false;

    r.Register();

    var dw = new Anibody.debug.DebugWindow();
    dw.Add(r, ["X", "Y", "Width", "Height"], "Shape");
    dw.Register();
    //dw.Open();

    var f = function (event) {

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.AddPoint(mpos.X, mpos.Y);

    }.getCallbackObject(r);

    engine.Input.MouseHandler.AddMouseHandler("leftclick", f);

    f = function (event) {
        
                var mpos = event.Mouse.Position;
                event.Handled = true;
        
                var dx = mpos.X - this.Centroid.x;
                var dy = mpos.Y - this.Centroid.y;
        
                this.Move(dx, dy);
        
            }.getCallbackObject(r);

    engine.Input.MouseHandler.AddMouseHandler("rightclick", f);

}

function testShape(engine) {

    var background = Anibody.shapes.GetGradientCode("#f00", "#0f0", "#00f");

    var s = new Anibody.shapes.Shape(20, 400,
        400, 590,
        150, 350);
    s.FillType = "linearGradient"; // none, color, image, linearGradient, radialGradient
    s.FillCode = background; // none, colorCode, codename, stops-object
    s.BorderWidth = 6;
    s.BorderType = "color"; //
    s.BorderCode = "#666";

    s._drawPoints = true;
    s._drawCentroid = true;
    s._drawArea = true;
    s._drawSurroundingRectangle = true;

    s.VisualRotation = false;

    s.Register();

    var mon = new Anibody.debug.Monitor(s.Points, "length", null, "Anzahl Punkte");
    mon.Start();

    var onleftclick = function (event) {

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.AddPoint(mpos.X, mpos.Y);

    }.getCallbackObject(s);

    engine.Input.MouseHandler.AddMouseHandler("leftclick", onleftclick);

    var onrightclick = function (event) {
        
                var mpos = event.Mouse.Position;
                event.Handled = true;
        
                this.Rotate(Math.PI * 0.1);
        
            }.getCallbackObject(s);

    engine.Input.MouseHandler.AddMouseHandler("rightclick", onrightclick);
}

function testSprite(engine) {

    var width = 85.33;
    var height = 85.375;
    var getOrigin = function (w, h) {
        return { x: width * w, y: height * h };
    };

    var bowser = new Anibody.visual.Sprite("sprite_test", 300, 400, width, height);
    bowser.SetTemplateAttribute("FPS", 6);

    //value by reference
    var templ = bowser.GetTemplate();
    templ.NumberOfClips = 3;
    templ.PlayMode = "loop";

    bowser.AddClippings(
        { Origin: { x: width * 9, y: height * 4 }, FlagNames: ["walking", "down"] },
        { Origin: { x: width * 9, y: height * 5 }, FlagNames: ["walking", "left"] },
        { Origin: { x: width * 9, y: height * 6 }, FlagNames: ["walking", "right"] },
        { Origin: { x: width * 9, y: height * 7 }, FlagNames: ["walking", "up"] }
    );

    templ.NumberOfClips = 1;

    bowser.AddClippings(
        { Origin: getOrigin(10, 4), FlagNames: ["down"] },
        { Origin: getOrigin(10, 5), FlagNames: ["left"] },
        { Origin: getOrigin(10, 6), FlagNames: ["right"] },
        { Origin: getOrigin(10, 7), FlagNames: ["up"] }
    );

    bowser.AddRadioConstraint("left", "right", "down", "up");

    templ.NumberOfClips = 9;
    templ.PlayMode = "once";

    bowser.AddClippings(
        { Origin: getOrigin(3, 0), FlagNames: ["laughing"] }
    );

    bowser.SetDefaultClipping(
        { Origin: getOrigin(1, 0) }
    );

    engine.AddObject(bowser);

    var cbo = function () {
        var area = {
            x: Anibody.static.Random.GetNumber(20, this.Canvas.width - 20),
            y: Anibody.static.Random.GetNumber(20, this.Canvas.height - 20),
            width: 20, height: 20
        };
        new Anibody.visual.Spotting(area, 2000).Start();

    }.getCallbackObject(engine);

    Anibody.import(Anibody.Widget);
    var w = new Widget();

    // the function that processes the user input for the Sprite
    // a plain widget is used for this
    w.ProcessInput = function () {
        
        var keys = this.Engine.Input.Keys;
        var speed = 2;

        if (keys.A.FramesPressed > 4 || keys.D.FramesPressed > 4 || keys.W.FramesPressed > 4 || keys.S.FramesPressed > 4) {
            bowser.SetFlag("walking", true);
        } else {
            bowser.SetFlag("walking", false);
        }

        if (keys.A.FramesPressed > 4) {
            bowser.SetFlag("left", true);
            bowser.X -= speed;
        }

        if (keys.D.FramesPressed > 4) {
            bowser.SetFlag("right", true);
            bowser.X += speed;
        }

        if (keys.W.FramesPressed > 4) {
            bowser.SetFlag("up", true);
            bowser.Y -= speed;
        }

        if (keys.S.FramesPressed > 4) {
            bowser.SetFlag("down", true);
            bowser.Y += speed;
        }

        if (keys.Space.FramesPressed > 1) {
            bowser.SetAllFlags(false);
            bowser.SetFlag("laughing", true);
        }

        if (keys.Q.FramesPressed > 1) {
            bowser.ResetClippingIndex();
        }

    };
    w.Draw = function (c) {
        
        c.fillText("Sprite Control: W,S,A,D and Space (Reset Sprite with Q)", 20, 20);

    };
    w.Register();

}

function testRandom(engine){

    var first = Date.now();
    var i=0;

    var cbo = function(){

        var dif = Date.now() - first;
        console.log("Call Nr. " + (++i) + " after " + dif + " ms");

    }.getCallbackObject();

    engine.rndInterval = Anibody.static.Random.SetRandomInterval(cbo, 300, 1300);
    
    window.setTimeout(function(engine){
        engine.rndInterval.clearInterval();
    }, 10000, engine);
}

function testSpline(engine) {
    Anibody.import(Anibody.visual.Spline);

    var sp = new Spline(
        { x: 750, y: 550 },
        730, 480,
        {x: 680, y:350}
    );

    sp.SetColor("red");
    sp.DrawPoints = true;

    sp.SetCloseSpline(true);

    sp.Register();

    // adding a mouse click handler to further test the spline
    var onmouseclickcbo = function (event) {

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.AddPoint(mpos.X, mpos.Y);

    }.getCallbackObject(sp);

    engine.Input.MouseHandler.AddMouseHandler("leftclick", onmouseclickcbo);
}

function testSoundWrapper(engine){

    var againcbo = function(){
        testSoundWrapper(this);
    }.getCallbackObject(engine);

    var codename = "bomb_timer";
    //codename = "portal_activate";

    var m = engine.MediaManager.GetSound(codename);
    var wrapper;

    if(m === 0){
        engine.MediaManager.Require("soundtest", againcbo);
    }else{

        if(m !== -1){
            wrapper = new Anibody.util.SoundWrapper(m);
            wrapper.Play({
                offsetStart : 3000,
                volume : 0.2
            });
        }else{
            console.log(`Can't find a Sound with "${codename}" in the MediaManager's MediaPack`);

            var sf = new Anibody.util.SoundFile("./music/alien_bomb_timer.wav", "bomb_timer", "soundtest");
            engine.MediaManager.LoadMedia([sf], againcbo);

        }
    }

}

function testImageWrapper(engine){

    var duration = 5000;

    var w = new Anibody.Widget();
    var img = engine.MediaManager.GetImage("logo");
    
    w.wrapper = new Anibody.util.ImageWrapper(img);
    
    w.Draw = function (c) {
        c.drawImage(this.wrapper.Image, 280, 500);
    };

    // the function that processes the user input
    w.ProcessInput = function () {

        var keys = this.Engine.Input.Keys;
        var step = 0.05;

        if (keys.B.FramesPressed === 4) {
            this.wrapper.Brighten(step)
        }

        if (keys.D.FramesPressed === 4) {
            this.wrapper.Darken(step)
        }

        if (keys.Q.FramesPressed === 4) {
            this.Deregister();
        }

        if (keys.V.FramesPressed === 4) {
            this.wrapper.FlipVertically();
        }

        if (keys.H.FramesPressed === 4) {
            this.wrapper.FlipHorizontally();
        }

    };

    // starts drawing and processInput
    w.Register();

}

function testNewCallObjectOptions(engine) {

    var func = function () {
        console.log("Start +++++++++++++++++++++++++++++++++++");
        console.log(arguments);
        console.log("End +++++++++++++++++++++++++++++++++++");
        console.log(" ");
    };

    var cbo_withParameter = func.getCallbackObject(engine, "mainParameter");
    var cbo_withoutParameter = func.getCallbackObject(engine);

    var cbo_extrem = func.getCallbackObject(engine, ["para1", "para2", {para:"para3"}]);
    cbo_extrem.useApply = true;

    // ...
    Anibody.CallObject(cbo_withoutParameter);

    // pre
    Anibody.CallObject(cbo_withoutParameter, {
        useApply: true,
        preparameter: "preparameter"
    });

    // post
    Anibody.CallObject(cbo_withoutParameter, {
        useApply: true,
        postparameter: "postparameter"
    });

    // pre, post
    Anibody.CallObject(cbo_withoutParameter, {
        useApply: true,
        preparameter: "preparameter",
        postparameter: "postparameter"
    });

    

    // main
    Anibody.CallObject(cbo_withParameter);
    
    

    // pre, main,
    Anibody.CallObject(cbo_withParameter, {
        useApply: true,
        preparameter: "preparameter"
    });
    

    // main, post
    Anibody.CallObject(cbo_withParameter, {
        useApply: true,
        postparameter: "postparameter"
    });

    // pre, main, post
    Anibody.CallObject(cbo_withParameter, {
        useApply: true,
        preparameter: "preparameter",
        postparameter: "postparameter"
    });

    // pre, para1, para2, object, post
    Anibody.CallObject(cbo_extrem, {
        preparameter: "preparameter",
        postparameter: "postparameter"
    });
}

function testInputField(engine){
    // InputField - top left - Initiation
    Anibody.import(Anibody.ui.InputField);
    var infi = new InputField(10, 10, 300);
    infi.BindToStorageEntry("startInputField");
    infi.Register();
}