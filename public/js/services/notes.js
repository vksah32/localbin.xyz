angular.module('noteService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Notes', ['$http',function($http) {
		return {
			get : function(noteData) {
				return $http.get('/api/notes/'+noteData.loc);
			},
			create : function(noteData) {
				return $http.post('/api/notes', noteData);
			},
			update : function(id,noteData){
				return $http.put('/api/notes/'+id, noteData);
			},
			delete : function(id) {
				return $http.delete('/api/notes/' + id);
			},
			deleteAll: function(){
				return $http.get('/api/deleteAll');
			}
		}
	}]);