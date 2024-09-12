import {HolidaysTypes} from "date-holidays";

interface Builder<A> {
    build(): A;
}

interface ExportBuilder<A> extends Builder<A> {
    setOutputPath(path: string): this;
    setFileName(name: string): this;
}

export class HolidayExportBuilder implements ExportBuilder<HolidayExporter> {

    private exporter: HolidayExporter

    constructor() {
        this.exporter = new HolidayExporter();
    }

    build(): HolidayExporter {
        return this.exporter;
    }

    setFileName(name: string): this {
        return this;
    }

    setOutputPath(path: string): this {
        return this;
    }

}

class HolidayExporter {
    export() {

    }
}