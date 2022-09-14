#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(StripeIdentityReactNative, NSObject)

RCT_EXTERN_METHOD(
                  initIdentityVerificationSheet: (NSDictionary)options
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                 )

RCT_EXTERN_METHOD(
                  presentIdentityVerificationSheet:(RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
