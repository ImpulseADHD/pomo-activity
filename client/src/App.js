// client/src/App.js

import HomeScreen from "./components/HomeScreen.js";
import CreateSessionScreen from "./components/CreateSessionScreen.js";
import SessionScreen from "./components/SessionScreen.js";

let sessionData = [];


const App = (socket) => {
  const appElement = document.createElement("div");
  appElement.id = "app-content";

  const navigateTo = (screen) => {
    try {
      console.log("Navigating to screen:", screen.name);
      appElement.innerHTML = ""; // Clear previous screen
      appElement.appendChild(screen(navigateTo, socket));
      console.log(`Screen "${screen.name}" loaded successfully.`);
    } catch (error) {
      console.error(`Error navigating to screen "${screen.name}":`, error);
    }
  };

  // Update sessions and refresh HomeScreen if visible
  App.updateSessions = (sessions) => {
    console.log("Received new session data:", sessions);

    try {
      sessionData = sessions;
      if (appElement.firstChild && appElement.firstChild.id === "home-screen") {
        navigateTo(HomeScreen);
        console.log("HomeScreen updated with new session data.");
      }
    } catch (error) {
      console.error("Error updating sessions:", error);
    }
  };

  // Initial navigation to HomeScreen
  try {
    navigateTo(HomeScreen);
    console.log("App started with HomeScreen.");
  } catch (error) {
    console.error("Error initializing HomeScreen:", error);
  }

  return appElement;
};

export default App;
