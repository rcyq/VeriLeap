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


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'verileap@gmail.com',
        pass: 'cs3235steps7'
    }
});



var port = process.env.PORT || 4344;
console.log("Listening on port "+port);
server.listen(port);


function sendEmail(username, email, id) {

	var html = "Dear " + username + ", <br/>"
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
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);

	});	

}

sendEmail("Pengran", "zhaopengran@gmail.com", 1);


function updateDatabase(data) {

	var imp = JSON.parse(data);
		
	var id = imp.name;
	var userName = id.slice(0, -1);	
	
	db.users.update( {_id: id}, { user: userName, _id: id, gesture: data }, {upsert: true}, function(err) {
	    if (err) throw err;
	});

}

function db_find(criteria, callback) {
	db.users.find(criteria).toArray(function(err, result) {
	    //console.log('Band members of Road Crew');
	    //console.log(result[0].members);
	    if (callback != null) {
	    	callback(result);
	    }
	});
}

function db_exist(criteria, callback) {
	var value;
	db.users.findOne(criteria, function(err, result) {
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
	db_exist({user: "test2" }, function(result) {
		console.log(result);
		res.send(result);
	});
});


app.post('/register', textParser, function(req, res) {
	//console.log(trainer.fromJSON(req.body));
	updateDatabase(req.body);
	res.send("success");
});


app.post('/verify', jsonParser, function(req, res) {
	db_find({_id: req.body.id}, function(results) {
		if (results.length == 0) {
			res.send("no associated user");
		} else {
			training = JSON.parse(results[0].gesture);
			if (training.pose != (req.body.frameCount == 1)) {
				hit = 0.0;
			} else {
				hit = trainer.correlate(req.body.id, training.data, req.body.gesture);		
			}		
			percent = Math.min(parseInt(100 * hit), 100);		
			res.send("percent = " + percent);
		}		
	});
});




/*
// assume always 5 fingers
function extractFeatures(frames) {
	result = {};
	
	start = parseInt(frames.length/6);
	end = parseInt(frames.length - start);

	for (i = 0; i<5; i++) {
		result["f" + i + "_len"] = 0;
		result["f" + i + "_width"] = 0;
		for (var j = 0; j < 4; j++)
			result["f" + i + "_seg_"+j] = 0;
	}
//	result["palm_width"] = 0;

	effectiveFrameNumber = 0;

	for (frameIndex = start; frameIndex <= end; frameIndex ++ ) {

		entry = frames[frameIndex];
		fingers = entry.fingers;
		if (entry.confidence <= 0.9) continue;
		effectiveFrameNumber ++;
		t = 0;
		for (var i in fingers) {
			if (fingers.hasOwnProperty(i)) {
				eachFinger = fingers[i];
				if (t ==0) {
					console.log(frameIndex + " " + eachFinger.length);
					t = 1;
				}
				result["f" + i + "_len"] += eachFinger.length;
				result["f" + i + "_width"] += eachFinger.width;
				for (var j = 0; j < 4; j++)
					result["f" + i + "_seg_"+j] += eachFinger.segments[j];
			}
		}
	//	result["palm_width"] += entry.palmWidth;
	}



	console.log(effectiveFrameNumber + "out of " + (end-start+1));

	for (i = 0; i<5; i++) {
		result["f" + i + "_len"] /= effectiveFrameNumber;
		result["f" + i + "_width"] /= effectiveFrameNumber;
		for (var j = 0; j < 4; j++)
			result["f" + i + "_seg_"+j] /= effectiveFrameNumber;
	}
	//result["palm_width"] /= effectiveFrameNumber;

	return result;

}

function readExistingEntries(callback) {
	fs.readFile(FILENAME, 'utf8', function(err, data) {
		if (err) {
			// file not exist
			if (callback) callback(null);
		} else {
			if (callback) callback(JSON.parse(data));
		}
	});
}

function addPerson(entry) {

	var rf = new RandomForestClassifier({
	    n_estimators: 20
	});

	data = readExistingEntries();
	data.push(entry);
	writeNewEntryToFile();

	rf.fit(data, null, "person", function(err, trees){
	  console.log(JSON.stringify(trees, null, 4));
	});

	return rf;
}

app.post('/register', jsonParser, function(req, res) {


});

app.post('/upload', jsonParser, function (req, res) {
	//console.log(req.body);

	entry = extractFeatures(req.body)


	readExistingEntries(function(allEntries) {
		if (allEntries == null) {
			allEntries = [];
			personIndex = 0;
		} else {
			personIndex = allEntries.length;
		}
		//entry['person'] = "Ryan";
		//allEntries.push(entry);


		fs.writeFile(FILENAME, JSON.stringify(allEntries), function(err) {
			if (err) console.log(err);
		});	

		var rf = new RandomForestClassifier({
	    	n_estimators: 10
		});

		rf.fit(allEntries, null, "person", function(err, trees){
		  //console.log(JSON.stringify(trees, null, 4));
		  console.log("fit_tree");
		  var pred = rf.predict([entry], trees);
		  console.log("prediction results" + pred);
		});


	});

	res.send(entry);
});
*/
