# cpu-percent
use procfs to return % cpu use for the whole system

```js

var percent = require('cpu-percent')

percent(function(percent){
  console.log(percent,'%')
})

``

## API

- var stop = module.exports(eventBack,sampleTime,windowSize)
  - eventBack, is a function that is called for each new sample
    - eventBack(Number percent), eventBack is called with one argument. the percent cpu used over the sample size
  - sampleTime, the time in ms to poll for cpu use. default 1000
  - windowSize, the number of samples to average for the percentage. default 5

  - returns a stop function. calling stop() stops the sampling interval.

 
