import logger from './logger.js';
import {HolidayExporter} from "./HolidayExporter.js";
import {HolidaysTypes} from "date-holidays";

logger.info('Starting Holiday Converter...');

const exporter = HolidayExporter.create()
    .setFileName('holidays')
    .setYears(2022, 2023, 2024, 2025, 2026)
    .modifyJson((holiday) => {
        return {
            ...holiday,
            country: holiday.countryCode,
            countryCode: undefined,
            countryName: undefined,
            substitute: undefined
        }
    })
    .build();

await exporter.export();