var each = require('each');
var fs = require('fs');
var config = require('config').get('Store');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';
var mkdirp = require("mkdirp");
var pwuid = require('pwuid');

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
  if(fs.statSync(this.getPath()).isFile()){
    fs.readFile(this.getPath(),function(err,data){
      cb(self.decryptStore(key,data));
    })
  }else{
    return false;
  }
};
exports.setStore = function(json,key,cb){
  var self = this;
  var getDirName = require("path").dirname
  mkdirp(getDirName(self.getPath()), function (err) {
    if (err) return cb(err)

    fs.writeFile(self.getPath(),self.encryptStore(key,json), function(err) {
        if(err) {
            if (cb) cb(err);
        } else {
            if (cb) cb(false);
        }
    });
  })
}
exports.encryptStore = function(key,json){
  var cipher = crypto.createCipher(algorithm,key.toString('binary'))
  var crypted = Buffer.concat([cipher.update(JSON.stringify(json)),cipher.final()]);
  return crypted;
}
exports.decryptStore = function(key,data){
  var decipher = crypto.createDecipher(algorithm,key.toString('binary'));
  var dec = Buffer.concat([decipher.update(data) , decipher.final()]);
  try{
    return JSON.parse(dec.toString('utf8'));
  }catch(err){
    return false;
  }

}
exports.checkStore = function(){
  try{
    if(fs.statSync(this.getPath()).isFile()){
      return true;
    }else{
      return false;
    }
  }catch(err){
    return false;
  }

};
exports.getPath = function(){
  if (config.get('path') === 'home'){
    return pwuid().dir + '/.itan-store/' + config.get('file');
  }else{
    return config.get('path') + '/' + config.get('file');
  }
}
