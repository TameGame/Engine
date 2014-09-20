/// <reference path="Interface.ts"/>
/// <reference path="Watch.ts" />

module TameGame {
    /**
     * Information stored for a property
     *
     * Interface matches TypeDefinition and is sometimes used interchangably; this doesn't have the need to
     * specify a type in the same way.
     */
    interface PropertyDefinition {
        createDefault: () => any;
        name: string;
        readFrom: (obj: any) => any;
    }
    
    // The set of properties that will be managed by a property manager
    var globalProperties: { [propertyName: string]: PropertyDefinition } = {};

    /**
     * Declares a new property that can be used in objects managed by the property manager
     */
    export function declareProperty<TPropertyType>(propertyName: string, createDefault: () => TPropertyType): TypeDefinition<TPropertyType> {
        var typeName = createTypeName();
        var readFrom = (obj) => {
            return obj[propertyName];
        };

        // Add to the list of known properties
        globalProperties[propertyName] = {
            createDefault:  createDefault,
            name:           typeName,
            readFrom:       readFrom
        };

        // Create a type definition for this property
        return {
            name:           typeName,
            createDefault:  createDefault,
            readFrom:       readFrom
        };
    }

    /**
     * The property manager is a class that manages 'watchable' properties on an object: that is, those
     * that can be watched via IWatchable.
     */
    export class PropertyManager {
        constructor(immediateActions: { [propertyName: string]: (TameObject) => void }) {
            // Properties for this object
            var properties = globalProperties;

            // Storage for any recent changes that have occurred
            var recentChanges = new Watcher();

            // Function that creates property values that notify us of any changes
            var watchify = (propertyObj: any, sourceObj: TameObject, propertyDefn: PropertyDefinition) => {
                // propertyObj but with properties that trigger when changed
                var watchObj = {};
                var propertyTypeName = propertyDefn.name;

                // Stores the actual values for this property
                var backing = {};

                // Make sure that the immediate action exists
                if (!immediateActions[propertyTypeName]) {
                    immediateActions[propertyTypeName] = () =>  {};
                }

                // Fill the initial backing store by copying the values for the property
                Object.getOwnPropertyNames(propertyObj).forEach((propName) => {
                    backing[propName] = propertyObj[propName];
                });

                // Setting the property should trigger events
                Object.getOwnPropertyNames(propertyObj).forEach((prop) => {
                    Object.defineProperty(watchObj, prop, {
                        get: () => backing[prop],
                        set: (newValue) => {
                            backing[prop] = newValue;
                            recentChanges.noteChange(sourceObj, propertyDefn);              // Takes advantage of the fact that the property definition type matches the type definition type
                            immediateActions[propertyTypeName](sourceObj);
                        }
                    });
                });

                // Calling setValue updates the backing store and fires the change event
                watchObj['set'] = (newValue) => {
                    // Refill the backing store
                    Object.getOwnPropertyNames(backing).forEach((prop) => {
                        backing[prop] = newValue[prop];
                    });

                    // Indicate that the property has changed
                    recentChanges.noteChange(sourceObj, propertyDefn);
                    immediateActions[propertyTypeName](sourceObj);
                }

                // Return the watchable object
                return watchObj;
            };

            // Function to initialise properties for an object
            this.initObject = (obj: TameObject) => {
                var propertyValues = {};            // Property storage for this object

                // Function to retrieve the current value of a particular property
                var getProp = (propertyName: string) => {
                    var val = propertyValues[propertyName];

                    if (val) {
                        // Use the existing value if there is one
                        return val;
                    } else {
                        // If the value is unset, then replace with the default value
                        val = watchify(properties[propertyName].createDefault(), obj, properties[propertyName]);
                        propertyValues[propertyName] = val;
                        return val;
                    }
                }

                // Function to set the value of a particular property
                var setProp = (propertyName: string, value: any) => {
                    if (!value) {
                        // We don't allow properties to be set to null or undefined
                        return;
                    }

                    // Update the existing property value
                    getProp(propertyName).set(value);
                }

                // Declare properties for each value on the object
                // This could also be done by altering the object's prototype; however, this would cause issues
                // with actually storing the values of the properties.
                Object.keys(properties).forEach((propertyName) => {
                    // Define this property on the object
                    Object.defineProperty(obj, propertyName, {
                        get: () => getProp(propertyName),
                        set: (val) => setProp(propertyName, val)
                    });
                })
            };

            // Add a way to retrieve the recent changes for this object
            this.getRecentChanges = () => recentChanges;
        }

        /**
         * Initialises the properties for an object
         */
        initObject: (obj: any) => void;

        /**
         * Retrieves the recent changes for this object
         */
        getRecentChanges: () => Watcher;
    };
}
