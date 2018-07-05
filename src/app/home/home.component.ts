import { Component, OnInit } from '@angular/core';
import { VivritiService } from '../services/vivriti.service';
import { DataService } from '../services/data.service';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  rawCatalog = [];
  catalog = {};
  beerStyles = [];
  filteredStyles = [];

  currentPageItems = [];
  currentSelectedCatalog = [];

  myControl: FormControl = new FormControl();

  allItems = [];

  cartItems = [];
  //pagaintion
  loading = false;
  limit = 10;
  page = 1;
  total = 0;

  //sort items
  lowToHigh = false;
  highToLow = false;

  filteredItems: Observable<string[]>;

  constructor(private vivritiAPI: VivritiService, private dataService: DataService) {

  }

  ngOnInit() {
    this.vivritiAPI.getCatalog().subscribe(
      res => {
        this.rawCatalog = res.json();
        let self = this;
        this.rawCatalog.forEach(function (item) {
          if (item.style == "") {
            let index = self.rawCatalog.indexOf(item);
            self.rawCatalog[index].style = "Uncategorized";
          }
        });
        this.beerStyles = this.rawCatalog.map(item => item.style)
          .filter((value, index, self) => self.indexOf(value) === index);
        this.beerStyles.sort();
        this.beerStyles.forEach((style) => {
          const styleMenu = this.rawCatalog.filter(item => {
            if (item.style == style) {
              item.quantity = 0;
              this.currentSelectedCatalog.push(item);
              this.allItems.push(item);
              return true;
            }
          });
          this.catalog[style] = styleMenu;
        });
        this.dataService.cartItemsObservable.subscribe(
          items => {
            if (items != "" && items != "Undefined") {
              this.cartItems = JSON.parse(items);
              this.cartItems.forEach(item => {
                let index = this.getItemIndex(item.id, this.currentSelectedCatalog);
                if (index != -1)
                  this.currentSelectedCatalog[index].quantity = item.quantity
              });
            }
          });
        this.getItems();
      },
      err => {
        console.log(err);
      }
    );
    this.filteredItems = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter(val))
      );
  }

  filter(val: string): string[] {
    return this.allItems.filter(option =>
      option.name.toLowerCase().includes(val.toLowerCase()));
  }

  getItems(): void {
    let currentPage = this.page - 1;
    this.currentPageItems = this.currentSelectedCatalog.slice(currentPage * this.limit, (currentPage + 1) * this.limit);
    this.total = this.currentSelectedCatalog.length;
  }

  goToPage(n: number): void {
    this.page = n;
    this.getItems();
  }

  onNext(): void {
    this.page++;
    this.getItems();
  }

  onPrev(): void {
    this.page--;
    this.getItems();
  }

  onAddToCart(itemId) {
    //console.log("Add to cart called");
    let index = this.getItemIndex(itemId, this.cartItems);
    if (index == -1) {
      let item = this.allItems[this.getItemIndex(itemId, this.allItems)];
      item.quantity = 1;
      this.cartItems.push(item);
    }
    else {
      ++this.cartItems[index].quantity;
    }
    //console.log("Inside updateCart");
    this.dataService.changeCartItems(JSON.stringify(this.cartItems));
  }


  onRemoveFromCart(itemId) {
    let index = this.getItemIndex(itemId, this.cartItems);
    if (index > -1) {
      --this.cartItems[index].quantity;
      if (this.cartItems[index].quantity == 0) {
        this.cartItems.slice(index, 1);
      }
      //console.log("Inside updateCart");
      this.dataService.changeCartItems(JSON.stringify(this.cartItems));
    }

  }

  getItemIndex(itemId, array) {
    let index = -1;
    array.some(function (entry, i) {
      if (entry.id == itemId) {
        index = i;
        return true;
      }
    });
    return index;
  }

  selectCategory($event) {
    this.lowToHigh = false;
    this.highToLow = false;
    const elem = $event.target;
    let category = elem.nextSibling.innerHTML;
    let currentState = elem.checked;
    if (currentState == true) {
      this.filteredStyles.push(category);
    }
    else {
      let index = this.filteredStyles.indexOf(category);
      if (index > -1) {
        this.filteredStyles.splice(index, 1);
      }
    }
    //console.log(this.filteredStyles);
    this.updateCurrentSelectedCategory();
  }

  updateCurrentSelectedCategory() {
    this.currentSelectedCatalog = [];
    if (this.filteredStyles.length == 0) {
      this.beerStyles.forEach(style => {
        this.catalog[style].forEach(item => {
          this.currentSelectedCatalog.push(item);
        });
      });
    } else {
      this.beerStyles.forEach(style => {
        this.filteredStyles.forEach(selStyle => {
          if (selStyle.trim() == style.trim()) {
            this.catalog[style].forEach(item => {
              this.currentSelectedCatalog.push(item);
            });
          }
        });
      });
    }
    this.getItems();
  }

  goToItem(itemId) {
    this.lowToHigh = false;
    this.highToLow = false;
    //console.log(itemId);
    this.currentPageItems = [];
    this.allItems.forEach(item => {
      if (item.id == itemId) {
        this.currentPageItems.push(item);
        this.total = 1;
      }
    });
  }
  sortContent($event) {
    if (this.currentPageItems.length > 1) {
      const elem = $event.target;
      const sortType = elem.value;
      if (sortType === "Low to High" && this.lowToHigh == false) {
        this.lowToHigh = true;
        this.highToLow = false;
        this.currentSelectedCatalog.sort(this.compareItemAsc);
      }
      else if (sortType === "High to Low" && this.highToLow == false) {
        this.lowToHigh = false;
        this.highToLow = true;
        this.currentSelectedCatalog.sort(this.compareItemDesc);
      }
      this.getItems();
    }
  }

  compareItemAsc(itemA, itemB) {
    // Use toUpperCase() to ignore character casing
    let comparison = 0;
    if (itemA.abv > itemB.abv) {
      comparison = 1;
    } else if (itemA.abv < itemB.abv) {
      comparison = -1;
    }
    return comparison;
  }
  compareItemDesc(itemA, itemB) {
    // Use toUpperCase() to ignore character casing
    let comparison = 0;
    if (itemA.abv > itemB.abv) {
      comparison = 1;
    } else if (itemA.abv < itemB.abv) {
      comparison = -1;
    }
    return comparison * -1;
  }
 
}
