// Get the "result" element from popup.html
let totalAds = document.getElementById("total-blocked-ads");
let totalSiteAds = document.getElementById("indiv-site-blocked-ads");

// Set the "total-blocked-ads" element to the total number of ads blocked from Google's local storage
chrome.storage.local.get("adBlockTotalCounter", function (data) {
    totalAds.innerHTML = data.adBlockTotalCounter;
  });

// Set the "indiv-site-blocked-ads" element to the total number of ads blocked from Google's local storage
let getCurrentTabId = chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

    /** Tabs returns an array, and the first element is always the active tab, so we can use
     *  that to get our active tab! **/

    const currentTab = tabs[0];
    currentSiteId = currentTab.id;

    console.log("Current Site ID:", currentSiteId);  // Testing line for DevTools

    // Set totalSiteAds to the site ad counter from Google's local storage
    chrome.storage.local.get("adBlockSiteCounters", function (data) {
        let adBlockSiteCounters = data.adBlockSiteCounters;
        let currentSiteAdCount = adBlockSiteCounters[currentSiteId];  // ...because adBlockSiteCounters is a dictionary

        /** Upon the extension installation since no sites have been added to the local storage yet,
         *  the value of currentSiteAdCount is usually undefined, so in this case we can just make
         *  totalSiteAds 0, and otherwise set totalSiteAds to whatever the ad counter in the local
         *  storage is! **/

        if (currentSiteAdCount === undefined){
            totalSiteAds.innerHTML = 0;
        }

        else{
            totalSiteAds.innerHTML = currentSiteAdCount;
        }
    });
});
