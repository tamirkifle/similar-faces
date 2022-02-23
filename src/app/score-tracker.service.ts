import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreTrackerService {
  score = 0;
  count = 0;
  challengeNo = 5;
  constructor() { }
}
