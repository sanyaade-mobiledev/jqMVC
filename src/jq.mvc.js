//mvc.js
(function($) {
    /**
     * This is the main app class that gets created.  It will include files and offer a "load" when they are all ready
     */
    $.mvc={}
    $.mvc.app=function(){
        var app= {
            _loadTimer:null,
            _modelsReady:false,
            _controllersReady:false,
            _loadedListeners:[],
            _modelsLoaded:0,
            _totalModels:0,
            _templateType:"text/html",
            _controllersDir:"controllers/",
            _modelsDir:"models/",
            /**
             * Looks for route changes via hash change (ala Backbone.js)
             ```
             app.listenHashChange()
             ```
             *@title app.listenHashChange()
             */
            listenHashChange:function(listen){
                window.addEventListener("hashchange",function(e){
                    var url=document.location.hash.replace("#","/");
                    $.mvc.route(url,e);
                });
            },
            /**
             * Set the path for where controllers will be loaded from
             ``` 
             app.controllersDir("controllers/");
             ```
             *@param {String} path
             *@title app.controllersDir(path);
             */
            controllersPath:function(path){
               this._controllersDir=path;
            },
            /**
             * Set the path for where models will be loaded from
             ``` 
             app.modelDir("models/");
             ```
             *@param {String} path
             *@title app.modelsDir(path);
             */
            modelsDir:function(path){
                this._modelsDir=path;
            },
            /**
             * Set the type attribute for templates. This is useful if you are using another templating system
             ```
             app.setViewType("text/x-handlebars-template");
             ```
             *@param {String} type
             *@title app.setViewType(type)
             */
             
            setViewType:function(type){
                this._templateType=typel
            },
            /**
             * Function to execute when $.mvc.app is ready (controllers and models are loaded async)
             ``` 
             app.ready(function(){
                //execute startup functions for app
             });
             ```
             *@param {Function} func
             *@title app.ready(func);
             */
            ready:function(fnc){
                if(!this.loaded)
                    $(document).one("jqmvc:loaded",fnc);
                else
                    fnc();
            },
            /**
             * Load controllers for the app asynchronously.  Do not put the ".js" suffex on the controller names.
             * When the "_controllername_:ready" events are all fired, app.ready is available
               ```
               app.loadControllers("main")
               app.loadControllers(["main","users","settings");
               ```
               *@param {String|Array} urls
               *@title app.loadControllers(urls);
             */
            loadControllers:function(urls){
                var that=this;
                $(document).ready(function(){
                    that._loadTimer=setTimeout(function(){
                        that._modelsReady
                    },1500); //Used if no models are loaded
                    if(typeof(urls)==="string"){
                        urls=[urls];
                    }
                    for(var i=0;i<urls.length;i++)
                    {
                        var file=document.createElement("script");
                        file.src=that._controllersDir+urls[i]+".js";
                        file.onerror=function(e){console.log("error ",e);};
                        $("head").append(file);
                        that._loadedListeners[urls[i]]=1;
                        $(document).one(urls[i]+":ready",function(e){
                            delete that._loadedListeners[e.name];
                            if(that._loadedListeners.length==0){
                                that._controllersReady=true;
                                if(that._modelsReady){
                                    $(document).trigger("jqmvc:loaded");
                                }
                            }
                        });
                        delete file;
                   }
               });
                
            },
            
            /**
             * Load models for the app asynchronously.  Do not put the ".js" suffex on the controller names.
             * 
               ```
               app.loadModels("main")
               app.loadModels(["main","users","settings");
               ```
               *@param {String|Array} urls
               *@title app.loadModels(urls);
             */
            loadModels:function(urls){
               var that=this;
               
               clearTimeout(this._loadTimer);
               $(document).ready(function(){
                   if(typeof(urls)==="string"){
                        urls=[urls];
                   }
                   that._totalModels=urls.length;
                   
                   for(var i=0;i<urls.length;i++)
                   {
                      var file=document.createElement("script");
                      file.src=that._modelsDir+urls[i]+".js";
                      file.onload=function(){
                         that._modelsLoaded++;
                         if(that._modelsLoaded>=that._totalModels)
                         {
                            that._modelsReady=true;
                            if(that._controllersReady)
                               $(document).trigger("jqmvc:loaded");
                         }
                      }
                      file.onerror=function(e){console.log("error ",e);};
                      $("head").append(file);
                      delete file;
                   }
               });
            }
       
        };
        
        return app;
    }
    
    /**
     * private properties for controllers
     * @api private
     */
    var baseUrl=document.location.protocol+"//"+document.location.host;
    var viewsCache = [];
    var modelsCache=[];
    var readyFuncs={};
    var viewsTotal={};
    var modelsTotal={};
    var viewsLoaded={};
    var modelsLoaded={};
    var controllerReady={};
    
    
     $.mvc.controller = {};
    /**
     * This is the basic controller creation script.  We add the object to the cache and then if any views are registered, we load them.
       ```
       $.mvc.controller.create("todo",{save:function(){},delete:function(){}});
       ```
       
       Because views/templates are loaded asynchronously, we do not want to be able to execute anything until they are ready.
       If you want to execute something when a controller is available, you can set an 'init' function on the object, or listen for
       the "_controllername_:ready" event
       
     * @param {String} Controller name
     * @param {Object} Controller object
     * @title $.mvc.controller.create
     */
    $.mvc.controller.create = function(name, obj) {
        
        var loaded=false;
        $.mvc.controller[name] = obj;
        viewsTotal[name]=0;
        viewsLoaded[name]=0;
        modelsLoaded[name]=0;
        modelsTotal[name]=0;
        if(obj.hasOwnProperty("init"))
            controllerReady[name]=obj;
        if (obj.hasOwnProperty("views") && (obj.views.length > 0||Object.keys(obj.views).length)>0) 
        {
            loaded=false;            
            viewsTotal[name]=obj.views.length||Object.keys(obj.views).length;
            for (var i in obj.views) 
            {
                var shortName=typeof(i)==="number"?obj.views[i]:i;
                if (!viewsCache[shortName] && jq("#" + shortName).length == 0) {
                    $.mvc.controller.addView(obj.views[i],name,shortName);
                    viewsCache[shortName] = 1;
                }
            }

        }
        
        if(loaded){
            $(document).trigger(name+":ready");
            controllerReady[name]&&controllerReady[name].init.apply(controllerReady[name]);
        }

    }
    /**
     * This handles the routing of the action using MVC style url routes (/controller/action/param1/param2/)
     * This is can be called manually, or using the jqUi custom click handler
        ```
        $.mvc.route("/main/list/foo/bar");
        ```
     * @param {String} Url string
     * @param {Object} [Event] - used to prevent default for anchor clicks, etc
     * @title $.mvc.controller.route
     */
    $.mvc.route = function(url, evt) {
        if (url.indexOf(baseUrl) === 0)
            url = url.substring(baseUrl.length, url.length);
        if (url[0] == "/")
            url = url.substr(1)
        url = url.split("/");
        
        if(url.length>1){
            var route = url.splice(0, 1);
            var axt = url.splice(0, 1);
        }
        else {
            route=url[0];
            axt="default";
        }
        if ($.mvc.controller[route] && $.mvc.controller[route].hasOwnProperty(axt)) 
        {
            evt&&evt.preventDefault();
            $.mvc.controller[route][axt].apply($.mvc.controller[route], url);
            return true;
        }
        return false;
    }
    
    $.mvc.addRoute=function(url,fnc){
        if (url.indexOf(baseUrl) === 0)
            url = url.substring(baseUrl.length, url.length);
        if (url[0] == "/")
            url = url.substr(1)
        url = url.split("/");
        
        if(url.length>1){
            var route = url.splice(0, 1);
            var axt = url.splice(0, 1);
        }
        else {
            route=url[0];
            axt="default";
        }
        if(!$.mvc.controller[route]){
           $.mvc.controller[route]={};
        }
        $.mvc.controller[route][axt]=fnc;
    
    }
    
    /**
     * Internal function that loads a view via AJAX and appends it to the dom
     * @param {String} Path
     * @api private
     * @title $.mvc.controller.addView
     */
    $.mvc.controller.addView = function(path,controller,name) {
        $.get(path, function(data) {
            var id=name;
            $(document.body).append($("<script type='"+$.mvc.app._templateType+"' id='" + id+ "'>" + data + "</script>"));
            viewsLoaded[controller]++;
            if((viewsLoaded[controller]==viewsTotal[controller]))
            {
                $(document).trigger(controller+":ready");
                
                controllerReady[controller]&&controllerReady[controller].init.apply(controllerReady[controller]);
            }
        });
    }
    

    /**
     * Here we override the custom click handler for jqUi so we can capture anchor events as needed
     */
    if($.ui)
        $.ui.customClickHandler = $.mvc.route;
    else{
        $(document).on("click","a",function(evt){
           $mvc.controller.route(evt.target.href,evt);
        });
    }
})(jq);

//model.js   
(function($) {
    
    storageAdapters = {}; //Each model can have it's own connector
    var baseOpts={}; //Base options/configs for each model to inherit from
    /**
     * This is the base model that all models inherit from.  This is used internally by $.mvc.model.extend
       
     * @param {String} name
     * @param {Object} properties and methods to add to the model
     * @api private
     * @title $.mvc.model
     */
    
    $.mvc.model =function(name,opts) {
        
        var self = this;
        opts && opts['modelName'] && delete opts['modelName']
        opts && opts['id'] && delete opts['id']
        if(!baseOpts[name]) //First time it's created, we want to store the options
            baseOpts[name]=opts;
        $.extend(this,opts);
      
        this.name = name;
        //this.id = $.uuid();
    };
    
    /**
     * This is the model prototype
     * @api private
     */
    $.mvc.model.prototype = {
            //Load a single object by id
            get: function(id,callback) {
                var self=this;
                var el = new $.mvc.model(this.name,baseOpts[this.name]);
                storageAdapters[this.name].get(id,
                    function(theObj){
                        el=$.extend(el,theObj);
                        el.name=self.name;
                        el.id=id;
                        if(callback)
                           return callback(el)
                        return el;
                    }
                );
                
            },
            //Get all objects for a given type and executes a callback
            getAll: function(callback) {
                return storageAdapters[this.name].getAll(this.name,callback);
                
            },
            //Save an object and executes a callback
            save: function(callback) {
                return storageAdapters[this.name].save(this,callback);
                
            },
            //Remove an object and execute a callback
            remove: function(callback) {
                return storageAdapters[this.name].remove(this,callback);               
            },
            //Set properties on the model.  You can pass in a key/value or an object of properties
            set:function(obj,value){
               if($.isObject(obj)){
                    obj && obj['name'] && delete obj['name'];
                    obj && obj['id'] && delete obj['id'];
                    for(var j in obj)
                    {
                        if(this.hasOwnProperty(j))
                           this[j]=obj[j];
                    }
                    return;
               }
               if(obj.toLowerCase()!="id"&&obj.toLowerCase()!="name")
                  this[obj]=value;
            }
        }

    
    /**
     * This is called to create a new model type.  You pass in the name, default properties and an optional storage adapter
        ```
        $.mvc.model.extend('model',{foo:'bar'})
        $.mvc.model.extend('model',{foo:'bar'},myCustomAdapter)
        ```
     * @param {String} name
     * @param {Object} default methods/properties
     * @param {Object} [storageAdapter] - look below for the default
     */
    $.mvc.model.extend = function(name, obj, storageAdapter) {
        storageAdapters[name] = storageAdapter ? storageAdapter : (localAdapter.linkerCache[name]={},localAdapter);
        return function() {
            return new $.mvc.model(name, obj);
        }
    }
    
    
    //Local Storage Adapter
    /**
     * This is the default storage adapater that wraps the HTML5 local storage item.  
     * When implementing a new adapter, you must implement the four following functions.  It should be noted that getAll should return an array
     *
     * Each function has a callback function to be executed against.
     * Additionally, you should dispatch an event for the model type for save/remove/etc.
     * @api private
     */
    var localAdapter = {
        linkerCache:{}, //We do not store all documents in a single record, we keep a lookup document to link them
      
        save: function(obj,callback) {
            if(!obj.id)
               obj.id=$.uuid();
            //try{
                window.localStorage.setItem(obj.id, JSON.stringify(obj));
                this.linkerCache[obj.modelName][obj.id]=1;
                window.localStorage.setItem(obj.modelName+"_linker",JSON.stringify(this.linkerCache[obj.modelName]));
                $(document).trigger(obj.modelName + ":save", obj);
                if(callback)
                   return callback(obj);
            }
           // catch(e){console.log(e)}
        },
        get: function(id,callback) {
            var el = window.localStorage.getItem(id);
            try {
                el = JSON.parse(el);
            } 
            catch (e) {
                el = {}
            }
            return callback(el);
        },
        getAll:function(type,callback){
           // try{
                var data=JSON.parse(window.localStorage.getItem(type+"_linker"));
                var res=[];
                for(var j in data){
                    if(localStorage[j]){
                        var item=JSON.parse(localStorage[j]);
                        item.name=type;
                        item.id=j;
                        res.push(item);
                    }
                    else {
                        delete data[j];
                    }
                }
                this.linkerCache[type]=data?data:{};
                //Fix dangling references
                window.localStorage.setItem(type+"_linker",JSON.stringify(this.linkerCache[type])); 
                return callback(res);
            }
           // catch(e){console.log(e)}
        },
        remove: function(obj,callback) {
            //try{
                window.localStorage.removeItem(obj.id);
                delete this.linkerCache[obj.name][obj.id];
                window.localStorage.setItem(obj.modelName+"_linker",JSON.stringify(this.linkerCache[obj.modelName])); 
                $(document).trigger(obj.modelName + ":remove", obj.id);
                if(callback)
                   return callback(obj);
            }
           // catch(e){console.log(e)}
        }
    };

})(jq);