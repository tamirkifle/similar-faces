import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { Face } from './face.model';

@Injectable({
  providedIn: 'root',
})
export class FaceCompareService {
  //NOTE: EXPIRED APIS, does not work at the moment
  private blobEndpoint = 'https://similarfaces.blob.core.windows.net/';
  private storageSAS =
    '?se=2021-07-19&sp=rl&spr=https&sv=2018-03-28&ss=b&srt=sco&sig=DFa0h8LUUnUoPIofpjqPtlalg%2B/Oj5F0Lt6ZwbmP7AQ%3D';
  private subscriptionKey = 'SUBSCRIPTION_KEY_HERE';
  private urlGetFaceId =
    'https://eastus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&recognitionModel=recognition_04&returnRecognitionModel=false&detectionModel=detection_03&faceIdTimeToLive=86400';

  private urlFaceVerify =
    'https://eastus.api.cognitive.microsoft.com/face/v1.0/verify';
  constructor(private http: HttpClient) {}

  compareFaces(face1Obj: Face, ...faces: Face[]): Observable<number[]> {
    const httpOptions = { headers: this.getHeaders(this.subscriptionKey) };
    const getFaceIdObservables = [
      this.getFaceId(face1Obj).pipe(tap((x) => console.log('base ', x))),
    ];
    for (let face of faces) {
      getFaceIdObservables.push(
        this.getFaceId(face).pipe(tap((x) => console.log(x)))
      );
    }
    return forkJoin(getFaceIdObservables).pipe(
      switchMap((faceIdArray) => {
        const verifyObservables = [];
        for (let i = 1; i < faceIdArray.length; i++) {
          verifyObservables.push(
            this.http
              .post<any>(
                this.urlFaceVerify,
                { faceId1: faceIdArray[0], faceId2: faceIdArray[i] },
                httpOptions
              )
              .pipe(map((data) => data.confidence * 100))
          );
        }
        return forkJoin(verifyObservables);
      })
    );
  }

  getFaceId({ face, isFemale }: Face): Observable<string> {
    const httpOptions = { headers: this.getHeaders(this.subscriptionKey) };
    const folder = isFemale ? 'female-faces' : 'male-faces';
    console.log(
      `https://similarfaces.blob.core.windows.net/${folder}/${face}.jpg${this.storageSAS}`
    );
    return this.http
      .post<any>(
        this.urlGetFaceId,
        { url: `${this.blobEndpoint}${folder}/${face}.jpg${this.storageSAS}` },
        httpOptions
      )
      .pipe(map((data) => data[0].faceId));
  }
  private getHeaders(subscriptionKey: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Ocp-Apim-Subscription-Key', subscriptionKey);
    return headers;
  }
}
