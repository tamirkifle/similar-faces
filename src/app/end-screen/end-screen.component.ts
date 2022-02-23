import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreTrackerService } from '../score-tracker.service';

@Component({
  selector: 'app-end-screen',
  templateUrl: './end-screen.component.html',
  styleUrls: ['./end-screen.component.css']
})
export class EndScreenComponent implements OnInit {
  constructor(private router: Router, public scoreTracker: ScoreTrackerService) { }

  ngOnInit(): void {
    if(this.scoreTracker.count !== this.scoreTracker.challengeNo){
      this.router.navigate(['/play']);
    }

  }

  resetGame(){
    this.scoreTracker.count = 0;
    this.router.navigate(['/play']);
    this.scoreTracker.score = 0;


  }

}
