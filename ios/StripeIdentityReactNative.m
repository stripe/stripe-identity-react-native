#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(StripeIdentityReactNative, NSObject)

RCT_EXTERN_METHOD(init: (NSDictionary)options)

RCT_EXTERN_METHOD(
                  present:(RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
@end
