/// <reference path="Interface.ts" />

module TameGame {
    //
    // Represents a set of registered watchers
    //
    class WatcherRegistration implements Watchable {
        _registered: { [updatePass: number]: { [property: string]: any[] } };

        //
        // When any any object with an attached property of the specified
        // type detects that the contents of that property has changed,
        // call the specified callback.
        //
        // Returns a value that can be used to cancel the watch.
        //
        // Watch notifications are generally not called immediately but when
        // a particular update pass is hit during a game tick.
        //
        watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>): Cancellable {
            var passCallbacks       = this._registered[updatePass]
            var propertyCallbacks   = passCallbacks[definition.name];

            propertyCallbacks.push(callback);

            // TODO: cancelling
            return { cancel: () => { } };
        }

        //
        // When this object is part of the active scene and the game hits
        // the specified pass as part of processing a tick, the callback
        // is called, once only.
        //
        onPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) {

        }

        //
        // As for onPass, but the call is made every time this object is part
        // of the active scene and the game hits the specified pass.
        //
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) : Cancellable {
            return { cancel: () => { } };
        }

    }

    //
    // The watcher notes when objects have changes made and helps
    // with dispatching the relevant events.
    //
    class Watcher {
        private _changes: { [property: string]: { [id: number]: (callback: any) => void } }

        //
        // Notes that a property on an object has changed
        //
        noteChange<TPropertyType>(o: TameObject, property: TypeDefinition<TPropertyType>) {
            var name    = property.name;
            var id      = o.identifier;

            var propertyChanges = this._changes[name];
            if (!propertyChanges) {
                propertyChanges = this._changes[name] = {};
            }

            // Nothing to do if the object has already been noted as changed
            if (id in propertyChanges) {
                return;
            }

            // Create a callback function for this object
            propertyChanges[o.identifier] = (callback) => {
                callback(o, o.get(property));
            };
        }
    }
}
