import { Component, OnInit,OnDestroy } from '@angular/core';
import { ShoppingCart } from '../../model/shopping-cart.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { Tour } from 'src/app/feature-modules/tour-execution/model/tour-model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { BoughtItem } from '../../model/bought-item.model';
import { MarketplaceService } from '../../marketplace.service';
import { PaymentRecord } from '../../model/payment-record.model';
import { WalletService } from '../../wallet.service';
import { MatDialog } from '@angular/material/dialog';
import { CouponDialogComponent } from '../../coupon-dialog/coupon-dialog.component';

@Component({
  selector: 'app-cart-items',
  templateUrl: './cart-items.component.html',
  styleUrls: ['./cart-items.component.css']
})
export class CartItemsComponent implements OnInit,OnDestroy {
  shoppingCart: ShoppingCart;
  total:number;
  isCartEmpty: boolean;
  UserId: number;
  balance: number;
  walletSub: any;

  constructor(private shoppingCartService: ShoppingCartService, 
            private authService: AuthService,
            private marketService: MarketplaceService,
            private walletService:WalletService,
            private dialog: MatDialog) {

    this.shoppingCart = {
      userId: 0,
      itemsInCart: []
    };
  }

  ngOnDestroy(): void {
    this.walletSub.unsubscribe();
  }

  ngOnInit(): void {
    this.UserId = this.authService.user$.getValue().id;
    this.loadCartItems();

    this.total = this.shoppingCartService.calculateTotalPrice();
    this.subToWallet();
  }

  subToWallet(){
    this.walletSub = this.walletService.getWallet().subscribe((wallet) => {
      this.balance = wallet.balance;
    });
  }

  loadCartItems(): void {
    this.shoppingCartService.getCart().subscribe((cart: ShoppingCart) => {
      this.shoppingCart = cart;
      this.isCartEmpty = this.shoppingCart.itemsInCart.length === 0;

      this.shoppingCart.itemsInCart.filter(t => t.bundleId && t.firstInBundle).forEach(tour => {
        this.marketService.getBundleById(tour.bundleId!).subscribe({
          next: (result => tour.price = result.price),
          error: (error: any) => console.log(error),
          complete: (): void => {this.total = this.shoppingCartService.calculateTotalPrice();}
        })
      })
    });
  }

  openCouponDialog(): void {
    const dialogRef = this.dialog.open(CouponDialogComponent, {
      width: '300px',
      height: '300px',
      data: { itemsInCart: this.shoppingCart.itemsInCart  } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.total = this.total - result.discount;
      }
    });
  }  


  checkout(): void {

    this.shoppingCart.itemsInCart.forEach(tour => {
      console.log(tour.id, tour.firstInBundle)
      if(tour.firstInBundle){
        let paymentRecord : PaymentRecord = {
          id: 0,
          touristId: this.UserId,
          bundleId:  tour.bundleId!,
          price:  tour.price,
          dateTimeOfBuying : new Date().toISOString()
        };

        this.marketService.createPaymentRecord(paymentRecord).subscribe({
          next: (result => {}),
          error: (error: any) => console.log(error),
          complete: (): void => {this.total = 0}
        })
      }
    })


    if(this.total > this.balance)
    {
      alert("Cannot checkout, not enough coins inside wallet!");
      return;
    }

    const itemsToBuy: BoughtItem[] = this.shoppingCart.itemsInCart.map((tour: Tour) => {
      return {
        id : 0,
        userId: this.UserId,
        tourId: tour.id,
        isUsed: false
      };
    });


    this.shoppingCartService.buyItems(itemsToBuy,this.total).subscribe(
      response => {
        alert("Items purchased successfully!");
        console.log('Items purchased successfully', response);

        this.walletService.updateWalletBalance(this.balance-this.total);
        this.shoppingCartService.clearCart();
        this.loadCartItems();
      },
      error => {
        console.error('Error purchasing items', error);
      }
    );
  }


  removeFromCart(tour: Tour): void {
    this.shoppingCartService.removeItemFromCart(tour);
    if(tour.bundleId){
      this.shoppingCart.itemsInCart.filter(t => t.bundleId == tour.bundleId).forEach(t => {
        this.shoppingCartService.removeItemFromCart(t);
      })
    }
    this.total = this.shoppingCartService.calculateTotalPrice();
    
  }

  statusMap = new Map<number, string>([
    [0, 'Beginner'],
    [1, 'Intermediate'],
    [2, 'Advanced'],
    [3, 'Pro'],
  ]);


}

