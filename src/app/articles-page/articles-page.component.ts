import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Article, Category} from '../model';
import {ArticleService} from '../services/article.service';
import {Subscription} from 'rxjs';
import {HebrewDateService} from '../services/hebrew-date.service';
import {Router} from '@angular/router';
import {CategoryService} from '../services/category.service';

const SEARCH_ON_ARTICLE_CONTENT_KEY = 'search_on_article_content_key';

@Component({
    selector: 'app-articles-page',
    templateUrl: './articles-page.component.html',
    styleUrls: ['./articles-page.component.scss']
})
export class ArticlesPageComponent implements OnInit, OnDestroy {

    public allArticles: Article[];
    public articles: Article[];
    public categories: Category[];
    public searchText: string;
    public subscription: Subscription;
    public searchOnArticleContent: boolean;

    constructor(private articleService: ArticleService,
                private categoryService: CategoryService,
                private hebrewDateService: HebrewDateService,
                private ngZone: NgZone,
                private router: Router) {

        this.searchOnArticleContent = localStorage.getItem(SEARCH_ON_ARTICLE_CONTENT_KEY) === 'true';
    }

    public ngOnInit(): void {
        this.initCategories();
        this.initArticles();
    }

    public navigate(commands: any[]): void {
        this.ngZone.run(() => this.router.navigate(commands)).then();
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public onSearchTextChange(): void {
        const fixedSearchText = this.searchText.toLowerCase();
        this.articles = this.allArticles.filter(article =>
            article.title.toLowerCase().includes(fixedSearchText) ||
            (this.searchOnArticleContent && article.sections.some(section =>
                (section.header && section.header.toLowerCase().includes(fixedSearchText)) ||
                section.content.toLowerCase().includes(fixedSearchText))));
    }

    public onSearchTypeChange(): void {
        localStorage.setItem(SEARCH_ON_ARTICLE_CONTENT_KEY, this.searchOnArticleContent.toString());
    }

    private initCategories(): void {
        const subscription = this.categoryService.getCategories().subscribe(categories => {
            this.categories = categories;
            subscription.unsubscribe();
        });
    }

    private initArticles() {
        this.subscription = this.articleService.getArticles().subscribe(articles => {
            this.allArticles = articles;
            if (this.searchText) {
                this.onSearchTextChange();
            } else {
                this.articles = articles;
            }
        });
    }
}
