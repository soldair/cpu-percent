
var test = require('tape')
var percent = require('../')
var cp = require('child_process')


test('works',function(t){

  var load = cp.spawn('node',[__dirname+'/../100.js'])
  
  var checks = 0;
  var stop = percent(function(err,percent){

    if(++checks != 2) return;

    t.ok(percent > 0,'percent '+percent+' > 0')
    stop();
    t.end()

    load.kill();

  })  

  t.ok(typeof stop === 'function','stop should be function')

})


test('per pid works',function(t){
  var checks = 0;

  var load = cp.spawn('node',[__dirname+'/../100.js'])

  var stop = percent.pid(load.pid,function(err,percent){


    if(++checks != 2) return;

    t.ok(percent > 0,'percent '+percent+' > 0')
    stop();
    t.end()

    load.kill();

  })  

  t.ok(typeof stop === 'function','stop should be function')

})



