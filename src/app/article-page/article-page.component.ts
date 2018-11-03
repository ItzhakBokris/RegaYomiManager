import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Article, Category, Topic} from '../model';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ArticleService} from '../services/article.service';
import {HebrewDateService} from '../services/hebrew-date.service';
import {Subscription} from 'rxjs';
import {ConfirmationDialogComponent} from '../components/confirmation-dialog/confirmation-dialog.component';
import {TopicService} from '../services/topic.service';
import {CategoryService} from '../services/category.service';

const GENERIC_ERROR_MESSAGE = 'משהו השתבש, אנא בדוק את חיבור האינטרנט או נסה מאוחר יותר';
const MAX_SECTIONS = 10;

@Component({
    selector: 'app-article-page',
    templateUrl: './article-page.component.html',
    styleUrls: ['./article-page.component.scss']
})
export class ArticlePageComponent implements OnInit, OnDestroy {

    public article: Article;
    public topics: Topic[];
    public filteredTopics: Topic[];
    public categories: Category[];
    public articlesSubscription: Subscription;
    public topicsSubscription: Subscription;
    public categoriesSubscription: Subscription;
    public articleKey: string;
    public isSubmitted: boolean;
    public isUpdating: boolean;
    public errorMessage: string;
    public successMessage: string;
    public form: FormGroup;
    public dateFilter: (date: Date) => boolean;

    constructor(private activateRoute: ActivatedRoute,
                private modalService: NgbModal,
                private articleService: ArticleService,
                private topicService: TopicService,
                private categoryService: CategoryService,
                private router: Router,
                private ngZone: NgZone,
                private hebrewDateService: HebrewDateService) {

        this.articleKey = activateRoute.snapshot.params.key;
        this.dateFilter = this.createDateFilter();
    }

    public get isNewArticle(): boolean {
        return !this.articleKey;
    }

    public ngOnInit(): void {
        this.initArticle();
        this.topicsSubscription = this.topicService.getTopics()
            .subscribe(topics => this.topics = topics);
        this.categoriesSubscription = this.categoryService.getCategories()
            .subscribe(categories => this.categories = categories);
    }

    public initArticle(): void {
        if (this.articleKey) {
            this.articlesSubscription = this.articleService.getArticle(this.articleKey).subscribe(article => {
                this.article = {...article};
                this.createSectionFormGroups();
            });
        } else {
            this.article = {
                title: '',
                category: '',
                topic: '',
                date: null,
                lastModifiedDate: 0,
                hebrewDate: '',
                sections: [{header: '', content: '', source: ''}]
            };
            this.createSectionFormGroups();
        }
    }

    public ngOnDestroy(): void {
        if (this.articlesSubscription) {
            this.articlesSubscription.unsubscribe();
        }
        if (this.topicsSubscription) {
            this.topicsSubscription.unsubscribe();
        }
        if (this.categoriesSubscription) {
            this.categoriesSubscription.unsubscribe();
        }
    }

    public toShowValid(controlName: string, formGroup?: FormGroup): boolean {
        const control = (formGroup || this.form).controls[controlName];
        return control.valid && (control.dirty || control.touched);
    }

    public toShowInvalid(controlName: string, formGroup?: FormGroup): boolean {
        const control = (formGroup || this.form).controls[controlName];
        return this.isSubmitted && control.invalid;
    }

    public save(): void {
        this.isSubmitted = true;
        if (this.form.valid) {
            this.updateArticle();
        }
    }

    public submit(): void {
        this.isSubmitted = true;
        if (this.form.valid) {
            this.postArticle();
        }
    }

    public delete(): void {
        const modalRef = this.modalService.open(ConfirmationDialogComponent);
        modalRef.componentInstance.title = 'מחיקת מאמר';
        modalRef.componentInstance.content = 'האם אתה בטוח שברצונך למחוק את המאמר?';
        modalRef.result.then(value => value &&
            this.articleService.deleteArticle(this.article).then(() => {
                window.close();
                setTimeout(() => this.router.navigate(['/']));
            }).catch(() => this.errorMessage = GENERIC_ERROR_MESSAGE));
    }

    public deleteSection(sectionIndex: number): void {
        const deleteAction = () => {
            this.article.sections.splice(sectionIndex, 1);
            if (this.article.sections.length === 0) {
                this.article.sections.push({header: '', content: '', source: ''});
            }
            this.createSectionFormGroups();
        };
        if (!this.article.sections[sectionIndex].content) {
            deleteAction();
        } else {
            const modalRef = this.modalService.open(ConfirmationDialogComponent);
            modalRef.componentInstance.title = 'מחיקת קטע';
            modalRef.componentInstance.content = 'האם אתה בטוח שברצונך למחוק את הקטע?';
            modalRef.result.then(value => value && deleteAction());
        }
    }

    public addSection(): void {
        if (this.article.sections.length < MAX_SECTIONS) {
            this.article.sections.push({header: '', content: '', source: ''});
            this.createSectionFormGroups();
        }
    }

    private postArticle(): void {
        this.isUpdating = true;
        this.articleService.addArticle(this.article)
            .then(result => {
                this.articleKey = result['key'];
                this.initArticle();
                this.successMessage = 'המאמר התווסף!';
                this.isUpdating = false;
            }, () => {
                this.errorMessage = GENERIC_ERROR_MESSAGE;
                this.isUpdating = false;
            });
        if (this.topics.every(topic => topic.name.toLowerCase() !== this.article.topic.toLowerCase())) {
            this.topicService.addTopic({name: this.article.topic}).then();
        }
    }

    private updateArticle(): void {
        this.isUpdating = true;
        this.articleService.updateArticle(this.article)
            .then(() => {
                this.successMessage = 'השינוי נשמר!';
                this.isUpdating = false;
            })
            .catch(() => {
                this.errorMessage = GENERIC_ERROR_MESSAGE;
                this.isUpdating = false;
            });
    }

    private createSectionFormGroups(): void {
        this.form = new FormGroup({
            title: new FormControl(this.article.title),
            category: new FormControl(this.article.category),
            topic: new FormControl(this.article.topic),
            date: new FormControl(this.article.date && new Date(this.article.date)),
            sections: new FormArray(this.article.sections.map(section => new FormGroup({
                header: new FormControl(section.header),
                content: new FormControl(section.content),
                source: new FormControl(section.source)
            })))
        });
        this.form.valueChanges.subscribe(value => {
            this.article = {
                ...this.article,
                ...value,
                date: value.date && value.date.getTime(),
                hebrewDate: value.date && this.hebrewDateService.convertToHebrew(value.date)
            };
            const searchedTopic = value.topic.toLowerCase();
            this.filteredTopics = this.topics.filter(topic => topic.name.toLowerCase().includes(searchedTopic));
        });
    }

    private createDateFilter(): (date: Date) => boolean {
        return (date: Date) => date.getTime() === this.article.date || !this.hebrewDateService.isTaken(date);
    }
}
