/// <reference path="Interface.ts" />

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
                
                Object.keys(behaviors).forEach((behaviorName) => {
                    objBehavior[behaviorName] = behaviors[behaviorName].defaultValue;
                });
            }
        }
        
        /** Initialises an object with the default behaviors */
        initObject: (obj: TameObject) => void;
    };
    
    // TODO: implement behavior classes
}
