var Note = require('./models/note');
var geoip = require('geoip-lite');
// var ip_ad = null;


function getNotes(loc,res){
	Note.find(function(err, notes) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
            
            //res.json(notes); // return all notes in JSON format
            if (loc == null){
                res.json(notes);
            } else{
                console.log("before localing")
                console.log(notes)
                res.json(findLocalNotes(loc,notes));

            }
            
		});
    // checkSize();
};

// function distance(lat1, lon1, lat2, lon2) {
//           var p = 0.017453292519943295;    // Math.PI / 180
//           var c = Math.cos;
//           var a = 0.5 - c((lat2 - lat1) * p)/2 + 
//                   c(lat1 * p) * c(lat2 * p) * 
//                   (1 - c((lon2 - lon1) * p))/2;

//           return 12742 * Math.asin(Math.sqrt(a))*1000; // 2 * R; R = 6371 km
// };

 function distance(lat1, lon1, lat2, lon2) 
    {
        console.log(lat1+ lon1+ lat2,+lon2)
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);



      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d*1000;
    }

 function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }   




function isLocal(loc,note){
    var temp = ""; 
    var loc2 = loc.split(":")  

    var d = distance(note.lat,note.lon, loc2[0], loc2[1]);
    console.log("calculating distance" + d);
    if (d < 200){
        return true;
    }
    return false;

};

function findLocalNotes(loc, all_notes){
    var temp  = [];
    for (var i = 0; i < all_notes.length; i++) {
        if (isLocal(loc,all_notes[i])){
            temp.push(all_notes[i])
        }   
    };
    return {notes: temp, total_notes_num: all_notes.length} ;
    // return temp;

}

function checkSize(){
    console.log("checkSize")
    Note.count(function(err, c){
            if (c > 3){
                Note.find(function(err,result){
                    console.log("getting all notes")
                    for (var i = 0; i < result.length-1; i++) {
                        // if((new Date().getTime()-(10*60*1000))>result[i]._id.getTimestamp().getTime()){
                            Note.remove({
                                _id:result[i]._id
                            },function(err,note){
                                console.log("deleting ")
                                // console.log(note)

                            })
                        // }
                    };
                });
            }

        });
};


module.exports = function(app) {

	// api ---------------------------------------------------------------------
	// get all notes
	app.get('/api/notes/:loc', function(req, res) {
  //       if (ip_ad === null){
	 //       ip_ad = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress;

		// }q
        //alert("jajaj");

		// use mongoose to get all notes in the database

		getNotes(req.params.loc,res);
	});

    app.get('/api/cred/', function(req,res){
        return res.json({ access_key:  'AKIAJEQCH7FHDXWQT3YQ', secret_key: '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' });
    })

	// create note and send back all notes after creation
	app.post('/api/notes', function(req, res) {
		//var ip_ad = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress;
		//var geo = geoip.lookup(ip_ad);
		console.log(req)
        //console.log("here hahah");
		
		// create a note, information comes from AJAX request from Angular
		Note.create({
			text : req.body.text["text"],
			lat : ""+req.body.location["latitude"],
			lon : ""+req.body.location["longitude"],
			done : false
		}, function(err, note) {
			if (err)
				res.send(err);

			// get and return all the notes after you create another
			getNotes(null,res);

		});


	});



	app.put('/api/notes/:note_id', function(req,res){
		Note.findById(req.params.note_id, function(err, Note) {

            if (err)
                res.send(err);
            if(Note != null){ //what happens here is that sometimes, when lots of notes are being added, they cross the count threshold
                //and start getting deleted, however, although deleted, location function for the latest nodes mightbe be running in the background resulting
                ////in system crash

            
                Note.text = req.body.text["text"];  // update the note info
                Note.lat = req.body.location["latitude"];
                Note.lon = req.body.location["longitude"];

                // save the note
                Note.save(function(err) {
                    if (err)
                        res.send(err);

                    getNotes(null,res);
                });
            }    

        });
	})

	// delete a note
	app.delete('/api/notes/:note_id', function(req, res) {
		Note.remove({
			_id : req.params.note_id
		}, function(err, note) {
			if (err)
				res.send(err);

			getNotes(null,res);
		});
	});

    app.get('/api/deleteAll', function(req,res){
        // Note.count(function(err, c){
            // if (c > 3){
                Note.find(function(err,result){
                    console.log("getting all notes")
                    for (var i = 0; i < result.length-1; i++) {
                        // if((new Date().getTime()-(10*60*1000))>result[i]._id.getTimestamp().getTime()){
                            Note.remove({
                                _id:result[i]._id
                            },function(err,note){
                                console.log("deleting ")
                                // console.log(note)

                            })
                        // }
                    };
                });
                res.json({message:"ok"});
            // }

        // }
        // );

    })

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};
