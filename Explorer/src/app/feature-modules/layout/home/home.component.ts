import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';

@Component({
  selector: 'xp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  hiddenElements: NodeListOf<HTMLElement>;

  @ViewChild('explorePage', { static: true }) explorePage: ElementRef;

  constructor(private ngZone: NgZone) {}
  scrollToExplorePage() {
    this.ngZone.run(() => {
      this.explorePage.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show-main');
      } else {
        entry.target.classList.remove('show-main');
      }
    });
  });

  ngOnInit() {
    this.hiddenElements = document.querySelectorAll('.hidden');
    this.hiddenElements.forEach((el) => this.observer.observe(el));
  }
}
