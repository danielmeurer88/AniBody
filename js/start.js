

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
        new ImgF({ path: "./img_rpg/rpg_img2.png", codename: "rpg_img", group: ["room1", "preload"] }),
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
        new Anibody.util.SoundFile({ path: "./music/portal_activate.mp3", codename: "portal_activate", group:["room2", "soundtest"] }),
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

    var b1 = new Button("center", 120, {
        Label: "Start",
        TriggerCallbackObject: function (engine) {
            level_rpg(engine);
        }.getCallbackObject(engine, engine),
        HoverText: "Startet das Spiel"
    });

    b1.AddButtonEffect();
    engine.AddObject(b1);

    /* BUTTON HELP */
    var b2 = new Button("center", 220,
        {
            Label: "Test Button",
            TriggerCallbackObject: function (engine) {
                button1(engine);
            }.getCallbackObject("self", engine),
            HoverText: "Wird zum Testen unterschiedlicher Dinge benutzt."
        });
    b2.AddButtonEffect();

    //engine.AddObject(b2);
    b2.Register();

    /* BUTTON HELP2 */
    var b3 = new Button("center", 320,
        {
            Label: "Test Button 2",
            TriggerCallbackObject: function (engine) {
                button2(engine);
            }.getCallbackObject(engine, engine),
            HoverText: "Wird auch zum Testen unterschiedlicher Dinge benutzt."
        });
    b3.AddButtonEffect();

    b3.Register();

    engine.Start();

    $("#fs_btn").on("click", function () {
        engine.RequestFullscreen();
        var f = function (en) {
            en.ExitFullscreen();
        };
        window.setTimeout(f, 3000, engine);

        var res = Anibody.static.copyText("Hallo du - Wie geht es dir?");
        console.log(res);

    });

    // input field
    Anibody.import(Anibody.ui.InputField);
    var infi = new InputField(10, 10, 300);
    //engine.AddObject(infi);
    infi.Register();

    //testing the horizontal and vertically flipped image feature
    var w = new Anibody.Widget();
    w.TestImg = engine.MediaManager.GetImage("logo");
    w.TestImgV = w.TestImg.getVerticallyFlippedImage();
    w.TestImgH = w.TestImg.getHorizontallyFlippedImage();
    w.Draw = function (c) {
        c.drawImage(this.TestImgV, 10, 500);
        c.drawImage(this.TestImg, 10, 500 - this.TestImg.height - 5);
        c.drawImage(this.TestImgH, 10 + this.TestImg.width + 5, 500);
    };

    w.Register();
    window.setTimeout(function (w) { w.Deregister(); }, 2000, w);


    /* engine.testobj = Anibody.static.Random.SetRandomInterval(cbo, 300, 1300);
    
    window.setTimeout(function(engine){
        engine.testobj.clearInterval();
    }, 10000, engine);
 */

}

function button1(engine) {

    testRect(engine);
}

function button2(engine) {
    soundTest(engine);
}

//###########################################
//##############    TESTS     ###############
//###########################################

function testRect(engine){
    
    var background = Anibody.shapes.GetGradientCode("rgba(255,0,0,0.25)", "rgba(0, 255,0,0.25)", "rgba(0,0,255,0.25)");
    
/*     var grad = engine.Context.createLinearGradient(-100,-100,100, 100);
    grad.addColorStop(0.0, "#f00");
    grad.addColorStop(1, "#00f");
    grad.addColorStop(1, "#00f"); */

    var r = new Anibody.shapes.Rectangle(0, 0, 200, 200);
    r.FillType = "radialGradient"; // none, color, image, linearGradient, radialGradient
    r.FillCode = background; // none, colorCode, codename, stops-object
    
    r.RadialGradientRates = {
        x1 : 0.25, y1 : 0.25, r1 : 0.25,
        x2 : 0.25, y2 : 0.25, r2 : 0.95
    };
    
    r.FillCode = background; // none, colorCode, codename, stops-object
    
    r.BorderWidth = 3;
    r.BorderType = "color"; //
    r.BorderCode = "#966";

    /* r.SetFillStyle(grad); */

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
    s.BorderCode = "#966";

    s._drawPoints = true;
    s._drawCentroid = true;
    s._drawArea = true;
    s._drawSurroundingRectangle = true;

    s.VisualRotation = false;

    s.Register();

    var dw = new Anibody.debug.DebugWindow();
    dw.Add(s, ["X", "Y", "Width", "Height"], "Shape");
    dw.Register();
    //dw.Open();

    var f = function (event) {

        var mpos = event.Mouse.Position;
        event.Handled = true;

        this.AddPoint(mpos.X, mpos.Y);

    }.getCallbackObject(s);

    engine.Input.MouseHandler.AddMouseHandler("leftclick", f);

    f = function (event) {
        
                var mpos = event.Mouse.Position;
                event.Handled = true;
        
                this.Rotate(Math.PI * 0.2);
        
            }.getCallbackObject(s);

    engine.Input.MouseHandler.AddMouseHandler("rightclick", f);
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
    w.Register();

}

function testSpline(engine) {

    var w = engine.Canvas.width;
    var h = engine.Canvas.height;
    var sp = new Spline();

    sp.SetColor("red");
    sp.DrawPoints = true;

    sp.SetCloseSpline(true);

    sp.AddPoint({ x: w * 0.65, y: h * 0.99 });
    sp.AddPoint({ x: w * 0.15, y: h * 0.7 });
    sp.AddPoint({ x: w * 0.63, y: h * 0.55 });

    engine.AddObject(sp);
}

function soundTest(engine){

    // "girl_background", group: ["room2", "soundtest"] })
    var m = engine.MediaManager.GetSound("portal_activate");

    if(m == false){
        var playcbo = function(){
            var engine = this;
            var m = engine.MediaManager.GetSound("portal_activate");
            m.play();
        }.getCallbackObject(engine);

        engine.MediaManager.Require("soundtest", playcbo);

    }else{
        m.play();
    }

}