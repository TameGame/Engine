/// <reference path="Interface.ts" />
/// <reference path="StandardProperties.ts" />

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
                var objBehavior = obj.behavior;
                var backing: Behavior = {};
                var behaviorProperties: PropertyDescriptorMap = {};
                
                Object.keys(behaviors).forEach((behaviorName) => {
                    var behaviorDefn = behaviors[behaviorName];
                    
                    behaviorProperties[behaviorName] = {
                        get: () => {
                            // Try the backing first
                            var behavior = backing[behaviorName];
                            if (behavior) return behavior;
                            
                            // Try the classes
                            var classes = obj.details.behaviorClass;
                            classes.some((behaviorClass) => {
                                behavior = behaviorClasses[behaviorClass][behaviorName];
                                
                                return behavior?true:false;
                            });
                            if (behavior) return behavior;
                            
                            // Use the default value
                            return behaviorDefn.defaultValue;
                        },
                        set: (value) => {
                            backing[behaviorName] = value;
                        }
                    };
                });
                
                Object.defineProperties(objBehavior, behaviorProperties);
            }
        }
        
        /** Initialises an object with the default behaviors */
        initObject: (obj: TameObject) => void;
    };
    
    // TODO: implement behavior classes
}
