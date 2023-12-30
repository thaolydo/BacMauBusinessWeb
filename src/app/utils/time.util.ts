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

    public static toString(dateTime: DateTime): string {
        return dateTime.toISO()!;
    }

    public static getEpochZeroTime(): DateTime {
        return DateTime.fromMillis(0, { zone: TimeUtil.TIME_ZONE_STRING });
    }
}
