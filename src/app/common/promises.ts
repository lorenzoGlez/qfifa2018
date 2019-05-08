module app{
    declare const Promise: any;

    export class Promises{

        static getPreferences(dataAccessService: app.service.DataAccessService):Promise<app.IPreferences>{
            return new Promise((resolve, reject) => {
                var preferencesResource = dataAccessService.getPreferencesResource();
                preferencesResource.get((dataPreferences:app.IPreferences) =>{
                    resolve(dataPreferences);
                }).$promise.catch((reason) => {
                    reject(reason);
                });
            });
        }

        static getOwners(dataAccessService: app.service.DataAccessService, price: number): Promise<app.IOwner[]>{
            return new Promise((resolve, reject) =>{
                var ownerResource = dataAccessService.getOwnerResource();
                ownerResource.query((data:app.IOwner[]) =>{
                    
                    resolve(data.filter((owner)=>{
                        return owner.quiniela == price;
                    }));
                }).$promise.catch((reason) => {
                    reject(reason);
                });
            });
        }

        static getGames(dataAccessService: app.service.DataAccessService): Promise<app.ICompetition>{
            return new Promise((resolve, reject) => {
                var gameResource = dataAccessService.getGameResource();
                gameResource.get((data: app.ICompetition) => {
                    resolve(data);
                }).$promise.catch((reason) => {
                    reject(reason);
                });
            });
        }

        static getFixGames(dataAccessService: app.service.DataAccessService, backupURL: string): Promise<app.ICompetition>{
            return new Promise((resolve, reject) => {
                var gameFixedResource = dataAccessService.getGameFixedResource(backupURL);
                gameFixedResource.get((dataFixed: app.ICompetition) => {
                        resolve(dataFixed);
                    }).$promise.catch((reason) => {
                        reject(reason);
                    });
            });
        }

        static getTeams(dataAccessService: app.service.DataAccessService): Promise<app.ITeam[]>{
            return new Promise((resolve, reject) => {
                var teamResource = dataAccessService.getTeamResource();
                teamResource.get((data: app.IStanding) => {
                    let teams = data.standings.A;
                    teams = teams.concat(data.standings.B);
                    teams = teams.concat(data.standings.C);
                    teams = teams.concat(data.standings.D);
                    teams = teams.concat(data.standings.E);
                    teams = teams.concat(data.standings.F);
                    teams = teams.concat(data.standings.G);
                    teams = teams.concat(data.standings.H);
                    resolve(teams);
                }).$promise.catch((reason) => {
                    reject(reason);
                });
            });
        }
    }
}