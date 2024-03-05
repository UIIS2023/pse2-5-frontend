import { Component, OnInit } from '@angular/core';
import { Club } from '../model/club.model';
import { LayoutService } from '../layout.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit {

  club: Club[] = [];
  selectedClub: Club;
  shouldEdit: boolean;
  shouldRenderClubForm: boolean = false;
  userHasCreatedClub: boolean = false;
  userHasDeletedClub: boolean;
  shouldRenderInviteKick: boolean = false;

  constructor(private service: LayoutService, private authService: AuthService) { }

  ngOnInit(): void {
    this.getClubs();
  }

  getClubs() {
    this.service.getClubs().subscribe({
      next: (result: PagedResults<Club>) => {
        this.club = result.results;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  canUserEdit(club: Club): boolean {
    const canEdit = club.touristId === this.authService.user$.value.id;
    return canEdit;
  }

  canUserDelete(club: Club): boolean {
    const canEdit = club.touristId === this.authService.user$.value.id;
    return canEdit;
  }

  onEditClicked(club: Club): void {
    this.shouldEdit = true;
    this.shouldRenderInviteKick = true;
    this.selectedClub = club;
  }

  onAddClicked(): void {
    this.shouldRenderClubForm = true;
    this.shouldRenderInviteKick = false;
    this.shouldEdit = false;
    this.userHasCreatedClub = true;
  }

  deleteClub(club: Club): void {
    this.service.deleteClub(club).subscribe({
      next: (_) => {
        this.getClubs();
        this.userHasCreatedClub = false;
        this.userHasDeletedClub = true;

      }
    });
  }
}
