/// <reference path="BinarySearch.ts" />

module TameGame {
    /**
     * Performs an in-place insertion sort on an array
     *
     * This sort has very good performance when the array passed in is already nearly sorted. This
     * is useful when dealing with keeping a list of objects sorted when they experience very small
     * changes (ie, any list of objects that experiences temporal coherence).
     *
     * Returns the array
     */
     export function insertionSort<TElement>(array: TElement[], compare: (a: TElement, b: TElement) => number): TElement[] {
        var pos: number;
        var shiftPos: number;
        var len: number = array.length;

        // Base case: array is empty
        if (len <= 0) {
            return;
        }

        // The first item always starts as 'sorted'
        for (pos = 1; pos < len; ++pos) {
            // Fetch the item to insert
            var item = array[pos];

            // Start shifting items upwards
            shiftPos = pos-1;
            while (shiftPos >= 0 && compare(item, array[shiftPos]) < 0) {
                array[shiftPos+1] = array[shiftPos];
                --shiftPos;
            }

            // Found the location for this item
            array[shiftPos+1] = item;
        }

        return array;
     }
 }
