export interface Article {
    key?: string;
    title: string;
    category: string;
    topic: string;
    date: number;
    lastModifiedDate: number;
    hebrewDate: string;
    sections: ArticleSection[];
}

export interface ArticleSection {
    header?: string;
    content: string;
    source?: string;
}

export interface Category {
    key?: string;
    name: string;
}

export interface Topic {
    key?: string;
    name: string;
}
