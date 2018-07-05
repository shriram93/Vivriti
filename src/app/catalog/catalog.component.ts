import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent {

  @Input() items: any;

  @Output() goAddToCart = new EventEmitter<number>();
  @Output() goRemoveFromCart = new EventEmitter<number>();

  constructor() {
  }

  addToCart(itemId) {
    this.goAddToCart.emit(itemId);
  }
  
  removeFromCart(itemId,itemQuantity) {
    if (itemQuantity > 0)
      this.goRemoveFromCart.emit(itemId);
  }

}
