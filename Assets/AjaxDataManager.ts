/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Data manager that retrieves resources via AJAX requests
     */
    export class AjaxDataManager implements DataManager {
        /**
         * Indicates an action that should be taken when all the assets that are currently loaded are available
         */
        whenLoaded(action: () => void): void {
            // TODO
        }

        /**
         * Loads some JSON data
         */
        loadJsonData(assetName: string) : Promise<any> {
            var promise = new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();

                // On load, try to parse the JSON
                xhr.onload = () => {
                    var jsonText    = xhr.responseText;
                    
                    try {
                        var jsonObject = JSON.parse(jsonText);
                        resolve(jsonObject);
                    } catch (e) {
                        console.error('Failed to parse', assetName, e);
                        reject(e);
                    }
                };
                
                // Deal with abort and error cases too
                xhr.onerror = (e) => { console.error(e); reject('Error while loading resource'); }
                xhr.onabort = () => { reject('Request aborted'); }
                
                // Request this resource
                xhr.open("get", assetName, true);
                xhr.send();
            });
            
            return promise;
        }
    }
}
