
var records = [];

export function setUsers(usersCollection) {
  records = usersCollection;
}

export function findById(id, cb) {
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

export function findByUsername(username, cb) {
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