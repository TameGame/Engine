/// <reference path="RenderQueue.ts" />
/// <reference path="../Core/GameLauncher.ts" />
/// <reference path="../Core/Worker.ts" />

module TameGame {
    // Blocks are 32k each
    var blockSize = 32*1024 / 4;
    
    /**
     * The standard implementation of a render queue
     */
    export class StandardRenderQueue extends RenderQueueBase implements RenderQueue {
        constructor() {
            super();
            
            var integers: Int32Array[]  = [];
            var floats: Float32Array[]  = [];
            var intPos: number          = 0;
            var floatPos: number        = 0;
            var intBlock: number        = 0;
            var floatBlock: number      = 0;
            
            // Functions to extend the array
            var extendIntegers = () => { integers.push(new Int32Array(blockSize)); }
            var extendFloats = () => { floats.push(new Float32Array(blockSize)); }
            
            extendIntegers();
            extendFloats();
            
            // Functions to write values
            var write = (intVals: number[], floatVals?: number[]) => {
                // Write the integers
                var iBlock = integers[intBlock];
                
                for (var i = 0; i<intVals.length; ++i) {
                    iBlock[intPos] = intVals[i];
                    
                    ++intPos;
                    if (intPos >= blockSize) {
                        extendIntegers();
                        intPos = 0;
                        intBlock++;
                        iBlock = integers[intBlock];
                    }
                }
                
                // Write the floats
                if (!floatVals) {
                    return;
                }
                var fBlock = floats[floatBlock];
                
                for (var f=0; f<floatVals.length; ++f) {
                    fBlock[floatPos] = floatVals[f];
                    
                    ++floatPos;
                    if (floatPos >= blockSize) {
                        extendFloats();
                        floatPos = 0;
                        ++floatBlock;
                        fBlock = floats[floatBlock];
                    }
                }
            }
            
            // Retrieves the list of action offsets (as intPos, floatPos pairs)
            var getOffsets = () => {
                var ordering        = [];
                var intOffsets      = [];
                var floatOffsets    = [];
                
                // Current position
                var iPos    = 0;
                var fPos    = 0;
                var intEnd  = intBlock * blockSize + intPos;
                
                while (iPos < intPos) {
                    // Fetch the header bits
                    var items       = read(integers, Math.floor(iPos/blockSize), iPos%blockSize, 3);
                    var action      = items[0];
                    var intLen      = items[1];
                    var floatLen    = items[2];
                    
                    // Store this value
                    intOffsets.push(iPos);
                    floatOffsets.push(fPos);
                    ordering.push(ordering.length);
                    
                    // Increase the lengths by the header size
                    intLen += 3;
                    floatLen += 1;
                    
                    // Move on to the next value
                    iPos += intLen;
                    fPos += floatLen;
                }
                
                return { intOffsets: intOffsets, floatOffsets: floatOffsets, ordering: ordering };
            }
            
            // Reads some items from an array
            var read = (source: any[], block: number, pos: number, len: number) => {
                var result = [];
                
                var remaining = len;
                
                while (pos > blockSize) {
                    pos -= blockSize;
                    ++block;
                }
                
                while (remaining > 0) {
                    // Read toRead items from pos
                    var toRead = len;
                    if (pos + toRead > blockSize) {
                        toRead = blockSize - pos;
                    }
                    
                    var curBlock = source[block];
                    for (var i=0; i<toRead; ++i) {
                        result.push(curBlock[pos+i]);
                    }
                    
                    remaining -= toRead;
                    pos = 0;
                    ++block;
                }
                
                return <number[]> result;
            };
            
            // Given an offset (as [iBlock, iPos, fBlock, fPos]), returns a RenderQueueItem
            var decodeOffset = (iPos: number, fPos: number) => {
                var iBlock  = Math.floor(iPos/blockSize);
                var fBlock  = Math.floor(fPos/blockSize);
                
                iPos %= blockSize;
                fPos %= blockSize;
                
                var result: RenderQueueItem;

                // Read the header
                var header      = read(integers, iBlock, iPos, 3);
                var action      = header[0];
                var intLen      = header[1];
                var floatLen    = header[2];
                
                // Read the values
                var actionIntValues = read(integers, iBlock, iPos+3, intLen);
                var actionFloatValues = read(floats, fBlock, fPos, floatLen+1);
                
                var zIndex = actionFloatValues[0];
                
                // Generate the result
                result = {
                    action: action,
                    zIndex: zIndex,
                    intValues: actionIntValues,
                    floatValues: actionFloatValues.slice(1)
                };
                
                return result;
            }
            
            // Exported function definitions
            this.addItem = (item) => {
                var intValues   = item.intValues || [];
                var floatValues = item.floatValues || [];
                
                // Standard header: the action, the lengths and the z-Index
                write([item.action, intValues.length, floatValues.length], [item.zIndex]);
                
                // The values themselves
                write(intValues, floatValues);
                
                // Done
                return this;
            }
            
            this.clearQueue = () => {
                // Clear everything out
                integers    = [];
                floats      = [];
                intPos      = 0;
                intBlock    = 0;
                floatPos    = 0;
                floatBlock  = 0;
                
                extendIntegers();
                extendFloats();
            }
            
            this.render = (action) => {
                // Grab the offsets of the commands
                var offsets = getOffsets();
                
                // Sort them by zIndex
                offsets.ordering.sort((a, b) => {
                    var fPosA   = offsets.floatOffsets[a];
                    var fPosB   = offsets.floatOffsets[b];
                    
                    var fBlockA = Math.floor(fPosA/blockSize);
                    var fBlockB = Math.floor(fPosB/blockSize);
                    
                    fPosA %= blockSize;
                    fPosB %= blockSize;
                    
                    var zIndexA = floats[fBlockA][fPosA];
                    var zIndexB = floats[fBlockB][fPosB];
                    
                    if (zIndexA < zIndexB) {
                        return -1;
                    } else if (zIndexA > zIndexB) {
                        return 1;
                    }
                    
                    // Order by positioning
                    if (fBlockA < fBlockB) {
                        return -1;
                    } else if (fBlockA > fBlockB) {
                        return 1;
                    }
                    
                    if (fPosA < fPosB) {
                        return -1;
                    } else if (fPosA > fPosB) {
                        return 1;
                    }
                    
                    return 0;
                });
                
                // Render them
                offsets.ordering.forEach((itemNum) => {
                    action(decodeOffset(offsets.intOffsets[itemNum], offsets.floatOffsets[itemNum]));
                });
            }
            
            this.postQueue = () => {
                // Get the values to post
                var lastInts    = integers.map((array) => array.buffer);
                var lastFloats  = floats.map((array) => array.buffer);
                var intLen      = intPos + intBlock*blockSize;
                var floatLen    = floatPos + floatBlock*blockSize;
                
                var transfer    = lastInts.concat(lastFloats);
                
                // Clear the old values (we'll transfer the values so these old values no longer apply)
                this.clearQueue();
                
                // Post the message to the owner of this worker
                var message: WorkerMessage = {
                    action: workerRenderQueue,
                    data: {
                        time:           perf.now(),
                        integers:       lastInts,
                        floats:         lastFloats,
                        integerLength:  intLen,
                        floatLength:    floatLen
                    }
                };
                
                var realPostMessage: any = postMessage;         // HACK: typescript doesn't know about web workers, apparently
                realPostMessage(message, transfer);
            }
            
            this.fillQueue = (msg: WorkerMessage) => {
                // Get the data
                var data    = msg.data;
                
                // Fill the arrays
                integers    = data.integers.map((buf) => new Int32Array(buf));
                floats      = data.floats.map((buf) => new Float32Array(buf));
                
                intPos      = data.integerLength;
                floatPos    = data.floatLength;
                
                intBlock    = Math.floor(intPos/blockSize);
                floatBlock  = Math.floor(floatPos/blockSize);
                intPos      %= blockSize;
                floatPos    %= blockSize;
            }
        }
    }
}
