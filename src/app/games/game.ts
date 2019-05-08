module app{
    export class IFixture{
        _links: {
            self: {
                href: string;
            },
            competition: {
                href: string;
            }
        };
        count: number;
        fixtures: IGame[];
    }

    export class ICompetition{
        count: number;
        competition:{
            id: number;
            area:{
                id: number;
                name: string;
            }
            name: string;
            code: string;
            plan: string;
            lastUpdated: string;
        }
        matches: IMatch[];

    }

    export class IMatch{
        id: number;
        status: string;
        utcDate: string;
        awayTeam: {
            id: number;
            name: string;
        }
        homeTeam: {
            id: number;
            name: string;
        }
        lastUpdated: string;
        score:{
            fullTime:{
                awayTeam: number;
                homeTeam:number;
            }
        }
        
    }

    export class IGame{
        self: {href: string};
        date: string;
        status: string;
        homeTeamName : string;
        awayTeamName : string;
        homeOwner: string;
        awayOwner: string;
        result: {
            goalsHomeTeam: number,
            goalsAwayTeam: number,
            extraTime: IResult,
            penaltyShootout: IResult
        }
    }
    
    export class IResult{
        goalsHomeTeam: number;
        goalsAwayTeam: number;
    }

    export class Game implements IGame {
        
        getId:string;

        public self: {href: string} = {href: ""};
        public date: string;
        public status: string;
        public homeTeamName : string;
        public awayTeamName : string;
        public homeOwner: string;
        public awayOwner: string;                     
        public result: {
            goalsHomeTeam: number,
            goalsAwayTeam: number,
            extraTime: IResult,
            penaltyShootout: IResult
        }

        constructor(game?: Game){
            (<any>Object).assign(this, game);
            
            //this.getId = this.self.href.match(/([^\/]*)\/*$/)[1];
        }
        
    }

    export class Match implements IMatch{
        getId: string;

        constructor( public id: number,
                     public status: string,
                     public utcDate: string,
                     public awayTeam: {
                                id: number,
                                name: string},
                     public homeTeam: {
                                id: number,
                                name: string},
                     public lastUpdated: string,
                     public score:{
                                fullTime:{
                                    awayTeam: number,
                                    homeTeam:number}}){

            this.getId = this.id.toString();
        }
    }
}