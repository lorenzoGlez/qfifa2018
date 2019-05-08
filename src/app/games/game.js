var app;
(function (app) {
    var IFixture = /** @class */ (function () {
        function IFixture() {
        }
        return IFixture;
    }());
    app.IFixture = IFixture;
    var ICompetition = /** @class */ (function () {
        function ICompetition() {
        }
        return ICompetition;
    }());
    app.ICompetition = ICompetition;
    var IMatch = /** @class */ (function () {
        function IMatch() {
        }
        return IMatch;
    }());
    app.IMatch = IMatch;
    var IGame = /** @class */ (function () {
        function IGame() {
        }
        return IGame;
    }());
    app.IGame = IGame;
    var IResult = /** @class */ (function () {
        function IResult() {
        }
        return IResult;
    }());
    app.IResult = IResult;
    var Game = /** @class */ (function () {
        function Game(game) {
            this.self = { href: "" };
            Object.assign(this, game);
            //this.getId = this.self.href.match(/([^\/]*)\/*$/)[1];
        }
        return Game;
    }());
    app.Game = Game;
    var Match = /** @class */ (function () {
        function Match(id, status, utcDate, awayTeam, homeTeam, lastUpdated, score) {
            this.id = id;
            this.status = status;
            this.utcDate = utcDate;
            this.awayTeam = awayTeam;
            this.homeTeam = homeTeam;
            this.lastUpdated = lastUpdated;
            this.score = score;
            this.getId = this.id.toString();
        }
        return Match;
    }());
    app.Match = Match;
})(app || (app = {}));
