var os = require('os')
var pfs = require('procfs-stats')
var numCpus = os.cpus().length;



module.exports = function(eventHandler,sampleTime,windowSize){
  return sample(pfs.cpu,eventHandler,sampleTime,windowSize)
}

// track the cpu use of a specific pid
module.exports.pid = function(pid,eventHandler,sampleTime,windowSize){
  var data = pfs(pid)
  return sample(function(cb){
    data.stat(function(err,stat){
      if(err) return cb(err)

      cb(false,{
        cpu:{
          user:+stat.utime,
          system:+stat.stime,
          nice:0 // all utime is nice if stat.nice so it's not very important to distiguish here
        }
      })
    })
  },eventHandler,sampleTime,windowSize)
}
  
function sample(getCpuData,eventHandler,sampleTime,windowSize){
  windowSize = windowSize||5;
  sampleTime = sampleTime||1000;

  var total;
  var eachSample = [];
  var sampleTimes = [];
  var samples = 0;
  var last;
  var start;

  var interval =  setInterval(function(){
    getCpuData(function(err,data){

      // it's ok to miss some samples. but this should do better.
      // for general cpu this shouldnt ever error but if the pid is not in procfs it will error forever if the pid exits.

      // :/ event back with err as second arg... so bad.
      // this will continue polling after an error.
      if(err) return eventHandler(err);

      var cpu = data.cpu;
      cpu._start = Date.now();

      // all numbers except btime are in USER_HZ which is 100ths of a second
      // to check the value of USER_HZ on your system run `getconf CLK_TCK` 
      // in your shell. It seems to always be 100ths of a second.

      if(last) {

        var diff = subtractProps(cpu,last)
        eachSample.push(diff);
        sampleTimes.push(last._start)

        if(total) total = addProps(diff,total)
        else total = diff;

        samples++;

        if(eachSample.length > windowSize) {
          var old = eachSample.shift()
          sampleTimes.shift();
          total = subtractProps(total,old)
          samples--;
        }
    
        var cpuTime = (total.user+total.nice+total.system)/100;

        var totalTime = cpu._start-sampleTimes[0]

        //console.log(cpuTime,'seconds on '+numCpus+' cpus in the last ',totalTime,'ms')

        var availableTime = (totalTime*numCpus)/1000;

        //console.log('availableTime',availableTime)

        var percentUsed = (cpuTime*100/availableTime)
        if(percentUsed < 0) percentUsed = 0;

        eventHandler(false,percentUsed);
        //console.log('cpu is at ',percentUsed,'%')

      } else {
        start = Date.now();
      }

      last = cpu;

    })
  },sampleTime)


  var stop = function(){

    clearInterval(interval);
  }

  stop.unref = function(){
    interval.unref()
  }

  return stop
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
