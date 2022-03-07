@_spi(STP) import StripeIdentity
import UIKit

@objc(StripeIdentityReactNative)
class StripeIdentityReactNative: NSObject {
  var verificationSheet: IdentityVerificationSheet?


    @objc func `init`(_ options: NSDictionary) -> Void {
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

  @objc func present(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      DispatchQueue.main.async {
        self.verificationSheet?.presentInternal(
            from: UIApplication.shared.delegate?.window??.rootViewController ?? UIViewController(),
            completion: { [weak self] result in
                switch result {
                case .flowCompleted:
                    resolve(["status": "Completed"])
                case .flowCanceled:
                    resolve(["status": "Canceled"])
                case .flowFailed(_):
                    resolve(["status": "Failed"])
                }
            })
      }
  }
}
