console.log("Heximo");
console.log(`Loaded on ${new Date()}`);

browser.runtime.onMessage.addListener(msg => {
    // console.log(msg);
    if (msg.results !== undefined) {
        console.log(msg.results);
    }
    if (msg.command !== undefined) {
        let { command } = msg;
        console.log(command);
        if (command === "export") {
            browser.runtime.sendMessage({ message: "24h" });
        }
    }
});

browser.commands.onCommand.addListener(function (command) {
    if (command === "_open_sidebar") {
        console.log("triggered");
    }
});