var isEnabled = true;
var maxTabs = 12;
var tabsCount;

function updateBadgeText() {
  var tabsBalance = maxTabs - tabsCount;
  var tabsAllowanceRemaining = tabsBalance > 0 ? tabsBalance : 0;

  chrome.browserAction.setBadgeText({
    text: "" + tabsAllowanceRemaining,
  });
}

function updateTabsCount() {
  chrome.tabs.query(
    {
      currentWindow: true,
      windowType: "normal",
      pinned: false,
    },
    (tabs) => {
      tabsCount = tabs.length;
      updateBadgeText();
    }
  );
}

function updateTabsCountHandler(_arg) {
  updateTabsCount();
}

function handleTabCreated(tab) {
  updateTabsCount();
  if (tabsCount >= maxTabs && tab.index > 0) {
    chrome.tabs.remove(tab.id);
  }
}

function init() {
  updateTabsCount();
  chrome.windows.onFocusChanged.addListener(updateTabsCountHandler);
  chrome.tabs.onCreated.addListener(handleTabCreated);
  chrome.tabs.onRemoved.addListener(updateTabsCountHandler);
  chrome.tabs.onUpdated.addListener(updateTabsCountHandler);
}

function teardown() {
  chrome.windows.onFocusChanged.removeListener(updateTabsCountHandler);
  chrome.tabs.onCreated.removeListener(handleTabCreated);
  chrome.tabs.onRemoved.removeListener(updateTabsCountHandler);
  chrome.tabs.onUpdated.removeListener(updateTabsCountHandler);
}

chrome.browserAction.onClicked.addListener(function (tab) {
  if (!isEnabled) {
    init();
    chrome.browserAction.setIcon({ path: "icons/19.png" });
  } else {
    teardown();
    chrome.browserAction.setIcon({ path: "icons/19-disabled.png" });
    chrome.browserAction.setBadgeText({ text: "" });
  }

  isEnabled = !isEnabled;
});

init();
