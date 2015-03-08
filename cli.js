var program = require('commander');
var fs = require('fs');
var util = require('./lib/util.js');
var itan = require('./');
var chalk = require('chalk');
var prompt = require('prompt');

var schema = {
    properties: {
      password: {
        description: 'Enter your password',
        pattern: /(?=(.*[0-9])+|(.*[ !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])+)(?=(.*[a-z])+)(?=(.*[A-Z])+)[0-9a-zA-Z !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]{8,}/,
        message: 'Key must have at least 8 char, one digit or special char, lower and upper case letters',
        hidden: true,
        required: true
      }
    }
  };
prompt.message = "iTan Store".rainbow;
prompt.delimiter = " >> ".yellow;
prompt.start();
program.version('1.0.0');

program
  .usage('[options] <id>')
  .command('*')
  .description('input iTan List id to get related TAN')
  .action(function(id, options){
    prompt.get(schema, function (err, res) {
      itan.getTan(id,res.password,function(tan){
        if(tan){
          console.log(chalk.white(id) + ': ' + chalk.bgBlue.white(tan));
        }else{
          console.log(chalk.bgRed.white('Tan already used'));
        }
      });
    });
  });
program
  .command('reset')
  .action(function(){
    prompt.get(schema, function (err, res) {
      itan.resetUsed(res.password,function(err){
        if (err) throw err;
        console.log(chalk.yellow('Used attribute got reset.'));
      });
    });
  })
// Add ITan List as a JSON File
program
  .command('addlist <file ...>')
  .action(function (file) {
    if (file) {
      console.log('Add List: %s', file);
      fs.readFile(file, function (err, data) {
        if (err) throw err;
        var json = JSON.parse(data);
        prompt.get({
            properties: {
              password: {
                description: 'Enter your password',
                pattern: /(?=(.*[0-9])+|(.*[ !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])+)(?=(.*[a-z])+)(?=(.*[A-Z])+)[0-9a-zA-Z !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]{8,}/,
                message: 'Key must have at least 8 char, one digit or special char, lower and upper case letters',
                hidden: true,
                required: true
              },
              pw_again: {
                description: 'Repeat your password',
                pattern: /(?=(.*[0-9])+|(.*[ !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])+)(?=(.*[a-z])+)(?=(.*[A-Z])+)[0-9a-zA-Z !\"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~]{8,}/,
                message: 'Key must have at least 8 char, one digit or special char, lower and upper case letters',
                hidden: true,
                required: true,
                conform: function (value) {
                  var pw = prompt.history('password').value;
                  if (pw === value){
                    return true;
                  }
                  return false;
                }
              }
            }
          }, function (err, res) {
            util.newStore(json,res.password,function(err){
              if (err) throw err
              console.log('List stored');
            });
        });
      });
    }
  });

  program.parse(process.argv);

if (program.addlist){
  console.log('Unternehmensinfo for VN: %s', program.unternehmensinfo);
}
