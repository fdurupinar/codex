/*
 *	Model initialization
 *  Event handlers of model updates
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */
var app = module.exports = require('derby').createApp('cwc', __filename);


app.loadViews(__dirname + '/views');
//app.loadStyles(__dirname + '/styles');
//app.serverUse(module, 'derby-stylus');


var ONE_DAY = 1000 * 60 * 60 * 24;

var ONE_HOUR = 1000 * 60 * 60;

var ONE_MINUTE = 1000 * 60;

var docReady = false;

var useQunit = true;

var userCount;
var socket;


app.on('model', function (model) {


    model.fn('pluckUserIds', function (items, additional) {
        var ids, item, key;


        if (items == null) {
            items = {};
        }
        ids = {};
        if (additional) {
            ids[additional] = true;

        }
        for (key in items) {
            item = items[key];
            //do not include previous messages

            if (item != null ? item.userId : void 0) {
                ids[item.userId] = true;
            }
        }


        return Object.keys(ids);
    });

    model.fn('biggerTime', function (item) {
        var duration = model.get('_page.durationId');
        var startTime;
        if (duration < 0)
            startTime = 0;
        else
            startTime = new Date - duration;

        return item.date > startTime;
    });


    model.fn('biggerThanCurrentTime', function (item) {

        clickTime = model.get('_page.clickTime');


        return item.date > clickTime;
    });


});

app.get('/', function (page, model, params) {
    function getId() {
        return model.id();
    }

    function idIsReserved() {
        var ret = model.get('documents.' + docId) != undefined;
        return ret;
    }

    var docId = getId();

    while (idIsReserved()) {
        docId = getId();
    }

    // if( useQunit ){ // use qunit testing doc if we're testing so we don't disrupt real docs
    //     docId = 'qunit';
    // }

    return page.redirect('/' + docId);
});


app.get('/:docId', function (page, model, arg, next) {
    var messagesQuery, room;
    room = arg.docId;





    var docPath = 'documents.' + arg.docId;

    model.subscribe(docPath, 'sifText', function(err){
        if (err) {
            return next(err);
        }

        model.setNull(docPath, { // create the empty new doc if it doesn't already exist
            id: arg.docId

        });
        // create a reference to the document
        model.ref('_page.doc', 'documents.' + arg.docId);

    });



    //chat related
    model.set('_page.room', room);





    

    //model.subscribe('messages');
    var userId = model.get('_session.userId');

    messagesQuery = model.query('messages', {
        room: room,
        date: {
            $gt: 0
        },
        targets: {
                $elemMatch:{id: userId}
            }
    });

    messagesQuery.subscribe(function (err) {

        if (err) {
            return next(err);
        }


        //just to initialize
        model.set('_page.doc.userIds',[model.get('_session.userId')]);

        model.subscribe('users');
        var  usersQuery = model.query('users', '_page.doc.userIds');
        usersQuery.subscribe(function (err) {
            if (err) {
                return next(err);
            }
            var  user = model.at('users.' + model.get('_session.userId'));



            userCount = model.at('chat.userCount');



            return userCount.fetch(function (err) {
                if(user.get()) {

                    if(user.get('name') != null)
                        return page.render();

                }
                if (err) {
                    return next(err);
                }

                return userCount.increment(function (err) {
                    if (err) {
                        return next(err);
                    }
                    user.set({
                        name: 'User ' + userCount.get()
                    });

                    return page.render();

                });
            });
        });
    });
});





function triggerContentChange(divId){
    //TODO: triggering here is not good


    $(('#' + divId)).trigger('contentchanged');

}
function playSound() {
    try {
        $('#notificationAudio').play();
    }
    catch (err) {
        return err;
    }


}


app.proto.clearHistory = function(){

    this.model.set('_page.clickTime', new Date);

    return this.model.filter('messages', 'biggerThanCurrentTime').ref('_page.list');
}


app.proto.changeDuration = function () {

    return this.model.filter('messages', 'biggerTime').ref('_page.list');

};

app.proto.init = function (model) {
    var timeSort;



    if(model.get('_page.doc.sifText') == null){

        var sifText = "b controls-expression-of c\n";
        sifText += "e controls-expression-of c\n";
        sifText += "a controls-state-change-of e\n";
        sifText += "e controls_state_change_of b\n";
        sifText += "b controls_state_change_of e\n";

        model.set('_page.doc.sifText', sifText);
    }





    model.on('insert', '_page.list', function (index) {


        var com = model.get('_page.list');
        var myId = model.get('_session.userId');


        if(docReady){
            triggerContentChange('messages');

        }

        if (com[com.length - 1].userId != myId) {

            playSound();

        }
    });


    timeSort = function (a, b) {

        return (a != null ? a.date : void 0) - (b != null ? b.date : void 0);
    };



    return model.sort('messages', timeSort).ref('_page.list');
};


app.proto.create = function (model) {

    docReady = true;

    socket = io();

    var id = model.get('_session.userId');
    var name = model.get('users.' + id +'.name');

    this.atBottom = true;

    return model.on('all', '_page.list', (function (_this) {

        return function () {
            if (!_this.atBottom) {
                return;
            }
            return _this.container.scrollTop = _this.list.offsetHeight;
        };
    })(this));
};

app.proto.clearSifText = function(){
    this.model.set('_page.doc.sifText','');
}

app.proto.updateSifGraph = function(){

    var sifText = this.model.get('_page.doc.sifText');
    var doTopologyGrouping = this.model.get('_page.doc.doTopologyGrouping');
    //var sifCy = require('./public/src/sif-visualizer/sif-cy.js')($('#graph-container'), sifText,topologyGrouping );

    sifCy($('#graph-container'), sifText,doTopologyGrouping);
}


app.proto.onScroll = function () {
    var bottom, containerHeight, scrollBottom;
    bottom = this.list.offsetHeight;
    containerHeight = this.container.offsetHeight;
    scrollBottom = this.container.scrollTop + containerHeight;

    return this.atBottom = bottom < containerHeight || scrollBottom > bottom - 10;

};




app.proto.add = function (model, filePath) {

    if(model == null)

        model = this.model;
    this.atBottom = true;



        var comment;
        comment = model.del('_page.newComment'); //to clear  the input box
        if (!comment) {
            return;
        }

        var targets  = [];
        var users = model.get('_page.doc.userIds');

        var myId = model.get('_session.userId');
        for(var i = 0; i < users.length; i++){
            var user = users[i];
            if(user == myId ||  document.getElementById(user).checked){
                targets.push({id: user});
            }
        }

        var msgUserId = model.get('_session.userId');
        var msgUserName = model.get('users.' + msgUserId +'.name');

        model.add('messages', {
            room: model.get('_page.room'),
            targets: targets,
            userId: msgUserId,
            userName: msgUserName,
            comment: comment,
            date: -1//val //server assigns the correct time
        });


};





app.proto.formatTime = function (message) {
    var hours, minutes, seconds, period, time;
    time = message && message.date;
    if (!time) {
        return;
    }
    time = new Date(time);
    hours = time.getHours();

    minutes = time.getMinutes();

    seconds = time.getSeconds();

    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
};

app.proto.formatObj = function(obj){

    return JSON.stringify(obj, null, '\t');
};


