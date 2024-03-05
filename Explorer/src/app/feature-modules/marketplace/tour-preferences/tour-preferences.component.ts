import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../marketplace.service';
import { TourPreferences } from '../model/tour-preferences.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'xp-tour-preferences',
  templateUrl: './tour-preferences.component.html',
  styleUrls: ['./tour-preferences.component.css']
})
export class TourPreferencesComponent implements OnInit {
  hasPreferences: boolean
  tourPreference : TourPreferences = {
    difficultyLevel: NaN,
    walkingRate: NaN,
    bicycleRate: NaN,
    carRate: NaN,
    boatRate: NaN,
    tags: []
  } 

  constructor(private service: MarketplaceService,
    private snackBar: MatSnackBar){}

  ngOnInit(): void {
    this.getPreferences()
  }

  getPreferences(): void{
    this.service.getPreference().subscribe({
      next:(result : TourPreferences) => {
        if(!result){
          this.hasPreferences = false
        }
        else{
          this.tourPreference = result
          this.hasPreferences = true
          console.log(result)
        }
        
      },
      error: () =>{
        console.log(console.error())
      }
    }) 
  }

  deletePreferences(): void{
    this.service.deletePreference(this.tourPreference.id || 0).subscribe({
      next: (_) => {
        console.log("Uspesno obrisan");
        this.snackBar.open('Preferences successfully deleted!', 'Close', {
          duration: 5000
        });
        this.hasPreferences = false
      },
      error: () =>{
        console.error()
      }
    })
  }
}
