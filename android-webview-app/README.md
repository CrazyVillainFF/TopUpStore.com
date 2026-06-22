# Unlimited Topup Android WebView App

This is a complete Android Studio project that wraps `https://top-up-store-com.vercel.app` in an Android WebView.

## Features

- Opens the Unlimited Topup website in-app.
- JavaScript enabled for Firebase and checkout flows.
- DOM storage/database enabled for localStorage and sessionStorage.
- File upload support for payment screenshot uploads.
- Multiple-window support for popup-based flows such as Google login where WebView permits it.
- Internet and network-state permissions.
- Adaptive launcher icons using black and gold UT branding.
- Android back button navigates WebView history before closing the app.
- Horizontal loading progress indicator.
- UPI, intent, market, mail, phone, WhatsApp, and external website links open outside the app.

## Open in Android Studio

1. Open Android Studio.
2. Select **Open**.
3. Choose the `android-webview-app` folder.
4. Let Gradle sync complete.
5. Run the `app` configuration on an emulator or Android device.

## Build APK

From Android Studio, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

From a terminal with Android Gradle Plugin support installed, run:

```bash
./gradlew assembleDebug
```

If your system does not have a Gradle wrapper generated yet, Android Studio can create/use its bundled Gradle after opening the project.
