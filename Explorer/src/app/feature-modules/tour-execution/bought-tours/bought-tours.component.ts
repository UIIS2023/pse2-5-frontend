import { Component } from '@angular/core';
import { Tour } from '../model/tour-model';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { TourExecutionService } from '../tour-execution.service';
import { Session } from '../model/position-simulator.model';
import { Router } from '@angular/router';
import { TourKeyPoints } from '../../tour-authoring/model/tour-keypoints.model';

@Component({
  selector: 'xp-bought-tours',
  templateUrl: './bought-tours.component.html',
  styleUrls: ['./bought-tours.component.css']
})
export class BoughtToursComponent {
  tours: Tour[] = [];
  userId: number;
  session: Session;
  firstKeyPoint: TourKeyPoints;
  touristTours: Tour[] = []
  constructor(private service: TourExecutionService, 
              private authService: AuthService,
              private router: Router) { }


  ngOnInit(): void {
    this.userId = this.authService.user$.getValue().id;

    this.getTours();
    this.getTouristTours();
  }

  activeTab: number = 1;

  setActiveTab(tabNumber: number) {
    this.activeTab = tabNumber;
  }


  getTours(): void {
    this.service.getPurchasedTours(this.userId).subscribe({
      next: (res => { this.tours = res; }),
      error: (error: any) => console.log(error),
      complete: (): void => { this.getSession() }
    })
  }

  getTouristTours(): void{
    const userId = this.userId;
    this.service.getTouristTours(userId).subscribe({
      next: (result) => {
        this.touristTours = result.results;
        console.log(this.touristTours);
      }
    })
  }

  getSession(): void {
    this.service.getSessionByTouristId(this.userId).subscribe({
      next: (result => this.session = result),
      error: (error: any) => console.log(error),
      complete: (): void => { }
    }) 
  }  

  tourShow(id: number): void {
    console.log("nasao je")
    this.router.navigate(['/tour-all-details', id]);
  }


  startTour(event: Event,id: number): void {

    event.stopPropagation();
    this.service.getTourKeyPointsByTourId(id).subscribe({
      next: (result => this.firstKeyPoint = result[0]),
      error: (error: any) => console.log(error),
      complete: (): void => {this.createSession(id);}
    }) 
    
  }

  createSession(id: number): void{
    this.session = {
      id: 0,
      tourId: id,
      location: {
        latitude: this.firstKeyPoint.latitude,
        longitude: this.firstKeyPoint.longitude
      },
      touristId: this.userId,
      lastActivity: new Date(),
      completedKeyPoints: []
    };


    this.service.createSession(this.session).subscribe({
      next: () => { },
      error: (error: any) => console.log(error),
      complete: (): void => { }
    });  
  }

  viewTourProggres(event : Event): void{
    event.stopPropagation();
    this.router.navigate(['/positionSimulator']);
  }   

  openTouristTour(tourId: number):void{
    this.router.navigate(['/tourist-tour-creation/', tourId]);
  }

  createNewTour(){
    this.router.navigate(['/tourist-tour-creation/0']);
  }

  createCampaign(){
    this.router.navigate(['/campaign-creation']);
  }
}