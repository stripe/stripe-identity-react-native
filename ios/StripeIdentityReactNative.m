#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(StripeIdentityReactNative, NSObject)

RCT_EXTERN_METHOD(initIdentityVerificationSheet: (NSDictionary)options)

RCT_EXTERN_METHOD(
                  presentIdentityVerificationSheet:(RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
@end
