
angular.module('noteController', [])
	.directive('file', function() {
  return {
    restrict: 'AE',
    scope: {
      file: '@'
    },
    link: function(scope, el, attrs){
      el.bind('change', function(event){
        var files = event.target.files;
        var file = files[0];
        scope.file = file;
        scope.$parent.file = file;
        scope.$apply();
      });
    }
  };
})

	// inject the Note service factory into our controller
	.controller('mainController', ['$scope','$http','Notes','Upload', function($scope, $http,  Notes,$timeout,Upload,$interval) {
		$scope.formData = {};
		$scope.loading = true;
		var curLocation = null;//can also act as session id
		var session_notes = [];
		var total_notes_num = 0;
		var bucket = null;
		$http.get( "/api/cred/").success(function( data ) {
			AWS.config.update({ accessKeyId: data.access_key, secretAccessKey: data.secret_key });
			AWS.config.region = 'us-east-1';
			bucket = new AWS.S3({ params: { Bucket: 'localbin.xyz' } });
		}	);
		

		if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(function(currentPos){
		        	curLocation = currentPos;
		        	var loco = currentPos.coords.latitude + ":"+ currentPos.coords.longitude
		        	console.log(loco)
					Notes.get({loc:loco})
						.success(function(data) {
							//console.log("testing")
							session_notes = data.notes;
							total_notes_num = data.total_notes_num;
							// session_notes = data;
							$scope.notes = session_notes;
							// for (i = 0; i < session_notes.length; i++){
							// 	if (isUrl(session_notes[i].text)){
							// 		if (document.getElementById(session_notes[i].text)){
							// 			document.getElementById(session_notes[i].text).innerHTML = "<a href = {{session_notes[i].text}} > haha </a>";
							// 		$compile( document.getElementById(ssession_notes[i].text) )($scope);
							// 		}
									

							// 	}
							// }
							// console.log(session_notes)
							$scope.loading = false;
						});
		        });
		    }    
		        	
 
	 // 	$scope.creds = {
		//   bucket: 'uploadforpeanotes',
		//   access_key: 'AKIAJTB7GYSQUZYVPYAQ',
		//   secret_key: '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'
		// }
		
		$scope.uploadFiles = function() {
		  // Configure The S3 Object 
		  //$scope.file = file
		  // $http.get( "/api/cred/").success(function( data ) {
		  		   
		    
		 
		  	if($scope.file) {
		  		if($scope.file.size > 10585760) {
				  alert('Sorry, file size must be under 10MB');
				  return false;
				}

				if (total_notes_num > 15){
					console.log($scope.notes.length)
					clearBucketIfNecessary
					alert('Sorry, server too busy, try again');
				  return false;

				}
			    var params = { Key: $scope.file.name,ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };
			 
			    bucket.putObject(params, function(err, data) {
			      if(err) {
			        // There Was An Error With Your S3 Config
			        alert(err.message);
			        return false;
			      }
			      else {
			        // Success!
			        console.log("success")
			        var file_name_field = angular.element(document.querySelector('#file-upload'));
			         file_name_field.val('');

			        var file_url = "https://s3.amazonaws.com/localbin.xyz/"+ encodeURI($scope.file.name);
				        post_note({text:file_url});
			      }
			    })
			    .on('httpUploadProgress',function(progress) {
			          // Log Progress Information
			         
			          console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
			        });
			  }
			  else {
			    // No File Selected
			    alert('No File Selected');
			  }
			  
			};	
			 

		//getlocation
		$scope.getLocation = function(id, textData, update){
			// console.log("getting location")
			if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(function(position){
		        	$scope.updateNote(id,{text:{text:textData},location: {latitude:position.coords.latitude, longitude: position.coords.longitude}});
		        });
		    }

		};	


		var isUrl = function(s) {
		   var regexp = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i');


		   return regexp.test(s);


		}


		// $scope.showPositionOnMap(position){
		// 	 var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

  //               var mapOptions = {
  //               zoom: 15,
  //               center: coords,
  //               mapTypeControl: true,
  //               mapTypeId: google.maps.MapTypeId.ROADMAP
  //           };


		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createNote = function() {
			post_note($scope.formData);
		};

		var post_note = function(textData){
			if (total_notes_num > 10){
				alert("server too busy, refresh the page");
				$scope.deleteAll();
				return;
			}


			if (textData.text != undefined) {
				$scope.loading = true;
				// input = $scope.formData.text;
				var last_one = {_id:'', _v:0, lon:'',lat:'',text:$scope.formData.text}
				session_notes.push(last_one);
				$scope.notes= session_notes
				$scope.loading = false;
				console.log($scope.formData)
				// console.log($scope.formData.text)
				// call the create function from our service (returns a promise object)
				Notes.create({text:textData, location: {latitude: '', longitude: ''}})

					// if successful creation, call our get function to get all the new notes
					.success(function(data) {
						total_notes_num = data.length;
						var last_data = data[data.length-1];
						// console.log("last data")
						// console.log(last_data)
						var id = last_data._id;
						// console.log("after adding")
						// console.log(session_notes)
						// $scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						//$scope.notes = data; // assign our new list of notes
						// session_notes = session_notes.concat(last_data)
						// // console.log("after concat")
						// // console.log(session_notes)
						session_notes[session_notes.length-1] = last_data;
						// $scope.notes= session_notes
						$scope.getLocation(id,last_data.text);
						//$setTimeout(function() {$scope.delete_note(last_data);}, 30000);
						// $scope.delete_note(last_data);
					});
			}

		}

		$scope.updateNote = function(id, data){
			// console.log("updating"+ id)
			// console.log(data)
			Notes.update(id,data)
				.success(function(data){
					$scope.notes = session_notes;
					//window.location.reload();

			});		
		};

		$scope.deleteAll = function(){

			Notes.deleteAll();
			$scope.clearBucket();

		}

		$scope.clearBucket = function(){

			console.log("now deleting bucket")

				bucket.listObjects(function (err, data) {
		            if (err) {
		                console.log("error listing bucket objects "+err);
		                return;
		            }
		            var items = data.Contents;
		            for (var i = 0; i < items.length; i += 1) {
		                var deleteParams = {Key: items[i].Key};
		                bucket.deleteObject( deleteParams, function(err, data){
		                	// console.log(deleteParams);
		                });
		                
		            }
		        });
			
		}

		// DELETE ==================================================================
		// delete a note after checking it
		$scope.deleteNote = function(deleted_note) {
			$scope.loading = true;

			Notes.delete(deleted_note._id)
				// if successful creation, call our get function to get all the new notes
				.success(function(data) {
					$scope.loading = false;
					session_notes.splice(session_notes.indexOf(deleted_note),1);
					$scope.notes = session_notes; // assign our new list of notes
				});
		};
	}]);