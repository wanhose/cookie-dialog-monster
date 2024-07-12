# Cookie Monster Dialog Browser Extension

This browser extension was designed to remove cookie consent dialogs that appear on websites without setting your preferences. Only in a few cases, it operates based on predefined rules specified in the file `data/fixes.txt` from where the extension will automatically decline or accept the cookie consent dialogs.

Please note that the `data/fixes.txt` file should be regularly updated to reflect changes in websites' cookie consent practices and to ensure accurate handling of the dialogs by the extension.

## Downloads

- [Chrome Web Store](https://chrome.google.com/webstore/detail/djcbfpkdhdkaflcigibkbpboflaplabg)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/hbogodfciblakeneadpcolhmfckmjcii)
- [Mozilla Firefox (.xpi)](https://www.cookie-dialog-monster.com/releases/latest.xpi)
- Advanced users or non-listed browsers ¹

¹ Scroll down to [this section](#installation-for-advanced-users-and-non-listed-browser-users) and follow the instructions to install the latest version of this extension in your browser.

## Compatibility

- All browsers based on Chromium 88+ (Blisk, Brave, Colibri, Epic Browser, Iron Browser, Vivaldi and many more)
- Google Chrome 88+
- Microsoft Edge 88+
- Mozilla Firefox 85+

## Installation (for Mozilla Firefox users)

1. Start by downloading the latest `.xpi` file [from here](https://www.cookie-dialog-monster.com/releases/latest.xpi).
2. Open your Firefox browser. Depending on your browser settings, Firefox may prompt you to install the add-on automatically upon download completion. If the installation prompt appears, you can proceed with the installation directly from the prompt by clicking **Add** and skip to step 8.
3. If the automatic prompt does not appear, navigate to [about:addons](about:addons) to open the Add-ons Manager.
4. Click on the gear icon (⚙️) to open the menu.
5. Select **Install Add-on From File...** from the menu.
6. A file dialog will open. Navigate to and select the downloaded `.xpi` file.
7. A confirmation dialog will appear asking if you wish to install the add-on. Click **Add** to proceed.
8. Congratulations! You've successfully installed the latest build of this extension in Firefox.

Optionally, if you wish to allow the extension to run in private browsing mode, find the extension in the list, click on the **Details** button, and then enable the **Allow in Private Browsing** checkbox.

## Installation (for advanced and non-listed browser users)

1. Start by downloading the latest zip file [from here](https://www.cookie-dialog-monster.com/releases/latest.zip).
2. Extract the downloaded zip file to a location on your local machine.
3. Open your browser's extensions page:
   - For Chrome, navigate to [chrome://extensions](chrome://extensions)
   - For Firefox, navigate to [about:addons](about:addons)
   - For Edge, navigate to [edge://extensions](edge://extensions)
     (Replace with the correct URL based on your browser)
4. Enable **Developer mode** (usually a toggle switch in the top right corner of the extensions page).
5. Click on the **Load Temporary Add-on…** button in Firefox or **Load unpacked** in other browsers.
6. A file dialog will open. Navigate to and select the extracted folder (or `manifest.json` file inside this folder if needed).
7. Congratulations! You've successfully loaded the latest build of this extension.

## Installation (only for developers)

1. Start by cloning the repository to your local machine using the command `git clone <repository-url>` or downloading it from the assets section of a release.
2. Navigate to the cloned repository's directory with `cd <repository-name>`.
3. Open your browser's extensions page:
   - For Chrome, navigate to [chrome://extensions](chrome://extensions)
   - For Firefox, navigate to [about:addons](about:addons)
   - For Edge, navigate to [edge://extensions](edge://extensions)
     (Replace with the correct URL based on your browser)
4. Enable **Developer mode** (usually a toggle switch in the top right corner of the extensions page).
5. Click on the **Load unpacked** button.
6. A file dialog will open. Navigate to and select the `packages/browser-extension/src` folder from the cloned repository.
7. Congratulations! You've successfully loaded the development build of this extension.

To ensure you're using the latest version of the extension, it's important to regularly pull the latest changes from the repository. You can do this by navigating to the repository's directory in your terminal and running the command `git pull`. This will fetch and download the latest changes from the remote repository and merge them into your local repository.

In some cases, after pulling the latest changes and rebuilding the extension, your browser may not immediately reflect the updates. This is because browsers typically cache extensions for performance reasons. To manually update the extension, navigate to your browser's extensions page. Look for a button or option to "Update" or "Reload" the extension. This forces the browser to reload the extension, ensuring it's running the latest version. Remember, this process may vary slightly depending on the browser you're using. Always refer to your browser's specific instructions for managing extensions.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
