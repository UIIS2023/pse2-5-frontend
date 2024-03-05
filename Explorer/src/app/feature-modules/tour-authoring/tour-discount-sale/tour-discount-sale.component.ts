import { Component, EventEmitter, Output } from '@angular/core';
import { TourAuthoringService } from '../tour-authoring.service';
import { Sales } from '../model/tour-discount-sale.model';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'xp-tour-discount-sale',
  templateUrl: './tour-discount-sale.component.html',
  styleUrls: ['./tour-discount-sale.component.css']
})
export class TourDiscountSaleComponent {
  savedDiscountId: number;
  isDiscountSaved: boolean = false;

  salesData: Sales = {
    startDate: new Date(),
    endDate: new Date(),
    discountPercentage:0
  };
  
  constructor(private tourAuthoringService: TourAuthoringService, public dialogRef: MatDialogRef<TourDiscountSaleComponent>) {}

  minEndDate(): string {
    const minDate = new Date();
    return minDate.toISOString().split('T')[0];
  }

  maxEndDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate.toISOString().split('T')[0];
  }

  saveSaleDiscount(): void {
    const maxEndDate = new Date();
    maxEndDate.setDate(maxEndDate.getDate() + 14);

    if (this.salesData.endDate > maxEndDate) {
      console.warn('End date cannot be more than 14 days from the current date.');
      return;
    }

    if (this.salesData.endDate < this.salesData.startDate) {
      console.warn('End date cannot be before the start date.');
      return;
    }

    this.tourAuthoringService.saveSaleDiscount(this.salesData).subscribe(
      response => {
        alert('Sucessfully saved!')
        this.savedDiscountId = response.id;
        this.isDiscountSaved = true;
        this.closeDialogWithData();
      },
      error => {
        console.error('Error saving discount:', error);
      }
    );
  }

  removeSaleDiscount(): void {
    if (this.savedDiscountId) {
      this.tourAuthoringService.removeSaleDiscount(this.savedDiscountId).subscribe(
        response => {
          alert('Sucessfully removed!')
          this.savedDiscountId = -1;
          this.isDiscountSaved = false;

        },
        error => {
          console.error('Error removing discount:', error);
        }
      );
    } else {
      console.warn('No saved discount ID available for removal.');
    }
  }

  closeDialogWithData(): void {
    const data = {
      discountPercentage: this.salesData.discountPercentage,
    };
  
    console.log('Closing dialog with data:', data);
    this.dialogRef.close(data);
  }
}
