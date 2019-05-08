var app;
(function (app) {
    var gameList;
    (function (gameList) {
        var GameListCtrl = /** @class */ (function () {
            function GameListCtrl($routeParams, dataAccessService) {
                var _this = this;
                this.$routeParams = $routeParams;
                this.dataAccessService = dataAccessService;
                this.errorTextAlert = "";
                this.title = "Juegos";
                this.games = [];
                this.price = this.$routeParams.price ? this.$routeParams.price : 400;
                this.price = Math.abs(this.price);
                app.Promises.getPreferences(dataAccessService).then(function (data) {
                    _this.preferences = data;
                    return app.Promises.getOwners(dataAccessService, _this.price);
                }).then(function (data) {
                    _this.owners = data;
                    return app.Promises.getGames(dataAccessService);
                }).then(function (data) {
                    _this.games = app.Common.convertMatchesToGames(data.matches);
                    _this.combineFixData();
                }).catch(function (error) {
                    _this.errorTextAlert = "La API de resultados esta fuera de servicio. Se usará último respaldo";
                    _this.combineFixData(true);
                });
                app.Common.setButtonsReferences(this.price);
            }
            GameListCtrl.prototype.combineFixData = function (replaceWholeFixData) {
                var _this = this;
                if (replaceWholeFixData === void 0) { replaceWholeFixData = false; }
                var gameFixedResource = this.dataAccessService.getGameFixedResource(this.preferences.backupURL);
                gameFixedResource.get(function (dataFixed) {
                    var gamesFixed = app.Common.convertMatchesToGames(dataFixed.matches);
                    _this.games = app.Common.getCombinedFixGames(_this.games, gamesFixed, _this.price);
                    _this.games.filter(function (game) { return game.homeTeamName; }).forEach(function (game) {
                        game.awayOwner = _this.owners.filter(function (owner) { return owner.teams.indexOf(game.awayTeamName) >= 0; })[0].ownerName;
                        game.homeOwner = _this.owners.filter(function (owner) { return owner.teams.indexOf(game.homeTeamName) >= 0; })[0].ownerName;
                    });
                });
            };
            GameListCtrl.prototype.getTotalGames = function () {
                //console.log(JSON.stringify(this.games));
                return this.games.filter(function (game) { return game.homeTeamName != ""; }).length;
            };
            GameListCtrl.$inject = ["$routeParams", "dataAccessService"];
            return GameListCtrl;
        }());
        gameList.GameListCtrl = GameListCtrl;
        angular.module("fifa").controller("GameListCtrl", GameListCtrl);
    })(gameList = app.gameList || (app.gameList = {}));
})(app || (app = {}));
