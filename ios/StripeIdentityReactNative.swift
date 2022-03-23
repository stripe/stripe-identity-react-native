@_spi(STP) import StripeIdentity
import UIKit

@objc(StripeIdentityReactNative)
class StripeIdentityReactNative: NSObject {
  var verificationSheet: IdentityVerificationSheet?


    @objc func initIdentityVerificationSheet(_ options: NSDictionary) -> Void {
    guard let verificationSessionId = options["sessionId"] as? String else {
        assertionFailure("Did not receive a valid id.")
        return
    }
    guard let ephemeralKeySecret = options["ephemeralKeySecret"] as? String else {
        assertionFailure("Did not receive a valid ephemeral key secret.")
        return
    }
    guard let merchantLogo = options["merchantLogo"] else {
        assertionFailure("Did not receive a valid merchantLogo.")
        return
    }
    DispatchQueue.main.async {
      guard let logo = RCTConvert.uiImage(merchantLogo) else {
          assertionFailure("Did not receive a valid logo.")
          return
      }
    self.verificationSheet = IdentityVerificationSheet(
        verificationSessionId: verificationSessionId,
        ephemeralKeySecret: ephemeralKeySecret,
            configuration: IdentityVerificationSheet.Configuration(
                merchantLogo:logo
            )
        )
    }
  }

  @objc func presentIdentityVerificationSheet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      DispatchQueue.main.async {
        self.verificationSheet?.presentInternal(
            from: UIApplication.shared.delegate?.window??.rootViewController ?? UIViewController(),
            completion: { result in
                switch result {
                case .flowCompleted:
                    resolve(["result": "FlowCompleted"])
                case .flowCanceled:
                    resolve(["result": "FlowCanceled"])
                case .flowFailed(let error):
                    // The error currently isn't returned to the SDK. Should this throw the error
                    resolve([
                        "result": "FlowFailed",
                        "error": createError("FlowFailed", error as NSError)
                    ])
                }
            })
      }
  }
}
// NOTE: Duplicated from https://github.com/stripe/stripe-react-native/blob/5e8045a12351b72714124b7e797146c326964973/ios/Errors.swift#L76

func createError (_ code: String, _ error: NSError?) -> NSDictionary {
    let value: NSDictionary = [
        "code": code,
        "message": error?.userInfo["com.stripe.lib:ErrorMessageKey"] ?? error?.userInfo["NSLocalizedDescription"] ?? NSNull(),
        "localizedMessage": error?.userInfo["NSLocalizedDescription"] ?? NSNull(),
        "declineCode": error?.userInfo["com.stripe.lib:DeclineCodeKey"] ?? NSNull(),
        "stripeErrorCode": error?.userInfo["com.stripe.lib:StripeErrorCodeKey"] ?? NSNull(),
        "type": error?.userInfo["com.stripe.lib:StripeErrorTypeKey"] ?? NSNull(),
    ]

    return ["error": value]
}
