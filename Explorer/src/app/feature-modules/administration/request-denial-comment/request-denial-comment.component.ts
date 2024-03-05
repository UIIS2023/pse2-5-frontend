import { Component, Inject, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PublicFacility } from '../../tour-authoring/model/facility.model';
import { PublicTourKeyPoints } from '../../tour-authoring/model/tour-keypoints.model';
import { environment } from 'src/env/environment';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'xp-request-denial-comment',
  templateUrl: './request-denial-comment.component.html',
  styleUrls: ['./request-denial-comment.component.css'],
})
export class RequestDenialCommentComponent implements OnInit {
  private hubConnection: signalR.HubConnection;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AdministrationService
  ) {}

  ngOnInit(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.socketHost, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();
    this.hubConnection.start().catch((err) => {
      console.error(err);
    });
  }

  denyRequestForm = new FormGroup({
    comment: new FormControl(),
  });

  denyRequest() {
    if (this.data.type == 'keypoint') {
      this.service
        .changePublicKeypointStatus(this.data.id, 'Denied')
        .subscribe({
          next: (result: PublicTourKeyPoints) => {
            this.hubConnection
              .invoke('SendPublicKeyPointNotification', this.data.keypoint.name, 'Denied', this.data.keypoint.creatorId)
              .catch((err) => {
                console.error(err);
              });
            location.reload();
          },
        });
    } else if (this.data.type == 'facility') {
      this.service
        .changePublicFacilityStatus(this.data.id, 'Denied')
        .subscribe({
          next: (result: PublicFacility) => {
            this.hubConnection
              .invoke('SendPublicFacilityNotification', this.data.facility.name, 'Denied', this.data.facility.creatorId)
              .catch((err) => {
                console.error(err);
              });
            location.reload();
          },
        });
    } else {
      console.error();
    }
  }
}
