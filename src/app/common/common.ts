module app{

    export class Common{
    
        static setButtonsReferences(price: number){
            var btnGames = this.getElementById('btnPartidos');
            btnGames.setAttribute("href","#gameList/" + price);
            var btnStats = this.getElementById('btnEstadsticas');
            btnStats.setAttribute("href","#teamList/" + price);

        }

        static getElementById(id: string): HTMLElement{
            return document.getElementById(id);
        }
        
        static getCanvasContext(elementId: string): CanvasRenderingContext2D{
            var canvas = <HTMLCanvasElement> Common.getElementById(elementId);
            var ctx = canvas.getContext("2d");
            return ctx;
        }

        static getZeroIfNull(value:number):number{
            return value ? value : 0;
        }
        
        static setNextGame(teams: app.ITeam[], games: app.IGame[], owner: IOwner, ownerName: string){
            
            games.forEach((game) => {
                if ( owner.nextGame == null && game.status == "TIMED"){
                    var homeOwner = Common.getOwnerName(teams, game.homeTeamName);
                    var awayOwner = Common.getOwnerName(teams, game.awayTeamName);
                    if (homeOwner == ownerName){
                        owner.nextGame = new app.OwnerNextGame(game.homeTeamName, 
                            game.awayTeamName, awayOwner, game.date);
                    }else{ 
                        if(awayOwner == ownerName){
                            owner.nextGame = new app.OwnerNextGame(game.awayTeamName, 
                                game.homeTeamName, homeOwner, game.date);
                        }
                    }
                }
            });
        }

        static getOwnerName(teams: app.ITeam[], teamName:string):string{
            return teams.filter((team) => {
                return team.team == teamName;
            })[0].owner;
        }
        
        static getfixedGames(gamesFixed: IGame[], games: IGame[]){
            let gamesToFix = games.filter((game) => {return game.status != 'FINISHED' && game.status != 'SCHEDULED';});
            gamesFixed.filter((game) => {return game.status !='TIMED';})
                .forEach((gameFix) => {
                    for (let i = 0; i < gamesToFix.length; i++) {
                        const game = gamesToFix[i];
                        if (gameFix.date.substring(0,10) == game.date.substring(0,10) 
                            && gameFix.homeTeamName == game.homeTeamName 
                            && gameFix.awayTeamName == game.awayTeamName){
                                game.result.goalsAwayTeam = gameFix.result.goalsAwayTeam;
                                game.result.goalsHomeTeam = gameFix.result.goalsHomeTeam;
                                if(gameFix.result.extraTime){ game.result.extraTime = gameFix.result.extraTime; }
                                if(gameFix.result.penaltyShootout){ game.result.penaltyShootout = gameFix.result.penaltyShootout; }
                                game.status = gameFix.status;
                                i = gamesToFix.length;
                            }
                    }

                });
        }

        static getCombinedFixGames(games: app.IGame[], fixGames: app.IGame[], price: number, replaceWholeFixData: boolean = false):app.IGame[]{
            if (replaceWholeFixData){
                return(fixGames);
            }else{
                let fixingGames: boolean = price >= 0;

                if(fixingGames){
                    Common.getfixedGames(fixGames, games);
                    return games;
                }
            }

        }

        static  convertMatchesToGames(matches: IMatch[]): IGame[]{
            var convertedGames: IGame[] = [];
            matches.forEach((match) => {
                var game = new Game();
                game.awayTeamName = match.awayTeam.name;
                game.date = match.utcDate;
                game.getId = match.id.toString();
                game.homeTeamName = match.homeTeam.name;
                game.result = {goalsAwayTeam:match.score.fullTime.awayTeam, 
                               goalsHomeTeam:match.score.fullTime.homeTeam, 
                               extraTime:{goalsAwayTeam:0, goalsHomeTeam:0}, 
                               penaltyShootout:{goalsHomeTeam:0,goalsAwayTeam:0}};
                game.status = match.status;
                convertedGames.push(game);
            });
            return convertedGames;
        }        

    }
}