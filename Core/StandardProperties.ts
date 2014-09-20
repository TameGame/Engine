/// <reference path="Interface.ts" />
/// <reference path="PropertyManager.ts" />

module TameGame {
    /**
     * Some identity information about an object
     *
     * This is sometimes useful for debugging, but is mainly an example
     * of how to declare some properties for an object
     */
    export interface IObjectDetails {
        objectName: string;
    };
    
    export interface TameObject {
        details?: IObjectDetails;
    }

    /**
     * The type definition is used to store/retrieve these properties when
     * associated with an object 
     */
    export var ObjectDetails: TypeDefinition<IObjectDetails> = declareProperty("details", () => {
        return { objectName: "object" };
    });
}
