var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;

var FILENAME = "data.txt";
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({limit: '5mb'})

app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  res.render('/index.html');
});


// assume always 5 fingers
function extractFeatures(frames) {
	result = {};
	
	start = parseInt(frames.length/6);
	end = parseInt(frames.length - start);

	for (i = 0; i<5; i++) {
		result["finger" + i + "_len"] = 0;
		result["finger" + i + "_width"] = 0;
	}

	effectiveFrameNumber = 0;

	for (frameIndex = start; frameIndex <= end; frameIndex ++ ) {

		entry = frames[frameIndex];
		fingers = entry.fingers;
		if (entry.confidence <= 0.9) continue;
		effectiveFrameNumber ++;
		for (var i in fingers) {
			if (fingers.hasOwnProperty(i)) {
				eachFinger = fingers[i];
				//console.log(eachFinger.length);
				result["finger" + i + "_len"] += eachFinger.length;
				result["finger" + i + "_width"] += eachFinger.width;
			}
		}

	}



	console.log(effectiveFrameNumber + "out of " + (end-start+1));

	for (i = 0; i<5; i++) {
		result["finger" + i + "_len"] /= effectiveFrameNumber;
		result["finger" + i + "_width"] /= effectiveFrameNumber;
	}

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
		//entry['person'] = "zhian";
		//allEntries.push(entry);


		fs.writeFile(FILENAME, JSON.stringify(allEntries), function(err) {
			if (err) console.log(err);
		});	

		var rf = new RandomForestClassifier({
	    	n_estimators: 20
		});

		rf.fit(allEntries, null, "person", function(err, trees){
		  //console.log(JSON.stringify(trees, null, 4));
		  var pred = rf.predict([entry], trees);
		  console.log("prediction results" + pred);
		});


	});




	// say it's recording
	// person = "a";
	// entry['person'] = person;
	// rf = addPerson(entry);
	// writeClassifierToFile(rf);

	// // for prediction
	// // build tree from rf
	// rf = buildClassifierFromFile();
	// trees = getTreesFromFile();
	// data = [entry];
	// rf.predict(data, trees)



	
	res.send(entry);
});

var port = process.env.PORT || 4344;
console.log("Listening on port "+port);
server.listen(port);