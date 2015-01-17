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
        uniqueName: string;
        readFrom: (obj: any) => any;
    }
    
    // The set of properties that will be managed by a property manager
    var globalProperties: { [propertyName: string]: PropertyDefinition } = {};

    /**
     * Declares a new property that can be used in objects managed by the property manager
     *
     * After this call is made, any new object that uses the property manager (ie, any TameObject) will have
     * this property added to it.
     *
     * When using typescript, you can add the property to the interface. For example, declare a new property
     * like this:
     *
     *     var MyProp = TameGame.declareProperty('myProp', () => { return { hello: 'world' }});
     *
     * and add it to the TameObject type definition like this:
     *
     *     export interface IMyProp { hello: string }
     *     module TameGame { export interface TameObject { myProp?: IMyProp } }
     *
     * See StandardProperties.ts for an example
     */
    export function declareProperty<TPropertyType>(propertyName: string, createDefault: () => TPropertyType): TypeDefinition<TPropertyType> {
        var typeName = createTypeName();
        var readFrom = (obj) => {
            return obj[propertyName];
        };
        
        var newProperty: PropertyDefinition = {
            createDefault:  createDefault,
            uniqueName:     typeName,
            readFrom:       readFrom
        };

        // Add to the list of known properties
        globalProperties[propertyName] = newProperty;

        // Create a type definition for this property
        return newProperty;
    }

    /**
     * The property manager is a class that manages 'watchable' properties on an object: that is, those
     * that can be watched via IWatchable.
     *
     * This will attach every property declared with declareProperty to the object. Properties look like 
     * standard javascript properties but a few aspects of their behavior is different and may be 
     * surprising. The most obvious is that they are copy-on-assign, so doing obj.prop = value actually
     * takes a copy of value instead of assigning it as a reference.
     *
     * A slightly more subtle issue is that subproperties are watched. This means that obj.prop = value
     * will generate a watch event, and obj.prop.x = value2 will also generate an event but 
     * obj.prop.x.y = value3 will not.
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
                var propertyTypeName = propertyDefn.uniqueName;

                // Make sure that the immediate action exists
                if (!immediateActions[propertyTypeName]) {
                    immediateActions[propertyTypeName] = () =>  {};
                }

                var propertyNames   = Object.getOwnPropertyNames(propertyObj);
                var noteChange      = recentChanges.getNoteForProperty(propertyDefn);

                // Setting the property should trigger events
                propertyNames.forEach((prop) => {
                    // Set the value of this property
                    var value = propertyObj[prop];
                    Object.defineProperty(watchObj, prop, {
                        get: function() { return value; },
                        set: function (newValue) {
                            value = newValue;
                            noteChange(sourceObj);              // Takes advantage of the fact that the property definition type matches the type definition type
                            immediateActions[propertyTypeName](sourceObj);
                        }
                    });
                });

                // Calling setValue updates the backing store and fires the change event
                watchObj['set'] = (newValue) => {
                    // Refill the backing store
                    propertyNames.forEach((prop) => {
                        watchObj[prop] = newValue[prop];
                    });

                    // Indicate that the property has changed
                    // TODO: something more efficient than just replacing the values
                    //recentChanges.noteChange(sourceObj, propertyDefn);
                    //immediateActions[propertyTypeName](sourceObj);
                }

                // Return the watchable object
                return watchObj;
            };

            // Function to initialise properties for an object
            this.initObject = (obj: TameObject) => {
                // Declare properties for each value on the object
                // This could also be done by altering the object's prototype; however, this would cause issues
                // with actually storing the values of the properties.
                Object.keys(properties).forEach((propertyName) => {
                    var value: any = watchify(properties[propertyName].createDefault(), obj, properties[propertyName]);

                    // Define this property on the object
                    Object.defineProperty(obj, propertyName, {
                        get: () => { return value; },
                        set: (newValue) => value.set(newValue)
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
