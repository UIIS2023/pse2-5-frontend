import { Component, OnInit } from '@angular/core';
import { Challenge, ChallengeStatus, ChallengeType } from '../model/challenge.model';
import { AdministrationService } from '../administration.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TourKeyPoints } from '../../tour-authoring/model/tour-keypoints.model';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css'],
})
export class ChallengeComponent implements OnInit {
  challenges: Challenge[] = [];
  selectedChallenge: Challenge;
  challengeStatus: any = ChallengeStatus;
  challengeType: any = ChallengeType;
  hiddenElements: NodeListOf<HTMLElement>;
  selectedKeyPoint: TourKeyPoints =  {
    id: undefined,
    name: "",
    description: "",
    image: "",
    longitude: 0,
    latitude: 0,
    tourId: 0,
    positionInTour: 0,
    publicPointId: 0
  };
  user:User

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show-main');
      } else {
        entry.target.classList.remove('show-main');
      }
    });
  });

  constructor(private service: AdministrationService,private route: ActivatedRoute,private authService: AuthService) {}

  ngOnInit(): void {
    this.getChallenges();
    this.hiddenElements = document.querySelectorAll('.hidden');
    this.hiddenElements.forEach((el) => this.observer.observe(el));
  
    this.route.params.subscribe((params) => {
      this.selectedKeyPoint.id = params['keypointid'];
  
      if (this.selectedKeyPoint.id !== undefined) {
        this.service.getTourKeyPointById(this.selectedKeyPoint.id).subscribe({
          next: (result: TourKeyPoints) => {
            this.selectedKeyPoint = result;
            console.log(result);
          }
        });
      }
    });
  
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }
  

  deleteChallenge(challenge: Challenge): void {
    
    this.service.deleteChallenge(challenge.id!).subscribe({
      next: () => {
        this.getChallenges();
      },
    });
  }
  approveChallenge(challenge: Challenge): void
  {
    challenge.status=ChallengeStatus.Active
    this.service.updateChallenge(challenge).subscribe({
      error: () => {},
    });
  }
  denyChallenge(challenge: Challenge): void
  {
    challenge.status=ChallengeStatus.Archived
    this.service.updateChallenge(challenge).subscribe({
      error: () => {},
    });
  }
  getChallenges(): void {
    this.service.getChallenges().subscribe({
      next: (result: PagedResults<Challenge>) => {
        this.challenges = result.results;
      },
      error: () => {},
    });
  }

  onEditClicked(challenge: Challenge): void {
    this.selectedChallenge = challenge;
  }

  onAddClicked(): void {
    this.selectedChallenge = {} as Challenge;
  }
}
