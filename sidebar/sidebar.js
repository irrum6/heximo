let load_message = `SideBar was loaded on ${new Date().toString()}`;
console.log(load_message);

const q = s => document.body.querySelector(s);
const on = "addEventListener";

const get_input_value = input_name => q(`input[name=${input_name}]`).value;
const get_input_date = input_name => new Date(get_input_value(input_name));

const HOUR = 3600 * 1000;
const PERIODS = ["24h", "30d", "365d", "this_mon", "this_year", "from_to", "all"];
Object.freeze(PERIODS);

const get_date_by_period = period => {
    let startTime = Date.now();
    switch (period) {
        case "24h":
            startTime -= 24 * HOUR;
            break;
        case "30d":
            startTime -= 24 * HOUR * 30;
            break;
        case "365d":
            startTime -= 24 * HOUR * 365;
            break;
        case "this_mon":
            startTime = get_date_on_month_start();
            break;
        case "this_year":
            startTime = get_date_on_year_start();
            break;
        case "all":
            startTime = 0;
            break;
        default:
            //do nothing
            break;
    }
    return startTime;
}

const show_progressbar = val => q("#progressbar").style.visibility = (true === val) ? "visible" : "hidden";

const get_filename = period => {
    let date = get_date_by_period(period);

    let format_options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    let name = new Date(date).toLocaleString('default', format_options).replace(/[\s:,]+/gi, "_");
    let filename = `history.${period}.from.${name}.json`;
    if ("from_to" === period) {
        filename = `history.from.${get_input_value("from")}.to.${get_input_value("to")}.json`;
    }
    if ("all" === period) {
        filename = "history.all.json"
    }
    return filename;
};

const get_date_on_month_start = () => {
    let datetime = new Date();
    //that's how you set day :(
    datetime.setDate(1);
    datetime.setHours(0);
    datetime.setMinutes(0);
    datetime.setSeconds(0);
    datetime.setMilliseconds(0);
    return datetime;
}
const get_date_on_year_start = () => {
    let datetime = get_date_on_month_start();
    //now reset month to 0;
    datetime.setMonth(0);
    return datetime;
}


const do_search_history = async (period) => {
    if (!PERIODS.includes(period)) {
        let message = PERIODS.map(e => `'${e}'`).join(",");
        console.error(`bad arguments: pass one of the following ${message} `);
        return {};
    }
    let startTime = get_date_by_period(period);

    let mega_records = 1048576;
    let options = {
        text: "",
        startTime,
        maxResults: 16 * mega_records
    };
    if ("from_to" === period) {
        options.startTime = get_input_date("from");
        options.endTime = get_input_date("to");
    }
    let results = await browser.history.search(options);
    return results;
};

const do_export_history = async () => {
    let period = "24h";
    let radio = q("input[type=radio]:checked");
    if (radio !== undefined && radio !== null) {
        period = radio.value;
    }
    show_progressbar(true);

    let results = await do_search_history(period);
    const json_string = JSON.stringify(results);
    const bytes = new TextEncoder().encode(json_string);
    const bob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    let url = URL.createObjectURL(bob);
    let filename = `history.${period}.json`;
    if ("from_to" === period) {
        filename = `history.from.${get_input_value("from")}.to.${get_input_value("to")}.json`;
    }
    filename = get_filename(period);

    show_progressbar(false);
    try {
        await browser.downloads.download({ url, filename, saveAs: true });
    } catch (error) {
        console.log("CANCELED");
        // console.error(error);
        // console.log(filename);
    } finally {

    }
};

const do_import_history = async () => {
    let input = q("input[type=file]");
    let file = input.files[0];
    let decoder = new TextDecoder();
    show_progressbar(true);

    let data = await file.arrayBuffer();

    let d = decoder.decode(data);
    let array = JSON.parse(d);

    for (const elem of array) {
        await browser.history.addUrl({
            url: elem.url,
            title: elem.title,
            visitTime: elem.lastVisitTime
        });
    }
    //clear input
    input.value = "";
    show_progressbar(false);
}

q("#export_action")[on]("click", do_export_history);
q("#import_action")[on]("click", do_import_history);