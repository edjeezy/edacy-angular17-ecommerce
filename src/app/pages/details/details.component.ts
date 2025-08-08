import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit, OnDestroy {
  public product$!: Observable<Product>;
  public selectedSize: string | null = null;
  public selectedColor: string | null = null;
  private paramsSub!: Subscription
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.productService.getProduct(id);
      })
    );

    this.paramsSub = this.route.queryParamMap.subscribe(params => {
      this.selectedSize = params.get('size');
      this.selectedColor = params.get('color');
    });
  }

  ngOnDestroy(): void {
    if (this.paramsSub) {
      this.paramsSub.unsubscribe();
    }
  }
}
