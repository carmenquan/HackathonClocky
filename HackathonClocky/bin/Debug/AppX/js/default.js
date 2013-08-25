// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
            document.getElementById('alarm').addEventListener("click", setAlarm, false);
            document.getElementById('setAlarm').addEventListener("click", showAlarmScreen, false);
            document.getElementById('backToClock').addEventListener("click", hideAlarmScreen, false);
            document.getElementById('timePicker_am').addEventListener("click", activateAM, false);
            document.getElementById('timePicker_pm').addEventListener("click", activatePM, false);
            document.getElementById('cancelSetAlarm').addEventListener("click", hideAlarmScreen, false);
            document.getElementById('turn-off').addEventListener("click", alarmOff, false);
            document.getElementById('alarmSet_min').addEventListener("change", addZerosM, false);
            document.getElementById('alarmSet_sec').addEventListener("change", addZerosS, false);
            updateTime();
            setup();
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
    
    var snoozeHandler;
    var clock;
    var timer;
    var currDN;
    var flashing;
    var number = 0;
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var likeStrings = [' thinks you are lazy.', " wants you to get your ass out of bed.", " likes that you don't wake up on time.", " hates that you snooze."];

    function setup() {
        document.getElementById('clockScreen').style.backgroundColor = "#FFFFFF";
        clock = setInterval(updateTime, 1000);
    }

    function formatTime(date) {
        var hh = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        var dd = "am";
        var h = hh;
        if (h >= 12) {
            if (h != 12) {
                h = hh - 12;
            }
            document.getElementById('time_am').className += " grey";
        }
        else {
            if (h == 0) {
                h = 12;
            }
            document.getElementById('time_pm').className += " grey";
        }
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;

        return h + ":" + m + ":" + s;
    }

    function addZerosM() {
        var m = document.getElementById('alarmSet_min').value;
        m = m < 10 ? "0" + m : m;
        document.getElementById('alarmSet_min').value = m;
    }

    function addZerosS() {
        var s = document.getElementById('alarmSet_sec').value;
        s = s < 10 ? "0" + s : s;
        document.getElementById('alarmSet_sec').value = s;
    }

    function updateTime() {
        var currDate = new Date();
        document.getElementById('header_weekday').innerHTML = days[currDate.getDay()];
        document.getElementById('header_date').innerHTML = months[currDate.getMonth()] + " " + currDate.getDate() + ", " + currDate.getFullYear();
        document.getElementById('time').innerHTML = formatTime(currDate).substring(0, formatTime(currDate).length - 3);
        document.getElementById('time_seconds').innerHTML = formatTime(currDate).substring(formatTime(currDate).length - 2);
    }


    function setAlarm(eventInfo) {
        var currTime = new Date();
        var alarmTime = new Date();
        if (currDN == "am") {
            if (document.getElementById('alarmSet_hour').value == 12) {
                alarmTime.setHours(0);
            }
            else {
                alarmTime.setHours(parseInt(document.getElementById('alarmSet_hour').value));
            }
        }
        else {
            if (document.getElementById('alarmSet_hour').value == 12) {
                alarmTime.setHours(12);
            }
            else {
                alarmTime.setHours(parseInt(document.getElementById('alarmSet_hour').value) + 12);
            }
        }
        var m = parseInt(document.getElementById('alarmSet_min').value);
        var s = parseInt(document.getElementById('alarmSet_sec').value);

        alarmTime.setMinutes(m);
        alarmTime.setSeconds(s);

        var currTimeMS = currTime.getTime();
        var alarmtimeMS = alarmTime.getTime();

        var diff = alarmtimeMS - currTimeMS;

        timer = setTimeout(alarmSetOff, diff);
        
        var DN;

        if (alarmTime.getHours() > 12) {
            DN = "pm";
        }
        else {
            DN = "am";
        }

        document.getElementById('setAlarm').style.visibility = "hidden";
        document.getElementById('alarmDisplay').style.visibility = "visible";

        document.getElementById('AlarmSet').innerHTML = formatTime(alarmTime) + DN;
        hideAlarmScreen();
    }

    function alarmSetOff() {
        document.getElementById('audiotag1').play();

        flashing = setInterval(flashingBG, 450);

        document.getElementById('alarmDisplay').style.visibility = "hidden"
        document.getElementById('snooze').style.visibility = "visible"

        document.getElementById('turn-off').style.visibility = "visible";

        snoozeHandler = document.getElementById('time').addEventListener("click", snoozeMe, false);
    }

    function flashingBG() { 
        if (document.getElementById('clockScreen').style.backgroundColor == "rgb(255, 255, 255)") {
            document.getElementById('clockScreen').style.backgroundColor = "#383838";
        } else {
            document.getElementById('clockScreen').style.backgroundColor = "#FFFFFF";
        }
    }

    var accessToken = "CAAGCB9OrmzsBALqn8qMP3xlY9U0q8St53xMrmVptZCa2YgvPKQXGxZCUyheKUq4cNdZBROBZCvKHhcxErxf0ZBgpCjgcncyYbNzdkEGYtrfoJrD1jYXV82t9PQEazLbIrOWblpTc74HiCZB7xLNixxVRanMt3UAzkaUhqVRVpFFwZDZD";
    var postid;
    function snoozeMe() {
        var data = new FormData();
        data.append("access_token", accessToken);
        
        document.getElementById('turn-off').style.visibility = "hidden"

        document.getElementById('snooze').style.visibility = "hidden"
        document.getElementById('alarmDisplay').style.visibility = "visible"

        document.getElementById('audiotag1').pause();

        document.getElementById('clockScreen').removeEventListener("click", snoozeHandler, false);

        clearInterval(flashing);
        document.getElementById('clockScreen').style.backgroundColor = "#FFFFFF";

        var messages = ["I just snoozed my alarm. Like this to help me wake up!", "I'm sleeping in when I shouldn't be. Like this to sound my alarm!", "I need help getting out of bed. Like this post to help me out!"]
        data.append("message", messages[Math.floor(Math.random() * 3)]);
        
        WinJS.xhr({
            type: "POST",
            url: "https://graph.facebook.com/510441781/feed",
            data: data,
        }).then(function (response) {
            var result = JSON.parse(response.responseText);
            postid = result.id;
            var date = new Date();
            var DN;
            var dateM = date.getMinutes() + 10;
            date.setMinutes(dateM);
            if (date.getHours() > 12) {
                DN = "pm";
            }
            else {
                DN = "am";
            }
            document.getElementById('AlarmSet').innerHTML = formatTime(date) + DN;
            console.log("success");
            checkLikes(postid);
        }, function (errorResponse) {
            var result = JSON.parse(errorResponse.responseText);
            console.error(result.error.message);
            var date = new Date();
            var DN;
            var dateS = date.getSeconds() + 10;
            date.setSeconds(dateS);
            if (date.getHours() > 12) {
                DN = "pm";
            }
            else {
                DN = "am";
            }
            document.getElementById('AlarmSet').innerHTML = formatTime(date) + DN;
            timer = setTimeout(alarmSetOff, 10000);
        });
    }

    var likedpeople = [];
    var messages = [];
    //var postid1 = "510441781_10151521253786782";
    function checkLikes(postidParameter)
    {
        var data = new FormData();
        data.append("access_token", accessToken);
        var posturl = "https://graph.facebook.com/"+ postid + "/?access_token=" + accessToken;
        WinJS.xhr({
            type: "GET",
            url: posturl
            //data: data,
        }).then(function (response) {
            var result = JSON.parse(response.responseText);
            console.log(result);
            console.log("success");
            if (typeof result.likes != 'undefined') {
                if (result.likes.data.length > 0) {
                    //document.getElementById("horn").play();
                    for (var index = 0; index < result.likes.data.length ; index++) {
                        if (likedpeople.indexOf(result.likes.data[index].name) < 0) {
                            likedpeople.push(result.likes.data[index].name);
                            var x = Math.floor(Math.random() * 4);
                            document.getElementById("horn" + x).play();
                            var newp = document.createElement('p');
                            newp.innerHTML = "<span>" + result.likes.data[index].name + " </span>" + likeStrings[x];
                            var newli = document.createElement('li');
                            newli.appendChild(newp);
                            document.getElementById('listLikes').insertBefore(newli, document.getElementById('listLikes').firstChild);
                        }
                    }
                }
            }
            if (typeof result.comments != 'undefined') {
                for (var index = 0; index < result.comments.data.length; index++)
                {
                    var newp = document.createElement('p');
                    var text = "<span>" + result.comments.data[index].from.name + " </span>says: <span class='comment'>\"" + result.comments.data[index].message + "\"</span>";
                    if (messages.indexOf(text) < 0) {
                        document.getElementById("horn").play();
                        messages.push(text);
                        newp.innerHTML = text;
                        var newli = document.createElement('li');
                        newli.appendChild(newp);
                        document.getElementById('listLikes').insertBefore(newli, document.getElementById('listLikes').firstChild);
                    }
                }
            }
            setTimeout(function(){checkLikes(postid);} , 1000);
        }, function (errorResponse) {
            var result = JSON.parse(errorResponse.responseText);
            console.error(result.error.message);
            checkLikes(postid);
        });
    }

    function alarmOff() {
        clearInterval(flashing);
        document.getElementById('clockScreen').style.backgroundColor = "#FFFFFF";
        document.getElementById('audiotag1').pause();
        document.getElementById('clockScreen').removeEventListener("click", snoozeHandler, false);
        document.getElementById('snooze').style.visibility = "hidden"
        document.getElementById('setAlarm').style.visibility = "visible"

        document.getElementById('turn-off').style.visibility = "hidden";
    }

    function showAlarmScreen() {
        var screen = document.getElementById('setAlarmScreen');
        screen.style.left = "0px";
        var currTime = new Date();
        var h = currTime.getHours();
        var m = currTime.getMinutes();
        var s = currTime.getSeconds();
        if (h >= 12)
        {
            if (h != 12) {
                h = h - 12;
            }
            activatePM();
        }
        else {
            if (h == 0) {
                h = 12;
            }
            activateAM();
        }

        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;

        document.getElementById('alarmSet_hour').value = h;
        document.getElementById('alarmSet_sec').value = s;
        document.getElementById('alarmSet_min').value = m;
    }

    function hideAlarmScreen() {
        var screen = document.getElementById('setAlarmScreen');
        screen.style.left = "-1371px";
    }

    function autoSetAlarm() {
        showAlarmScreen();
        var currTime = new Date();
        var s = currTime.getSeconds();
        s = s + 5;
        currTime.setSeconds(s);
        document.getElementById('alarmSet_hour').value = currTime.getHours() + 12;
        document.getElementById('alarmSet_sec').value = currTime.getSeconds();
        document.getElementById('alarmSet_min').value = currTime.getMinutes();
        document.getElementById('alarmSet_dn').value = "am";
    }

    function activateAM() {
        document.getElementById('timePicker_am').className = "timePicker-am active";
        document.getElementById('timePicker_pm').className = "timePicker-pm";
        currDN = "am";
    }

    function activatePM() {
        document.getElementById('timePicker_pm').className = "timePicker-pm active";
        document.getElementById('timePicker_am').className = "timePicker-am";
        currDN = "pm"
    }
    app.start();

})();
