import * as moment from "moment-timezone";

/**
 * Library to date and time so that it's consistent across front-end, backend, and other components.
 */
export class TimeUtil {
    public static TIME_ZONE_STRING = 'America/Los_Angeles';

    public static TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS z';
    public static getCurrentTime = (): moment.Moment => moment.tz(TimeUtil.TIME_ZONE_STRING);
    public static getCurrentTimeString = (): string => TimeUtil.toString(TimeUtil.getCurrentTime());
    public static parseTimeString = (timeString: string): moment.Moment => moment.tz(timeString, TimeUtil.TIME_FORMAT, TimeUtil.TIME_ZONE_STRING);
    public static toString = (ts: moment.Moment): string => ts.format(TimeUtil.TIME_FORMAT);
    public static getEpochZeroTime = (): moment.Moment => moment.tz(0, TimeUtil.TIME_ZONE_STRING);
}

