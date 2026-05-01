import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = themeBackground()
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    // Synchronous pass — catches the splash view if expo-splash-screen
    // inserts it during startReactNative (view controller lifecycle).
    colorAllWindows()

    let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)

    // Two deferred passes — catch the splash view if it is inserted
    // asynchronously after the bridge finishes loading modules.
    DispatchQueue.main.async { self.colorAllWindows() }
    DispatchQueue.main.async { DispatchQueue.main.async { self.colorAllWindows() } }

    return result
  }

  // MARK: - Theme

  private func themeBackground() -> UIColor {
    let preference = UserDefaults.standard.string(forKey: "themePreference") ?? "system"
    let isDark: Bool
    switch preference {
    case "dunkel": isDark = true
    case "hell":   isDark = false
    default:       isDark = UITraitCollection.current.userInterfaceStyle == .dark
    }
    return isDark
      ? UIColor(red: 15/255, green: 15/255, blue: 20/255, alpha: 1)
      : UIColor(red: 242/255, green: 242/255, blue: 247/255, alpha: 1)
  }

  // MARK: - Splash Coloring

  private func colorAllWindows() {
    let bg = themeBackground()
    // Iterate every window in the app — expo-splash-screen may open
    // its own UIWindow with an elevated windowLevel.
    let windows = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
    for win in windows {
      win.backgroundColor = bg
      win.subviews.forEach { $0.backgroundColor = bg }
      colorViewControllerHierarchy(win.rootViewController, background: bg)
    }
  }

  // Recurses through presented VCs and child VCs so the expo-splash-screen
  // view controller is reached regardless of how it is attached.
  private func colorViewControllerHierarchy(_ vc: UIViewController?, background: UIColor) {
    guard let vc = vc else { return }
    vc.view.backgroundColor = background
    colorViewControllerHierarchy(vc.presentedViewController, background: background)
    vc.children.forEach { colorViewControllerHierarchy($0, background: background) }
  }

  // MARK: - Linking

  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
