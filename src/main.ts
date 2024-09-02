import { default as Holidays } from 'date-holidays';
import logger from './logger.js';

logger.info('Starting Holiday Converter...');

const hd = new Holidays('DE');

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