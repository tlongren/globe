GLOBE.SummarySearchController = Ember.ArrayController.extend({
    needs: ['application'],
    content: [],
    active: 'relays',
    offset: 0,
    limit: 50,

    summaries: {},
    relays: Ember.ArrayController.create({
        content: Ember.A([]),
        summaries: Ember.A([])
    }),
    bridges: Ember.ArrayController.create({
        content: Ember.A([]),
        summaries: Ember.A([])
    }),

    relaysActive: function(){
        return this.get('active') === 'relays';
    }.property('active'),
    bridgesActive: function(){
        return this.get('active') === 'bridges';
    }.property('active'),

    resultChanged: function(){
        var query = this.get('query');

        GLOBE.set('title', 'Results for ' + query);
        GLOBE.set('message', '<span class="subtle">searched for</span> <strong>' + query +'</strong>');

    }.observes('bridges.content.length', 'relays.content.length'),

    query: '',
    sortProperties: ['nickname'],
    sortAscending: false,

    activateSummaries: function(what){
        switch(what){
            case 'relays':
                this.set('active', 'relays')
                break;
            case 'bridges':
                this.set('active', 'bridges');
                break;
        }
    },

    showBridgeDetail: function(fingerprint){
        this.transitionToRoute('bridgeDetail', fingerprint);
    },
    showRelayDetail: function(fingerprint){
        this.transitionToRoute('relayDetail', fingerprint);
    }
});