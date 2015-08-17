# cpu-percent
use procfs to return % cpu use for the whole system or a specific process

```js

var percent = require('cpu-percent')

percent(function(err,percent){
  if(err) {
    // this will continue polling and percent will be undefined.
    // call stop if you want to stop on error.
  }

  console.log(percent,'%')
})

percent.pid(process.pid,function(err,percent){
  // percent is the % of the whole system that is being used by this process
})

```

## API

- var stop = module.exports(eventBack,sampleTime,windowSize)
  - eventBack, is a function that is called for each new sample
    - eventBack(Number percent), eventBack is called with one argument. the percent cpu used over the sample size
  - sampleTime, the time in ms to poll for cpu use. default 1000
  - windowSize, the number of samples to average for the percentage. default 5

  - returns a stop function. calling stop() stops the sampling interval.

- var stop = cpuPercent.pid(pid,eventBack,sampleTime,windowSize)
  - pid the process id to watch
  - eventBack, is a function that is called for each new sample
    - eventBack(Number percent), eventBack is called with one argument. the percent cpu used over the sample size
  - sampleTime, the time in ms to poll for cpu use. default 1000
  - windowSize, the number of samples to average for the percentage. default 5

  - returns a stop function. calling stop() stops the sampling interval.
