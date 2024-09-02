import { default as Holidays } from 'date-holidays';
import logger from './logger.js';

logger.info('Starting Holiday Converter...');

const hd = new Holidays();