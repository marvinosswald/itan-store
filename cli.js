#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var util = require('./lib/util.js');
var itan = require('./');
var chalk = require('chalk');
var prompt = require('prompt');
var config = require('config').get('itan');
var updateNotifier = require('update-notifier');

var pkg = require('./package.json');

updateNotifier({pkg: pkg}).notify();

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
    if(util.checkStore()){
      if(id){
        prompt.get(schema, function (err, res) {
          itan.getTan(id,res.password,function(tan,msg){
            if(tan){
              console.log(chalk.white(id) + ': ' + chalk.bgBlue.white(tan));
            }else{
              console.log(chalk.bgRed.white(msg));
            }
          });
        });
      }else{
        console.log(chalk.red('Please provide id'));
      }
    }else{
      console.log(chalk.red('No Store found'));
    }
  });
program
  .command('reset')
  .description('reset used value of the whole list')
  .action(function(){
    if(util.checkStore()){
      prompt.get(schema, function (err, res) {
        itan.resetUsed(res.password,function(err){
          if (err) {
            console.log(chalk.bgRed.white(err));
          }else{
            console.log(chalk.yellow('Used attribute got reset.'));
          }
        });
      });
    }else{
      console.log(chalk.red('No Store found'));
    }
  });
// Add ITan List as a JSON File
program
  .command('addlist')
  .description('add a Tan List to iTan')
  .option('-f --file <file>', 'Import json file')
  .option('-a --assistent', 'An Assistent to input you TAN List')
  .action(function (options) {
    if (options.assistent) {
      prompt.get([
        {
          name: 'listsize',
          description: 'List length',
          default: 100,
          type: 'number'
        }
      ],function(err,res){
        console.log(res);
        var assistent = [];
        for (var i = 0; i < res.listsize; i++){
          var schema = {
            name: 'tan_' + i,
            description: 'TAN ' + i,
            required:true,
            type: 'number'
          }
          assistent.push(schema);
        }
        console.log(assistent);
        prompt.get(assistent,function(err,list){
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
              itan.newStore(list,res.password,function(err){
                if (err) throw err
                console.log('List stored');
              });
          });
        })
      })
    }else if (program.file){
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
              itan.newStore(json,res.password,function(err){
                if (err) throw err
                console.log('List stored');
              });
          });
        });
      }
    }
  });

  program.parse(process.argv);

if (program.addlist){
  console.log('Unternehmensinfo for VN: %s', program.unternehmensinfo);
}
