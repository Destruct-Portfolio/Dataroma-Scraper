import { log } from "apify";
import { SuperinvestorsDesiredEntryT, SuperinvestorsEntryT } from "../types/superinvestors";

export function columnSplitter(data: Array<SuperinvestorsEntryT>): Array<SuperinvestorsDesiredEntryT> {

    log.info(`Fomatting superinvestors data into desired format`)
    let formatted_data: Array<SuperinvestorsDesiredEntryT> = []
    for(const entry of data) {
        const { activity, ...rest } = entry; // Destructure 'activity' property

        const trimmedActivity = activity.trim(); // Remove leading and trailing spaces
        const [direction, distance] = trimmedActivity.split(/\s+/); // Split 'activity' into 'direction' and 'distance'

        const updated_entry = {
            ...rest,
            direction,
            distance,
        };

        formatted_data.push(updated_entry)
    }

    return formatted_data;
}
