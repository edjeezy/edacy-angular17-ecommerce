import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap, take, tap } from 'rxjs';
import { Product } from '../../models/product';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  public products$!: Subscription;
  private searchTerms = new Subject<string>();
  searchResults$ = new Subject<Product[]>();
  searchSubscription!: Subscription;
  constructor(private productService: ProductService) { }


  onSearchChange(event: any): void {
    const term = event.target.value;
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.products$ = this.productService.getProducts().pipe(
      take(1),
      tap(products => this.searchResults$.next(products)),
      tap(produits => {
        this.searchSubscription =  this.searchTerms.pipe(
          // Attendre 300ms après chaque frappe avant de considérer le terme
          debounceTime(300),
          // Ignorer si le nouveau terme est le même que le précédent
          distinctUntilChanged(),
          // Annuler la requête HTTP précédente et en lancer une nouvelle
          switchMap((term: string) => {
            this.searchResults$.next(this.productService.search(produits, term))
            return this.searchResults$;
          })
          // autre ops
        ).subscribe();
      })
    ).subscribe();

  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe()
  }

}
