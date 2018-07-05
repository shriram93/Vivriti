import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cartItems = new BehaviorSubject<string>("Undefined");
  cartItemsObservable = this.cartItems.asObservable();
  constructor() { }

  changeCartItems(cartItems: any) {
    this.cartItems.next(cartItems);
  }

}
