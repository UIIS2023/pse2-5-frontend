import { Component, OnInit } from '@angular/core';
import { Bundle } from '../model/bundle.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';
import { MarketplaceService } from '../marketplace.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Tour } from '../model/tour.model';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'xp-bundle-view',
  templateUrl: './bundle-view.component.html',
  styleUrls: ['./bundle-view.component.css']
})
export class BundleViewComponent implements OnInit{
  user:User;
  bundles:Bundle[]=[];
  tours: Tour[] = [];
  constructor(private authService: AuthService, private router:Router, private service:MarketplaceService, private tourService: TourAuthoringService){}

  ngOnInit(): void {
    this.user = this.authService.user$.getValue();
    this.service.getBundlesByAuthorId(this.user.id).subscribe({//treba getByAuthorId()!!!!!
      next:(result: PagedResults<Bundle>) => {
        this.bundles = result.results.sort((a, b) => a.name.localeCompare(b.name));
        this.service.getToursByAuthorId(this.user.id).subscribe({
          next:(result: PagedResults<Tour>) => {
            this.tours = result.results;
          }
        })
      }
    });
    // this.service.getAllBundles().subscribe({//treba getByAuthorId()!!!!!
    //   next:(result: PagedResults<Bundle>) => {
    //     this.bundles = result.results.sort((a, b) => a.name.localeCompare(b.name));
    //     this.service.getToursByAuthorId(this.user.id).subscribe({
    //       next:(result: PagedResults<Tour>) => {
    //         this.tours = result.results;
    //       }
    //     })
    //   }
    // });
  }
  
  navigateCreate(){
    this.router.navigate(['/bundle-create']);
  }

  navigateUpdate(id:number,authorId:number){
    if(this.user.id==authorId){
      this.router.navigate(['/bundle-update/'+id]);
    }
  }

  archiveBundle(bundle: Bundle) {
    if(bundle.authorId == this.user.id)
    {
      bundle.bundleState = 2;
      this.service.archiveBundle(bundle).subscribe({
        next:() => {
          this.service.getAllBundles().subscribe({
            next: (result: PagedResults<Bundle>) => {
              this.bundles = result.results.sort((a, b) => a.name.localeCompare(b.name));
            }
          })
        }
      })
    }
  }

  deleteBundle(id:number,authorId:number){
    if(authorId==this.user.id){
      this.service.deleteBundle(id).subscribe({
        next:() => {
          this.bundles=this.bundles.filter(bundle => bundle.id!==id).sort((a, b) => a.name.localeCompare(b.name))
        }
      });
    }
    else{
      console.log('error')
    }
  }

  numberOfPublishedToursInBundle(bundle: Bundle): number {
    let numberOfPublishedTours: number = 0
    let selectedToursForBundle: Tour[] = [];
    selectedToursForBundle = this.tours.filter(item => bundle.toursId.includes(item.id || 0));
    numberOfPublishedTours = selectedToursForBundle.length;
    return numberOfPublishedTours;
  }

  publishBundle(bundle: Bundle) {
    if(bundle.authorId == this.user.id)
    {
      bundle.bundleState = 1;
      this.service.publishBundle(bundle).subscribe({
        next:() => {
          this.service.getAllBundles().subscribe({
            next: (result: PagedResults<Bundle>) => {
              this.bundles = result.results.sort((a, b) => a.name.localeCompare(b.name));
            }
          })
        }
      })
    }
  }
}
