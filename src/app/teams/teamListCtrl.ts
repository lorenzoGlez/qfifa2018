//import { ChartConfiguration } from "../../../typings/modules/chartjs";

module app.teamList{
    interface ITeamModel{
        title: string;
        teams: app.ITeam[];
    }

    interface ITeamParams extends ng.route.IRouteParamsService{
        price: number;
    }

    class TeamListCtrl implements ITeamModel{
        title: string;
        teams: app.ITeam[];
        owners: app.IOwner[];
        games:app.IGame[] = [];
        gamesFixed:app.IGame[] = [];
        errorTextAlert: string = "";
        preferences: app.IPreferences;

        chartSeries: app.ChartSeries = new app.ChartSeries();
        isChartVisible:boolean = false;
        price:  number;

        ownerListCtrl = new app.ownerList.OwnerListCtrl(this.dataAccessService);

        static $inject=["$routeParams","dataAccessService"];
        constructor(private $routeParams: ITeamParams, private dataAccessService: app.service.DataAccessService){
            this.title = "Estadísticas";
            this.teams = [];

            
            this.price = this.$routeParams.price ? this.$routeParams.price : 400;

            Promises.getPreferences(dataAccessService).then((dataPreferences:app.IPreferences) =>{

                this.preferences = dataPreferences;

                Promises.getTeams(dataAccessService).then((teams: ITeam[]) => {
                    this.teams = teams;
                    console.log("Standings retrieved");
                    return Promises.getGames(dataAccessService);
                }).then((data:ICompetition) => {
                    this.games = Common.convertMatchesToGames(data.matches);
                    this.combineFixData();
                }).catch((error) => {
                    this.errorTextAlert = "La API de resultados esta fuera de servicio. Se usará último respaldo";
                    this.combineFixData(true);
                });


            });
            Common.setButtonsReferences(this.price);
        }        

        private combineFixData(replaceWholeFixData: boolean = false){
            Promises.getFixGames(this.dataAccessService,this.preferences.backupURL).then((dataFixed: app.ICompetition) => {
                var gamesFixed = Common.convertMatchesToGames(dataFixed.matches);
                this.games = Common.getCombinedFixGames(this.games, gamesFixed, this.price);
                
                this.games.forEach((game) => {
                    if (game.status != "TIMED" && game.homeTeamName != "" && game.homeTeamName != "" ){
                        var homeTeam: app.ITeam = this.teams.filter((team) =>{
                            return team.team == game.homeTeamName;
                        })[0];
                        var awayTeam: app.ITeam = this.teams.filter((team) =>{
                            return team.team == game.awayTeamName;
                        })[0];

                        if (homeTeam && awayTeam){
                            this.updateTeamStats(homeTeam, awayTeam,game);
                        }else{
                            console.log(game.homeTeamName + " or " + game.awayTeamName + " was/were not found in teams");
                        }
                    }
                    
                })
                console.log("Games retrieved")
                this.rankTeams();
                this.calcOwnersResults(this.dataAccessService);
            });
        }

        private rankTeams(){
            this.teams.sort((s1,s2) => {
                var sortResult = s1.group < s2.group  ? -1 : 1;
                if(s1.group == s2.group){
                    sortResult = s1.points > s2.points ? -1 : 1;
                    if(s1.points == s2.points){
                        sortResult = s1.goals > s2.goals ? -1 : 1;
                        if (s1.goals == s2.goals){
                            sortResult = s1.goalDifference > s2.goalDifference ? -1 : 1
                        }
                    }
                }
                return sortResult
            });

            for (let index = 0; index < this.teams.length; index+=4) {
                this.teams[index].rank = 1;
                this.teams[index + 1].rank = 2;
                this.teams[index + 2].eliminated = this.teams[index + 2].playedGames > 2;
                this.teams[index + 3].eliminated = this.teams[index + 3].playedGames > 2;
            }

        }

        private calcOwnersResults(dataAccessService: app.service.DataAccessService){
            
            var ownerResource = dataAccessService.getOwnerResource();
            ownerResource.query((data:app.IOwner[]) =>{
                
                this.owners = data.filter((owner)=>{
                    return owner.quiniela == this.price;
                });

                var ownerList = [];

                this.owners.forEach((owner)=>{
                    
                    owner.playedGames = 0;
                    owner.wonGames = 0;
                    owner.lostGames = 0;
                    owner.tiedGames = 0;
                    owner.goals = 0;
                    owner.goalsAgainst = 0;
                    owner.goalsDifference = 0;
                    owner.points = 0;
                    owner.teamList = [];

                    owner.teams.forEach((teamName)=>{
                        let teamObj = this.teams.filter((team)=>{
                            return team.team == teamName;
                        })[0];
                        teamObj.owner = owner.ownerName;
                        
                        owner.teamList.push(teamObj);
                        owner.playedGames += Common.getZeroIfNull(teamObj.playedGames);
                        owner.lostGames += Common.getZeroIfNull(teamObj.lostGames);
                        owner.wonGames += Common.getZeroIfNull(teamObj.wonGames);
                        owner.tiedGames += Common.getZeroIfNull(teamObj.tiedGames);
                        owner.goals += Common.getZeroIfNull(teamObj.goals);
                        owner.goalsDifference += Common.getZeroIfNull(teamObj.goalDifference);
                        owner.goalsAgainst += Common.getZeroIfNull(teamObj.goalsAgainst);
                        owner.points += Common.getZeroIfNull(teamObj.points);
                        
                    });
                    

                    ownerList.push({
                        'name': owner.ownerName,
                        'points': owner.points,
                        'goals': owner.goals,
                        'wonGames' :owner.wonGames,
                        'lostGames' :owner.lostGames,
                        'tiedGames' :owner.tiedGames,
                    })


                });

                ownerList.sort((o1, o2) => {
                    var sortResult = o1.points > o2.points ? -1 : 1;
                    if(o1.points == o2.points){
                        sortResult = o1.goals > o2.goals ? -1 : 1;
                        if (o1.goals == o2.goals){
                            sortResult = o1.goalDifference > o2.goalDifference ? -1 : 1
                        }
                    }
                    return sortResult
                })

                
                ownerList.forEach((owner) => {
                    var ownerObj = this.owners.filter((ow) =>{
                        return ow.ownerName == owner.name;
                    })[0];

                    Common.setNextGame(this.teams, this.games, ownerObj, owner.name);
                    this.chartSeries.addLabel(owner.name);
                    this.chartSeries.addPoints(owner.points);
                    this.chartSeries.addGoals(owner.goals);
                    this.chartSeries.addWonGames(owner.wonGames);
                    this.chartSeries.addLostGames(owner.lostGames);
                    this.chartSeries.addTiedGames(owner.tiedGames);
   
                })
                            
            console.log("Owners retrieved");

            this.showChart();
            }); 
        }

        private showChart(){
            this.isChartVisible = !this.isChartVisible;
            if (this.isChartVisible){
                var statsChart = new Chart(Common.getCanvasContext('mixed-chart'),{
                    type: 'bar',
                    data: {
                        labels: this.chartSeries.labels,
                        datasets: [{
                            label: "Puntos",
                            type: "bar",
                            //borderColor: "lightgray",
                            //backgroundColor: "lightblue",                        
                            data: this.chartSeries.points,
                            yAxisID:"first-y-axis",
                            
                        },
                        {
                            label: "Goles Favor",
                            type: "bubble",
                            borderWidth: 4,
                            pointRadius: 20,
                            borderColor: "black",
                            backgroundColor: "white",
                            pointBackgroundColor: 'red',
                            data: this.chartSeries.goals,
                            yAxisID:"first-y-axis"
                        },                    
                        {
                            label: "Juegos Perdidos",
                            type: "line",
                            borderColor: "red",
                            backgroundColor: "tomato",
                            data: this.chartSeries.lostGames,
                            fill: true,
                            yAxisID:"first-y-axis"                        
                        },
                        {
                            label: "Juegos Empatados",
                            type: "line",
                            borderColor: "orange",
                            backgroundColor: "yellow",
                            data: this.chartSeries.tiedGames,
                            fill: true,
                            yAxisID:"first-y-axis"                       
                        },
                        {
                            label: "Juegos Ganados",
                            type: "line",
                            borderColor: "green",
                            backgroundColor: "lightgreen",
                            data: this.chartSeries.wonGames,
                            fill: true,
                            yAxisID:"first-y-axis"                       
                        }                    
                    ]
                    },
                    options: {
                    scales:{
                        yAxes:[{
                            id: "first-y-axis",
                            type: 'linear',
                            stacked: true,
                            scaleLabel:{
                                labelString: "Puntos & Juegos",
                                display: false
                            }
                        },{
                            id:"second-y-axis",
                            stacked: true,
                            type: 'linear',
                            position: "right",
                            ticks: {
                                //stepSize: 2
                            },
                            scaleLabel:{ 
                                labelString: "Goles",
                                display: false
                            }
                        }

                    ],
                    },
                    responsive: true,
                    maintainAspectRatio: true,
                    title: {
                        display: true,
                        text: 'Puntos & Juegos y Goles'
                    },
                    legend: { display: true }
                    }
                }); 
                
            }
            
            //this.showChartSample()
        }

        private showChartSample(){
      
                var barChartData = {
                    labels: this.chartSeries.labels,
                    datasets: [ {
                        type: 'bubble',
                        label: 'Goles a Favor',
                        borderColor: "black",
                        backgroundColor: "white",
                        borderWidth: 4,
                        pointRadius: 20,                        
                        data: this.chartSeries.goals
                    },{
                        type: 'bar',
                        label: 'P. Perdidos',
                        //borderColor: "red",
                        backgroundColor: "tomato",
                        data: this.chartSeries.lostGames
                    }, {
                        type: 'bar',
                        label: 'P. Empatados',
                        //borderColor: "orange",
                        backgroundColor: "yellow",
                        data: this.chartSeries.tiedGames
                    }, {
                        type: 'bar',
                        label: 'P. Ganados',
                        //borderColor: "green",
                        backgroundColor: "lightgreen",
                        data: this.chartSeries.wonGames
                    }]
        
                };            
                var myBar = new Chart(Common.getCanvasContext('barChart'), {
                    type: 'bar',
                    data: barChartData,
                    options: {
                        title: {
                            display: true,
                            text: 'Chart.js Bar Chart - Stacked'
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false
                        },
                        responsive: true,
                        scales: {
                            xAxes: [{
                                stacked: true,
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        },
                        legend: { display: true }
                    }
                });            
          
        }

        randomScalingFactor() {
            return Math.round(Date.now());
        };


        toggleShowTeams(owner){
            owner.showTeams = !owner.showTeams;
        }

        private updateTeamStats(homeTeam: ITeam, awayTeam:ITeam, game: IGame):void{
            if (game.status != "TIMED"){
                homeTeam.eliminated  = awayTeam.eliminated = false;
                game.result.extraTime = game.result.extraTime ? game.result.extraTime : new IResult();
                game.result.penaltyShootout = game.result.penaltyShootout ? game.result.penaltyShootout : new IResult();
                if(this.getHomeGoalsTotal(game) > this.getAwayGoalsTotal(game)){
                    homeTeam.wonGames ? homeTeam.wonGames++: homeTeam.wonGames = 1;
                    awayTeam.lostGames ? awayTeam.lostGames++: awayTeam.lostGames = 1;
                    homeTeam.points += 3;
                    awayTeam.eliminated = awayTeam.playedGames > 3;
                }else{
                    if (this.getAwayGoalsTotal(game) > this.getHomeGoalsTotal(game)){
                        awayTeam.wonGames ? awayTeam.wonGames++: awayTeam.wonGames = 1;
                        homeTeam.lostGames ? homeTeam.lostGames++: homeTeam.lostGames = 1;
                        awayTeam.points += 3;
                        homeTeam.eliminated = homeTeam.playedGames > 3;
                    }else{
                        homeTeam.tiedGames ? homeTeam.tiedGames++ : homeTeam.tiedGames=1;
                        awayTeam.tiedGames ? awayTeam.tiedGames++ : awayTeam.tiedGames=1;
                        homeTeam.points ++;
                        awayTeam.points ++;
                    }
                }
                
                homeTeam.playedGames++;
                homeTeam.goals += game.result.goalsHomeTeam + Common.getZeroIfNull(game.result.extraTime.goalsHomeTeam);
                homeTeam.goalsAgainst += game.result.goalsAwayTeam + Common.getZeroIfNull(game.result.extraTime.goalsAwayTeam);
                homeTeam.goalDifference = homeTeam.goals - homeTeam.goalsAgainst;
                

                awayTeam.playedGames++;
                awayTeam.goals += game.result.goalsAwayTeam + Common.getZeroIfNull(game.result.extraTime.goalsAwayTeam);
                awayTeam.goalsAgainst += game.result.goalsHomeTeam + Common.getZeroIfNull(game.result.extraTime.goalsHomeTeam);
                awayTeam.goalDifference = awayTeam.goals - awayTeam.goalsAgainst;

            }
        }

        private getHomeGoalsTotal(game: IGame){
            return game.result.goalsHomeTeam +
                   Common.getZeroIfNull(game.result.extraTime.goalsHomeTeam) +
                   Common.getZeroIfNull(game.result.penaltyShootout.goalsHomeTeam);
        }
        private getAwayGoalsTotal(game: IGame){
            return game.result.goalsAwayTeam + 
                   Common.getZeroIfNull(game.result.extraTime.goalsAwayTeam) +
                   Common.getZeroIfNull(game.result.penaltyShootout.goalsAwayTeam);
        }

        getTotalTeams():number{
            return this.teams.length;
        }



    }
    angular.module("fifa").controller("TeamListCtrl", TeamListCtrl);
}