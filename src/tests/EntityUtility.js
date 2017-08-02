import assert from "assert";
import EntityUtility from "./../EntityUtility";

// class Entity {
//     constructor() {
//         this.components = [];
//         this.components.push(
//             {
//                 type: "test"
//             },
//             {

//                 type: "test",
//                 prop: "secondTest"
//             },
//             {
//                 type: "test-2",
//                 prop: "value"
//             }
//         );
//     }
// }

// exports["EntityUtility.constructor"] = function () {
//     var entityUtility = new EntityUtility();
//     assert.equal(entityUtility.entity, null);

//     var entity = new Entity();

//     entityUtility = new EntityUtility(entity);

//     assert.equal(entityUtility.entity, entity);
// };

// exports["EntityUtility.constructor: act without setting an entity."] = function () {
//     assert.throws(() => {
//         var entityUtility = new EntityUtility();
//         entityUtility.hasComponent("test");
//     });
// };

// exports["EntityUtility.getComponent"] = function () {
//     var entity = new Entity();
//     var entityUtility = new EntityUtility(entity);

//     assert.equal(entityUtility.getComponent("test"), entity.components[0]);
// };

// exports["EntityUtility.getComponents"] = function () {
//     var entity = new Entity();
//     var entityUtility = new EntityUtility(entity);

//     var components = entityUtility.getComponents("test");

//     assert.equal(components[0], entity.components[0]);
//     assert.equal(components[1], entity.components[1]);
//     assert.equal(components.length, 2);

// };

// exports["EntityUtility.hasComponent"] = function () {
//     var entity = new Entity();
//     var entityUtility = new EntityUtility(entity);

//     assert.equal(entityUtility.hasComponent("test"), true);
// };

// exports["EntityUtility.hasTypeComposition"] = function () {
//     var entity = new Entity();
//     var entityUtility = new EntityUtility(entity);

//     var result = entityUtility.hasTypeComposition(["test", "test-2"]);

//     assert.equal(result, true);
// }; 
