export const AppConfig = {
  // Difficulty level, 'easy', 'medium', or 'hard'
  gameMode: 'hard',
  // Whether to keep the window alive when the game has finished
  keepAlive: true,
  // Whether to open a browser. If false, run in headless mode.
  liveBrowser: true,
  // Whether to log intermediate images (saved to /images folder)
  logImages: true,
  // Whether to log cells and actions to console, for debugging purposes
  logInfo: true,
  // Wait time after opening cells, so that cell animations are over and cell reading is accurate
  stepWaitTime: 800,
  // Whether to save screenshot when the game is solved
  saveScreenshot: true,
  // Name of screenshot to save when the game ends
  screenshotName: 'final',
  // How long to wait after final step before taking final screenshot
  screenshotWaitTime: 7000,
}
