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

/**
 * Builder class for creating instances of HolidayExporter.
 */
class HolidayExportBuilder implements ExportBuilder<HolidayExporter> {

    private readonly exporter: HolidayExporter

    constructor() {
        this.exporter = new HolidayExporter();
    }

    /**
     * Builds and returns the HolidayExporter instance.
     * @returns {HolidayExporter} The built HolidayExporter instance.
     */
    build(): HolidayExporter {
        return this.exporter;
    }

    /**
     * Sets the file name for the export.
     * Default ist "holidays.json" when exporting multiple years, otherwise "holidays-<year>.json".
     * @param {string} name - The file name.
     * @returns {this} The current builder instance.
     */
    setFileName(name: string): this {
        this.anyExporter.fileName = name;
        return this;
    }

    /**
     * Sets the output path for the export.
     * Default is "output".
     * @param {string} path - The output path. Without "/" at beginning and end
     * @returns {this} The current builder instance.
     */
    setOutputPath(path: string): this {
        this.anyExporter.outputPath = path;
        return this;
    }

    /**
     * Sets the years for which holidays should be exported.
     * Default is the current year.
     * @param {number[]} years - The years to set.
     * @returns {this} The current builder instance.
     */
    setYears(...years: number[]): this {
        this.anyExporter.years = years;
        return this;
    }

    /**
     * Sets the types of holidays to be exported.
     * Default is public holidays.
     * @param {HolidaysTypes.HolidayType[]} types - The holiday types to set.
     * @returns {this} The current builder instance.
     */
    setTypes(...types: HolidaysTypes.HolidayType[]): this {
        this.anyExporter.types = types;
        return this;
    }

    /**
     * Sets the countries for which holidays should be exported.
     * Default is all countries.
     * @param {string[]} countries - The countries to set.
     * @returns {this} The current builder instance.
     */
    setCountries(...countries: string[]): this {
        this.anyExporter.countries = countries;
        return this;
    }

    /**
     * Modifies the JSON output of the holidays. This can be used to filter or modify the output.
     * Default is to return the holiday as is.
     * @param {(json: ExportHoliday) => object} modifier - The modifier function.
     * @returns {this} The current builder instance.
     */
    modifyJson(modifier: (json: ExportHoliday) => object): this {
        this.anyExporter.jsonModifier = modifier;
        return this;
    }

    private get anyExporter(): any {
        return this.exporter as any;
    }

}

/**
 * Class for exporting holidays.
 */
export class HolidayExporter {

    private years: number[] = [new Date().getFullYear()];
    private types: HolidaysTypes.HolidayType[] = ['public'];
    private countries: string[] = Object.keys(new Holidays().getCountries());
    private outputPath: string = 'output';
    private jsonModifier: (json: ExportHoliday) => object = json => json;
    private fileName: string | null = null;

    /**
     * Used to create a new instance of the HolidayExporter via the builder.
     * When not using the builder, only default configuration can be exported.
     * @returns {HolidayExportBuilder} The builder instance.
     */
    static create(): HolidayExportBuilder {
        return new HolidayExportBuilder();
    }

    /**
     * Exports the holidays with the given configuration.
     * @throws {Error} If an error occurs during export.
     */
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