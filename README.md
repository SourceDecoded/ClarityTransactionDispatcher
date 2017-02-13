Getting Started with Clarity Transaction Dispatcher
===

Install Clarity Transaction Dispatcher with npm.
```bash
npm install ...To be determined
```

### Setting Up
Now that the dispatcher is install create a file title "dispatcher.js". 
Inside "dispatcher.js" set up the services and the systems you need. 

Here is an example of "dispatcher.js".
```js
var ClarityTransactionDispatcher = require("clarity-transaction-dispatcher").ClarityTransactionDispatcher;

var LoggerSystem = function(){
    
};

var logger = new LoggerSystem();
var dispatcher = new ClarityTransactionDispatcher();

dispatcher.addSystemAsync(logger);


```
