import { Component, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from 'src/app/shared/map/map.component';
import { TourExecutionService } from '../tour-execution.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { CompletedKeyPointDto, Session } from '../model/position-simulator.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Tour } from '../model/tour-model';
import { Subscription, interval } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { KeypointSecretDialogComponent } from '../keypoint-secret-dialog/keypoint-secret-dialog.component';
import { TourKeyPoints } from '../../tour-authoring/model/tour-keypoints.model';
import { Route, Router } from '@angular/router';
import { LayoutService } from '../../layout/layout.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { TourRating } from '../../marketplace/model/tourrating.model';
import { Challenge, ChallengeStatus } from '../../administration/model/challenge.model';
import { ChallengeExecution } from '../model/challenge-execution.model';
import { UserExpirience } from '../../layout/model/userExperience';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ChallengeLocationDialogComponent } from '../challenge-location-dialog/challenge-location-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { ChallengeDetailsDialogComponent } from 'src/app/shared/map/challenge-details-dialog/challenge-details-dialog.component';


@Component({
  selector: 'xp-position-simulator',
  templateUrl: './position-simulator.component.html',
  styleUrls: ['./position-simulator.component.css']
})

export class PositionSimulatorComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent: MapComponent;
  session: Session;
  user: User;
  startTourButtonEnabled: boolean = true;
  sub: Subscription;
  keypoints: TourKeyPoints[];
  visitedKeyPoints: TourKeyPoints[] = [];
  completedKeyPoints: CompletedKeyPointDto[] = [];
  tour : Tour;
  validForForm = false;
  tourRatings: TourRating[];
  tourRating : TourRating;
  enableCompleteButton: boolean = false;

  challenges: Challenge[];
  isActivateChallenge: boolean = false;
  isCompleteChallenge: boolean = false;
  isAbandonChallenge: boolean = false;
  isShowPicture: boolean = false;
  activeChallenge: Challenge | undefined;
  executionChallenge: ChallengeExecution | undefined;
  executionChallengesForTourist: ChallengeExecution[];
  userExperience:UserExpirience

  tourratingForm=new FormGroup({
    grade: new FormControl('',[Validators.required]),
    comment: new FormControl('',[Validators.required]),
    image: new FormControl('',[Validators.required]),
  })

  constructor(private service: TourExecutionService,
    private authService: AuthService,
    private layoutService: LayoutService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar){ }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      // this.service.getPreviousLocation(user.id).subscribe(previousLocation => {
      //   this.session = previousLocation;
      //   if (previousLocation) {
      //     this.mapComponent.addMarker(previousLocation.location.latitude, previousLocation.location.longitude);
      //     this.startTourButtonEnabled = true;
      //   }
      // });
    });
    this.service.getSessionByTouristId(this.user.id).subscribe({
      next: (result => {
        this.session = result;

        this.service.getTour(Number(this.session.tourId)).subscribe({
          next: (result: Tour) => {
            this.tour = result;
            console.log(this.tour);

            //challenges
            this.layoutService.getXP(this.authService.user$.getValue().id).subscribe({
              next: (res => { this.userExperience = res; console.log(this.userExperience)}),
              error: (error: any) => console.log(error)
            })
            this.service.getChallengesForTour(this.tour).subscribe({
              next: (result: PagedResults<Challenge>) => {
                this.challenges = result.results.filter(c => c.status == ChallengeStatus.Active);
                console.log(this.challenges);
                this.service.getExecutionChallengesForTourist(this.authService.user$.getValue().id).subscribe({
                  next:(result: PagedResults<ChallengeExecution>) =>{
                    this.executionChallengesForTourist = result.results;
                    console.log(this.executionChallengesForTourist);

                    this.challenges = this.challenges.filter(challenge => {
                      
                      const challengeIdExists = this.executionChallengesForTourist.some(executionChallenge => executionChallenge.challengeId === challenge.id && executionChallenge.isCompleted ==true);
                      
                      return !challengeIdExists;
                    });
            
                    this.executionChallenge = this.executionChallengesForTourist.find(executionChallenge => executionChallenge.isCompleted === false);
                    if(this.executionChallenge){
                      this.activeChallenge = this.challenges.find(challenge => challenge.id === this.executionChallenge!.challengeId);     
                      if(this.activeChallenge!.type == 2){
                        this.isCompleteChallenge = true;
                        this.isAbandonChallenge = true;
                      }else if(this.activeChallenge!.type == 1){
                        this.isShowPicture = true;
                        this.isAbandonChallenge = true;
                      }  
                    }
          
                  }
                });
                
                      
              }
            });
          },
          error: () => {},
        });
        
        this.completedKeyPoints = this.session.completedKeyPoints;

        if (this.session !== null) {
          this.service.getTourKeyPointsByTourId(this.session.tourId).subscribe({
            next: (result: TourKeyPoints[]) => {
              this.keypoints = result;

              console.log(this.keypoints)
              this.keypoints.forEach(keypoint => {
                this.mapComponent.initKeyPointMarker(keypoint.latitude, keypoint.longitude);
              });

              this.enableCompleteButton = (this.keypoints.length == this.session.completedKeyPoints.length) ? true : false;
              console.log(this.keypoints.length, this.session.completedKeyPoints.length, this.enableCompleteButton);

              this.mapComponent.initKeyPointsRoute(this.keypoints);

              this.mapComponent.addTouristMarker(this.session.location.latitude, this.session.location.longitude);
              

              this.startTourButtonEnabled = false;
            }
          });

          this.sub = interval(10000).subscribe((val) => {
            this.mapComponent.addMarker(this.session.location.latitude, this.session.location.longitude);
            if(this.tour.authorId == this.user.id){
              this.validForForm = false
            }
            else{
              this.checkIfExistRating();
            }
            
            this.service.getTourKeyPointsByTourId(this.session.tourId).subscribe({
              next: (result: TourKeyPoints[]) => {
                this.keypoints = result;
                this.mapComponent.clearMarkers();
                this.keypoints.forEach(keypoint => {
                  this.mapComponent.initKeyPointMarker(keypoint.latitude, keypoint.longitude);
                });

                

                this.mapComponent.initKeyPointsRoute(this.keypoints);

                this.service.getSessionByTouristId(this.user.id).subscribe({
                  next: (result => {
                    this.mapComponent.addTouristMarker(result.location.latitude, result.location.longitude);
                    this.keypoints.forEach(keypoint => {
                      if (this.mapComponent.getDistance(result.location.latitude, result.location.longitude, keypoint.latitude, keypoint.longitude) < 50) {
                        console.log('Blizu si kljucne take pod nazivom:', keypoint.name);
                        
                      

                        // Check if keypoint is not in visitedKeyPoints
                        if (!this.session.completedKeyPoints.some(cp => cp.keyPointId === keypoint.id)) {

                          this.visitedKeyPoints.push(keypoint);
                          this.service.completeKeyPoint(this.session.id!, keypoint.id!).subscribe({
                            next:(result => {
                              this.session = result;

                              this.enableCompleteButton = (this.keypoints.length == this.session.completedKeyPoints.length) ? true : false;
                            console.log(this.keypoints.length, this.session.completedKeyPoints.length, this.enableCompleteButton);
                            })
                          });
                          if (keypoint.id !== undefined && keypoint.id !== null) {
                            this.service.getTourKeyPointSecret(keypoint.id).subscribe({
                              next: (result => {
                                console.log(result);
                                const secretTitle = keypoint.name + ' secret';
                                const secret = result.secret;
                                this.openSecretDialog(secretTitle, secret);
                              })
                            });
                          } else {
                            console.error('Keypoint ID is undefined or null');
                          }
                        }
                      }
                    });
                  })
                })
              }
            });
          })
        }
      }),
      error: (error: any) => console.log(error),
      complete: (): void => { 
        console.log(this.startTourButtonEnabled) 
      }
    });
  }

  updateLocation() {
    this.authService.user$.subscribe(user => {
      const coordinates = this.mapComponent.getLastMarker();

      this.session.location.latitude = coordinates.getLatLng().lat;
      this.session.location.longitude = coordinates.getLatLng().lng;

      this.mapComponent.getRouteDistanceFromFirstKeyPoint(
        this.keypoints[0].latitude,
        this.keypoints[0].longitude,
        this.session.location.latitude,
        this.session.location.longitude
      ).then((routeDistanceFromFirstKeyPoint: number) => {
        const routeDistanceinKm = routeDistanceFromFirstKeyPoint/1000; 
        const percentCrossed = Math.floor((routeDistanceinKm/this.tour.distanceInKm) * 100)

        this.session.distanceCrossedPercent = percentCrossed;
        this.session.lastActivity = new Date();

        this.mapComponent.clearMarkers();

        this.keypoints.forEach(keypoint => {
          this.mapComponent.initKeyPointMarker(keypoint.latitude,keypoint.longitude);
        });

        this.mapComponent.initKeyPointsRoute(this.keypoints);

        this.mapComponent.addTouristMarker(this.session.location.latitude, this.session.location.longitude);


        this.service.updatePosition(this.session).subscribe({
          next: (result: Session) => {


            this.isActivateChallenge = false;
            
            if(!this.executionChallenge){
              for (const challenge of this.challenges) {
                if(this.mapComponent.getDistance(this.session.location.latitude,this.session.location.longitude,challenge.latitude,challenge.longitude) <= challenge.range!){
                  console.log('blizu si tog challenga',challenge);
                  this.isActivateChallenge = true;
                }
              } 
            }else{
              this.executionChallenge.latitude = this.session.location.latitude;
              this.executionChallenge.longitude = this.session.location.longitude;
              if (this.activeChallenge?.type == 0) {
                if (this.mapComponent.getDistance(this.activeChallenge.latitude, this.activeChallenge.longitude, this.executionChallenge.latitude, this.executionChallenge.longitude) > this.activeChallenge.range!) {
                  this.service.deleteExecutionChallenge(this.executionChallenge.id!).subscribe({
                    next: () => {
                      alert(`You have left the ${this.activeChallenge!.name} social challenge`);
                      this.activeChallenge = undefined;
                      this.executionChallenge = undefined;
                      this.ngOnInit();
                    }
        
                  });
                }
              } else {
                this.service.updateExecutionChallenge(this.executionChallenge,this.executionChallenge.id!).subscribe({
                  next: (result : ChallengeExecution) => {
                    console.log(result);
                    if(this.activeChallenge!.type == 1){
                      console.log(this.activeChallenge);
                      console.log(this.executionChallenge);
                      console.log(this.mapComponent.getDistance(this.activeChallenge!.latitudeImage!, this.activeChallenge!.longitudeImage!, this.executionChallenge!.latitude, this.executionChallenge!.longitude));
                      if(this.mapComponent.getDistance(this.activeChallenge!.latitudeImage!, this.activeChallenge!.longitudeImage!, this.executionChallenge!.latitude, this.executionChallenge!.longitude) <= 10){
                        
                        console.log("Tu si gdje je slika!!! Sačekaj 30 sekundi da se izazov kompletira.");
                        this.showNotificationWhenTouristFindPicture();
                        this.isAbandonChallenge = false;
          
                        // Koristite timer funkciju za čekanje 30 sekundi
                        timer(30000).pipe(take(1)).subscribe(() => {
                          this.openLocationChallengeDialog(
                            this.activeChallenge!.name!,
                            this.activeChallenge!.description!,
                            this.activeChallenge!.image!,
                            "Location challenge is completed!!!"
                          );
                        
                          this.executionChallenge!.completionTime = new Date();
                          this.executionChallenge!.isCompleted = true;
                        
                          this.service.updateExecutionChallenge(this.executionChallenge!, this.executionChallenge!.id!).subscribe({
                            next: (result: ChallengeExecution) => {
                              console.log(result);
                              this.isShowPicture = false;
                              this.executionChallenge = undefined;
                              this.activeChallenge = undefined;
                              this.isCompleteChallenge = false;
                              this.isAbandonChallenge = false;
                              this.ngOnInit();
                            },
                            error: (error: any) => console.log(error)
                          });
                        });
                          
                                        
                                 
          
                      }
                    } else if (this.activeChallenge!.type == 0) {
                      if (result.isCompleted) {
                        alert(`You have completed social challenge: ${this.activeChallenge!.name}`);
                        this.service.addXPSocial(this.activeChallenge!.id!,this.activeChallenge!.experiencePoints!).subscribe(res=>{
                          console.log(res)
                        })
                        this.activeChallenge = undefined;
                        this.executionChallenge = undefined;
                        this.isActivateChallenge = false;
                        this.ngOnInit();
                      } else {
                        alert(`You have activate social challenge: ${this.activeChallenge!.name} to complete the challenge ${this.activeChallenge!.requiredAttendance} people need to activate this challenge`);
                      }
                    }
                  },
                  error: (error: any) => console.log(error)
                });
              }
            }



            alert('Your location is updated!');

          },
          error: (error) => {
            console.error('Error updating location:', error);
          }
        });
      });
    });
  }

  openSecretDialog(title: string, content: string): void {
    this.dialog.open(KeypointSecretDialogComponent, {
      width: '250px',
      data: { title, content }
    });
  }

  completeTour(): void {
    this.session.sessionStatus = 1;

    this.updateSession();
    if(this.tour.authorId == this.user.id){
      this.showNotificationForBlog()
    }
  }

  abandonTour(): void {
    this.session.sessionStatus = 2;

    this.updateSession();
  }

  updateSession(): void {
    this.session.lastActivity = new Date();

    this.service.updatePosition(this.session).subscribe({
      next: (result => console.log(result)),
      error: (error: any) => console.log(error),
      complete: (): void => {
        this.service.updateBoughtTour(this.user.id, this.session.tourId!).subscribe(
          response => {
            console.log('Update successful', response);
          },
          error => {
            console.error('Update failed', error);
          }
        );
        this.router.navigate(['/bought-tours'])
      }
    })

  }

  closeForm(): void{
    this.validForForm = false;
  }

  addTourRating(): void {
    if(this.validate()){
      const personId = this.authService.user$.getValue().id;

      const tourrating: TourRating = {
        personId : personId,
        tourId : this.tour.id,
        mark: parseInt(this.tourratingForm.value.grade || ""),
        comment: this.tourratingForm.value.comment || "",
        dateOfVisit : this.session.lastActivity, 
        dateOfCommenting : new Date(),
        images : []
  
      };
  
      const imageUris = this.tourratingForm.value.image;
      const images = imageUris?.split(','); 
      if (images) {
        images.forEach(imageUri => {
        tourrating.images.push(imageUri);
        });
      }
  
      this.service.addTourRating(tourrating).subscribe({
        next: () => {
          this.validForForm = false;
          this.ngOnInit();
        }
      });
    }
  }

  private validate(): boolean {
    if (!this.tourratingForm.value.grade) {
      alert('Grade must not be empty');
      return false;
    }
    if (!this.tourratingForm.value.comment) {
      alert('Comment must not be empty');
      return false;
    }
    if (!this.tourratingForm.value.image) {
      alert('Comment must not be empty');
      return false;
    }
    return true;  
  }

  checkIfExistRating() : void{
    this.service.getRatingsByTourId(this.tour.id).subscribe({
      next: (result: TourRating[]) => {
        this.tourRatings = result;

        for (const rating of this.tourRatings){
          if(rating.personId == this.authService.user$.getValue().id){
              this.tourRating = rating;
          }
        }

        if(this.tourRating == undefined){
          this.service.getValidForTouristComment(this.session.id!).subscribe({
            next: (result =>{
              this.validForForm = result;
            })
          });
        }
      }
    });
  }


  //Logic for challenges and buttons for that
  activateChallenge(): void{
    for (const challenge of this.challenges) {
      if(this.mapComponent.getDistance(this.session.location.latitude,this.session.location.longitude,challenge.latitude,challenge.longitude) <= challenge.range!){
        this.activeChallenge = challenge;
        continue;
      }
    } 
    console.log(this.activeChallenge);
    const exectuionChallenge : ChallengeExecution = {
      touristId: this.authService.user$.getValue().id,
      challengeId : this.activeChallenge!.id,
      latitude: this.session.location.latitude,
      longitude: this.session.location.longitude,
      activationTime: new Date(),
      isCompleted: false
    }
    
    this.service.addExecutionChallenge(exectuionChallenge).subscribe({
      next: (result : ChallengeExecution) => {
        this.executionChallenge = result;
        console.log(this.executionChallenge);
      },
      error: (error: any) => console.log(error),
      complete: (): void => {
        if(this.activeChallenge!.type == 2){
          this.isCompleteChallenge = true;
          this.isAbandonChallenge = true;
          this.isActivateChallenge = false;
          this.openChallengeDialog(this.activeChallenge!.name!,this.activeChallenge!.description!,2);
        }else if(this.activeChallenge!.type == 1){
          this.isActivateChallenge = false;
          this.openLocationChallengeDialog(this.activeChallenge!.name!,this.activeChallenge!.description!,this.activeChallenge!.image!,"");
          this.isShowPicture = true;
          this.isAbandonChallenge = true;
        } else if (this.activeChallenge!.type == 0) {
          if (this.executionChallenge?.isCompleted) {
            alert(`You have completed social challenge: ${this.activeChallenge!.name}`);
            this.service.addXPSocial(this.activeChallenge!.id!,this.activeChallenge!.experiencePoints!).subscribe(res=>{
              console.log(res)
            })
            this.activeChallenge = undefined;
            this.executionChallenge = undefined;
            this.ngOnInit();
          }
          alert(`You have activate social challenge: ${this.activeChallenge!.name} to complete the challenge ${this.activeChallenge!.requiredAttendance} people need to activate this challenge`);
          this.isActivateChallenge = false;
        }
        
      }
    });
  }


  completeChallenge(): void{
    console.log(this.activeChallenge);
    console.log(this.executionChallenge);
    if(this.executionChallenge && this.activeChallenge){
      if(this.mapComponent.getDistance(this.executionChallenge.latitude,this.executionChallenge.longitude,this.activeChallenge.latitude,this.activeChallenge.longitude) <= this.activeChallenge.range!){
        this.executionChallenge.completionTime = new Date();
        this.executionChallenge.isCompleted = true;

        this.service.updateExecutionChallenge(this.executionChallenge,this.executionChallenge.id!).subscribe({
          next: (result : ChallengeExecution) => {
            this.service.addXP(this.userExperience.id,this.activeChallenge!.experiencePoints!).subscribe(res=>{
              console.log(res)
            })
            
            console.log(result);
            this.executionChallenge = undefined;
            this.activeChallenge = undefined;
            this.isCompleteChallenge = false;
            this.isAbandonChallenge = false;
            this.ngOnInit();
          },
          error: (error: any) => console.log(error)
        });
      }else{
        console.log("ne mozes kompletirat jer nisi dovoljno blizu izazova!");
      }
      
    }
    
  }

  showPictureAgain() : void{
    this.openLocationChallengeDialog(this.activeChallenge!.name!,this.activeChallenge!.description!,this.activeChallenge!.image!, "");
  }

  abandonChallenge(): void{
    console.log(this.executionChallenge);
    if(this.executionChallenge){
      this.executionChallenge.isCompleted = true;

      this.service.updateExecutionChallenge(this.executionChallenge,this.executionChallenge.id!).subscribe({
        next: (result : ChallengeExecution) => {
          this.executionChallenge = undefined;
          this.activeChallenge = undefined;
          this.isCompleteChallenge = false;
          this.isAbandonChallenge = false;
          this.isShowPicture = false;
          this.ngOnInit();
        },
        error: (error: any) => console.log(error)
      });
    }
  }

  openLocationChallengeDialog(name: string, description: string, image:string, status: string): void {
    this.dialog.open(ChallengeLocationDialogComponent, {
      width: '1200px',
      height: '800px',
      data: { name, description, image, status }
    });
  }

  openChallengeDialog(name: string, description: string, type: number): void {
    this.dialog.open(ChallengeDetailsDialogComponent, {
      width: '400px',
      height: '200px',
      data: { name, description, type }
    });
  }

  showNotificationWhenTouristFindPicture() {
    this.snackBar.open('You have found the location where the picture was taken. Enjoy the view for 30 seconds to complete the location challenge!', 'Ok', {
      duration: 30000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top', 
      
    });
  }

  showNotificationForBlog() {
    const dialogRef = this.snackBar.open('Would you like to write a blog about this tour?', 'Yes', {
      duration: 15000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top',
      panelClass: "blog-snack"
      
    });
    dialogRef.onAction().subscribe(() => {
      this.router.navigate(['/blog/create',this.tour.id]);
    });
  }
}