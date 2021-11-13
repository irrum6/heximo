console.log(`Loaded on ${new Date()}`);
console.log("I am Iron Man!");

const active_tab = () => browser.tabs.query({ active: true, currentWindow: true });

const doSearch = async (period) => {
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

const domsg = async ({ message }) => {
    console.log(message);
    let results = await doSearch(message);
    // let tabs = await active_tab();
    //thanks stackoverflow
    const json_string = JSON.stringify(results);
    const bytes = new TextEncoder().encode(json_string);
    const bob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    let url = URL.createObjectURL(bob);
    let filename = "history.compiled.json";
    browser.downloads.download({ url, filename, saveAs: true });
    // browser.tabs.sendMessage(tabs[0].id, { results });
}
browser.runtime.onMessage.addListener(domsg);