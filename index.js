var fs = require('fs');
var util = require('./lib/util.js');
var each = require('each');

exports.getTan = function(id,key,cb){
  util.getStore(key,function(json){
    if(json[id]){
      if(json[id].used){
        cb(false);
      }else{
        json[id].used = true;
        util.updateStore(id,json[id],key);
        cb(json[id].val);
      }
    }else{
      console.log('ID unknown');
    }
  });
};
exports.resetUsed = function(cb){
  util.getStore(function(json){
    each(json)
    .on('item', function(key, value, next) {
      json[key].used = false;
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
      util.setStore(json,cb);
    });
  })
};