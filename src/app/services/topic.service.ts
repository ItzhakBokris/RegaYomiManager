import {Injectable, NgZone} from '@angular/core';
import {snapshotToArray} from '../utils/firebase-utils';
import {AngularFireDatabase} from '@angular/fire/database';
import {Topic} from '../model';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class TopicService {

    private topics: Topic[];
    private topicsChanges: Subject<Topic[]>;

    constructor(private database: AngularFireDatabase, private ngZone: NgZone) {
        this.topicsChanges = new Subject<Topic[]>();
        this.database.list('/topics').query.on('value', snapshot => {
            this.topics = snapshotToArray(snapshot);
            this.ngZone.run(() => this.topicsChanges.next(this.topics));
        });
    }

    public getTopics(): Observable<Topic[]> {
        if (this.topics) {
            const observers = this.topicsChanges.observers;
            setTimeout(() => observers[observers.length - 1].next(this.topics));
        }
        return this.topicsChanges.asObservable();
    }

    public addTopic(topic: Topic): PromiseLike<void> {
        return this.database.list('topics').push(topic);
    }
}
