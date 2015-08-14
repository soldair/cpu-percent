
var test = require('tape')
var percent = require('../')

test('works',function(t){
  
  var stop = percent(function(percent){
    t.ok(percent > 0,'percent > 0')
    stop();
    t.end()
  })  

  t.ok(typeof stop === 'function','stop should be function')

})



