/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Represents a base class for object behavior
     *
     * This is used to generate prototypes by a behaviour manager
     */
    export class DefaultBehavior implements Behavior {
        constructor() {
            this._classes = [];
        }

        /** Adds a class to this object */
        addClass: (newClass: string) => void;

        /** Removes a class from this object */
        removeClass: (oldClass: string) => void;

        /** Retrieves the classes for this object */
        getClasses: () => string[];

        /** Classes set for this behavior */
        _classes: string[];
    }

    /**
     * Clears out all of the classes in a particular behavior
     */
    function clearClasses(b: Behavior) {
        Object.keys(b).forEach((propName) => {
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
                classes[x].splice(x);
                --x;
            }
        }

        // Reset class values
        clearClasses(this);
    };

    DefaultBehavior.prototype.getClasses = function () {
        return this._classes;
    }
}
