(function(){
	var app = angular.module('walletManager', []);
	app.controller('WalletController', function(walletLocalStorage){
		//Amount currency always in Eur currency
		//All amount operations are performed in Eur
		this.amount = parseFloat(walletLocalStorage.getData("wallet-amount")) || 0;
		//Displayed amount as selected wallet currency
		this.displayedAmount = 0;
		this.currency = walletLocalStorage.getData("wallet-currency") || 'EUR';
		this.transactions = JSON.parse(walletLocalStorage.getData("wallet-transactions")) || [];

		this.updateAmount = function(amount){
			this.amount += amount;
			walletLocalStorage.setData("wallet-amount", this.amount);
			walletLocalStorage.setData("wallet-currency", this.currency);
		};

		this.addTransaction = function(transaction){
			this.transactions.push(transaction);
			walletLocalStorage.setData("wallet-transactions", JSON.stringify(this.transactions));
		};

		this.reset = function(){
			this.amount = 0;
			this.displayedAmount = 0;
			this.currency = 'EUR';
			this.transactions = [];

			//Reset caches
			walletLocalStorage.setData("wallet-amount", this.amount);
			walletLocalStorage.setData("wallet-currency", this.currency);
			walletLocalStorage.setData("wallet-transactions", "[]");
		}

	});

	app.controller('AmountController', function(){
		this.submitAmount = function(wallet,action){
			var transaction = {},
				amountEur;

			transaction['amount'] = this.amount;
			transaction['action'] = action;
			transaction['currency'] = this.currency;
			transaction['creationDate'] = Date.now();
			
			//add transaction
			wallet.addTransaction(transaction);

			//TODO: if amount != EUR call service to get RealTime amount in EUR
			amountEur = this.amount;

			wallet.updateAmount(action === 'add'?amountEur:-amountEur);

			//After add a new amount : Reset amount and set currency 
			this.amount = 0;
			//this.currency = wallet.currency;
		};
	});

	app.controller('TransactionsController', function(){
		
		this.actionName = function (action){
			var dictionary = {
				add : "Added",
				remove : "Removed",
			}
			return dictionary[action];
		};
	});

	app.controller('CurrencyController',['$http', function($http){
		var self = this;
		this.currencies = [];
		this.currencyDictionary = {};

		$http.get('utils/currencies.json').success(function(data){
				self.currencyDictionary = data;

				for(i in data){
					self.currencies.push(data[i]);
				}
		}); 
	}]);

	//CACHE Management
	app.factory("walletLocalStorage", function($window, $rootScope) {
	  return {
	    setData: function(key, value) {
	      $window.localStorage && $window.localStorage.setItem(key, value);
	      return this;
	    },
	    getData: function(key) {
	      return $window.localStorage && $window.localStorage.getItem(key);
	    }
	  };
	});
	
	app.directive('walletMenu', function(){
		// Runs during compile
		return {
			restrict : 'E',
			templateUrl : 'partials/walletMenu.html'
		};
	});

	app.directive('amountForm', function(){
		// Runs during compile
		return {
			restrict : 'E',
			templateUrl : 'partials/amountForm.html'
		};
	});

	app.directive('walletTransactions', function(){
		// Runs during compile
		return {
			restrict : 'E',
			templateUrl : 'partials/walletTransactions.html'
		};
	});

	app.directive('walletCurrency', function(){
		// Runs during compile
		return {
			restrict : 'E',
			templateUrl : 'partials/walletCurrencyForm.html'
		};
	});

	app.directive('walletTotals', function(){
		// Runs during compile
		return {
			restrict : 'E',
			templateUrl : 'partials/walletTotals.html'
		};
	});
	
})();