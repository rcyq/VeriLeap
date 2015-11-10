var express = require('express');
var app = express();
var server = require('http').Server(app);
var https = require('https');
var io = require('socket.io')(server);
var fs = require('fs');
var privateKey  = fs.readFileSync('ssl/verileap-key.pem');
var certificate = fs.readFileSync('ssl/verileap-cert.pem');
var credentials = {key: privateKey, cert: certificate};
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({limit: '5mb'})
var textParser = bodyParser.text()

var trainerFile = require("leaptrainer.js");
var trainer = new trainerFile.LeapTrainer.Controller({controller:1});

var db = require('mongoskin').db('mongodb://localhost:27017/leap', {username: 'verileap', password: 'cs3235steps7db'}); 
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
var gids = ["s1", "s2", "s3"];
var sequenceTrans = ["1st", "2nd", "3rd"];
var correlate_threshold_normal = 90;
var correlate_threshold_random = 70;


var port = process.env.PORT || 4344;
console.log("Listening on port "+port);
server.listen(port);

https.createServer(credentials, app, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);
console.log("HTTPS: Listening on port 8000");



function sendEmail(username, email, id, sequence, callback) {

	var html = "Dear " + username + ", <br/>"
			//+"<p><b> Replace which one??  No." + sequence +"</p></b>"
			+"<p>You are about to login using VeriLeap verification software. Please replace your"
			+ "<b> " + sequenceTrans[sequence-1] + " </b> password gesture with our One-Time-Password (OTP)"
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
app.post('/register', jsonParser, function(req, res) {

	userName = req.body.userName;
	email = req.body.email;
	parsedGestures = req.body.gestures;
	
	var eventsToWait = 4;
	var err_reply = {
		flag: false,
		msg: "Error in adding to database"
	}
	var success_reply = {
		flag: true,
		msg: 'Successfully registered "' + userName +'"'
	}
	// update email address
	db_exist(db.users, {user: userName }, function(result) {
		if (result == false) {  // username doesn't exist

			db.emails.update( {_id:userName}, {_id: userName, email: email, gesture: null, sequence:null, timestamp: null},  {upsert: true}, function(err) {
				eventsToWait --;
				if (err && eventsToWait >= 0) {
					eventsToWait = -1;
					res.send(JSON.stringify(err_reply));
				} else 
					if (eventsToWait == 0) res.send(JSON.stringify(success_reply));
			});
			
			// update gestures
			console.log(gids);
			for (i=0; i<3; i++) {
				gid = gids[i];
				console.log("i" + i);
				console.log("gid" + gid);
		    	gesture = JSON.stringify(parsedGestures[gid]);
		    	console.log("gesture" + gesture);
				db.users.update( {_id: userName+gid}, { user: userName, _id: userName+gid, gesture: gesture }, {upsert: true}, function(err) {
					eventsToWait --;
					if (err && eventsToWait >= 0) {
						eventsToWait = -1;
						res.send(JSON.stringify(err_reply));
					} else 
						if (eventsToWait == 0) res.send(JSON.stringify(success_reply));
				});
			}	

		} else {
			err_reply.msg = "Username exists";
			res.send(JSON.stringify(err_reply));
		}
	});

});

function preVerification (username, callback) {
	
	var replies = [
		{flag: true,
		 msg: "An email has been sent",
		},
		{
		flag: false,
		msg: "No user found",
		},
		{
		flag: false,
		msg: "Error in sending email. Please try again",
		},
		{
		flag: false,
		msg: "Error in updating database. Please try again",
		},
		];


	db_find(true, db.emails, {_id: username}, function(results) {
		currentTime = new Date().getTime(); // uNIX timestamp in millisecond
		console.log(results);
		if (results.length == 0) {
			callback(replies[1]);
		} else {
			results = results[0];
			if (results.gesture == null || (currentTime - results.timestamp >= email_resend_threshold_in_seconds*1000)) {
				// if there's no gesture associated or ( the previous email sent is threshold minutes ago )
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
						callback(replies[2])

					} else {
						// successfully send the email. Update database
						currentTime = new Date().getTime();
						db.emails.update({_id: username}, {$set: {timestamp: currentTime, gesture: gestureId, sequence: sequence}}, function (err, result) {
							if (err) {
								callback(replies[3])
							} else 
								replies[0].msg += " just now.";
								callback(replies[0], gestureId, sequence)
						});
					}
				});

			} else {
				elapse = Math.floor((currentTime - results.timestamp)/1000);
				replies[0].msg +=  " " + elapse + " seconds ago. Retry after " + (email_resend_threshold_in_seconds-elapse) + " seconds.";
				callback(replies[0], results.gesture, results.sequence);
			}
		}
	});
}

app.post('/startVerify', textParser, function(req, res) {

	preVerification(req.body, function(reply, gesture, sequence) {
		res.send(JSON.stringify(reply));
	});
});

app.post('/verify', jsonParser, function(req, res) {

	username = req.body.userName;
	parsedGestures = req.body.gestures;

	console.log(parsedGestures);

	db_find(true, db.emails, {_id: username}, function(results) {
		currentTime = new Date().getTime(); // uNIX timestamp in millisecond
		console.log(results);
		if (results.length == 0) {
			// no such user
		} else {
			login = true;
			results = results[0];
			gestureId = result.gesture;
			randomGid = results.sequence;
			db_find(true, db.users, {_id: "PREDEFINED"+randomGid}, function(randomTrainingGestures) {

				//randomTrainingGesture = randomTrainingGestures[0];
				randomGid = -1;
				db_find(false, db.users, {user: username}, function(trainingGetures) {
					for (i=0; i<3; i++) {
						if (randomGid == i)	{
							//gestureToCompareJson = randomTrainingGesture;
						} else {
							// in case the data are not in order
							for (j in trainingGetures) {
								if (trainingGetures[j]._id == username + gids[i]) {
									gestureToCompareJson = trainingGetures[j];
									break;
								}	
							}
						}
						gestureToCompare = (JSON.parse(gestureToCompareJson)).data;
						hit = trainer.correlate(username, parsedGestures[gids[i]], gestureToCompare);	
						percent = Math.min(parseInt(100 * hit), 100);		
						console.log(percent);		
						if (percent < correlate_threshold_random) login = false;
						else if (percent < correlate_threshold_normal && randomGid != i) login = false;
						if (login == false) {
							break;
						}
					}
					if (login == false) {
						res.send("false");
						return;
					}
					// update database. reset random gesture etc.
					db.emails.update( {_id:userName}, {_id: userName, email: results.email, gesture: null, sequence:null, timestamp: null},  {upsert: true}, function(err) {
						res.send("true");
					});

				}) // end of db find;
			})
		}
	});
});
