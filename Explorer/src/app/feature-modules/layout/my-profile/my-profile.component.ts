import { Component, OnInit,OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { LayoutService } from '../layout.service';
import { Person } from 'src/app/shared/model/person.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MyFollowersComponent } from '../my-followers/my-followers.component';
import { MyFollowingsComponent } from '../my-followings/my-followings.component';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { Tour } from '../../tour-execution/model/tour-model';
import { Router } from '@angular/router';
import { UserExpirience } from '../model/userExperience';
import {WalletService} from "../../marketplace/wallet.service";


@Component({
  selector: 'xp-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit,OnDestroy{
  user: User;
  profile: Person;
  isDisabled: boolean = true;
  myFollowers: Person[] = [];
  myFollowings: Person[] = [];
  userXP: UserExpirience;
  tours: Tour[] = [];
  userId: number;
  purchased_tours: number;
  balance: number;
  walletSub: any;
  profileDetailsForm = new FormGroup({
    name: new FormControl({ value: '', disabled: true }, [Validators.required]),
    surname: new FormControl({ value: '', disabled: true }, [Validators.required]),
    biography: new FormControl({ value: '', disabled: true }),
    motto: new FormControl({ value: '', disabled: true }),
    profilePic: new FormControl({ value: '', disabled: true })
  })

  constructor(private authService: AuthService,
              private service: LayoutService,
              public dialog: MatDialog,
              private Executionservice: TourExecutionService,
              private router: Router,
              private walletService: WalletService){
    this.user = this.authService.user$.getValue();
  }

  ngOnInit(): void {
    this.getTours()
    this.GetUnusedTours()
    this.getXP()
    this.getWalletBalance();
    this.service.getUserProfile(this.user.id, this.user.role).subscribe({
        next: (result =>{
          this.profile = result;

          this.profileDetailsForm.patchValue({
            name: this.profile.name,
            surname: this.profile.surname,
            biography: this.profile.biography,
            motto: this.profile.motto,
            profilePic: this.profile.profilePic
          })
        }),
        error: (error: any) => console.log(error),
        complete: (): void => {
          this.service.getFollowers(this.user.id, this.user.role).subscribe({
            next: (result => this.myFollowers = result),
            error: (error: any) => console.log(error),
            complete: (): void => {
              this.service.getFollowings(this.user.id, this.user.role).subscribe({
                next: (result => this.myFollowings = result),
                error: (error: any) => console.log(error),
                complete: (): void =>{}
              })
            }
          })
        }
    })
  }

  getXP(): void {
    this.service.getXP(this.user.id).subscribe({
      next: (res => { this.userXP = res; console.log(this.userXP)}),
      error: (error: any) => console.log(error)
    })
  }
  getTours(): void {
    this.Executionservice.getUsedTours(this.user.id).subscribe({
      next: (res => { this.tours = res; }),
      error: (error: any) => console.log(error)
    })
  }

  GetUnusedTours(): void {
    this.Executionservice.getPurchasedTours(this.user.id).subscribe({
      next: (res => { this.purchased_tours = res.length; }),
      error: (error: any) => console.log(error)
    })
  }

  enableUpdate(): void {
    this.isDisabled = !this.isDisabled;

    this.profileDetailsForm.enable();

    console.log(this.isDisabled);
    console.log(this.profileDetailsForm.value.profilePic);

    if (this.isDisabled) {
      this.setDataValues();

      this.service.update(this.profile, this.user.id, this.user.role).subscribe({
        next: (result => {}),
        error: (error: any) => {
          console.log(error)
          this.isDisabled = false;
        },
        complete: (): void => {
          this.isDisabled = true;
        }
      });
    }

  }

  setDataValues(): void {
    this.profile.name = this.profileDetailsForm.value.name || '';
    this.profile.surname = this.profileDetailsForm.value.surname || '';
    this.profile.biography = this.profileDetailsForm.value.biography || '';
    this.profile.motto = this.profileDetailsForm.value.motto || '';
    this.profile.profilePic = this.profileDetailsForm.value.profilePic;
  }

  showFollowers(): void{
      const dialogRef = this.dialog.open(MyFollowersComponent, {
        width: '35vw',
        height: '35vw',
        data: {followers: this.myFollowers}
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
  }

  showFollowings(): void{
    const dialogRef = this.dialog.open(MyFollowingsComponent, {
      width: '35vw',
      height: '35vw',
      data: {followers: this.myFollowings}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  showTourAllDetails(tourId:number):void{
    this.router.navigate(['/tour-all-details/' + tourId]);
  }

  getWalletBalance(){
    this.walletSub = this.walletService.getWallet().subscribe((wallet) =>{
      this.balance = wallet.balance;
    })
  }

  ngOnDestroy(): void {
    this.walletSub.unsubscribe();
  }
}
