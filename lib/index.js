var derby = require('derby');

exports.run = run;
var model;
var server;
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
// client names which are currently connected to the server


function makeTextFile (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
};

function run(app, options, cb) {
  options || (options = {});
  var port = options.port || process.env.PORT || 3001 ;//| process.env.OPENSHIFT_NODEJS_PORT ;

  function listenCallback(err) {

    console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
    cb && cb(err);
  }


    function createServer() {
        var userList = [];


        if (typeof app === 'string') app = require(app);

        require('./server').setup(app, options, function (err, expressApp, upgrade, refModel) {
            model = refModel;



            //To set the time for the messages

            model.on('all', ('messages.*'), function (id, op, msg ) {

            if(msg.date < 0) {
                msgPath = model.at('messages.' + id);
                msgPath.set('date', +(new Date));
            }

            });


            // model.on('all', 'analysisFiles.*', function(id, op, data){
            //     console.log(id);
            //     console.log(op);
            //     console.log(data);
            //
            // });

            if (err) throw err;
            server = require('http').createServer(expressApp);




             var io = require('socket.io').listen(server);

            server.on('upgrade', upgrade);
            server.listen(port, listenCallback);


            io.sockets.on('connection', function (socket) {

                socket.on('error', function (error) {
                    console.log(error);
                    //  socket.destroy()
                });


                socket.on('analysisDir', function (data, callback) { //from computer agent


                 try{

                    var written = 0;
                    var p1 = new Promise(function (resolve, reject) {
                        for (var i = 0; i < data.length; i++) {

                            (function (file) {
                                var fs = require('fs');
                                fs.writeFile(("./jar/analysisDir/" + file.name), file.content, function (err) {
                                    if (err) console.log(err);
                                    written++;
                                    if(written>=data.length)
                                        resolve("success");
                                });
                            })(data[i]);
                        }
                    });

                    p1.then(function (content) {

                        var exec = require('child_process').exec, child;

                        child = exec("java -jar './jar/causalpath.jar' ./jar/analysisDir ",
                            function (error, stdout, stderr) {
                                console.log('stdout: ' + stdout);
                                if(stderr)
                                    console.log('stderr: ' + stderr);
                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                }
                                //get file and send it to the client for visualization
                                var fs = require('fs');
                                fs.readFile(('./jar/analysisDir/causative.json'), 'utf-8', function(err, content) {
                                    if (err) {
                                        console.log('exec error: ' + err);
                                        return;
                                    }
                                    callback(content);
                                });



                            });
                        child();


                    }), function (xhr, status, error) {
                        api.set('content.text', "Error retrieving data: " + error);

                    }
                 }
                 catch(error) {
                     console.log(error);
                 }

                });


            });


//funda            require('./serverSideSocketListener.js').start(io, model);


        });


      return server;


  }

    derby.run(createServer);







}
