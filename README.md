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
They discovered the "Entity Component System" or "ECS" pattern, which through the years has been refined. The most recent advances have the entities and 
the components just contain data, and all logic runs on the systems. The systems do not and should not know about eachother. The systems rely on the
composition of components to know whether or not to act on the entity. This pattern truly changed the industry. It allowed complexity to be acheived
through composition, and simplicity because systems became specialist. They only worried about one thing and did that one thing really well. 

The main difference between the transaction dispatcher and game engines is that games engine's life-cycle revolved around a 16 millisecond tick.
The dispatcher however builds itself around the life-cycle of an entity, specifically, when an entity is added, updated, and removed. With these
life-cycles the systems can react to changes in an efficient way. It is slightly more complicated than just three life-cycles, but that is the idea. For a full list
of the life-cycles [click here](./ClarityTransactionDispatcher.html#addSystemAsync__anchor).

The structure of an entity is as follows.
* An entity has many components of any type.
* An entity has content. 

The entity's components are just objects of varying properties and the only requirement is that they have a "type" property. 
The content of an entity could be nothing, image binary, or JSON. The entity itself has no important data on it 
other than its id. It is the container, and that is it.

So an entity could have content of an image and have a component with the type "Image". The image component would have important information on it
pertaining to the image like jpg, or png. Of course this component would be maintained by 1 or more systems based on the life-cycle of entity's content
and other components. 

Components and Content can all be validated by systems. This allows systems to ensure integrity with their components. It is important to understand that 
one system may be validating and governing a component doesn't mean that its the only system to add that component to an entity. For example, there may be
to systems interested in a component of type "Image". They both have ways of uploading new images and deleting them. One system may thumbnail the image
and the other may archive them. The key is remember that other systems may not want to govern the component, but they may want to add, update and remove them.