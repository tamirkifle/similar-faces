import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreTrackerService } from '../score-tracker.service';
import { FaceCompareService } from '../face-compare.service';
import { Face } from '../face.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.css']
})
export class GameScreenComponent implements OnInit {

  randomImgs: string[] = [];
  correctAnswerIndex = -1;
  correct = false;
  confidenceArray: number[] = [];
  private femaleImgIds = ['000001', '000002', '000005', '000009', '000010', '000011', '000014', '000018', '000022', '000024', '000026', '000027', '000028', '000029', '000031', '000034', '000035', '000040', '000042', '000043', '000045', '000047', '000054', '000057', '000058', '000062', '000063', '000066', '000071', '000073', '000074', '000075', '000077', '000078', '000083', '000085', '000087', '000088', '000089', '000092', '000094', '000097', '000098', '000099', '000101', '000103', '000107', '000108', '000112', '000121'];
  private maleImgIds = ['000007', '000008', '000012', '000013', '000015', '000016', '000020', '000021', '000023', '000025', '000032', '000033', '000037', '000038', '000048', '000050', '000051', '000052', '000055', '000064', '000065', '000068', '000070', '000072', '000076', '000079', '000080', '000081', '000090', '000091', '000104', '000109', '000113', '000114', '000115', '000119', '000123', '000125', '000127', '000129', '000130', '000134', '000135', '000136', '000143', '000152', '000153', '000160', '000164', '000171'];
  constructor(private router: Router, public scoreTracker: ScoreTrackerService, private faceCompare: FaceCompareService) { }
  showAnswers = false;

  ngOnInit(): void {
    this.scoreTracker.count = 1;
    this.getNewImages().subscribe(confidenceArray => {
      console.log(confidenceArray);
      this.confidenceArray = confidenceArray
      this.correctAnswerIndex = this.indexOfMax(confidenceArray);
      this.correct = false;
    });;
    // this.faceCompare.compareFaces({face: '000008', isFemale: false}, {face: '000001', isFemale: true}, {face: '000002', isFemale: true});
  }

  private indexOfMax(arr: number[]) {
    if (arr.length === 0) {
      return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }

    return maxIndex;
  }

  private getNewImages(): Observable<any> {
    let length = 0;
    let isFemale = false;
    if (Math.floor(Math.random() * 2) === 0) {
      isFemale = true;
    };// 0 female, 1 male
    if (isFemale) {
      length = this.femaleImgIds.length
    }
    else {
      length = this.maleImgIds.length
    }

    const randomIndices: number[] = []
    while (randomIndices.length < 4) { // We need 4 random indices
      let randomIndex = Math.floor(Math.random() * length);
      while (randomIndices.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * length);
      }
      randomIndices.push(randomIndex);
    }

    const randomImgs: string[] = [];

    for (let i = 0; i < randomIndices.length; i++) {
      if (isFemale) {
        randomImgs.push(`assets/faces/female/${this.femaleImgIds[randomIndices[i]]}.jpg`)
      }
      else {
        randomImgs.push(`assets/faces/male/${this.maleImgIds[randomIndices[i]]}.jpg`)
      }
    }
    // return of([1,2,10]).pipe(tap(() => this.randomImgs = randomImgs));
    return this.getAnswers(randomIndices, isFemale).pipe(tap(() => this.randomImgs = randomImgs));

  }

  private getAnswers(imageIndices: number[], isFemale: boolean): Observable<any> {
    let questionFaceObj: Face, choiceFaceObjs: Face[] = [];
    if (isFemale) {
      questionFaceObj = { face: `${this.femaleImgIds[imageIndices[0]]}`, isFemale: isFemale }
      for (let i = 1; i < imageIndices.length; i++) {
        choiceFaceObjs.push({ face: `${this.femaleImgIds[imageIndices[i]]}`, isFemale: isFemale })
      }
    }
    else {
      questionFaceObj = { face: `${this.maleImgIds[imageIndices[0]]}`, isFemale: isFemale }
      for (let i = 1; i < imageIndices.length; i++) {
        choiceFaceObjs.push({ face: `${this.maleImgIds[imageIndices[i]]}`, isFemale: isFemale })
      }
    }
    return this.faceCompare.compareFaces(questionFaceObj, ...choiceFaceObjs);
  }

  onChoiceClick(index: number) {

    if (this.correctAnswerIndex !== -1) {
      if (this.correctAnswerIndex === index) {
        this.correct = true;
        this.scoreTracker.score++;
      }
      this.showAnswers = true;

    }


  }

  onNext() {
    if (this.scoreTracker.count === this.scoreTracker.challengeNo) {
      this.router.navigate(['/end']);
    }
    else {
      this.getNewImages().subscribe(confidenceArray => {
        this.showAnswers = false;
        console.log(confidenceArray);
        this.confidenceArray = confidenceArray
        this.correctAnswerIndex = this.indexOfMax(confidenceArray);
        this.correct = false;
        this.scoreTracker.count++;

      });
    }
  }

}
