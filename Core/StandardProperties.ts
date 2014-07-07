/// <reference path="Interface.ts" />

module TameGame {
    //
    // Some identity information about an object
    //
    // This is sometimes useful for debugging, but is mainly an example
    // of how to declare some properties for an object
    //
    export interface IObjectDetails {
        objectName: string;
    };


    //
    // The type definition is used to store/retrieve these properties when
    // associated with an object 
    //
    export var ObjectDetails: TypeDefinition<IObjectDetails> = {
        name: "ObjectDetails",
        createDefault: () => {
            return {
                objectName: "object"
            }
        }
    };

    // Test: getting a property from an object
    var x: TameObject;
    var y = x.get(ObjectDetails).objectName;
}
