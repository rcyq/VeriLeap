var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({limit: '5mb'})
var textParser = bodyParser.text()

var trainerFile = require("leaptrainer.js");
var trainer = new trainerFile.LeapTrainer.Controller({controller:1});

var db = require('mongoskin').db('mongodb://localhost:27017/leap'); 
db.bind("users");
db.bind("emails");


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'verileap@gmail.com',
        pass: 'cs3235steps7'
    }
});

var email_resend_threshold_in_seconds = 300; // 5 minutes
var gesture_regen_threshold_in_seconds = 900; // 15 minutes
var gesturePoolSize = 6;

var port = process.env.PORT || 4344;
console.log("Listening on port "+port);
server.listen(port);


function sendEmail(username, email, id, sequence, callback) {

	var html = "Dear " + username + ", <br/>"
			+"<p><b> Replace which one??  No." + sequence +"</p></b>"
			+"<p>You are about to login using VeriLeap verification software. Please replace one of your password gesture with our One-Time-Password (OTP)"
			+" gesture as shown below (also attached to the email) when you are prompted to input your gestures."
			+"If you did not attempt to login, your account details could have been compromised. Please login and change your password (gestures) immediately.</p>"
			+"<p>Step 1: Place your Leap Motion device in this orientation</p>"
			+'<img src="cid:orientation"/>'
			+"<p>Step 2: Place your hand as shown over the device</p>"
			+'<img src="cid:gesture"/>'
			+"<p>-VeriLeap</p>";

	var mailOptions = {
	    from: 'VeriLeap <verileap@gmail.com>', // sender address
	    to: email, // list of receivers
	    subject: 'VeriLeap Login Notification', // Subject line
	    html: html,
	    attachments: [{
	    	path: 'docs/Email Instructions/Orientation.png',
	        cid: 'orientation' //same cid value as in the html img src
	    },{
	        path: 'docs/Email Instructions/Gesture '+id+'.png',
	        cid: 'gesture' //same cid value as in the html img src
	    }],
	};


	// send mail with defined transport object
	
	transporter.sendMail(mailOptions, function(error, info){
		if (callback != null) {
			callback( error || info.response.slice(0,3)!="250" );
		} else {
			if (error) console.log(error); 
			else console.log(info.response);
		}
	});	

}

// sendEmail("Pengran", "zhaopengran@gmail.com", 1);


function updateDatabaseNewUser(userName, email, threeGestures, callback) {

	var parsedGestures = JSON.parse(threeGestures);
	var eventsToWait = 4;
	var err_reply = {
		flag: false,
		message: "Error in adding to database"
	}
	var success_reply = {
		flag: true,
		message: "Successfully registered the user"
	}
	// update email address
	db.emails.update( {_id: userName, email: email, gesture: null, sequence:null, timestamp: null},  {upsert: true}, function(err) {
		if (err) {
			callback(err_reply);
		}
		eventsToWait --;
		if (eventsToWait == 0) callback(success_reply)
	});
	
	// update gestures
	for (var gid in parsedGestures) {
    	if (parsedGestures.hasOwnProperty(gid)) {
    		gesture = parsedGestures.gid;
    		db.users.update( {_id: gid}, { user: userName, _id: gid, gesture: gesture }, {upsert: true}, function(err) {
				if (err) {
					callback(err_reply);
				}
				eventsToWait --;
				if (eventsToWait == 0) callback(success_reply)
			});
		}
	}	
}

function db_find(findOne, table, criteria, callback) {
	if (findOne){
		table.find(criteria).toArray(function(err, result) {
	    	if (callback != null) {
	    		callback(result);
	   		}
		});
	} else {
		table.find(criteria).toArray(function(err, result) {
		    if (callback != null) {
		    	callback(result);
		    }
		});
	}
}

function db_exist(table, criteria, callback) {
	var value;
	table.findOne(criteria, function(err, result) {
		if (callback != null) {
			callback(result != null);
		}

	});
}

app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  res.render('/index.html');
});


app.post('/checkExisting', textParser, function(req, res) {
	// to replace test2 with the username
	db_exist(db.users, {user: req.body }, function(result) {
		console.log(result);
		reply = {
			flag: result
		}
		res.send(JSON.stringify(reply));
	});
});


// before register, checkExisting should be called to make sure the user name does not exist
app.post('/register', textParser, function(req, res) {
	updateDatabaseNewUser(req.body.userName, req.body.email, req.body.gestures, function(reply) {
		res.send(JSON.stringify(reply));
	});
	
});

function preVerification (username, toSendEmail, callback) {
	
	var reply = {
		success: true,
		message: "An email has been sent to your mailbox just now",
	};

	db_find(true, db.emails, {_id: username}, function(results) {
		currentTime = new Date().getTime(); // uNIX timestamp in millisecond
		if (results == null) {
			reply.success = false;
			reply.message = "No user found.";
			callback(reply)
		} else {
			if (results.gesture == null || (currentTime - results.timestamp >= email_resend_threshold_in_seconds*1000) && toSentEmail) {
				// if there's no gesture associated or ( the previous email sent is threshold minutes ago and user requested to resend )
				if (results.gesture==null || currentTime - results.timestamp >= gesture_regen_threshold_in_seconds*1000) {
					// regenerate a gesture
					gestureId = Math.floor((Math.random() * gesturePoolSize) + 1);
					sequence = Math.floor((Math.random() * 3) + 1);
				} else {
					gestureId = results.gesture;
					sequence = results.sequence;
				}

				// send email
				sendEmail(username, results.email, gestureId, sequence, function(error) {
					if (error) {
						reply.success = false;
						reply.message = "Error in sending email. Please try again";
						callback(reply)

					} else {
						// successfully send the email. Update database
						currentTime = new Date().getTime();
						db.emails.update({_id: username}, {$set: {timestamp: currentTime, gesture: gestureId, sequence: sequence}}, function (err, result) {
							if (err) {
								reply.success = false;
								reply.message = "Error in updating database. Please try again";
								callback(reply)
							} else 
								callback(reply, gestureId, sequence)
						});
					}
				});

			} else {
				reply.success = true;
				reply.message = "An email has been sent to you " + Math.floor((currentTime - results.timestamp)/1000) + "seconds ago";
				callback(reply, results.gesture, results.sequence);
			}
		}
	});
}

app.post('/startVerify', textParser, function(req, res) {

	preVerification(req.body, false, function(reply) {
		res.send(JSON.stringify(reply));
	});
});

app.post('/verify', jsonParser, function(req, res) {

	// toSendEmail, whether user wants to resend email....

	userName = req.body.id.slice(0, -1);
	toSentEmail = false;
	
	preVerification(userName, false, function(reply, gestureId, sequence) {
		if (reply.success == false) {
			/// Oh no! some error occurred.
		} else {
			if (req.body.id.slice(-1) == sequence) {
				gestureName = "predifinedGestures" + req.gestureId;
			} else {
				gestureName = user.body.id;
			}

			db_find(true, db.users, {_id: req.body.id}, function(results) {
				if (results == null) {
					res.send("no associated user");
				} else {
					training = JSON.parse(results.gesture);
					if (training.pose != (req.body.frameCount == 1)) {
						hit = 0.0;
					} else {
						hit = trainer.correlate(req.body.id, training.data, req.body.gesture);		
					}		
					percent = Math.min(parseInt(100 * hit), 100);		
					res.send("percent = " + percent);
				}		
			});
		}
	});




});
