import { Observable } from 'rxjs';

// Création d'un Observable qui émet les valeurs 1, 2, 3 puis se termine
const monObservable = new Observable<number>(observer => {
  observer.next(1); // Émet la première valeur
  observer.next(2); // Émet la deuxième valeur
  observer.next(3); // Émet la troisième valeur
  observer.complete(); // Signale la fin de la séquence
});

monObservable.subscribe({
  next: (valeur) => console.log('Valeur reçue :', valeur), // Callback pour les valeurs
  error: (err) => console.error('Erreur :', err), // Callback pour les erreurs
  complete: () => console.log('La séquence est terminée.') // Callback à la fin
});


// Sortie dans la console :
// Valeur reçue : 1
// Valeur reçue : 2
// Valeur reçue : 3
// La séquence est terminée.

/* 
    body
        button id='mon-boutton'

*/

import { fromEvent, filter } from 'rxjs';

const bouton = document.getElementById('mon-bouton')!;


fromEvent(bouton, 'click')
  .pipe(
    // N'autorise que les clics dont le bouton de la souris est le 0 (bouton gauche)
    filter((event: MouseEvent) => (event.button === 0))
  )
  .subscribe(event => {
    console.log('Clic sur le bouton gauche !');
  });

const mouveauTb =  Array(100).fill(0).filter((valeur, index) => index !== 1)
