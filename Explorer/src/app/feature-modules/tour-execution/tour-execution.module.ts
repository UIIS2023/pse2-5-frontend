import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionSimulatorComponent } from './position-simulator/position-simulator.component';
import { MapModule } from 'src/app/shared/map/map.module';
import { BoughtToursComponent } from './bought-tours/bought-tours.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { TouristTourViewComponent } from './tourist-tour-view/tourist-tour-view.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { TourAllDetailsComponent } from './tour-all-details/tour-all-details.component';
import { KeypointSecretDialogComponent } from './keypoint-secret-dialog/keypoint-secret-dialog.component';
import { TourSearchComponent } from './tour-search/tour-search.component';
import { ChallengesViewComponent } from './challenges-view/challenges-view.component';
import { ChallengeLocationDialogComponent } from './challenge-location-dialog/challenge-location-dialog.component';



@NgModule({
  declarations: [
    PositionSimulatorComponent,
    BoughtToursComponent,
    TouristTourViewComponent,
    TourAllDetailsComponent,
    KeypointSecretDialogComponent,
    TourSearchComponent,
    ChallengesViewComponent,
    ChallengeLocationDialogComponent,
  ],
  imports: [
    CommonModule,
    MapModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    PositionSimulatorComponent,
    TouristTourViewComponent,
    TourAllDetailsComponent,
    TourSearchComponent
  ]
})
export class TourExecutionModule { }
