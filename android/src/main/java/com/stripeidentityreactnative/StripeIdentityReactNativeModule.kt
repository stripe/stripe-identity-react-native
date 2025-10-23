package com.stripeidentityreactnative

import android.app.Activity
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.*

class StripeIdentityReactNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "StripeIdentityReactNative"
  }

  private var stripeIdentityVerificationSheetFragment: StripeIdentityVerificationSheetFragment? = null
  private var initialized = false

  private val mActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      if (initialized) {
        initialized = false
        stripeIdentityVerificationSheetFragment?.activity?.activityResultRegistry?.dispatchResult(requestCode, resultCode, data)
      }
    }
  }

  init {
    reactContext.addActivityEventListener(mActivityEventListener)
  }

  @ReactMethod
  fun initIdentityVerificationSheet(options: ReadableMap, promise: Promise) {
    initialized = true
    val activity = reactApplicationContext.currentActivity as AppCompatActivity? ?: return

    // If a fragment was already initialized, we want to remove it first
    stripeIdentityVerificationSheetFragment?.let {
      runCatching {
        activity.supportFragmentManager.beginTransaction().remove(it).commitAllowingStateLoss()
      }
    }
    stripeIdentityVerificationSheetFragment = StripeIdentityVerificationSheetFragment().also {
      val bundle = toBundleObject(options)
      it.arguments = bundle
    }

    activity.supportFragmentManager.beginTransaction()
      .add(requireNotNull(stripeIdentityVerificationSheetFragment), "identity_sheet_launch_fragment")
      .commit()

    promise.resolve(null)
  }

  @ReactMethod
  fun presentIdentityVerificationSheet(promise: Promise) {
    stripeIdentityVerificationSheetFragment?.present(promise)
  }

}
