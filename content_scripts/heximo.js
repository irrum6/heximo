console.log("Heximo");
console.log(`Loaded on ${new Date()}`);

browser.commands.onCommand.addListener(function (command) {
    if (command === "_open_sidebar") {
        console.log("triggered");
    }
});