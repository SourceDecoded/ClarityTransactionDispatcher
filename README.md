Getting Started with Clarity Transaction Dispatcher
===

[Documentation](https://sourcedecoded.github.io/ClarityTransactionDispatcher/gen/index.html)

In order to use Clarity Transaction Dispatcher there needs to be a MongoDb instance running.
[Click here](https://docs.mongodb.com/manual/installation/) to install MongoDb.

Once MongoDb is installed start the database as instructed in the link above.

Install Clarity Transaction Dispatcher with npm.
```bash
npm install clarity-transaction-dispatcher
```
The purpose of the transaction dispatcher is to be the mechanism by which data can flow and notify systems of that data flow.
Data can come from devices, database systems, apis, or user input. The dispatcher optimizes for inserts while the systems can 
optimize for queries. However the dispatcher's inserts can be made atomic and therefore slow because of life cycle methods of systems. It really is up to the developer to decide the speed at which the inserts will be. Fast and eventual consistency or slow and atomic.

We will give concrete examples in business where the
transaction dispatcher is needed, but first the principle behind the transaction dispatcher is crucial. 

Video games became more and more complex as the hardware became more advance. This advancement meant games could do more things.
With more things came more complexity. There was also a need to turn on and off different affects like shaders, reflections, etc, because of the range of quality of hardware. Game engineers saught for a pattern that would allow them the flexibility they needed as well as the speed. They discovered the "Entity Component System" or "ECS" pattern, which through the years has been refined. The most recent advances have the entities and the components just contain data, and all logic runs on the systems. The systems do not and should not know about eachother. The systems rely on the composition of components to know whether or not to act on the entity. This pattern truly changed the industry. It allowed complexity to be acheived through composition, and simplicity because systems became specialist. They only worried about one thing and did that one thing really well. 

The main difference between the transaction dispatcher and game engines is that games engine's life-cycle revolved around a 16 millisecond tick. The dispatcher however builds itself around the life-cycle of an entity, specifically, when an entity is added, updated, and removed. With these life-cycles the systems can react to changes in an efficient way. It is slightly more complicated than just three life-cycles, but that is the idea. For a full list of the life-cycles [click here](./ClarityTransactionDispatcher.html#addSystemAsync__anchor).

The structure of an entity is as follows.

```json
{
    "_id": "de34g433ddy22",
    "createdDate": Date,
    "modifiedDate": Date,
    "components": [
        {
            "type":"component-type"
            //...
        }
    ]
}
```

The entity will only have an "_id", "createdDate", "modifiedDate", and "components" property. The entity's components are just objects of varying properties and the only requirement is that they have a "type" property.

The dispatcher doesn't support complex queries because it's expecting the systems to create specialized query databases that then link back, if necessary, to the entity. Think of the dispatcher as a broker of data transfer objects. It's responsibility is storing the current state of an entity and notifying the systems of the changes done to an entity.
