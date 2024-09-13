import logger from './logger.js';
import {HolidayExporter} from "./HolidayExporter.js";

logger.info('Starting Holiday Converter...');

const exporter = HolidayExporter.create()
    .setFileName('holidays')
    .setYears(2021, 2022)
    .modifyJson((holiday) => {
        return {
            date: holiday.date.split(' ')[0],
            country: holiday.countryCode
        };
    })
    .build();

await exporter.export();