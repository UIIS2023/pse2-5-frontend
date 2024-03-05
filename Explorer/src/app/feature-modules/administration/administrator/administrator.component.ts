import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserInformation } from '../model/user_information.model';
import { AdministrationService } from '../administration.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { User } from '../model/user.model';
import { MatTableDataSource } from '@angular/material/table';
import * as signalR from "@microsoft/signalr";
import {environment} from "../../../../env/environment";

@Component({
  selector: 'xp-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css']
})
export class AdministratorComponent implements OnInit{

    users:UserInformation[]=[];
    userToBlock = {} as User;


    constructor(private service:AdministrationService) { }

    ngOnInit(): void {
      this.service.getUserInformation().subscribe({
        next:(result:PagedResults<UserInformation>)=>{
          this.users=result.results.sort((a,b)=>{return a.userId-b.userId});
        },
        error:(err:any)=>{
          console.log(err);
        }
      })
    }
    OnBlockClicked(user: UserInformation):void{
      this.userToBlock.id=user.userId;
      this.userToBlock.username=user.username
      this.userToBlock.role=user.role
      this.userToBlock.isActive=user.isActive
      this.userToBlock.password=user.password
      this.service.blockUser(this.userToBlock).subscribe({
        next:(_)=>{
          this.ngOnInit()
        }
      })
    }

    addCoins(user: UserInformation,coinsStr:string): void{

      let coins = Number(coinsStr)
      if (confirm("Please confirm your action")) {

        this.service.addCoins(user.userId, coins).subscribe({
          next: (response) => {
            user.balance += coins;
            this.sendNotification(user.userId.toString(),coins.toString(),user.balance.toString())
            alert(`${coins}AC added to user ${user.username} successfully!`);
          },
          error: (error) => {
            alert("Error while adding coins to tourist!")
          }
        });

      }



    }

    sendNotification(recipientId: string,  addedCoins: string,  balance: string): void{

      let hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.socketHost,{
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .build();

      hubConnection.start().then(() => {
        hubConnection.invoke("BalanceChanged",recipientId,addedCoins,balance).then(() => {
          hubConnection.stop();
        });
      })
        .catch((err) => {
        console.error(err);
      });

    }
}
