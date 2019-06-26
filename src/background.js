// import store from './store'
global.browser = require('webextension-polyfill')
// alert(`Hello ${store.getters.foo}!`)

// browser.browserAction.setIcon({ path: "icons/paint-green-32.png" });

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
// function onCreated() {
//   if (browser.runtime.lastError) {
//     console.log(`Error: `, browser.runtime.lastError);
//   } else {
//     console.log('Item created successfully');
//   }
// }
//
// /*
// Called when the item has been removed.
// We'll just log success here.
// */
// function onRemoved() {
//   console.log("Item removed successfully");
// }
//
// /*
// Called when there was an error.
// We'll just log the error here.
// */
// function onError(error) {
//   console.log(`Error: ${error}`);
// }
//
// /*
// Create all the context menu items.
// */
// browser.contextMenus.create({
//   id: "log-selection",
//   title: browser.i18n.getMessage("menuItemSelectionLogger"),
//   contexts: ["selection"]
// }, onCreated);
//
// browser.contextMenus.create({
//   id: "remove-me",
//   title: browser.i18n.getMessage("menuItemRemoveMe"),
//   contexts: ["all"]
// }, onCreated);
//
// browser.contextMenus.create({
//   id: "separator-1",
//   type: "separator",
//   contexts: ["all"]
// }, onCreated);
//
//
//
// browser.contextMenus.create({
//   id: "separator-2",
//   type: "separator",
//   contexts: ["all"]
// }, onCreated);
//
// var checkedState = true;
//
// browser.contextMenus.create({
//   id: "check-uncheck",
//   type: "checkbox",
//   title: browser.i18n.getMessage("menuItemUncheckMe"),
//   contexts: ["all"],
//   checked: checkedState
// }, onCreated);
//
//
// browser.contextMenus.create({
//   id: "tools-menu",
//   title: browser.i18n.getMessage("menuItemToolsMenu"),
//   contexts: ['link', 'image'],
// }, onCreated);
//
// /*
// Set a colored border on the document in the given tab.
// Note that this only work on normal web pages, not special pages
// like about:debugging.
// */
// var blue = 'document.body.style.border = "5px solid blue"';
// var green = 'document.body.style.border = "5px solid green"';
//
// function borderify(tabId, color) {
//   browser.tabs.executeScript(tabId, {
//     code: color
//   });
// }
//
// /*
// Toggle checkedState, and update the menu item's title
// appropriately.
// Note that we should not have to maintain checkedState independently like
// this, but have to because Firefox does not currently pass the "checked"
// property into the event listener.
// */
// function updateCheckUncheck() {
//   checkedState = !checkedState;
//   if (checkedState) {
//     browser.contextMenus.update("check-uncheck", {
//       title: browser.i18n.getMessage("menuItemUncheckMe"),
//     });
//   } else {
//     browser.contextMenus.update("check-uncheck", {
//       title: browser.i18n.getMessage("menuItemCheckMe"),
//     });
//   }
// }
//
// /*
// The click event listener, where we perform the appropriate action given the
// ID of the menu item that was clicked.
// */
// browser.contextMenus.onClicked.addListener((info, tab) => {
//   switch (info.menuItemId) {
//     case "log-selection":
//       console.log(info.selectionText);
//       break;
//     case "remove-me":
//       var removing = browser.contextMenus.remove(info.menuItemId);
//       removing.then(onRemoved, onError);
//       break;
//     case "bluify":
//       borderify(tab.id, blue);
//       break;
//     case "greenify":
//       borderify(tab.id, green);
//       break;
//     case "check-uncheck":
//       updateCheckUncheck();
//       break;
//     case "open-sidebar":
//       console.log("Opening my sidebar");
//       break;
//     case "tools-menu":
//       console.log("Clicked the tools menu item");
//       break;
//   }
// });
