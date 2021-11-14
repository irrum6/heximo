let load_message = `SideBar was loaded on ${new Date().toString()}`;
console.log(load_message);

const q = s => document.body.querySelector(s);
const on = "addEventListener";

const error_log = err => console.error(err);

const active_tabs = func => browser.tabs.query({ active: true, currentWindow: true }).then(func).catch(error_log);

const do_search_history = async (period) => {
    const validValues = ["24h", "30d", "12m", "all"];
    //12m is equal to 365 days
    if (!validValues.includes(period)) {
        console.error("bad arguments - is either '24h', '30d', '12m' or 'all'");
        return {};
    }
    let minus_date = 0;
    let hour = 60 * 60 * 1000;
    switch (period) {
        case "24h":
            minus_date = 24 * hour;
            break;
        case "30d":
            minus_date = 24 * hour * 30;
            break;
        case "12m":
            minus_date = 24 * hour * 365;
            break;
        case "all":
            minus_date = 0;
            break;
        default:
            //do nothing
            break;
    }
    let startTime = new Date(Date.now() - minus_date);
    let results = await browser.history.search({
        "text": "",
        "startTime": startTime
    });
    return results;
};

const do_export_history = async () => {
    let period = "24h";
    let results = await do_search_history(period);
    const json_string = JSON.stringify(results);
    const bytes = new TextEncoder().encode(json_string);
    const bob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    let url = URL.createObjectURL(bob);
    let filename = `history.${period}.json`;
    browser.downloads.download({ url, filename, saveAs: true });
};

const do_import_history = () => {
    let file = document.body.querySelector("input[type=file]").files[0];
    let decoder = new TextDecoder();
    file.arrayBuffer().then(data => {
        let d = decoder.decode(data);
        let array = JSON.parse(d);

        for (const elem of array) {
            browser.history.addUrl({
                url: elem.url,
                title: elem.title,
                visitTime: elem.lastVisitTime
            });
        }
    });
}

q("#export_action")[on]("click", do_export_history);
q("#import_action")[on]("click", do_import_history);