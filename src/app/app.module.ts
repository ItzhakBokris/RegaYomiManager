import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {ArticlesPageComponent} from './articles-page/articles-page.component';
import {RouterModule, Routes} from '@angular/router';
import {environment} from '../environments/environment';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AngularFireModule} from '@angular/fire';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {ArticleService} from './services/article.service';
import {ArticlePageComponent} from './article-page/article-page.component';
import {HttpClientModule} from '@angular/common/http';
import {MatAutocompleteModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule} from '@angular/material';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {HebrewDateService} from './services/hebrew-date.service';
import {TopicService} from './services/topic.service';
import {CategoryService} from './services/category.service';
import {CategoryNamePipe} from './pipes/category.pipe';

const appRoutes: Routes = [
    {path: 'articles-page', component: ArticlesPageComponent},
    {path: 'article-page/:key', component: ArticlePageComponent},
    {path: 'article-page', component: ArticlePageComponent},
    {path: '**', redirectTo: 'articles-page'}
];

@NgModule({
    declarations: [
        AppComponent,
        ArticlesPageComponent,
        ArticlePageComponent,
        ConfirmationDialogComponent,
        CategoryNamePipe
    ],
    imports: [
        RouterModule.forRoot(appRoutes),
        BrowserModule,
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NoopAnimationsModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule
    ],
    entryComponents: [
        ConfirmationDialogComponent
    ],
    providers: [ArticleService, HebrewDateService, TopicService, CategoryService, CategoryNamePipe],
    bootstrap: [AppComponent]
})
export class AppModule {}
