/// <reference path="Interface.ts" />

module TameGame {
    "use strict";

    /**
     * Represents a base class for object behavior
     *
     * This is used to generate prototypes by a behaviour manager
     */
    export class DefaultBehavior implements Behavior {
        constructor() {
            Object.defineProperty(this, '_classes', { 
                configurable: false,
                enumerable: false,
                writable: true,
                value: []
            });

            Object.defineProperty(this, '_state', { 
                configurable: false,
                enumerable: false,
                writable: true,
                value: ''
            });
        }

        /** Adds a class to this object */
        addClass: (newClass: string) => void;

        /** Removes a class from this object */
        removeClass: (oldClass: string) => void;

        /** Retrieves the classes for this object */
        getClasses: () => string[];

        /** Sets/gets the behavior state of this object */
        state: string;

        /** Classes set for this behavior */
        _classes: string[];

        /** The current state of this object */
        _state: string;
    }

    /**
     * Clears out all of the classes in a particular behavior
     */
    function clearClasses(b: Behavior) {
        Object.getOwnPropertyNames(b).forEach((propName) => {
            // Reset any property marked as 'fromClass' to null
            if (b[propName]['fromClass']) {
                b[propName] = null;
            }
        });
    }

    DefaultBehavior.prototype.addClass = function (newClass) {
        this._classes.unshift(newClass);

        clearClasses(this);
    };

    DefaultBehavior.prototype.removeClass = function (oldClass) {
        // Splice out everwhere this class is used
        var classes = this._classes;
        for (var x=0; x<classes.length; ++x) {
            if (classes[x] === oldClass) {
                classes.splice(x, 1);
                --x;
            }
        }

        // Reset class values
        clearClasses(this);
    };

    DefaultBehavior.prototype.getClasses = function () {
        return this._classes;
    }

    Object.defineProperty(DefaultBehavior.prototype, 'state', {
        set: function (newValue: string) {
            this._state = newValue;
            clearClasses(this);
        },
        get: function () { 
            return this._state; 
        },
        enumerable: false
    });

    /**
     * Behavior that invokes the add/remove callbacks for a particular scene
     */
    export class SceneBehavior extends DefaultBehavior {
        constructor(scene: Scene) {
            Object.defineProperty(this, '_scene', { 
                configurable: false,
                enumerable: false,
                writable: true,
                value: scene
            });

            super();
        }

        _scene: Scene;
    }

    SceneBehavior.prototype.addClass = function(newClass: string) {
        // Add the class
        this._classes.unshift(newClass);
        clearClasses(this);

        // Invoke the 'add class' behavior
        var classOptions = getOptionsForBehaviorClass(newClass);
        if (classOptions.onApplyToScene) {
            classOptions.onApplyToScene(this._scene);
        }
    }

    SceneBehavior.prototype.removeClass = function(oldClass: string) {
        // Splice out everwhere this class is used
        var classes = this._classes;
        for (var x=0; x<classes.length; ++x) {
            if (classes[x] === oldClass) {
                classes.splice(x, 1);
                --x;
            }
        }

        // Reset class values
        clearClasses(this);

        // Invoke the 'add class' behavior
        var classOptions = getOptionsForBehaviorClass(oldClass);
        if (classOptions.onRemoveFromScene) {
            classOptions.onRemoveFromScene(this._scene);
        }
    }
}
