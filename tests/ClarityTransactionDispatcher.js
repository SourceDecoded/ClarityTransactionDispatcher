var assert = require("assert");
var ClarityTransactionDispatcher = require("./../library/ClarityTransactionDispatcher").default;

exports["ClarityTransactionDispatcher: Successfully invoking disposeSystemAsync."] = function(){
    var calledDispose = false;

    var dispatcher = new ClarityTransactionDispatcher({
        databaseUrl: "",
        MongoClient: {}
    });

    var system = {
        disposeSystemAsync: function(){
            calledDispose = true;
        }
    };

    dispatcher.addSystemAsync(system).then(()=>{
        return dispatcher.disposeSystemAsync(system);
    }).then(()=>{
        assert.equal(calledDispose, true);
    }).catch((error)=>{
        assert.fail(error);
    });
};

exports["ClarityTransactionDispatcher: Error out with promise when invoking disposeSystemAsync."] = function(){
    var calledDispose = false;

    var dispatcher = new ClarityTransactionDispatcher({
        databaseUrl: "",
        MongoClient: {}
    });

    var system = {
        disposeSystemAsync: function(){
            calledDispose = true;
            return Promise.reject(new Error("BAD"));
        }
    };

    dispatcher.addSystemAsync(system).then(()=>{
        return dispatcher.disposeSystemAsync(system);
    }).then(()=>{
        assert.fail();
    }).catch((error)=>{
        assert.equal(calledDispose, true);
    });
};