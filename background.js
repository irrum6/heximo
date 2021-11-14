console.log("guess who's back ?!");

browser.menus.create({
    id: "open-sidebar",
    title: "Open Heximo",
    contexts: ["all"],
    command: "_execute_sidebar_action"
});