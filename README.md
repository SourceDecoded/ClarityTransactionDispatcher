Getting Started with Clarity Transaction Dispatcher
===

Install Clarity Transaction Dispatcher with npm.
```bash
npm install ...To be determined
```
The purpose of the transaction dispatcher is to be the mechanism by which data can flow and notify systems of that data flow.
Data can come from devices, database systems, apis, or user input. We will give concrete examples in business where the
transaction dispatcher is needed, but first the principle behind the transaction dispatcher is crucial. 

Video games became more and more complex as the hardware became more advance. This advancement meant the game could do more things.
With more things came more complexity. There was also a need to turn on and off different affects like shaders, reflections, etc, because of the
the range of quality of hardware. Game engineers saught for a pattern that would allow them the flexibility they needed as well as the speed. 
They discovered the "Component, Entity, System" pattern, which through the years has been refined. The most recent advances have the entities and 
the components just contain data, and all logic runs on the systems. The systems do not and should not no about eachother. The systems rely on the
composition of components to know whether or not to act on the entity. This pattern truly changed the industry. It allowed complexity to be acheived
through composition, and simplicity because systems became specialist. They only worried about one thing and did that one thing really well. 

The main difference between the transaction dispatcher and game engines is that games engine's life-cycle revolved around a 16 millisecond tick.
The dispatcher however builds itself around the life-cycle of an entity, specifically, when an entity is added, updated, and removed. With these
life-cycles the systems can react to changes. It is slightly more complicated than just three life-cycles, but that is the idea. For a full reference
of the life-cycles [click here](./ClarityTransactionDispatcher.html#addSystemAsync__anchor).