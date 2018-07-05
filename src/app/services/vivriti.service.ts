import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VivritiService {
  private url = 'http://starlord.hackerearth.com/beercraft';
  
  constructor(private http: Http) {
  }

  getCatalog() {
    return this.http.get(this.url);
  }
}
