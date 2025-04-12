// custom.PhotoWidget
dojo.provide("custom.PhotoWidget");
 
// Bring in what we need
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("custom.PhotoUploader");
//dojo.require("dijit.form.Button");

dojo.declare("custom.PhotoWidget", [dijit._Widget, dijit._Templated ], {
    // Some default values for our photo
    // These typically map to whatever you're handing into the constructor
    title: "No Name",
    // Using dojo.moduleUrl, we can get a path to our PhotoWidget's space
    // and we want to have a default avatar, just in case
    picture: dojo.moduleUrl("custom.PhotoWidget", "images/defaultPhoto.png"),
    description: "",
    file_name: "",

    //Some presets which can be overridden
    height: '300',
    //URL of the image resizer
    url: '/c2/yfi_cake/files/image.php?height=200',
    delete_url: '/c2/yfi_cake/realms/json_delete_photo_for_realm/',
    width: '380',

 
    // Our template - important!
    templateString:
        dojo.cache("custom.PhotoWidget", "templates/PhotoWidget.html"),
 
    // A class to be applied to the root node in our template
    baseClass: "photoWidget",

    //Add a default dummy realm
    realm_id : '',
    id: '',
    postCreate: function(){
        // Get a DOM node reference for the root of our widget
        var domNode = this.domNode;
        //var wid = this;
 
        // Run any parent postCreate processes - can be done at any point
        this.inherited(arguments);

        //Connect the edit and delete methods
        this.connect(this.editNode, "onclick", function(e) {
            this._editPicture();
        });

        //Connect the add and delete methods
        this.connect(this.deleteNode, "onclick", function(e) {
            var def = dojo.xhrGet({
					url: this.delete_url+this.id,
					handleAs: 'json',
                    preventCache: true
		    });

            var w = this;
            // Once ready, process the feedback
    	    def.then(function(response){
                 if(response.json.status == 'ok'){
                    dijit.byId('componentsMainToaster').setContent('<b>'+"Photo deleted OK"+'</b>','message',components.Const.toasterInfo);
                    w.destroyRecursive(false);
                 }     
            });
        });
 
    },
    // This method is automatically invoked anytime anyone calls
	// myWidget.set('picture', someValue)
	_setPictureAttr: function(av) {
		// We only want to set it if it's a non-empty string
		if (av != '') {
			// Save it on our widget instance - note that
			// we're using _set, to support anyone using
			// our widget's Watch functionality, to watch values change
			this._set('picture', av);

			// Using our avatarNode attach point, set its src value
            //http://127.0.0.1/c2/yfi_cake/files/image.php?height=300&image=/c2/yfi_cake/webroot/img/graphics/4e9190e9-4790-4b52-a30e-22fca509ff00.jpeg
            av = this.url+this.height+'&width='+this.width+'&image='+av;
			this.pictureNode.src = av;
		}
	},
    // myWidget.set('title', someValue)
	_setTitleAttr: function(t) {
		// We only want to set it if it's a non-empty string
		if (t != '') {
			this._set('title', t);
			this.headingNode.innerHTML = t;
		}
	},
     // myWidget.set('title', someValue)
	_setDescriptionAttr: function(t) {
		// We only want to set it if it's a non-empty string
		if (t != '') {
			this._set('description', t);
			this.descriptionNode.innerHTML = t;
		}
	},
    _editPicture:    function(){

        console.log("Edit Picture for "+this.id);
        //Create the edit dialog
        var c = this.domNode;
        var pul = new custom.PhotoUploader({realm_id: this.realm_id, id: this.id});
        pul.show_edit_dialog(this);
    }
});




