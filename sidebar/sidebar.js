let load_message = `SideBar was loaded on ${new Date().toString()}`;
console.log(load_message);

const q = s => document.body.querySelector(s);
const on = "addEventListener";

const show_progressbar = val => {
    let progressbar = q("#progressbar");
    if (true === val) {
        progressbar.style.visibility = "visible";
        return;
    }
    progressbar.style.visibility = "hidden";
}
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

const get_input_date = (input_name) => new Date(q(`input[name=${input_name}]`).value);


const do_search_history = async (period) => {
    const validValues = ["24h", "30d", "365d", "this_mon", "this_year", "from_to", "all"];

    if (!validValues.includes(period)) {
        let message = validValues.map(e => `'${e}'`).join(",");
        console.error(`bad arguments: pass one of the followign ${message} `);
        return {};
    }
    let startTime = Date.now();
    let hour = 3600 * 1000;
    switch (period) {
        case "24h":
            startTime -= 24 * hour;
            break;
        case "30d":
            startTime -= 24 * hour * 30;
            break;
        case "365d":
            startTime -= 24 * hour * 365;
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

    show_progressbar(false);

    browser.downloads.download({ url, filename, saveAs: true });
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
        browser.history.addUrl({
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