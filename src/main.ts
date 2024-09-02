import {default as Holidays, HolidaysTypes} from 'date-holidays';
import logger from './logger.js';
import fs from 'fs';
import path from "node:path";

const YEAR = 2024;
const OUTPUT_PATH = 'output';

logger.info('Starting Holiday Converter...');

const options: HolidaysTypes.Options = {
    types: ['public'],
}

const hd = new Holidays('DE', options);

try {

    if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
        logger.info('Output directory created: ' + OUTPUT_PATH);
    }

    const holidays = hd.getHolidays(YEAR);
    if (holidays.length === 0) {
        logger.warn('No holidays found.');
    } else {
        const fileName = `holidays-${YEAR}.json`;
        const filePath = path.join(OUTPUT_PATH, fileName);

        fs.writeFileSync(filePath, JSON.stringify(holidays, null, 2));

        logger.info('Holidays written to file ' + fileName);
    }
} catch (error) {
    logger.error('Error fetching holidays:', error);
}