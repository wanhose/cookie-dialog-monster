# Cookie Monster Dialog Browser Extension

## Downloads

- [Chrome Web Store](https://chrome.google.com/webstore/detail/djcbfpkdhdkaflcigibkbpboflaplabg)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/hbogodfciblakeneadpcolhmfckmjcii)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/cookie-dialog-monster/)

## Compatibility

- All browsers based on Chromium 88+ (Blisk, Brave, Colibri, Epic Browser, Iron Browser, Vivaldi and many more)
- Google Chrome 88+
- Microsoft Edge 88+
- ~~Mozilla Firefox 54+~~ (development stalled until further notice, you can still download and use this extension in its **5.5.5** version)

## Installation (only for developers)

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
