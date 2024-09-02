import {default as Holidays, HolidaysTypes} from 'date-holidays';
import logger from './logger.js';

logger.info('Starting Holiday Converter...');

const options: HolidaysTypes.Options = {
    types: ['public'],
}

const hd = new Holidays('DE', options);

try {
    const holidays = hd.getHolidays(2024);
    if (holidays.length === 0) {
        logger.warn('No holidays found.');
    } else {
        console.log('Holidays:', holidays);
    }
} catch (error) {
    logger.error('Error fetching holidays:', error);
}