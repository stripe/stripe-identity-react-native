@_spi(STP) import StripeIdentity
import UIKit

@objc(StripeIdentityReactNative)
class StripeIdentityReactNative: NSObject {
    var verificationSheet: IdentityVerificationSheet?


    @objc func initIdentityVerificationSheet(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let verificationSessionId = options["sessionId"] as? String else {
            assertionFailure("Did not receive a valid id.")
            return
        }
        guard let ephemeralKeySecret = options["ephemeralKeySecret"] as? String else {
            assertionFailure("Did not receive a valid ephemeral key secret.")
            return
        }
        guard let brandLogo = options["brandLogo"] else {
            assertionFailure("Did not receive a valid brandLogo.")
            return
        }
        DispatchQueue.main.async {
            guard let logo = RCTConvert.uiImage(brandLogo) else {
                assertionFailure("Did not receive a valid logo.")
                return
            }
            self.verificationSheet = IdentityVerificationSheet(
                verificationSessionId: verificationSessionId,
                ephemeralKeySecret: ephemeralKeySecret,
                configuration: IdentityVerificationSheet.Configuration(
                    brandLogo:logo
                )
            )
        }
        resolve(NSNull())
    }

    @objc func presentIdentityVerificationSheet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Note: creating a UIViewController inside here results in a nil window
        // This is a bit of a hack: We traverse the view hierarchy looking for the most reasonable VC to present from.
        // A VC hosted within a SwiftUI cell, for example, doesn't have a parent, so we need to find the UIWindow.
        var presentingViewController: UIViewController =
            UIApplication.shared.delegate?.window??.rootViewController ?? UIViewController()

        // Find the most-presented UIViewController
        while let presented = presentingViewController.presentedViewController {
            presentingViewController = presented
        }
        DispatchQueue.main.async {
            self.verificationSheet?.present(
                from: presentingViewController,
                completion: { result in
                    switch result {
                    case .flowCompleted:
                        resolve(["status": "FlowCompleted"])
                    case .flowCanceled:
                        resolve(["status": "FlowCanceled"])
                    case .flowFailed(let error):
                        resolve([
                            "status": "FlowFailed",
                            "error": createError("FlowFailed", error as NSError)
                        ])
                    }
                })
        }
    }
}

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
