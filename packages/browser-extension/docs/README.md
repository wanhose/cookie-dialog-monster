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

1. Clone this repository and then run `yarn install`
2. Build this repository running the command `yarn workspace browser-extension run build`
3. Go to [yourbrowser://extensions](yourbrowser://extensions) (different URL based on your browser)
4. Enable **Developer mode**
5. Then, click the **Load unpacked** button and select the generated `build` folder
6. That's all, you have a development build of this extension

Please note, each time you want to see changes made in the code you will need to rebuild and refresh the extension

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
