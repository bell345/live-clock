// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    // JavaScript "using" statements
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var notes = Windows.UI.Notifications;
    var appData = Windows.Storage.ApplicationData.current;
    var roamSettings = appData.roamingSettings;
    var roamFolder = appData.roamingFolder;

    function gebi(id) {
        return document.getElementById(id);
    }

    function notify(header, text) {
        var template = notes.TileTemplateType.tileSquare150x150Text02,
            tileXML = notes.TileUpdateManager.getTemplateContent(template),
            textNodes = tileXML.getElementsByTagName("text");
        textNodes[0].innerText = header;
        textNodes[1].innerText = text;
        var tileNote = new notes.TileNotification(tileXML);
        tileNote.expirationTime = new Date(new Date().getTime() + 600 * 1000);
        notes.TileUpdateManager.createTileUpdaterForApplication().update(tileNote);
    }

    function noteReset() {
        notes.TileUpdateManager.createTileUpdaterForApplication().clear();
    }

    var dateFormats = {
        "dmy": "{DD}/{MM}/{yy}",
        "mdy": "{MM}/{DD}/{yy}",
        "long-eu": "{dddd}, {dd} of {MMMM} {yyyy}",
        "long-us": "{dddd}, {MMMM} {dd} {yyyy}",
        "iso": "{yyyy}-{MM}-{DD}"
    }, timeFormats = {
        "formal-24": "{HH}:{mm}",
        "formal-12": "{hh}:{mm} {tt}",
        "informal-12": "{h}:{mm} {tt}"
    }, example = new Date("1992-07-19T17:40:00");

    function findDateFormat(format) {
        for (var prop in dateFormats) if (dateFormats.hasOwnProperty(prop))
            if (dateFormats[prop] == format) return prop;
        return null;
    }
    
    function findTimeFormat(format) {
        for (var prop in timeFormats) if (timeFormats.hasOwnProperty(prop))
            if (timeFormats[prop] == format) return prop;
        return null;
    }

    function getPersistentDateFormat() {
        return roamSettings.values["dateformat"];
    }
    function getPersistentTimeFormat() {
        return roamSettings.values["timeformat"];
    }
    function setPersistentDateFormat(value) {
        if (value == null || value == "") return;
        roamSettings.values["dateformat"] = value;
    }
    function setPersistentTimeFormat(value) {
        if (value == null || value == "") return;
        roamSettings.values["timeformat"] = value;
    }
    function populateOptions() {
        // populate date
        for (var prop in dateFormats) if (dateFormats.hasOwnProperty(prop)) {
            var optElement = document.createElement("option");
            optElement.id = "dformat-" + prop;
            optElement.value = prop;
            optElement.innerText = CD3.format(example, dateFormats[prop]);
            gebi("dformat-select").appendChild(optElement);
        }
        // populate time
        for (var prop in timeFormats) if (timeFormats.hasOwnProperty(prop)) {
            var optElement = document.createElement("option");
            optElement.id = "dformat-" + prop;
            optElement.value = prop;
            optElement.innerText = CD3.format(example, timeFormats[prop]);
            gebi("tformat-select").appendChild(optElement);
        }
    }
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                $(document).trigger("pageload");
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };
    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };
    app.start();

    $(document).on("pageload", function () {
        populateOptions();
        var dateFormat = getPersistentDateFormat();
        if (dateFormat) {
            var ref = findDateFormat(dateFormat);
            $("#dformat-select").val(ref || "custom");
            $("#date-format").val(dateFormat);
            $("#date-format").attr("disabled", ref == null ? null : true);
            $("#dformat-accept").attr("disabled", ref == null ? null : true);
        }
        var timeFormat = getPersistentTimeFormat();
        if (timeFormat) {
            var ref = findTimeFormat(timeFormat);
            $("#tformat-select").val(ref || "custom");
            $("#time-format").val(timeFormat);
            $("#time-format").attr("disabled", ref == null ? null : true);
            $("#tformat-accept").attr("disabled", ref == null ? null : true);
        }
        $("#dformat-select").change(function () {
            var curr = $("#dformat-select").val();
            if (curr == "custom") { 
                $("#date-format").attr("disabled", null);
                $("#dformat-accept").attr("disabled", null);
            }
            else {
                $("#date-format").attr("disabled", true);
                $("#dformat-accept").attr("disabled", true);
                $("#date-format").val(dateFormats[curr]);
                setPersistentDateFormat(dateFormats[curr]);
            }
        });
        $("#tformat-select").change(function () {
            var curr = $("#tformat-select").val();
            if (curr == "custom") {
                $("#time-format").attr("disabled", null);
                $("#tformat-accept").attr("disabled", null);
            } else {
                $("#time-format").attr("disabled", true);
                $("#tformat-accept").attr("disabled", true);
                $("#time-format").val(timeFormats[curr]);
                setPersistentTimeFormat(timeFormats[curr]);
            }
        });
        $("#dformat-accept").click(function () {
            setPersistentDateFormat($("#date-format").val());
        });
        $("#tformat-accept").click(function () {
            setPersistentTimeFormat($("#time-format").val());
        });
        $("#test").click(function () {
            notify(CD3.format(new Date(), getPersistentTimeFormat()), CD3.format(new Date(), getPersistentDateFormat()));
        });
    });

})();
