import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { interval, Observable, startWith, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-polling',
  templateUrl: './polling.component.html',
  styleUrl: './polling.component.css'
})
export class PollingComponent implements OnInit, OnDestroy {
  products$!: Observable<Product[]>;
  clean: any
  constructor(private prodService: ProductService) {}

  ngOnInit(): void {
    this.products$ = interval(1000).pipe(
      // `startWith(0)` garantit que la première requête est lancée immédiatement
      startWith(0),
      switchMap(() => this.prodService.getProducts())
    )
  }

  ngOnDestroy(): void {
  }
}
