import {Injectable, NgZone} from '@angular/core';
import {snapshotToArray} from '../utils/firebase-utils';
import {AngularFireDatabase} from '@angular/fire/database';
import {Category} from '../model';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class CategoryService {

    private categories: Category[];
    private categoriesChanges: Subject<Category[]>;

    constructor(private database: AngularFireDatabase, private ngZone: NgZone) {
        this.categoriesChanges = new Subject<Category[]>();
        this.database.list('/categories').query.on('value', snapshot => {
            this.categories = snapshotToArray(snapshot);
            this.ngZone.run(() => this.categoriesChanges.next(this.categories));
        });
    }

    public getCategories(): Observable<Category[]> {
        if (this.categories) {
            const observers = this.categoriesChanges.observers;
            setTimeout(() => observers[observers.length - 1].next(this.categories));
        }
        return this.categoriesChanges.asObservable();
    }
}
