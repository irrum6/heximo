const q = s => document.body.querySelector(s);
const on = "addEventListener";

const readfile = () => {
    let file = document.body.querySelector("input[type=file]").files[0];
    let decoder = new TextDecoder();
    file.arrayBuffer().then(data => {
        let d = decoder.decode(data);
        let array = JSON.parse(d);

        let title = "Test Title";

        for (const elem of array) {
            browser.history.addUrl({
                url: elem.url,
                title,
                visitTime: elem.lastVisitTime
            });
        }
    });
}

q("button")[on]("click", readfile);
