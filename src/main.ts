import {default as Holidays, HolidaysTypes} from 'date-holidays';
import logger from './logger.js';
import fs from 'fs/promises';
import path from 'node:path';

const YEAR = 2024;
const COUNTRIES: string[] = ['DE', 'PT'];
const OUTPUT_PATH = 'output';

logger.info('Starting Holiday Converter...');

const options: HolidaysTypes.Options = {
    types: ['public'],
};

type ExportHoliday = HolidaysTypes.Holiday & { country: string };

const allHolidays: ExportHoliday[] = [];

async function ensureOutputDirectory() {
    await fs.mkdir(OUTPUT_PATH, {recursive: true}).catch(err => {
        throw new Error('Error creating output directory: ' + err);
    });
}

function fetchHolidaysForCountry(country: string) {
    const hd = new Holidays(country, options);
    const holidays = hd.getHolidays(YEAR) as ExportHoliday[];
    if (holidays.length === 0) {
        logger.warn('No holidays found for ' + country);
        return;
    }

    holidays.forEach(holiday => {
        holiday.country = country;
    });
    allHolidays.push(...holidays);
    logger.info(`Fetched ${holidays.length} holidays for ${country}`);
}

async function writeHolidaysToFile() {
    const fileName = `holidays-${YEAR}.json`;
    const filePath = path.join(OUTPUT_PATH, fileName);
    await fs.writeFile(filePath, JSON.stringify(allHolidays, null, 2)).catch(err => {
        throw new Error('Error writing file: ' + err);
    });
    logger.info(`Successfully wrote ${allHolidays.length} holidays to ${filePath}`);
}

async function main() {
    await ensureOutputDirectory();
    COUNTRIES.map(fetchHolidaysForCountry);
    await writeHolidaysToFile();
}

main().catch(error => logger.error('Unexpected error:', error));