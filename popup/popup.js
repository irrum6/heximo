console.log("popup");
console.log(`Loaded on ${new Date()}`);

const q = s => document.body.querySelector(s);
const on = "addEventListener";

const error_log = err => console.error(err);

const active_tabs = func => browser.tabs.query({ active: true, currentWindow: true }).then(func).catch(error_log);

const export_history = () => {
    active_tabs(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {
            command: "export"
        });
    });

};
const import_history = (e) => {
    let file = q("#importer_input");
    console.log(file.value, file.files[0]);
    active_tabs(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {
            command: "import"
        });
    });
    //  let file = document.body.querySelector("input[type=file]").files[0];
    // file.arrayBuffer().then(data=>{let d = decoder.decode(data); console.log(JSON.parse(d))});
}
q("#exporter")[on]("click", export_history);
q("#importer")[on]("click", import_history);