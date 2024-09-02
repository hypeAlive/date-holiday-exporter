import {default as Holidays, HolidaysTypes} from 'date-holidays';
import logger from './logger.js';
import fs from 'fs/promises';
import path from 'node:path';

const YEAR = 2024;
const COUNTRIES: string[] = ['DE', 'PT'];
const TYPES: HolidaysTypes.HolidayType[] = ['public'];
const OUTPUT_PATH = 'output';

logger.info('Starting Holiday Converter...');

type ExportHoliday = HolidaysTypes.Holiday & { country: string };

async function ensureOutputDirectory() {
    await fs.mkdir(OUTPUT_PATH, {recursive: true}).catch(err => {
        throw new Error('Error creating output directory: ' + err);
    });
}

function fetchHolidaysForCountry(country: string): ExportHoliday[] {
    const hd = new Holidays(country, {types: TYPES});
    const holidays = hd.getHolidays(YEAR) as ExportHoliday[];
    if (holidays.length === 0) {
        logger.warn('No holidays found for ' + country);
        return [];
    }

    holidays.forEach(holiday => {
        holiday.country = country;
    });
    logger.info(`Fetched ${holidays.length} holidays for ${country}`);
    return holidays;
}

async function writeHolidaysToFile(allHolidays: ExportHoliday[]) {
    const fileName = `holidays-${YEAR}.json`;
    const filePath = path.join(OUTPUT_PATH, fileName);
    await fs.writeFile(filePath, JSON.stringify(allHolidays, null, 2)).catch(err => {
        throw new Error('Error writing file: ' + err);
    });
    logger.info(`Successfully wrote ${allHolidays.length} holidays to ${filePath}`);
}

async function main() {
    await ensureOutputDirectory();
    await writeHolidaysToFile(COUNTRIES.flatMap(fetchHolidaysForCountry));
}

main().catch(error => logger.error('Unexpected error:', error));