import {Pipe, PipeTransform} from '@angular/core';
import {CategoryService} from '../services/category.service';

@Pipe({name: 'categoryName'})
export class CategoryNamePipe implements PipeTransform {

    private categoryMap: Map<string, string>;

    constructor(private categoryService: CategoryService) {
        this.categoryService.getCategories().subscribe(categories => {
            this.categoryMap = new Map<string, string>();
            categories.map(category => this.categoryMap.set(category.key, category.name));
        });
    }

    public transform(categoryKey: string): string {
        return this.categoryMap.get(categoryKey);
    }
}
