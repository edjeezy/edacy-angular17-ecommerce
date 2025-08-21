import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, retry, throwError } from 'rxjs';
import { Product } from '../models/product';


@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private apiUrl = 'http://localhost:3000/products';
    public errorMessage: string | null = null;
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

    getProduitsDerives(id: number): Observable<Product[]> {
        const url = `${this.apiUrl}/${id}`;
        return of([
            {
                "id": 1,
                "name": "T-Shirt Classique",
                "price": 20,
                "description": "Un t-shirt classique confortable et élégant en 100% coton.",
                "imageUrl": "https://placehold.co/600x400/cccccc/000000?text=T-Shirt"
            },
            {
                "id": 2,
                "name": "Jeans Modernes",
                "price": 55,
                "description": "Jean en denim de haute qualité avec une coupe slim moderne.",
                "imageUrl": "https://placehold.co/600x400/cccccc/000000?text=Jeans"
            },
        ])
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
            this.errorMessage = "Unexpected error"
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

    search(produits: Product[], term: string): Product[] {
        if (!term || !term.length) {
            return produits;
        }
        const resultat = produits.filter((produit) => produit.name.includes(term) || produit.description.includes(term));
        return resultat;
    }
}
