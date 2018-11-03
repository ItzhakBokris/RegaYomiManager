import {Component} from '@angular/core';
import {Article, ArticleSection} from './model';
import {ArticleService} from './services/article.service';
import {downloadFile, escapeCsvData} from './utils/files-utils';
import {CategoryNamePipe} from './pipes/category.pipe';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public isCsvGenerated: boolean;

    constructor(private articleService: ArticleService, private categoryNamePipe: CategoryNamePipe) {}

    public downloadData(): void {
        if (!this.isCsvGenerated) {
            this.isCsvGenerated = true;
            const subscription = this.articleService.getArticles().subscribe(articles => {
                downloadFile(this.generateArticlesCsvFileContent(articles), 'articles.csv');
                downloadFile(this.generateArticleSectionsCsvFileContent(articles), 'article-sections.csv');
                this.isCsvGenerated = false;
                subscription.unsubscribe();
            });
        }
    }

    private generateArticlesCsvFileContent(articles: Article[]): string {
        let content =
            '#,' +
            'Key,' +
            'title,' +
            'Category,' +
            'Topic,' +
            'Date,' +
            'Hebrew Date,' +
            'Last Modified Date,' +
            'Views Count\r\n';

        articles.forEach((article: Article, index: number) => {
            content +=
                (index + 1) + ',' +
                article.key + ',' +
                escapeCsvData(article.title) + ',' +
                escapeCsvData(this.categoryNamePipe.transform(article.category)) + ',' +
                escapeCsvData(article.topic) + ',' +
                ((article.date && new Date(article.date).toISOString()) || '') + ',' +
                escapeCsvData(article.hebrewDate) + ',' +
                ((article.lastModifiedDate && new Date(article.lastModifiedDate).toISOString()) || '') + ',' +
                '0\r\n';
        });
        return content;
    }

    private generateArticleSectionsCsvFileContent(articles: Article[]): string {
        let content = '#,Article,Header,Content,Source\r\n';
        let index = 0;
        articles.forEach((article: Article) =>
            article.sections.forEach((section: ArticleSection) =>
                content += (++index) + ',' +
                    article.key + ',' +
                    escapeCsvData(section.header) + ',' +
                    escapeCsvData(section.content) + ',' +
                    escapeCsvData(section.source) + '\r\n'));

        return content;
    }
}
