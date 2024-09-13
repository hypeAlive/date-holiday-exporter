import {default as Holidays, HolidaysTypes} from "date-holidays";
import fs from "fs/promises";
import logger from "./logger.js";
import path from "node:path";

interface Builder<A> {
    build(): A;
}

interface ExportBuilder<A> extends Builder<A> {
    setOutputPath(path: string): this;
    setFileName(name: string): this;
}

type ExportHoliday = HolidaysTypes.Holiday & {
    countryCode: string,
    countryName: string
};

export class HolidayExportBuilder implements ExportBuilder<HolidayExporter> {

    private readonly exporter: HolidayExporter

    constructor() {
        this.exporter = new HolidayExporter();
    }

    build(): HolidayExporter {
        return this.exporter;
    }

    setFileName(name: string): this {
        this.anyExporter.fileName = name;
        return this;
    }

    setOutputPath(path: string): this {
        this.anyExporter.outputPath = path;
        return this;
    }

    setYears(...years: number[]): this {
        this.anyExporter.years = years;
        return this;
    }

    setTypes(...types: HolidaysTypes.HolidayType[]): this {
        this.anyExporter.types = types;
        return this;
    }

    setCountries(...countries: string[]): this {
        this.anyExporter.countries = countries;
        return this;
    }

    modifyJson(modifier: (json: ExportHoliday) => object): this {
        this.anyExporter.jsonModifier = modifier;
        return this;
    }

    private get anyExporter(): any {
        return this.exporter as any;
    }

}

export class HolidayExporter {

    private years: number[] = [new Date().getFullYear()];
    private types: HolidaysTypes.HolidayType[] = ['public'];
    private countries: string[] = Object.keys(new Holidays().getCountries());
    private outputPath: string = 'output';
    private jsonModifier: (json: ExportHoliday) => object = json => json;
    private fileName: string | null = null;

    static create(): HolidayExportBuilder {
        return new HolidayExportBuilder();
    }


    async export() {
        await this.ensureOutputDirectory();

        const result: any[] = [];

        this.countries.forEach(country => {
           const holidays = this.fetchHolidaysForCountry(country);

           result.push(...holidays.map(this.jsonModifier));
        });

        await this.writeHolidaysToFile(result);

    }

    private fetchHolidaysForCountry(country: string): ExportHoliday[] {
        const hd = new Holidays(country, {types: this.types});

        const result: ExportHoliday[] = [];

        this.years.forEach(year => {
            const holidays = hd.getHolidays(year) as ExportHoliday[];
            if (holidays.length === 0) {
                logger.warn('No holidays found for ' + country, year);
                return [];
            }

            holidays.forEach(holiday => {
                holiday.countryCode = country;
                holiday.countryName = hd.getCountries()[country];
            });

            result.push(...holidays);
        });

        logger.info(`Fetched ${result.length} holidays for ${country}`);
        return result;
    }

    private async ensureOutputDirectory() {
        await fs.mkdir(this.outputPath, {recursive: true}).catch(err => {
            throw new Error('Error creating output directory: ' + err);
        });
    }

    private async writeHolidaysToFile(allHolidays: any[]) {
        const fileName = this.fileName ? `${this.fileName}.json` : this.years.length === 1 ? `holidays-${this.years[0]}.json` : 'holidays.json';
        const filePath = path.join(this.outputPath, fileName);
        await fs.writeFile(filePath, JSON.stringify(allHolidays, null, 2)).catch(err => {
            throw new Error('Error writing file: ' + err);
        });
        logger.info(`Successfully wrote ${allHolidays.length} holidays to ${filePath}`);
    }
}