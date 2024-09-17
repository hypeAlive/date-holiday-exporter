import logger from './logger.js';
import {HolidayExporter} from "./HolidayExporter.js";

logger.info('Starting Holiday Converter...');

const exporter = HolidayExporter.create()
    .setFileName('holidays')
    .setYears(...Array.from({ length: 2040 - 2023 + 1 }, (_, i) => 2023 + i))
    .modifyJson((holiday) => {
        const modifiedHoliday = {
            ...holiday,
            country: holiday.countryCode,
            countryCode: undefined,
            countryName: undefined,
            substitute: undefined,
            note: undefined,
        };

        // Remove properties that are undefined
        Object.keys(modifiedHoliday).forEach(key => {
            // @ts-ignore
            if (modifiedHoliday[key] === undefined) {
                // @ts-ignore
                delete modifiedHoliday[key];
            }
        });

        return modifiedHoliday;
    })
    .outputAsCSV()
    .build();

await exporter.export();