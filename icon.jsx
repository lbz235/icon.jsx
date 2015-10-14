var dlg = new Window("dialog{text:'制作图标',bounds:[100,100,500,250],\
warningText:StaticText{bounds:[25,80,380,200] , text:'* 需要1024x1024的png图片' ,properties:{multiline:true}},\
dropDownLabel:StaticText{bounds:[17,16,200,38] , text:'已生成' ,properties:{multiline:true}},\
};");

dlg.cancelBtn = dlg.add('button', [255,40,375,63], '取消', {name:'cancel'});
dlg.selectImgBtn = dlg.add('button', [255,13,375,35], '选择文件', {name:'ok'});

var platformOptions = []; 
platformOptions[0] = "iOS App"; 
platformOptions[1] = "Mac App"; 

dlg.dropdownlist = dlg.add("dropdownlist", [130,13,220,35]);

for (var i=0,len=platformOptions.length;i<len;i++)  {
    dlg.dropdownlist.add ('item', "" + platformOptions[i]);      
}

var destPlatform = 0;
dlg.dropdownlist.selection = dlg.dropdownlist.items[destPlatform];

dlg.dropdownlist.onChange = function() { 
   destPlatform = parseInt(this.selection);
}

dlg.center();
var returnValue = dlg.show();

if (returnValue == 1) {
    try {
        // Prompt user to select an image file. Clicking "Cancel" returns null.
        var iTunesArtwork = File.openDialog();

        if (iTunesArtwork !== null) { 
            var doc = open(iTunesArtwork);

            if (doc == null) {
                throw "源文件不是png图片";
            }

            var startState = doc.activeHistoryState;       // save for undo
            var initialPrefs = app.preferences.rulerUnits; // will restore at end
            app.preferences.rulerUnits = Units.PIXELS;     // use pixels

            if (doc.width != doc.height) {
                throw "源文件不是方的";
            }

            // Folder selection dialog
            var destFolder = Folder.selectDialog( "保存于");

            if (destFolder == null) {
                // User canceled, just exit
                throw "";
            }

            // Save icons in PNG using Save for Web.
            var sfw = new ExportOptionsSaveForWeb();
            sfw.format = SaveDocumentType.PNG;
            sfw.PNG8 = false; // use PNG-24
            sfw.transparency = false;
            doc.info = null;  // delete metadata

            var icons;

            // String check rather than using magic numbers
            if (platformOptions[destPlatform] == "iOS App") {
                sfw.transparency = false;
                icons = [
                    {"name": "1", "size":29},
                    {"name": "2", "size":58},
                    {"name": "3", "size":87},
                    {"name": "4", "size":80},
                    {"name": "5", "size":120},
                    {"name": "6", "size":57},
                    {"name": "7", "size":114},
                    {"name": "8", "size":120},
                    {"name": "9", "size":180},
                    {"name": "10", "size":29},
                    {"name": "11", "size":58},
                    {"name": "12", "size":40},
                    {"name": "13", "size":80},
                    {"name": "14", "size":50},
                    {"name": "15", "size":100},
                    {"name": "16", "size":72},
                    {"name": "17", "size":144},
                    {"name": "18", "size":76},
                    {"name": "19", "size":152}

                    ];
            } else {
                sfw.transparency = true;
                icons = [
                    {"name": "icon_16x16",             "size":16},
                    {"name": "icon_16x16@2x",          "size":32},
                    {"name": "icon_32x32",             "size":32},
                    {"name": "icon_32x32@2x",          "size":64},
                    {"name": "icon_128x128",           "size":128},
                    {"name": "icon_128x128@2x",        "size":256},
                    {"name": "icon_256x256",           "size":256},
                    {"name": "icon_256x256@2x",        "size":512},
                    {"name": "icon_512x512",           "size":512},
                    {"name": "icon_512x512@2x",        "size":1024},
                ];
            }

            var icon;
            for (i = 0; i < icons.length; i++) {
                icon = icons[i];
                doc.resizeImage(icon.size, icon.size, null, ResampleMethod.BICUBICSHARPER);

                var destFileName = icon.name + ".png";

                if ((icon.name == "iTunesArtwork@2x") || (icon.name == "iTunesArtwork")) {
                    // iTunesArtwork files don't have an extension
                    destFileName = icon.name;
                }

                doc.exportDocument(new File(destFolder + "/" + destFileName), ExportType.SAVEFORWEB, sfw);
                doc.activeHistoryState = startState; // undo resize
            }

            alert(platformOptions[destPlatform] + " 完成");
        }
    } catch (exception) {
        // Show degbug message and then quit
        if ((exception != null) && (exception != "")) {
            alert(exception);
        }
    } finally {
        if (doc != null) {
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }

        app.preferences.rulerUnits = initialPrefs; // restore prefs
    }
}
