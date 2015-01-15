/// <reference path="Interface.ts" />
/// <reference path="StandardProperties.ts" />
/// <reference path="UninitializedField.ts" />
/// <reference path="Behavior.ts" />

module TameGame {
    /**
     * Information stored for a behavior
     *
     * Interface matches TypeDefinition and is sometimes used interchangably; this doesn't have the need to
     * specify a type in the same way.
     */
    interface BehaviorDefinition {
        // Matches TypeDefinition
        createDefault: () => any;
        name: string;
        readFrom: (obj: any) => any;
        
        // Details used by the behavior manager itself
        
        /** 
         * Unlike properties, the default behavior is only instantiated once: the assumption is that behaviors are replaced
         * wholesale and not piecemeal
         */
        defaultValue: any;
    }
    
    /** The standard set of behaviors */
    var globalBehaviors: { [ name: string ]: BehaviorDefinition } = {};
    
    /** The behavior classes that we know about */
    var behaviorClasses: { [ name: string ]: Behavior } = {};
    
    /**
     * Declares a new behavior type with a particular default behavior
     *
     * Objects that use the behavior manager will gain a new property with the specified name. The TameObject definition
     * should be extended to include this property.
     *
     * For example, if you define a behavior like this:
     *
     *      export interface IMyBehavior { wobble(): void }
     *      var MyBehavior: TypeDefinition<IMyBehavior> = TameGame.defineBehavior('myBehavior', () => { return { wobble() { } } });
     *
     * You should extend the TameObject interface like this:
     *
     *      module TameGame { export interface Behavior { myBehavior?: IMyBehavior } }
     *
     * The behavior can be access using obj.behavior.wobble()
     */
    export function declareBehavior<TBehavior>(name: string, createDefault: () => TBehavior) : TypeDefinition<TBehavior> {
        // Create a new internal name for this behavior
        var behaviorTypeName = createTypeName();
        
        // Set up the behavior definition
        var newBehavior: BehaviorDefinition = {
            name:           createTypeName(),
            createDefault:  createDefault,
            readFrom:       (obj) => obj[name],
        
            defaultValue:   createDefault()
        };

        // Create the default value (returned when there's no class or state defined for the object)
        var defaultValue = newBehavior.defaultValue;

        // Function to create the value for this behavior for a particular object
        var createObjectValue = (obj: Behavior) => {
            // Get the classes that are applied to this object
            var classes: string[];

            if (obj.getClasses) {
                classes = obj.getClasses();
            } else {
                classes = [];
            }

            // Look for a class containing this behavior
            var foundClass: TBehavior = null;;
            classes.some((className) => {
                // Get the behaviors defined for this class
                var classBehaviors = behaviorClasses[className];

                // Check if this class has a definition for this behavior object
                if (classBehaviors) {
                    foundClass = classBehaviors[name];
                }

                // Stop once we find a behavior
                return foundClass !== null;
            });

            // If there's a class behavior, use that as the value
            if (foundClass) {
                var result = Object.create(foundClass);
                result['fromClass'] = true;
                return result;
            }

            // Use the default value
            return Object.create(defaultValue);
        };

        // Add to the default behavior prototype
        defineUnintializedField(DefaultBehavior.prototype, name, (newBehavior, defineProperty) => {
            // An initial value of null indicates to use the state/class to retrieve the behavior
            var currentValue = null;

            function getValue() {
                currentValue = currentValue || createObjectValue(newBehavior);
                return currentValue;
            }

            function setValue(newValue) {
                currentValue = newValue;
            }

            // When the property is retrieved, create a new value (based on the class/state) if it's set to null
            defineProperty({
                get: getValue,
                set: setValue
            });

            // Retrieve the initial value
            return getValue();
        });
        
        // Store it
        globalBehaviors[name] = newBehavior;
        return newBehavior;
    }
    
    /**
     * Declares a behavior class
     *
     * Behavior classes can be specified for an object using the details.behaviorClass property:
     * they make it possible to quickly re-use behaviors across a wide variety of objects.
     *
     * Behaviors can be left as null or undefined in a behavior class: the behavior from lower
     * priority or the default will be used instead if this is done.
     */
    export function declareBehaviorClass(behaviorClassName: string, behaviors: Behavior) {
        behaviorClasses[behaviorClassName] = behaviors;
    }
    
    /**
     * The BehaviorManager handles registering and creating the behaviors of objects.
     *
     * Behaviors are simply collections functions that objects use to communicate with one another.
     * For instance, it is possible to define something like a CollisionBehavior and use that to decide
     * what should happen when one object collides with another (and indeed, this is what the default
     * physics library does)
     */
    export class BehaviorManager {
        constructor() {
            var behaviors = globalBehaviors;
            
            this.initObject = (obj) => {
                obj.behavior = new DefaultBehavior();
            }
        }
        
        /** Initialises an object with the default behaviors */
        initObject: (obj: TameObject) => void;
    };
    
    // TODO: implement behavior classes
}
