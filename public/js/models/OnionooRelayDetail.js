
App.OnionooRelayDetail = Ember.Object.extend({});
App.OnionooRelayDetail.reopenClass({
    find: function(fingerprint){

        if(!fingerprint.length){
            return {};
        }


        // check if localStorage has something on key fingerprint
        var dbKey = App.static.db.prefix + App.static.db.details + fingerprint;
        var storedDetail = store.get(dbKey);

        if(storedDetail && App.Store.isUseable){
            // has detail for fingerprint, start getting complete data from indexedDB
            var dbPromise = App.Store.Detail.get(fingerprint);

            // create fake promise that returns stored object
            var defer = new $.Deferred();

            dbPromise.done(function(result, event){
                defer.resolve(result);
            });

            return defer.promise();
        }else{

            // use generate hashed fingerprint
            var hashedFingerprint = App.Util.hashFingerprint(fingerprint);
            return $.getJSON('https://onionoo.torproject.org/details?lookup=' + hashedFingerprint, {}).then(function(result){
                // right now i only care about relays

                var detail = {};

                if(result && result.relays && result.relays.length){

                    for(var i = 0, max = result.relays.length; i < max; i++){

                        // create default details object and overwrite with given results
                        var relay = $.extend({}, defaultOnionooDetails, result.relays[i]);
                        detail = App.OnionooRelayDetail.create(relay);
                    }

                }

                // add to detail database and add localStorage reference
                if(App.Store.isUseable){
                    store.set(dbKey, Date.now());
                    var dbPromise = App.Store.Detail.add(detail);

                    dbPromise.fail(function(error, event){
                        console.error(error, event); // indicates if there was an error or an exception
                    });
                }

                return detail;
            });

        }

    }
});