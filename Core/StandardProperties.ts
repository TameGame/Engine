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
        /** A name that identifies this object */
        objectName: string;
        
        /** 
         * The behaviour classes that this should inherit from.
         *
         * This specifies what is returned for the default behaviour of this object. For any given
         * behaviour defined in the behaviour manager, the behaviour that will be used will be the
         * first one in the list that has a concrete definition. (See BehaviorManager.ts for more
         * details)
         */
        behaviorClass: string[];
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
        return { objectName: defaultObjectName, behaviorClass: [] };
    });
}
