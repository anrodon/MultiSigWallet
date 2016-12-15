(
  function(){
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function($scope, Wallet, Utils, Transaction, Owner, $uibModal){

      // Init wallets collection
      $scope.$watch(
        function(){
          return Wallet.wallets;
        },
        function(){
          $scope.wallets = Wallet.wallets;
          $scope.totalItems = Object.keys($scope.wallets).length;
          var batch = Wallet.web3.createBatch();
          // Init wallet balance of each wallet address
          Object.keys($scope.wallets).map(function(address){
            batch.add(
              Wallet.getBalance(
                address,
                function(e, balance){
                  $scope.wallets[address].balance = balance.div('1e18').toNumber();
                  $scope.$apply();
                }
              )
            );
          });
          batch.execute();
        }
      );

      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;
      $scope.new = {
        name: 'MultiSig Wallet',
        owners: {},
        confirmations : 1
      };

      $scope.newWalletSelect = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/selectNewWallet.html',
          size: 'sm',
          controller: function($scope, $uibModalInstance) {
            $scope.walletOption = "create";

            $scope.ok = function () {
              $uibModalInstance.close($scope.walletOption);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function(option){
            if(option == "create"){
              // open create modal
              $scope.newWallet();
            }
            else{
              // open recover modal
            }
          }
        );

      }

      $scope.newWallet = function(){

        $uibModal.open({
          templateUrl: 'partials/modals/newWallet.html',
          size: 'lg',
          controller: 'newWalletCtrl'
        });
      }

      $scope.addOwner = function(){
        $scope.new.owners[$scope.owner.address] = {};
        angular.copy($scope.owner, $scope.new.owners[$scope.owner.address]);
      }



      $scope.removeWallet = function(address){
        Wallet.removeWallet(address);
      }

      $scope.restoreWallet = function(){
        Wallet.restore($scope.old, function(e, w){
          console.log(e);
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            $scope.view = 'list';
          }
        });
      }

    });
  }
)();