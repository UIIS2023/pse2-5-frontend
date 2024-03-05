import { Component, OnInit } from '@angular/core';
import { Tour, TourDifficulty, TourStatus } from '../model/tour.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { TourStatistics } from '../model/tour-statistics.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';


@Component({
  selector: 'xp-overall-tour-statistics',
  templateUrl: './overall-tour-statistics.component.html',
  styleUrls: ['./overall-tour-statistics.component.css']
})

export class OverallTourStatisticsComponent implements OnInit {
  
  tours: Tour[] = [];
  attendedToursStats: TourStatistics[] = [];
  abandonedToursStats: TourStatistics[] = [];
  mostSoldToursStats: TourStatistics[] = [];
  bestRatedToursStats: TourStatistics[] = [];
  attendedTours: Tour[] = [];
  abandonedTours: Tour[] = [];
  mostSoldTours: Tour[] = [];
  bestRatedTours: Tour[] = [];
  tourStatus = TourStatus;
  tourDifficulty = TourDifficulty;
  
  
  constructor(private service: TourAuthoringService) {}
  
  
  ngOnInit(): void {
    this.getAllTours();
  }

  getAllTours(): void{
    this.service.getTours().subscribe({
      next: (result: PagedResults<Tour>) => {
        this.tours = result.results;
        this.getAttendedToursStats();
        this.getAbandonedToursStats();
        this.getSoldToursStats();
        this.getBestRatedToursStats();
      }
    })
  }

  getAttendedToursStats(): void{
    this.service.getAttendanceStatistics().subscribe({
      next: (result: TourStatistics[]) => {
        this.attendedToursStats = result;
        this.showAttendedToursStats();
      } 
    })
  }

  getAbandonedToursStats(): void{
    this.service.getAbandonedStatistics().subscribe({
      next: (result: TourStatistics[]) => {
        this.abandonedToursStats = result;
        this.showAbandonedToursStats();
      } 
    })
  }

  getSoldToursStats(): void{
    this.service.getSoldToursStatistics().subscribe({
      next: (result: TourStatistics[]) => {
        this.mostSoldToursStats = result;
        this.showMostSoldToursStats();
      } 
    })
  }
  
  getBestRatedToursStats(): void{
    this.service.getBestRatedStatistics().subscribe({
      next: (result: TourStatistics[]) => {
        this.bestRatedToursStats = result;
        this.showBestRatedToursStats();
      }
    })
  }

  showAttendedToursStats(): void{
    this.attendedToursStats.sort((a, b) => b.numberOfStats - a.numberOfStats);
    
    for(let i=0; i < 3; i++){
      if(this.attendedToursStats[i]){
        let temp = this.tours.find(tour => tour.id === this.attendedToursStats[i].tourId);
        if(temp){
          this.attendedTours.push(temp);
        }
      }
    }
  }

  showAbandonedToursStats(): void{
    this.abandonedToursStats.sort((a, b) => b.numberOfStats - a.numberOfStats);

    for(let i=0; i < 3; i++){
      if(this.abandonedToursStats[i]){
        let temp = this.tours.find(tour => tour.id === this.abandonedToursStats[i].tourId);
        if(temp){
          this.abandonedTours.push(temp);
        }
      }
    }
  }

  showMostSoldToursStats(): void{
    this.mostSoldToursStats.sort((a, b) => b.numberOfStats - a.numberOfStats);

    for(let i=0; i < 3; i++){
      if(this.mostSoldToursStats[i]){
        let temp = this.tours.find(tour => tour.id === this.mostSoldToursStats[i].tourId);
        if(temp){
          this.mostSoldTours.push(temp);
        }
      }
    }
  }

  showBestRatedToursStats(): void{
    this.bestRatedToursStats.sort((a, b) => b.numberOfStats - a.numberOfStats);

    for(let i=0; i < 3; i++){
      if(this.bestRatedToursStats[i]){
        let temp = this.tours.find(tour => tour.id === this.bestRatedToursStats[i].tourId);
        if(temp){
          this.bestRatedTours.push(temp);
        }
      }
    }
  }

}
