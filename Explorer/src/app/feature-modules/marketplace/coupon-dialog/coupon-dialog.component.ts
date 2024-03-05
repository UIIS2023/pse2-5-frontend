import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tour } from 'src/app/feature-modules/tour-execution/model/tour-model';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { Coupon } from '../model/coupon.model';


@Component({
  selector: 'xp-coupon-dialog',
  templateUrl: './coupon-dialog.component.html',
  styleUrls: ['./coupon-dialog.component.css']
})
export class CouponDialogComponent {

  currentDate = new Date();
  discount = 0
  tours : Tour[]
  couponCode: string = '';

  constructor(
    public dialogRef: MatDialogRef<CouponDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { itemsInCart: Tour[] },
    private service: ShoppingCartService,
  ) { }

  ngOnInit(): void {
    this.fetchTourData();
  }

  fetchTourData(): void {

        this.tours = this.data.itemsInCart ;
        console.log(this.tours)
  }


  submitCoupon(): void {
    
      this.service.getCoupon(this.couponCode).subscribe((coupon) => {
          if(coupon!=null) {

            if(coupon.isUsed) alert("Code has already beed used")

            if (coupon.expirationDate) {
              const expirationDate = new Date(coupon.expirationDate);
              
  
              if (expirationDate > this.currentDate) {

                if (coupon.tourId) {
                   const foundTour =  this.tours.find(tour => tour.id === coupon.tourId);
                   
                   if (foundTour) {
                    this.discount = Math.floor(coupon.discount * foundTour.price);
                    coupon.isUsed = true
                    this.service.updateCoupon(coupon).subscribe({
                      next: (result: Coupon) => {
                        this.dialogRef.close({ success: true, discount: this.discount });
                      }
                    })
                   } else {
                     alert('No matching tour in shopping cart to discard');
                   }  
                } else {

                  this.tours.forEach(tour => {
                    if (tour.authorId === coupon.authorId) {
                      
                      this.discount = this.discount + Math.floor(coupon.discount * tour.price);
                    }
                  });
                  coupon.isUsed = true
                  this.service.updateCoupon(coupon).subscribe({
                    next: (result: Coupon) => {
                      this.dialogRef.close({ success: true, discount: this.discount });
                    }
                  })
                }
                     
              } else alert('Coupon has expired');
          } else {

            if (coupon.tourId) {
               const foundTour =  this.tours.find(tour => tour.id === coupon.tourId);
               
               if (foundTour) {
                this.discount =  Math.floor(coupon.discount * foundTour.price);
                coupon.isUsed = true
                this.service.updateCoupon(coupon).subscribe({
                  next: (result: Coupon) => {
                    this.dialogRef.close({ success: true, discount: this.discount });
                  }
                })
               } else {
                 alert('No matching tour in shopping cart to discard');
               }  
            } else {

              this.tours.forEach(tour => {
                if (tour.authorId === coupon.authorId) {
                  
                  this.discount = this.discount +  Math.floor(coupon.discount * tour.price);
                }
              });
              coupon.isUsed = true
              this.service.updateCoupon(coupon).subscribe({
                next: (result: Coupon) => {
                  this.dialogRef.close({ success: true, discount: this.discount });
                }
              })
            }
          }
        } 
          else alert("Entered coupon doesnt exist")
        },
        error => {
          alert("ERROR")
        }
      );
    
  }
}

