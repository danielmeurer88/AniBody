
$(document).ready(function () {

    var engine = new Engine("Play");

    RegisterTouchTest(engine);

    var mediapack = [
        {path: "./img_rpg/button_0.png", codename: "button_state_0", type:MediaManager.prototype.Types.Image},
        {path: "./img_rpg/button_1.png", codename: "button_state_1", type:MediaManager.prototype.Types.Image},
        {path: "./img_rpg/button_2.png", codename: "button_state_2", type:MediaManager.prototype.Types.Image},
        {path: "./img_rpg/rpg_img2.png", codename: "rpg_img", type:MediaManager.prototype.Types.Image, group:"room1"},
        {path: "./img_rpg/rpg_structure2.png", codename: "rpg_structure", type:MediaManager.prototype.Types.Image},
        {path: "./img_rpg/rpg_subimg2.jpg", codename: "rpg_subimg", type:MediaManager.prototype.Types.Image, group:"room2"},
        {path: "./img_rpg/rpg_substructure.png", codename: "rpg_substructure", type:MediaManager.prototype.Types.Image},
        {path: "./img_rpg/grey_sprite_3x4.png", codename: "rpg_testsprite", type:MediaManager.prototype.Types.Image },
        {path: "./img_rpg/tresure_closed.png", codename: "tresure_closed", type:MediaManager.prototype.Types.Image, group:"room1"},
        {path: "./img_rpg/tresure_opened.png", codename: "tresure_opened", type:MediaManager.prototype.Types.Image, group:"room1"},
        {path: "./img_rpg/girl.png", codename: "girl", type:MediaManager.prototype.Types.Image, group:"room2"},
        {path: "./img_rpg/da_racoon.jpg", codename: "da_racoon", type:MediaManager.prototype.Types.Image, group:"room2"},
        {path: "./img_rpg/crate.png", codename: "crate", type:MediaManager.prototype.Types.Image, group:"room2"},
        {path: "./img_rpg/crate_pad.png", codename: "pad", type:MediaManager.prototype.Types.Image, group:"room2"},
        {path: "./img_rpg/fire_sprite.png", codename: "bonfire", type:MediaManager.prototype.Types.Image, group:"room1"},
        {path: "./img_rpg/fire_out.png", codename: "bonfire_out", type:MediaManager.prototype.Types.Image, group:"room1"},
        {path: "./img_rpg/water_glass.jpg", codename: "water_glass", type:MediaManager.prototype.Types.Image, group:"room1"},
        {path: "./img_rpg/litte_click_sprite.png", codename: "little_click_sprite", type:MediaManager.prototype.Types.Image, group:"room1"}
    ];

    engine.MediaManager.Init(  mediapack, {function : menu_callback, parameter: engine, that:engine});

    
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