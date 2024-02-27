# Cookie Monster Dialog Browser Extension

This browser extension was designed to remove cookie consent dialogs that appear on websites without setting your preferences. Only in a few cases, it operates based on predefined rules specified in the file `data/fixes.txt` from where the extension will automatically decline or accept the cookie consent dialogs.

Please note that the `data/fixes.txt` file should be regularly updated to reflect changes in websites' cookie consent practices and to ensure accurate handling of the dialogs by the extension.

## Downloads

- [Chrome Web Store](https://chrome.google.com/webstore/detail/djcbfpkdhdkaflcigibkbpboflaplabg)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/hbogodfciblakeneadpcolhmfckmjcii)
- ~~[Firefox Add-ons](https://addons.mozilla.org/firefox/addon/cookie-dialog-monster/)~~ ¹

¹ Due to technical issues with the Firefox Team, our extension's support on Mozilla Add-ons has ended with version 5.5.5. However, you can still run a development copy of the last version of the extension. Steps for this are available in our GitHub repository. We appreciate your understanding and patience.

## Compatibility

- All browsers based on Chromium 88+ (Blisk, Brave, Colibri, Epic Browser, Iron Browser, Vivaldi and many more)
- Google Chrome 88+
- Microsoft Edge 88+
- Mozilla Firefox 85+

## Installation (only for developers or Mozilla Firefox users)

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
