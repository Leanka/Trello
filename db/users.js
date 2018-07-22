import * as tools from "../js/commonTools.js";

var records = [];


exports.setUsers = function(usersCollection) {
   records = usersCollection;
}

exports.findById = function(id, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record._key === id) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record._username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}