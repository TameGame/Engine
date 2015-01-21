/// <reference path="Interface.ts" />
/// <reference path="PropertyManager.ts" />

module TameGame {
    "use strict";

    /**
     * Some identity information about an object
     *
     * This is sometimes useful for debugging, but is mainly an example
     * of how to declare some properties for an object
     */
    export interface IObjectDetails {
        /** A name that identifies this object */
        objectName: string;
    };
    
    export interface TameObject {
        details?: IObjectDetails;
    }
    
    var defaultObjectName = "object";

    /**
     * The type definition is used to store/retrieve these properties when
     * associated with an object 
     */
    export var ObjectDetails: TypeDefinition<IObjectDetails> = declareProperty("details", () => {
        return { objectName: defaultObjectName };
    });
}
