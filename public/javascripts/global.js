/**
 * Created by lukas on 14.12.17.
 */
(function(){
    var app = angular.module('currency-project', []);
    app.controller('CurrencyController', ['$http', function($http){
        var currency = this;
//        currency.isLoaded = false;
        currency.providers = [{title: 'AAA'}];
        $http.get('/rates').success(function(data){
            currency.providers = data.slice();
//            currency.isLoaded = true;
        });
    }]);

})();