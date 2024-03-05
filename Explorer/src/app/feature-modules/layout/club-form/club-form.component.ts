import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LayoutService } from '../layout.service';
import { Club } from '../model/club.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-club-form',
  templateUrl: './club-form.component.html',
  styleUrls: ['./club-form.component.css']
})
export class ClubFormComponent implements OnChanges {

  @Output() clubUpdated = new EventEmitter<null>();
  @Input() club: Club;
  @Input() shouldEdit: boolean = false;
  userHasCreatedClub: boolean = false;
  @Input() userHasDeletedClub: boolean;


  constructor(private service: LayoutService, private authService: AuthService) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.clubForm.reset();
    if(this.shouldEdit) {
      this.clubForm.patchValue(this.club);
    }
  }

  clubForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    clubPicture: new FormControl('', [Validators.required])
  });

  addClub(): void {
    this.authService.user$.subscribe(user => {
      const club: Club = {
        name: this.clubForm.value.name || "",
        description: this.clubForm.value.description || "",
        clubPicture: this.clubForm.value.clubPicture || "",
        touristId: user.id
      };
      this.service.addClub(club).subscribe({
        next: (_) => {     
          this.clubForm.reset();
          this.userHasCreatedClub = true;         
          this.clubUpdated.emit();         
        }
      });
    });
  }

  updateClub(): void {
    this.authService.user$.subscribe(user => {
      const club: Club = {
        name: this.clubForm.value.name || "",
        description: this.clubForm.value.description || "",
        clubPicture: this.clubForm.value.clubPicture || "",
      };
      club.id = this.club.id;
      club.touristId = user.id;

      this.service.updateClub(club).subscribe({
        next: (_) => {
          this.clubForm.reset();
          this.clubUpdated.emit();
        }
      });
    });
  }
}





