import { DateTime } from 'luxon';

/**
 * https://github.com/moment/luxon/blob/master/docs/formatting.md
 */
export class TimeUtil {

    public static TIME_ZONE_STRING = 'America/Los_Angeles';

    public static getCurrentTime(): DateTime {
        return DateTime.now().setZone(TimeUtil.TIME_ZONE_STRING);
    }

    public static getCurrentTimeString(): string {
        return this.getCurrentTime().toISO()!;
    }

    public static parseTimeString(timeString: string): DateTime {
        return DateTime.fromISO(timeString, { zone: TimeUtil.TIME_ZONE_STRING });
    }

    public static parseTimeMillis(millis: number): DateTime {
        return DateTime.fromMillis(millis, { zone: TimeUtil.TIME_ZONE_STRING });
    }

    public static toString(dateTime: DateTime): string {
        return dateTime.toISO()!;
    }

    public static getEpochZeroTime(): DateTime {
        return DateTime.fromMillis(0, { zone: TimeUtil.TIME_ZONE_STRING });
    }

    public static clone(dateTime: DateTime): DateTime {
        return DateTime.fromISO(dateTime.toISO()!, { zone: TimeUtil.TIME_ZONE_STRING });
    }

    public static getBeginOfMonth(month: number): DateTime {
        // Get current time, but set the month to be given month.
        // TODO: get the year from input instead
        const now = TimeUtil.getCurrentTime();
        return TimeUtil.clone(now).set({ month }).startOf('month');
    }

    public static getEndOfMonth(month: number): DateTime {
        // Get current time, but set the month to be given month.
        // TODO: get the year from input instead
        const now = TimeUtil.getCurrentTime();
        return TimeUtil.clone(now).set({ month }).endOf('month');
    }
}
