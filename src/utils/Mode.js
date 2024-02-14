import {
  INFO_ID,
  INFO_TEXT,
  MODE_CONTAINER_ID,
  SELECTED_MODE_CLASS,
} from "../constants";

/**
 * Utility class to store button id, button element and perform mouse events
 */
export class Mode {
  id;
  modeButton;

  /**
   * Create a new object with give button id
   * @param {string} id
   */
  constructor(id) {
    this.id = id;
    this.modeButton = document.getElementById(id);
  }

  /**
   * Returns if a button is selected
   * @returns {boolean}
   */
  isSelected() {
    return this.modeButton.classList.contains(SELECTED_MODE_CLASS);
  }

  // Remove styling from other mode buttons
  removeStylingFromOtherModes() {
    const allModes = document.getElementById(MODE_CONTAINER_ID).children;
    for (let i = 0; i < allModes.length; i++) {
      if (allModes[i].classList.contains(SELECTED_MODE_CLASS)) {
        allModes[i].classList.remove(SELECTED_MODE_CLASS);
      }
    }
  }

  // Highlight selected mode
  selectModeOnClick() {
    this.removeStylingFromOtherModes();
    if (!this.modeButton.classList.contains(SELECTED_MODE_CLASS)) {
      this.modeButton.classList.add(SELECTED_MODE_CLASS);
    }
  }

  // Callback function to set current selected mode and update info text
  onClick(callback, appInstance) {
    this.modeButton.onclick = (ev) => {
      this.selectModeOnClick();
      document.getElementById(INFO_ID).textContent = INFO_TEXT[ev.target.id];
      // Callback function
      callback(ev, appInstance);
    };
  }
}
