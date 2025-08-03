import Expo
import React
import ReactAppDependencyProvider
import PushKit
import RNCallKeep

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate, PKPushRegistryDelegate {
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

    // Setup CallKeep ASAP в нативном коде
    RNCallKeep.setup([
      "appName": "Domofon",
      "maximumCallGroups": 1,
      "maximumCallsPerCallGroup": 1,
      "supportsVideo": true
    ])

    // Register VoIP push notifications ASAP (recommended)
    RNVoipPushNotificationManager.voipRegistration()

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
  
  // MARK: - PushKit Delegate Methods
  
  // Handle updated push credentials
  public func pushRegistry(_ registry: PKPushRegistry, didUpdate credentials: PKPushCredentials, for type: PKPushType) {
    // Register VoIP push token with server
    RNVoipPushNotificationManager.didUpdate(credentials, forType: type.rawValue)
  }
  
  public func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    // The system calls this method when a previously provided push token is no longer valid
  }
  
  // Handle incoming pushes
  public func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
    // КРИТИЧНО: Apple требует вызвать CallKit НЕМЕДЛЕННО для iOS 13+
    
    // Извлекаем данные из payload
    let payloadDict = payload.dictionaryPayload
    let uuid = payloadDict["uuid"] as? String ?? UUID().uuidString
    let callerName = payloadDict["callerName"] as? String ?? "Домофон"
    let handle = payloadDict["handle"] as? String ?? "Входящий звонок"
    
    // Вызываем CallKeep НЕМЕДЛЕННО
    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: handle,
      handleType: "generic",
      hasVideo: true,
      localizedCallerName: callerName,
      supportsHolding: false,
      supportsDTMF: false,
      supportsGrouping: false,
      supportsUngrouping: false,
      fromPushKit: true,
      payload: payloadDict,
      withCompletionHandler: completion
    )
    
    // Также передаем в React Native
    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
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
