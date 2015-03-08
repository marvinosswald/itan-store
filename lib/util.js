var each = require('each');
var fs = require('fs');
var config = require('config').get('Store');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

exports.newStore = function(json,key,cb){
  var self = this;
  var store = {};
  each(json)
  .on('item', function(key, value, next) {
    store[key] = {
      val: value,
      used: false
    }
    next();
  })
  .on('error', function(err) {
    if (cb) {
      cb(err);
    }else{
      console.error(err);
    };
  })
  .on('end', function(){
    self.setStore(store,key,cb);
  });
};
exports.updateStore = function(key,val,pass){
  var self = this;
  this.getStore(pass,function(json){
    json[key] = val;
    self.setStore(json,pass);
  })
};
exports.getStore = function(key,cb){
  var self = this;
  if(fs.statSync(config.get('path') + config.get('file')).isFile()){
    fs.readFile(config.get('path') + config.get('file'),function(err,data){
      cb(self.decryptStore(key,data));
    })
  }
};
exports.setStore = function(json,key,cb){
  fs.writeFile(config.get('path') + config.get('file'),this.encryptStore(key,json), function(err) {
      if(err) {
          if (cb) cb(err);
      } else {
          if (cb) cb(false);
      }
  });
}
exports.encryptStore = function(key,json){
  var cipher = crypto.createCipher(algorithm,key.toString('binary'))
  var crypted = Buffer.concat([cipher.update(JSON.stringify(json)),cipher.final()]);
  return crypted;
}
exports.decryptStore = function(key,data){
  var decipher = crypto.createDecipher(algorithm,key.toString('binary'));
  var dec = Buffer.concat([decipher.update(data) , decipher.final()]);
  return JSON.parse(dec.toString('utf8'));
}
