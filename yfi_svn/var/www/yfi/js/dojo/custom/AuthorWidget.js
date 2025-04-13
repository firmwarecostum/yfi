// custom.AuthorWidget
dojo.provide("custom.AuthorWidget");
 
// Bring in what we need
dojo.require("dijit._Widget");
//dojo.require("dijit.Dialog");

dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");


dojo.declare("custom.AuthorWidget", [dijit._Widget, dijit._Templated, ], {
    // Some default values for our author
    // These typically map to whatever you're handing into the constructor
    name: "No Name",
    // Using dojo.moduleUrl, we can get a path to our AuthorWidget's space
    // and we want to have a default avatar, just in case
    avatar: dojo.moduleUrl("custom.AuthorWidget", "images/defaultAvatar.png"),
    bio: "",
 
    // Our template - important!
    templateString:
        dojo.cache("custom.AuthorWidget", "templates/AuthorWidget.html"),
 
    // A class to be applied to the root node in our template
    baseClass: "authorWidget",
 
    // A reference to our background animation
    mouseAnim: null,
 
    // Colors for our background animation
    baseBackgroundColor: "#fff",
    mouseBackgroundColor: "#def",

    postCreate: function(){
    // Get a DOM node reference for the root of our widget
    var domNode = this.domNode;
    var wid = this;
 
    // Run any parent postCreate processes - can be done at any point
    this.inherited(arguments);
 
    /*
    // Set our DOM node's background color to white -
    // smoothes out the mouseenter/leave event animations
    dojo.style(domNode, "backgroundColor", this.baseBackgroundColor);
    // Set up our mouseenter/leave events - using dijit._Widget's connect
    // means that our callback will execute with `this` set to our widget
    this.connect(domNode, "onmouseenter", function(e) {
        this._changeBackground(this.mouseBackgroundColor);
    });
    this.connect(domNode, "onmouseleave", function(e) {
        this._changeBackground(this.baseBackgroundColor);
    });

    */

        var button = new dijit.form.Button({
                    label: "Click me!",
                    onClick: function() {
                        // Do something:
                       console.log("Thank you! ");
                        wid.destroy();
                    }
                },
                document.createElement("div"));
        dojo.place(button.domNode, this.domNode);

    }





});



