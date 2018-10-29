import {Injectable} from '@angular/core';
import {Article} from './model';
import {snapshotToArray, snapshotToObject} from './utils/firebase-utils';
import {AngularFireDatabase} from '@angular/fire/database';
import {Observable} from 'rxjs';
import {Subscriber} from 'rxjs/src/internal/Subscriber';

@Injectable()
export class ArticleService {

    constructor(private database: AngularFireDatabase) {}

    public getArticles(): Observable<Article[]> {
        return Observable.create((subscribe: Subscriber<Article[]>) => {
            this.database
                .list('/articles').query
                .orderByChild('date')
                .on('value', snapshot => subscribe.next(snapshotToArray(snapshot)));
        });
    }

    public getArticle(articleKey: string): Observable<Article> {
        return Observable.create((subscribe: Subscriber<Article>) => {
            this.database
                .object(`articles/${articleKey}`)
                .snapshotChanges()
                .subscribe(snapshotAction => {
                    if (snapshotAction.payload.exists()) {
                        subscribe.next(snapshotToObject(snapshotAction.payload));
                    }
                });
        });
    }

    public updateArticle(article: Article): Promise<void> {
        return this.database.object(`/articles/${article.key}`).update({
            ...article,
            key: null,
            lastModifiedDate: new Date().getTime()
        });
    }

    public addArticle(article: Article): PromiseLike<void> {
        return this.database.list('articles').push({
            ...article,
            lastModifiedDate: new Date().getTime()
        });
    }

    public deleteArticle(article: Article): Promise<void> {
        return this.database.object(`/articles/${article.key}`).remove();
    }
}
