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


var port = process.env.PORT || 4344;
console.log("Listening on port "+port);
server.listen(port);


function updateDatabase(data) {

	var imp = JSON.parse(data);
		
	var id = imp.name;
	var userName = id.slice(0, -2);	
		
		 //articles.update({foo:'bar'}, {foo: 'bar', val:'val2'}, {strict: true}, function(err) {
	db.users.update( {_id: id}, { user: userName, _id: id, gesture: data }, {upsert: true}, function(err) {
	    if (err) throw err;
	});

}


app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  res.render('/index.html');
});


app.post('/register', textParser, function(req, res) {
	console.log(trainer.fromJSON(req.body));
	updateDatabase(req.body);
	res.send("success");
});

app.post('/verify', jsonParser, function(req, res) {
	ans = trainer.recognize( req.body.gesture, req.body.frameCount);
	res.send(JSON.stringify(ans));
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
