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
    }
    
    @objc func presentIdentityVerificationSheet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.verificationSheet?.present(
                from: UIApplication.shared.delegate?.window??.rootViewController ?? UIViewController(),
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
