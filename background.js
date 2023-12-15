// Initialize the Total Ad Counter in Google's local storage when the extension is installed
chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension Installed");  // Mainly for testing in the DevTools console
  chrome.storage.local.set({ adBlockTotalCounter: 0 });
  chrome.storage.local.set({ adBlockSiteCounters: {}});
});

// "Listen" for network requests that have the same URLs as those in our rules.json
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(function(feedback) {
    // Mainly for testing in the DevTools console
    console.log("An ad was blocked!");
    console.log(feedback);

    // Increment the total and site number of ads blocked
    incrementTotalCounter();
    incrementSiteCounter();
})

/** This listener "listens" for when the user opens a new tab, and will make a new "entry" into
 *  Google's local storage to store the number of ads on that specific page **/
chrome.tabs.onUpdated.addListener(function(tabId, status, url) {

    // Testing lines for DevTools
    console.log("updated", tabId);
    console.log("Status:", status);
    console.log("URL:", url);

    /** Make a new entry only when the page is loading, because the listener will fire when
     *  the page is done loading as well, as the page "status" would be updated from "loading"
     *  to "complete" **/

    if (status.status === "loading"){
        console.log("Website status: complete")  // Testing line for DevTools

        chrome.storage.local.get("adBlockSiteCounters", function (data) {
        let adBlockSiteCounters = data.adBlockSiteCounters;

        // Start the site counter at 0
        adBlockSiteCounters[tabId] = 0;

        // Add the site counter to Google's local storage
        chrome.storage.local.set({ adBlockSiteCounters: adBlockSiteCounters });

        // Testing line for DevTools
        console.log("Site ID: ", tabId, "starting with count of: ", adBlockSiteCounters[tabId]);
        });
    }
})

// Increments the total number of ads blocked in Google's local storage
function incrementTotalCounter() {
  // Get the current total from the local storage
  chrome.storage.local.get("adBlockTotalCounter", function (data) {

    // Increment and update the total back into storage
    let newTotal = data.adBlockTotalCounter + 1;
    chrome.storage.local.set({ adBlockTotalCounter: newTotal });

    // Display the updated counter value in the extension console (mainly for testing!)
    console.log("Blocked ads count:", newTotal);
  });
}

/** Increments the number of ads blocked on a given webpage in Google's local storage
 *
 *  NOTE: The main logic behind this is in the chrome.tabs.onUpdated listener, we're able to get the id of
 *        a tab the user is on, which we are planning to use to "identify" which ad counter belongs to which
 *        in Google's local storage since different sites will have different numbers of ads.
 *
 *        As such, in order to access and update the correct ads, we can simply use the ids of the user's
 *        tabs as the names of the counters in the local storage (since the local storage is essentially a
 *        dictionary, to my knowledge). From there, we can then use chrome.tabs.query to get the tab id
 *        of the current tab the user is on, match it with one of the ids in the local storage to get the
 *        current site's ad counter, and increment that counter whenever an ad on the current site is blocked!
 **/
function incrementSiteCounter() {
  let getCurrentTabId = chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

      /** Tabs returns an array, and the first element is always the active tab, so we can use
       *  that to get our active tab! **/

      let currentTab = tabs[0];
      currentSiteId = currentTab.id;

      console.log("Current tab:", currentSiteId);  // Testing line for DevTools

      // Increment the counter for the correct site in Google's local storage
      chrome.storage.local.get("adBlockSiteCounters", function (data) {
          let adBlockSiteCounters = data.adBlockSiteCounters;
          let currentSiteAdCount = adBlockSiteCounters[currentSiteId];

          // Increment the specific site counter
          let newSiteAdCount = currentSiteAdCount + 1;
          adBlockSiteCounters[currentSiteId] = newSiteAdCount;

          // Update this value into Google's local storage
          chrome.storage.local.set({ adBlockSiteCounters: adBlockSiteCounters });
          console.log("Blocked ads count for site:", adBlockSiteCounters[currentSiteId]);  // Testing line for DevTools
      });
  });
}
