import { Component, Inject, LOCALE_ID, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { ShoppingCartService } from "../../marketplace/shopping-cart/shopping-cart.service";
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { environment } from 'src/env/environment';
import * as signalR from '@microsoft/signalr';
import { LayoutService } from '../layout.service';
import { SavedNotification } from '../model/savedNotification.model';
import { formatDate } from '@angular/common';
import { TourProblemMessage } from '../model/tourProblemMessage.model';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import {TokenStorage} from "../../../infrastructure/auth/jwt/token.service";
import {WalletService} from "../../marketplace/wallet.service";
import { UserExpirience } from '../model/userExperience';


@Component({
  selector: 'xp-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private hubConnection: signalR.HubConnection;
  user: User | undefined;
  cartSize: number = 0;
  cartSub: any;
  savedNotifications: SavedNotification[];
  unreadTourProblemMessages: TourProblemMessage[];

  constructor(private authService: AuthService,
    private router: Router,
    private tourExecutionService: TourExecutionService,
    private layoutService: LayoutService,
    private cartService: ShoppingCartService,
    @Inject(LOCALE_ID) private locale: string,
    private tourAuthoringService: TourAuthoringService,
              private tokenStorage: TokenStorage,
              private walletService: WalletService) { }
   userxp:UserExpirience


  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;

      if(user !== null){
        if(this.user.role==='tourist')
        {
          this.getXP()
        }
        this.layoutService.getFollowersNotifications(this.user.id, this.user.role).subscribe({
          next: (result => this.savedNotifications = result),
          error: (error: any) => console.log(error),
          complete: (): void => {
            this.savedNotifications.forEach(savedNotification => {
              const notification = savedNotification.fullName + " started following you " + formatDate(savedNotification.timeOfArrival, 'dd/MM/yyyy HH:mm', this.locale);
              const ulElement: HTMLElement | null = document.getElementById('notifications-ul');

              if (ulElement) {
                const liElement = document.createElement('li');
                liElement.innerHTML =
                  `
                  <li>
                    <div class="dropdown-item d-flex align-items-center">
                      <span class="h6 mb-0 "style="white-space: nowrap">
                        `  + notification + `
                      </span>
                    </div>
                  </li>
                `;


                ulElement.append(liElement);
              }

            });
          }
        })
      }
     });

    this.loadCartSize();
  

    let token = this.tokenStorage.getAccessToken()!;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.socketHost,{
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory(): string {
          return token;
        }

      })
      .build();
    this.hubConnection.start().catch((err) => {
      console.error(err);
    });



    this.hubConnection.on(
      'ReceivePublicKeyPointNotification',
      (publicKeyPoint: string, status: string, creatorId: number) => {

      const notification = "Public keypoint '" + publicKeyPoint + "' has been " + status.toLowerCase() + '.';
      const ulElement: HTMLElement | null = document.getElementById('notifications-ul');
      const badge = status === 'Approved'
                    ? '<i class="bi bi-check2-circle me-1"></i>'
                    : '<i class="bi bi-x-circle me-1"></i>';
      const color = status === 'Approved' ? 'text-success' : 'text-danger';

      if (ulElement) {
        const liElement = document.createElement('li');
        liElement.innerHTML =
          `
          <li>
            <div class="dropdown-item d-flex align-items-center">
              <span class="h6 mb-0 ` + color + `"style="white-space: nowrap">
            ` + badge + notification + `
              </span>
            </div>
          </li>
        `;

        if(this.user?.id === creatorId){
          ulElement.appendChild(liElement);
        }
      }
    }
  );

  this.hubConnection.on(
    'ReceivePublicFacilityNotification',
     (publicFacility: string, status: string, creatorId: number) => {

      const notification = "Public facility '" + publicFacility + "' has been " + status.toLowerCase() + '.';
      const ulElement: HTMLElement | null = document.getElementById('notifications-ul');
      const badge = status === 'Approved'
                    ? '<i class="bi bi-check2-circle me-1"></i>'
                    : '<i class="bi bi-x-circle me-1"></i>';
      const color = status === 'Approved' ? 'text-success' : 'text-danger';

      if (ulElement) {
        const liElement = document.createElement('li');
        liElement.innerHTML =
          `
          <li>
            <div class="dropdown-item d-flex align-items-center">
              <span class="h6 mb-0 ` + color + `"style="white-space: nowrap">
                ` + badge + notification + `
              </span>
            </div>
          </li>
        `;

        if(this.user?.id === creatorId){
          ulElement.appendChild(liElement);
        }
      }

    }
    );

    this.hubConnection.on(
      'ReceiveNewFollowerNotification',
      (follower: string, status: string, followedId: number) => {

        const notification = follower + " " + status + " just now";
        const ulElement: HTMLElement | null = document.getElementById('notifications-ul');

        if (ulElement) {
          const liElement = document.createElement('li');
          liElement.innerHTML =
            `
            <li>
              <div class="dropdown-item d-flex align-items-center">
                <span class="h6 mb-0 "style="white-space: nowrap">
                  <svg width="30" height="30">
                    <use xlink:href="#circle" />
                  </svg>`  + notification + `
                </span>
              </div>
            </li>
          `;

          if (this.user?.id === followedId) {
            ulElement.appendChild(liElement);
          }
        }
      }
    );

    this.hubConnection.on(
      'ReceiveFollowerMessageNotification',
      (recipientId: number, senderUsername: string) => {

        const notification = senderUsername + " " + "sent a message.";
        const ulElement: HTMLElement | null = document.getElementById('notifications-ul');

        if (ulElement) {
          const liElement = document.createElement('li');
          liElement.innerHTML =
            `
            <li>
              <div class="dropdown-item d-flex align-items-center">
                <span class="h6 mb-0 "style="white-space: nowrap">
                  <svg width="30" height="30">
                    <use xlink:href="#circle" />
                  </svg>`  + notification + `
                </span>
              </div>
            </li>
          `;

          if (this.user?.id === recipientId) {
            ulElement.appendChild(liElement);
          }
        }
      }
    );

    this.hubConnection.on(
      'ReceiveTourProblemMessageNotification',
      (recipientId: number) => {
        const notification = "You have new messages about reported problems!";
        const ulElement: HTMLElement | null = document.getElementById('notifications-ul');
        if (ulElement) {
          const liElement = document.createElement('li');
          liElement.innerHTML =
            `
        <li>
          <div class="dropdown-item d-flex align-items-center custom-notification">
            <span class="h6 mb-0 custom-text-style">
              ${notification}
            </span>
          </div>
        </li>
      `;
          liElement.addEventListener('click', () => {
            this.router.navigate(['/reported-problems']);
          });

          if (this.user?.id === recipientId) {
            liElement.addEventListener('click', () => {
                          this.router.navigate(['/reported-problems']);
                         });
            ulElement.appendChild(liElement);

          }
        }
      }
    );

    this.hubConnection.on(
      'ReceiveDeadlineNotification',
      (authorUsername: string, tourId: number, deadline: Date) => {
        let tour:string;
        var notification:string;
        notification="";
        tour="";
        if(this.user?.role==="author")
        {
          this.tourAuthoringService.getTourById(tourId).subscribe((result) => {
            tour = result.name;
            notification =  "Problem on tour: " + tour + " should be resloved by " + formatDate(deadline, 'dd/MM/yyyy', this.locale) + '.';
          const ulElement: HTMLElement | null = document.getElementById('notifications-ul');

          if (ulElement) {
            const liElement = document.createElement('li');
            liElement.innerHTML =
              `
              <li>
                <div class="dropdown-item d-flex align-items-center">
                  <span class="h6 mb-0 ` + `"style="white-space: nowrap">
                    `  + notification + `
                  </span>
                </div>
              </li>
            `;

            if (this.user?.username === authorUsername) {
              ulElement.appendChild(liElement);
            }
          }
          });

        }

      }
    );

    this.hubConnection.on("BalanceChanged",(addedCoins:string , balance:string) => {
      const message = `${addedCoins}AC has been added to your account. New balance: ${balance}AC`;
      const color = 'text-success';
      this.showNotification(message,color,'');
      this.walletService.updateWalletBalance(Number(balance));
    });

  }

  showNotification(message:string,color: string,badge: string){
    const ulElement: HTMLElement | null = document.getElementById('notifications-ul');
    if (ulElement) {
      const liElement = document.createElement('li');
      liElement.innerHTML =
        `
          <li>
            <div class="dropdown-item d-flex align-items-center">
              <span class="h6 mb-0 ` + color + `"style="white-space: nowrap">
            ` + badge + message + `
              </span>
            </div>
          </li>
        `;

      ulElement.appendChild(liElement);
    }

  }

  loadCartSize() {
    this.cartSub = this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartSize = cart.itemsInCart.length;
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.cartService.clearCart();
  }

  isOnLandingPage(): boolean {
    return this.router.url === '/';
  }

  ngOnDestroy(): void {
    this.cartSub.unsubscribe();
  }
  getXP(): void {
    this.layoutService.getXP(this.user!.id).subscribe({
      next: (res => { this.userxp = res; console.log(this.userxp)}),
      error: (error: any) => console.log(error)
    })
  }
}
