var app;
(function (app) {
    var Common = /** @class */ (function () {
        function Common() {
        }
        Common.setButtonsReferences = function (price) {
            var btnGames = this.getElementById('btnPartidos');
            btnGames.setAttribute("href", "#gameList/" + price);
            var btnStats = this.getElementById('btnEstadsticas');
            btnStats.setAttribute("href", "#teamList/" + price);
        };
        Common.getElementById = function (id) {
            return document.getElementById(id);
        };
        Common.getCanvasContext = function (elementId) {
            var canvas = Common.getElementById(elementId);
            var ctx = canvas.getContext("2d");
            return ctx;
        };
        Common.getZeroIfNull = function (value) {
            return value ? value : 0;
        };
        Common.setNextGame = function (teams, games, owner, ownerName) {
            games.forEach(function (game) {
                if (owner.nextGame == null && game.status == "TIMED") {
                    var homeOwner = Common.getOwnerName(teams, game.homeTeamName);
                    var awayOwner = Common.getOwnerName(teams, game.awayTeamName);
                    if (homeOwner == ownerName) {
                        owner.nextGame = new app.OwnerNextGame(game.homeTeamName, game.awayTeamName, awayOwner, game.date);
                    }
                    else {
                        if (awayOwner == ownerName) {
                            owner.nextGame = new app.OwnerNextGame(game.awayTeamName, game.homeTeamName, homeOwner, game.date);
                        }
                    }
                }
            });
        };
        Common.getOwnerName = function (teams, teamName) {
            return teams.filter(function (team) {
                return team.team == teamName;
            })[0].owner;
        };
        Common.fixGames = function (gamesFixed, games) {
            var gamesToFix = games.filter(function (game) { return game.status != 'FINISHED' && game.status != 'SCHEDULED'; });
            gamesFixed.filter(function (game) { return game.status != 'TIMED'; })
                .forEach(function (gameFix) {
                for (var i = 0; i < gamesToFix.length; i++) {
                    var game = gamesToFix[i];
                    if (gameFix.date.substring(0, 10) == game.date.substring(0, 10)
                        && gameFix.homeTeamName == game.homeTeamName
                        && gameFix.awayTeamName == game.awayTeamName) {
                        game.result.goalsAwayTeam = gameFix.result.goalsAwayTeam;
                        game.result.goalsHomeTeam = gameFix.result.goalsHomeTeam;
                        if (gameFix.result.extraTime) {
                            game.result.extraTime = gameFix.result.extraTime;
                        }
                        if (gameFix.result.penaltyShootout) {
                            game.result.penaltyShootout = gameFix.result.penaltyShootout;
                        }
                        game.status = gameFix.status;
                        i = games.length;
                    }
                }
            });
        };
        return Common;
    }());
    app.Common = Common;
})(app || (app = {}));
