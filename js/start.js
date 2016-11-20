
$(document).ready(function () {

    var engine = new Engine("Play");

    RegisterTouchTest(engine);

    var waterglass = new Image({path: "./img_rpg/water_glass.jpg", codename: "water_glass", group:"room3"});
    waterglass.AddGroup("room1");

    var mediapack = [
        new Image("./img_rpg/button_0.png", "button_state_0"),
        new Image("./img_rpg/button_1.png", "button_state_1"),
        new Image("./img_rpg/button_2.png", "button_state_2"),
        new Image({path: "./img_rpg/rpg_img2.png", codename: "rpg_img", group: ["room1", "beginning"]}),
        new Image({path: "./img_rpg/rpg_structure2.png", codename: "rpg_structure"}),
        new Image({path: "./img_rpg/rpg_subimg2.jpg", codename: "rpg_subimg", group:"room2"}),
        new Image({path: "./img_rpg/rpg_substructure.png", codename: "rpg_substructure"}),
        new Image({path: "./img_rpg/grey_sprite_3x4.png", codename: "rpg_testsprite" }),
        new Image({path: "./img_rpg/tresure_closed.png", codename: "tresure_closed"}),
        new Image({path: "./img_rpg/tresure_opened.png", codename: "tresure_opened"}),
        new Image({path: "./img_rpg/girl.png", codename: "girl", group:"room2"}),
        new Image({path: "./img_rpg/da_racoon.jpg", codename: "da_racoon", group:"room2"}),
        new Image({path: "./img_rpg/crate.png", codename: "crate", group:"room2"}),
        new Image({path: "./img_rpg/crate_pad.png", codename: "pad", group:"room2"}),
        new Image({path: "./img_rpg/fire_sprite.png", codename: "bonfire", group:"room1"}),
        new Image({path: "./img_rpg/fire_out.png", codename: "bonfire_out", group:"room1"}),
        waterglass,
        new Image({path: "./img_rpg/litte_click_sprite.png", codename: "little_click_sprite", group:"room1"}),
        new Sound({path: "./music/portal_activate.mp3", codename: "portal_activate", group:"room1"}),
        new Sound({path: "./music/alongway.mp3", codename: "girl_background", group:"room2"})
    ];

    engine.MediaManager.SetMediaPack(  mediapack, new Callback(engine, menu_callback, engine));

    
});

function menu_callback(engine){
    
    // ------------------------------------------------ adding objects to the engine
    /* BUTTON RPG */
    var b1 = new Button("center", 120, 250, 60);
    b1.SetTriggerCallbackObject({that:b1, parameter: engine, function:function (engine) {
        level_rpg(engine);
    }});
    
    b1.SetAppearance(
        {DisplayType: "image", Code: "button_state_0", Label: "RPG Test", TextColor: "black", FontHeight: 18},
        {DisplayType: "image", Code: "button_state_1", Label: "RPG Test", TextColor: "black", FontHeight: 18},
        {DisplayType: "image", Code: "button_state_2", Label: "RPG Test", TextColor: "white", FontHeight: 12}
    );

    engine.AddObject(b1, 2);

    // input Area
    var ia = new InputArea(10, 10, 300);
    engine.AddObject(ia);

    /* BUTTON HELP */
    var b2 = new Button("center", 220, 250, 60);
    b2.SetTriggerCallbackObject({that:b2, parameter: engine, function:function (engine) {
        //start_help(engine);
        engine.CreateDownloadLink();
    }});
    
    
    b2.SetAppearance(
        {DisplayType: "image", Code: "button_state_0", Label: "Start Help", TextColor: "black", FontHeight: 18},
        {DisplayType: "image", Code: "button_state_1", Label: "Start Help", TextColor: "black", FontHeight: 18},
        {DisplayType: "image", Code: "button_state_2", Label: "Start Help", TextColor: "white", FontHeight: 12}
    );

    engine.AddObject(b2, 1);
        
    engine.Start();
    
    // Example: FLAG Engine.ConstantLoop set to false then own timer needs to handle the frame
    //var timer = new Timer(engine, engine.Frame, 1);
    //timer.Start();
}

function RegisterTouchTest(en){
    
    var f = function(text){
        if(arguments.length == 2)
            text = arguments[1];
        
        this.ShowAlert(text, 1);
        
    };
    
    en.Input.Touch.RegisterTapFunction(f, 5, en, "tap");
    en.Input.Touch.RegisterTap2Function(f, 5, en, "tap 2");
    
    en.Input.Touch.RegisterSwipeFunction(f, 5, en, "swipe");
    en.Input.Touch.RegisterSwipe2Function(f, 5, en, "swipe 2");
    
    if(en.Touch.PiesAllowed){
        
        en.Input.Touch.Pie.SetPiece(0, "Right1",
                {that: en, parameter: en.Input.Touch.Pie, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        en.Input.Touch.Pie.SetPiece(1, "Bottom1",
                {that: en, parameter: en.Input.Touch.Pie, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        en.Input.Touch.Pie.SetPiece(2, "Left1",
                {that: en, parameter: en.Input.Touch.Pie, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        en.Input.Touch.Pie.SetPiece(3, "Top1",
                {that: en, parameter: en.Input.Touch.Pie, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );


        en.Input.Touch.Pie2.SetPiece(0, "Right2",
                {that: en, parameter: en.Input.Touch.Pie2, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        en.Input.Touch.Pie2.SetPiece(1, "Bottom2",
                {that: en, parameter: en.Input.Touch.Pie2, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        en.Input.Touch.Pie2.SetPiece(2, "Left2",
                {that: en, parameter: en.Input.Touch.Pie2, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        en.Input.Touch.Pie2.SetPiece(3, "Top2",
                {that: en, parameter: en.Input.Touch.Pie2, function: function (self) {
                        this.ShowAlert(self.Labels[self.SelectedPiePiece], 1);
                    }}
        );
        
    }else{
        
        en.Input.Touch.RegisterLongTapFunction(f, 5, en, "long tap");
        en.Input.Touch.RegisterLongTap2Function(f, 5, en, "long tap 2");
        
    }
    
    
}

function start_help(engine){
    engine.ShowAlert("in developement", 1);
    
    // needs Platform_Only.js
    // platform_start(engine);
}