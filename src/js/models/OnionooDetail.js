App.OnionooRelayDetail = Ember.Object.extend({});
App.OnionooBridgeDetail = Ember.Object.extend({});


App.OnionooDetail = Ember.Object.extend({});
App.OnionooDetail.reopenClass({
    applyDetailDefaults: function(result){
        var details = {
            relay: $.extend({}, defaultOnionooRelayDetail),
            bridge: $.extend({}, defaultOnionooBridgeDetail)
        };

        if(result &&
            result.hasOwnProperty('relays') &&
            result.hasOwnProperty('bridges')){

            if(result.relays.length > 1 || result.bridges.length > 1){
                throw 'Result should only contain 1 detail object';
            }
            if(result.relays.length === 1){
                // process result relays
                var relay = $.extend({}, defaultOnionooRelayDetail, result.relays[0]);
                details.relay = App.OnionooRelayDetail.create(relay);
            }

            if(result.bridges.length === 1){
                // process result bridges
                var bridge = $.extend({}, defaultOnionooBridgeDetail, result.bridges[0]);
                details.bridge = App.OnionooBridgeDetail.create(bridge);
            }
        }
        return details;
    },
    /**
     * Requests a details lookup on the onionoo api using a fingerprint and given fields
     * @param fingerprint string
     * @param isHashed boolean if fingerprint is already hashed
     * @param fields array if set, use the fields api param to limit response fields
     * @returns {*}
     */
        // TODO: refactor function parameter to "holder" object
    find: function(fingerprint, isHashed, fields, state){

        var that = this;
        var hashedFingerprint = fingerprint,
            hasFields = (fields && fields.length);

        if(!isHashed){
            // use generate hashed fingerprint if not already hashed
            hashedFingerprint = App.Util.hashFingerprint(fingerprint);
        }

        hashedFingerprint = hashedFingerprint.toUpperCase();

        var storedDetail = App.TemporaryStore.find('details', hashedFingerprint);
        if(storedDetail === undefined ||
            (storedDetail._meta && !storedDetail._meta.complete) &&
            state > storedDetail._meta.state){
            // has no detail stored

            App.incrementProperty('loading');

            var fieldParam = hasFields ? '&fields=' + fields.join(',') : '';

            return $.getJSON('https://onionoo.torproject.org/details?lookup=' + hashedFingerprint + fieldParam, {}).then(function(result){
                var detailObj = that.applyDetailDefaults(result);

                App.decrementProperty('loading');

                App.TemporaryStore.store('details', hashedFingerprint, $.extend({}, detailObj, {
                    _meta: {
                        complete: hasFields ? false : true,
                        state: state
                    }
                }));
                return  detailObj;
            });

        }else{
            var defer = new $.Deferred();

            setTimeout(function(){
                // wait 4 ms (http://stackoverflow.com/a/9647221) then resolve with stored detail
                defer.resolve(storedDetail);
            }, 4);

            return defer.promise();
        }


    }
});