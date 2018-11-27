import {Injectable, NgZone} from '@angular/core';
import {Article, ArticleSection} from '../model';
import {snapshotToArray} from '../utils/firebase-utils';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {Observable, Subject, Subscriber} from 'rxjs';
import {HebrewDateService} from './hebrew-date.service';

@Injectable()
export class ArticleService {

    private articles: Article[];
    private articleMap: Map<string, Article>;
    private articlesChanges: Subject<Article[]>;

    constructor(private database: AngularFireDatabase,
                private hebrewDateService: HebrewDateService,
                private ngZone: NgZone) {

        this.articlesChanges = new Subject<Article[]>();
        this.database
            .list('/articles').query
            .orderByChild('date')
            .on('value', snapshot => {
                this.articles = snapshotToArray(snapshot).filter(article => article.isActive).reverse();
                this.articleMap = new Map<string, Article>();
                this.articles.map(article => this.articleMap.set(article.key, article));
                this.updateTakenDates();
                this.ngZone.run(() => this.articlesChanges.next(this.articles));
            });
    }

    public getArticles(): Observable<Article[]> {
        if (this.articles) {
            const observers = this.articlesChanges.observers;
            setTimeout(() => observers[observers.length - 1].next(this.articles));
        }
        return this.articlesChanges.asObservable();
    }

    public getArticle(articleKey: string): Observable<Article> {
        return Observable.create((subscribe: Subscriber<Article>) =>
            this.getArticles().subscribe(() => subscribe.next(this.articleMap.get(articleKey))));
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

    private updateTakenDates(): void {
        this.hebrewDateService.clearIsTakenDates();
        this.articles
            .map(article => new Date(article.date))
            .forEach(date => this.hebrewDateService.setIsTaken(date, true));
    }
}
