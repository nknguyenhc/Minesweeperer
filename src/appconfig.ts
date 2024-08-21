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
  logInfo: false,
  // Site to play minesweeper on.
  // If "google", the URL is "https://google.com/search?q=minesweeper"
  // If "minesweeperonline", the URL is "https://minesweeperonline.com/"
  // If "minesweeperdotonline", the URL is "https://minesweeper.online/"
  site: "google",
  // Which solver to use, 'simple' or 'complex'.
  // Simple solver is optimised for time, while complex solver can solve better.
  solverMode: 'simple',
  // Time that the agent is allowed to think
  stepThinkTime: 1000,
  // Wait time after opening cells, so that cell animations are over and cell reading is accurate
  // Only applicable on Google minesweeper
  stepWaitTime: 800,
  // Whether to save screenshot when the game is solved
  saveScreenshot: true,
  // Name of screenshot to save when the game ends
  screenshotName: 'final',
  // How long to wait after final step before taking final screenshot
  screenshotWaitTime: 7000,
}
