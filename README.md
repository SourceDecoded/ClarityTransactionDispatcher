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
    this.name = "Logger";
    this.guid = "eaef6f3b-f9eb-4aac-b5ba-314e53da87d2";
};

LoggerSystem.prototype.getName = function(){
    return this.name;
};

LoggerSystem.prototype.getGuid = function(){
    return this.guid;
};

LoggerSystem.prototype.entityAddedAsync = function(entity){};

LoggerSystem.prototype.entityUpdatedAsync = function(entity){};

LoggerSystem.prototype.entityRemovedAsync = function(entity){};


var logger = new LoggerSystem();
var dispatcher = new ClarityTransactionDispatcher();

dispatcher.addSystemAsync(logger);


```
