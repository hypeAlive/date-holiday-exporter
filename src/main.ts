import { default as Holidays, HolidaysTypes } from 'date-holidays';
import logger from './logger.js';
import fs from 'fs';
import path from 'node:path';

const YEAR = 2024;
const OUTPUT_PATH = 'output';

logger.info('Starting Holiday Converter...');

const options: HolidaysTypes.Options = {
    types: ['public'],
};

const COUNTRIES: string[] = ['DE', 'PT'];

type ExportHoliday = HolidaysTypes.Holiday & { country: string };

const allHolidays: ExportHoliday[] = [];

if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    logger.info('Output directory created: ' + OUTPUT_PATH);
}

COUNTRIES.forEach(country => {
    const hd = new Holidays(country, options);

    try {
        const holidays = hd.getHolidays(YEAR) as ExportHoliday[];
        if (holidays.length === 0) {
            logger.warn('No holidays found for ' + country);
        } else {
            holidays.forEach(holiday => {
                holiday.country = country;
            });
            allHolidays.push(...holidays);
        }
    } catch (error) {
        logger.error('Error fetching holidays for ' + country + ':', error);
    }
});

const fileName = `holidays-${YEAR}.json`;
const filePath = path.join(OUTPUT_PATH, fileName);

fs.writeFileSync(filePath, JSON.stringify(allHolidays, null, 2));
logger.info('All holidays written to file ' + fileName);