import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from 'src/app/shared/map/map.component';
import { PublicTourKeypointsComponent } from '../public-tour-keypoints/public-tour-keypoints.component';
import { PublicFacilitiesComponent } from '../public-facilities/public-facilities.component';
import { TourAuthoringService } from '../tour-authoring.service';
import { PublicTourKeyPoints, TourKeyPoints } from '../model/tour-keypoints.model';
import { PublicFacility } from '../model/facility.model';
import { TourFormComponent } from '../tour-form/tour-form.component';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Tour, TourDifficulty, TourStatus } from '../model/tour.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit {

  @ViewChild(MapComponent) mapComponent: MapComponent;
  publicTourKeyPoint: PublicTourKeyPoints[]=[];
  publicFacilities: PublicFacility[]=[];
  tourKeyPoints: TourKeyPoints[] = [];
  tours: Tour[] = [];
  user: User | undefined;
  constructor(private dialog: MatDialog, 
    private tourAuthoringService: TourAuthoringService, 
    private authService: AuthService,
    private router: Router){}
  ngOnInit(): void {
    //Load all public key points
    this.authService.user$.subscribe(user =>{
      this.user = user;
    })
    //this.showAllPublic();
    this.loadTours();
  }


  openAddPublicKeyPoint(): void {
    const dialogRef = this.dialog.open(PublicTourKeypointsComponent, {
      width: '50%', 
      height: '90%'
    });
  }
  openAddPublicFacilitiy(): void {
    const dialogRef = this.dialog.open(PublicFacilitiesComponent, {
      width: '50%', 
      height: '90%'
    });
  }

  openAddNewTour(): void{
    const dialogRef = this.dialog.open(TourFormComponent,{
      width: '50%',
      height: '70%'
    })
  }

  showPublicKeyPoint(): void{
    this.mapComponent.clearMarkers();
    this.mapComponent.removeFacilities();
    this.tourAuthoringService.getPublicTourKeyPoints().subscribe(
      (response: PublicTourKeyPoints[]) => {
        this.publicTourKeyPoint = response;
        this.publicTourKeyPoint.forEach((keypoint) => {
          this.mapComponent.addMarker(keypoint.latitude, keypoint.longitude);
        });
      },
      (error) => {
        console.error('Error: ', error);
      }
    );

  }

  loadTours(): void{
    this.tourAuthoringService.getToursByAuthorId(this.user?.id!).subscribe({
      next: (response: PagedResults<Tour>) => {
        this.tours = response.results;
      },
      error: () => {},
    }

    );

  }

  showTourOnMap(tourId: number | undefined){
    this.mapComponent.clearMarkers();
    this.tourAuthoringService.getTourKeyPointsByTourId(tourId!).subscribe({
      next: (response) => {
        this.tourKeyPoints = response;
        this.tourKeyPoints.forEach((keypoint) => {
          this.mapComponent.addMarker(keypoint.latitude, keypoint.longitude);
        });
      },
    })
  }

  showPublicFacilities(): void{
    this.mapComponent.clearMarkers();
    this.tourAuthoringService.getPublicFecilities().subscribe(
      (response: PublicFacility[])=>{
        this.publicFacilities = response;
        this.publicFacilities.forEach((facility)=>{
          this.mapComponent.initFacility(facility);
        })
      },
      (error) => {
        console.error('Error: ', error);
      }
    )

  }

  onEditClick(tourId: number | undefined){
    this.router.navigate([`tour-creation-form/${tourId}/1`]);
  }
  
  showAllPublic(): void{
    this.mapComponent.clearMarkers();
    this.tourAuthoringService.getPublicTourKeyPoints().subscribe(
      (response: PublicTourKeyPoints[]) => {
        this.publicTourKeyPoint = response;
        this.publicTourKeyPoint.forEach((keypoint) => {
          this.mapComponent.addMarker(keypoint.latitude, keypoint.longitude);
        });
      },
      (error) => {
        console.error('Error: ', error);
      }
    );

    this.tourAuthoringService.getPublicFecilities().subscribe(
      (response: PublicFacility[])=>{
        this.publicFacilities = response;
        this.publicFacilities.forEach((facility)=>{
          this.mapComponent.initFacility(facility);
        })
      },
      (error) => {
        console.error('Error: ', error);
      }
    )
  }
}
