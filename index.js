var os = require('os')
var pfs = require('procfs-stats')
var numCpus = os.cpus().length;

module.exports = function(eventHandler,sampleTime,windowSize){
  
  windowSize = windowSize||5;
  sampleTime = sampleTime||1000;

  var total;
  var eachSample = [];
  var samples = 0;
  var last;
  var start;

  var interval =  setInterval(function(){
    pfs.cpu(function(err,data){

      var cpu = data.cpu;
      var btime = data.btime;

      // all numbers except btime are in USER_HZ which is 100ths of a second
      // to check the value of USER_HZ on your system run `getconf CLK_TCK` 
      // in your shell. It seems to always be 100ths of a second.

      if(last) {

        var diff = subtractProps(cpu,last)
        eachSample.push(diff);

        if(total) total = addProps(diff,total)
        else total = diff;

        samples++;

        if(eachSample.length > windowSize) {
          var old = eachSample.shift()
          total = subtractProps(total,old)
          samples--;
        }

    
        var cpuTime = (total.user+total.nice+total.system)/100;

        var totalTime = samples*sampleTime;

        //console.log(cpuTime,'seconds on '+numCpus+' cpus in the last ',totalTime,'ms')

        var availableTime = (totalTime*numCpus)/1000;

        //console.log('availableTime',availableTime)

        var percentUsed = (cpuTime*100/availableTime)
        if(percentUsed < 0) percentUsed = 0;

        eventHandler(percentUsed);
        //console.log('cpu is at ',percentUsed,'%')

      } else {
        start = Date.now();
      }

      last = cpu;

    })
  },sampleTime)


  return function(){
    clearInterval(interval);
  }

}



function addProps(o,o2){
  var d = {};
  _e(o,function(v,k){
    d[k] = (+v)+(+o2[k])
  })
  return d;
}

function subtractProps(o,o2){
  var d = {};
  _e(o,function(v,k){
    d[k] = (+v)-(+o2[k])
  })

  return d;
}

function _e(o,fn){
  Object.keys(o).forEach(function(k){
    fn(o[k],k)
  })
}
