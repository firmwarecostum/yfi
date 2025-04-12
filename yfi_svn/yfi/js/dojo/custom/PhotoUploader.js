// custom.PhotoUploader
dojo.provide("custom.PhotoUploader");
 
// Bring in what we need
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require('dojo.io.iframe');

dojo.require("custom.PhotoWidget");

dojo.declare("custom.PhotoUploader", null, {

    //If it is a new photo we will only have realm_id and not photo_id
    realm_id: "",
    photo_id: "",

    //Some variables which will be assigned later
    dialogAdd: "",
    frmUpload: "",

    node_for_adding: "",

    //Editing stuff
    widget_for_editing: "", 


    //--------------------------
    //--- The constructor-------
    //--------------------------
    constructor: function(args) {
        dojo.safeMixin(this,args);
    },

    //-------------------------------
    //----Method to display dialog --
    //-------------------------------
    show_dialog : function(node){
        console.log("Showing dialog for "+ this.realm_id);
        this._show_dialog();
        //Get the node where the new photo should be adde to
        this.node_for_adding = node;

    },

    //-------------------------------
    //----Method to display edit dialog --
    //-------------------------------
    show_edit_dialog : function(photo_widget){
        console.log("Showing edit dialog for "+ this.realm_id);

       // console.log(photo_widget.get('title'));
       // console.log(photo_widget.set('title','Nou moet hy werk'));
      //  console.log(photo_widget.get('id'));
        this._show_dialog(photo_widget);
        //Get the node where the new photo should be adde to
       // this.node_for_adding = node;

    },




    //------------------------------------
    //--- Private method to show dialog --
    //------------------------------------
    _show_dialog: function(photo_widget){


        if(photo_widget == undefined){
            var t = "Add new photo";
        }else{
            var t = "Edit existing photo";
        }

        this.dialogAdd = new (dijit.Dialog)({title: t, style: "width: 450px"});
        //Add the content to the dialg
        this._create_content(photo_widget);

        this.dialogAdd.set("content", this.frmUpload.domNode); 
        this.dialogAdd.show();
    },

    //--------------------------------
    //--Create and return the content-
    //--------------------------------
    _create_content: function(photo_widget){

        //A form to contain the other widgets
        this.frmUpload    = new dijit.form.Form({encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            //Add a label
            var lbl =document.createElement('label');
                var txt=document.createTextNode('Photo to upload');
            lbl.appendChild(txt);
            dojo.addClass(lbl, "frmRequired");
        dojo.place(lbl,this.frmUpload.domNode);

            var hiddenId    = document.createElement("input");  //Hidden element containing the Realm ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = this.realm_id;
        dojo.place(hiddenId,this.frmUpload.domNode);

            //The ID either the realm (add) or photo id (edit)
            var p_id = this.realm_id;
            //Edit or Add ID
            if(photo_widget != undefined){
                p_id = photo_widget.id;
            }

            //Upload element
            var upload      = document.createElement('input');
            upload.type = 'file';
            upload.name = 'fileToUpload'+p_id;
            upload.id   = 'UploadPhoto';
            //dojo.addClass(upload,'inputUpload');
        dojo.place(upload,this.frmUpload.domNode);

        var br2=document.createElement('BR');
        br2.clear = 'all';
        dojo.place(br2,this.frmUpload.domNode);

            //Title for photo
            var title =document.createElement('label');
                var title_txt=document.createTextNode('Title');
            title.appendChild(title_txt);
            dojo.addClass(title, "frmRequired");
        dojo.place(title,this.frmUpload.domNode);

        if(photo_widget != undefined){
            var t = photo_widget.get('title');
        }

        var tb_title = new dijit.form.ValidationTextBox({ name:'title',required: true, value: t},document.createElement("div"));
        dojo.place(tb_title.domNode,this.frmUpload.domNode);

        //Clear
        var br3=document.createElement('BR');
        br3.clear = 'all';
        dojo.place(br3,this.frmUpload.domNode);

        //Description for photo
            var description =document.createElement('label');
                var description_txt=document.createTextNode('Description');
            description.appendChild(description_txt);
            dojo.addClass(description, "frmRequired");
        dojo.place(description,this.frmUpload.domNode);

        if(photo_widget != undefined){
            var d = photo_widget.get('description');
        }

            //   
            var inp = new dijit.form.Textarea({     
                name:           'description',
                required:       "true",
                style:          'width: 420px; margin-bottom: 10px;',
                value:          d
            },document.createElement("div"));

        dojo.place(inp.domNode,this.frmUpload.domNode);

            var btnSave = new dijit.form.Button({style:"float: right; margin:10px; margin-left:1px",label:"Save",iconClass:"saveIcon"},document.createElement("div"));
        dojo.place(btnSave.domNode,this.frmUpload.domNode);

            var instance = this;
            dojo.connect(btnSave,'onClick',function(){
                console.log("The realm is "+instance.realm_id);
                instance._submit_form(photo_widget);
            });

        },
    //----------------------
    //Function to upload...
    //-----------------------
    _submit_form : function(photo_widget){

        //We will not tolerate empty selections
        if((dojo.byId('UploadPhoto').value == undefined)||(dojo.byId('UploadPhoto').value == "")){
            console.log("Empty file...return");
            return;
        }
        //Nor empty heading
        if(!this.frmUpload.validate()){
            console.log("Empty heading.... return");
            return;
        }


        var url_cake = "/c2/yfi_cake/realms/json_new_photo/"+this.realm_id;
        if(photo_widget != undefined){
            var url_cake = "/c2/yfi_cake/realms/json_edit_photo/"+photo_widget.id;
        }

        var d = this.dialogAdd;
        var n = this.node_for_adding;

        //All set and ready to submit....
        dojo.io.iframe.send({
            url: url_cake,
            method: "post",
            handleAs: "text",
            form: this.frmUpload.domNode,
            handle: function(data,ioArgs){
            var response = dojo.fromJson(data);
            //console.log(data);

                if (response.json.status == 'ok'){
                    dijit.byId('componentsMainToaster').setContent('<b>'+"Photo uploaded OK"+'</b>','message',components.Const.toasterInfo);
                    d.destroyRecursive(false);
                    if(photo_widget == undefined){ //New addition
                        var widget = new custom.PhotoWidget(response.photo).placeAt(n);
                    }else{ //Edit existing
                        console.log(response);
                        //Update the widget
                        photo_widget.set('title',response.photo.title);
                        photo_widget.set('description',response.photo.description);
                        //photo_widget.set('picture','/c2/yfi_cake/webroot/img/graphics/4e936701-0248-4b02-9ccc-09d5a509ff00.jpeg');
                        photo_widget.set('picture',response.photo.picture);
                    }
                }
                
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });
    } 
});
