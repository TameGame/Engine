/// <reference path="Interface.ts"/>

module TameGame {
    /**
     * Information stored for a property
     */
    interface PropertyDefinition {
        createDefault: () => any;
    }
    
    // The set of properties that will be managed by a property manager
    var globalProperties: { [propertyName: string]: PropertyDefinition };

    /**
     * Declares a new property that can be used in objects managed by the property manager
     */
    export function declareProperty<TPropertyType>(propertyName: string, createDefault: () => TPropertyType): TypeDefinition<TPropertyType> {
        // Add to the list of known properties
        globalProperties[propertyName] = {
            createDefault: createDefault
        };

        // Create a type definition for this property
        return {
            name: createTypeName(),
            createDefault: createDefault
        };
    }

    /**
     * The property manager is a class that manages 'watchable' properties on an object: that is, those
     * that can be watched via IWatchable.
     */
    export class PropertyManager {
        constructor() {
            // Properties for this object
            var properties = globalProperties;

            // Function to initialise properties for an object
            this.initObject = (obj) => {
                // Function to retrieve the current value of a particular property
                var getProp = (propertyName: string) => {}

                // Function to set the value of a particular property
                var setProp = (propertyName: string, value: any) => {}

                // Declare properties for each value on the object
                Object.keys(properties).forEach((propertyName) => {
                    // Define this property on the object
                    Object.defineProperty(obj, propertyName, {
                        get: () => getProp(propertyName),
                        set: (val) => setProp(propertyName, val)
                    });
                })
            };
        }

        /**
         * Initialises the properties for an object
         */
        initObject: (obj: any) => void;
    };
}
