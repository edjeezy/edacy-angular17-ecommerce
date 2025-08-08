import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Product } from '../models/product';


@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = 'http://localhost:3000/products';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl)
            .pipe(
                retry(3),
                catchError(this.handleError)
            )
    }

    // READ: Get a single product by ID
    getProduct(id: number): Observable<Product> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Product>(url).pipe(
            retry(3),
            catchError(this.handleError)
        )
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
            // Une erreur côté client ou réseau s'est produite.
            console.error('An error occurred:', error.error);
        } else {
            // Le backend a retourné un code d'échec.
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Retourne un observable avec un message d'erreur pour l'utilisateur.
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}
