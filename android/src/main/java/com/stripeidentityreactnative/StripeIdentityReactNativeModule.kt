package com.stripeidentityreactnative

import android.app.Activity
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.*

class StripeIdentityReactNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "StripeIdentityReactNative"
  }

  lateinit var stripeIdentityVerificationSheetFragment: StripeIdentityVerificationSheetFragment

  private val mActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      stripeIdentityVerificationSheetFragment.activity?.activityResultRegistry?.dispatchResult(requestCode, resultCode, data)
    }
  }

  init {
    reactContext.addActivityEventListener(mActivityEventListener)
  }

  @ReactMethod
  fun init(options: ReadableMap) {

    val activity = currentActivity as AppCompatActivity? ?: return

    stripeIdentityVerificationSheetFragment = StripeIdentityVerificationSheetFragment().also {
      val bundle = toBundleObject(options)
      it.arguments = bundle
    }

    activity.supportFragmentManager.beginTransaction()
      .add(stripeIdentityVerificationSheetFragment, "identity_sheet_launch_fragment")
      .commit()

  }

  @ReactMethod
  fun present(promise: Promise) {
    stripeIdentityVerificationSheetFragment.present(promise)
  }


}
