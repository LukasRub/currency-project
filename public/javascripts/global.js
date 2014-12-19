/**
 * Created by lukas on 14.12.17.
 */
(function(){
    var app = angular.module('currency-project', []);
    app.controller('CurrencyController', ['$http', function($http){

        var currency = this;
        currency.providerObjects = [];
        currency.providerData = [];

        $http.get('/rates').success(function(data){
            currency.providerObjects = data;
            currency.providerObjects.forEach(function(provider){
                currency.getSelectedProviderData(provider.title);
            })
        });

        currency.getSelectedProviderData = function(providerTitle){
            $http.get('/rates/'+ providerTitle).success(function(data){
                currency.providerData.push(data);
            });
        };

    }]);
})();