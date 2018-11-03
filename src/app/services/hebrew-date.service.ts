import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';

const START_YEAR = 2018;
const YEARS_AHEAD = 10;
const DATES_MAP_KEY = 'dates_map';
const HEBREW_CALENDAR_URL = 'https://www.hebcal.com/hebcal/?v=1&cfg=json&lg=h&d=on&month=x&year=';

@Injectable()
export class HebrewDateService {

    private datePipe: DatePipe;
    private hebrewDateMap: { [fixedDate: string]: string };
    private isTakenDates: Set<string>;

    constructor(private http: HttpClient) {
        this.datePipe = new DatePipe('en-US');
        this.isTakenDates = new Set<string>();
        this.initHebrewDateMap();
    }

    public convertToHebrew(date: Date): string {
        return this.hebrewDateMap[this.getFixedDate(date)];
    }

    public setIsTaken(date: Date, value: boolean): void {
        if (value) {
            this.isTakenDates.add(this.getFixedDate(date));
        } else {
            this.isTakenDates.delete(this.getFixedDate(date));
        }
    }

    public clearIsTakenDates(): void {
        this.isTakenDates.clear();
    }

    public isTaken(date: Date): boolean {
        return this.isTakenDates.has(this.getFixedDate(date));
    }

    private getFixedDate(date: Date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    private initHebrewDateMap(): void {
        this.hebrewDateMap = JSON.parse(localStorage.getItem(DATES_MAP_KEY)) || {};
        const endYear = new Date().getFullYear() + YEARS_AHEAD;
        let checkedYearsCount = 0;
        for (let year = START_YEAR; year <= endYear; year++) {
            if (this.containsYear(year)) {
                checkedYearsCount++;
                continue;
            }
            this.http.get(HEBREW_CALENDAR_URL + year).subscribe(result => {
                result['items'].forEach(item => this.hebrewDateMap[item.date] = item.hebrew);
                checkedYearsCount++;
                if (checkedYearsCount === (endYear - START_YEAR) + 1) {
                    localStorage.setItem(DATES_MAP_KEY, JSON.stringify(this.hebrewDateMap));
                }
            });
        }
    }

    private containsYear(fullYear: number): boolean {
        const date = new Date();
        date.setFullYear(fullYear);
        return !!this.hebrewDateMap[this.getFixedDate(date)];
    }
}
