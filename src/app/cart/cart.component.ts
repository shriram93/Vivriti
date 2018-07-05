import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartItems;
  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.cartItemsObservable.subscribe(
      items => {
        if (items == "" || items == "Undefined") {
          this.cartItems = [];
        }
        else {
          this.cartItems = JSON.parse(items);
          this.cartItems.forEach(item => {
            if(item.quantity == 0)
            {
              this.removeItem(item.id);
            }
          });
        }
      }
    );
  }

  removeItem(itemId) {
    let index = this.getItemIndex(itemId,this.cartItems);
    this.cartItems.splice(index,1);
    this.dataService.changeCartItems(JSON.stringify(this.cartItems));
  }

  getItemIndex(itemId,array) {
    let index = -1;
    array.some(function (entry, i) {
      if (entry.id == itemId) {
        index = i;
        return true;
      }
    });
    return index;
  }

}
