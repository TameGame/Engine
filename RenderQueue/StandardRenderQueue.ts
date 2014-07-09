/// <reference path="RenderQueue.ts" />

module TameGame {
    /**
     * The standard implementation of a render queue
     */
    export class StandardRenderQueue implements RenderQueue {
        private _items: RenderQueueItem[];
        
        constructor() {
            this._items = [];
        }
        
        /**
         * Adds an item to this queue
         */
        addItem<TItemType extends RenderQueueItem>(item: TItemType): RenderQueue {
            // Don't add empty/bad items to the queue
            if (!item) {
                return;
            }
            
            // JavaScript sort isn't stable. We need to stablise it: in this case, by adding an indexing element
            // (Cost: memory, advantage: don't need to write our own sort algorithm to do something that JS
            // REALLY should be able to do itself)
            item["_stability"] = this._items.length;
            
            // Store the item
            this._items.push(item);
        }
        
        /**
         * Empties this render queue
         */
        clearQueue(): void {
            this._items = [];
        }
        
        /**
         * Sends the actions in this queue to a renderer in the appropriate order
         */
        render(action: (item: RenderQueueItem) => void) {
            // Sort the items into order
            this._items.sort((a, b) => {
                var aOrder = a.zIndex;
                var bOrder = b.zIndex;
                
                // Order by z-index
                if (aOrder < bOrder) {
                    return -1;
                } else if (aOrder > bOrder) {
                    return 1;
                }
                
                // Order by when it was added to the array
                var aStable = a["_stability"];
                var bStable = b["_stability"];
                if (aStable < bStable) {
                    return -1;
                } else if (aStable > bStable) {
                    return 1;
                }
                
                // This will never happen unless something weird has happened (eg: item updated after being added)
                return 0;
            });
            
            // Perform the action
            this._items.forEach(action);
        }
    }
}