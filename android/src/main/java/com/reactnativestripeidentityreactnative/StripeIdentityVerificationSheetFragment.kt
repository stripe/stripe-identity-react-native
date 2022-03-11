package com.reactnativestripeidentityreactnative

import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.fragment.app.Fragment
import com.facebook.react.bridge.*
import com.stripe.android.identity.*
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.FrameLayout

class StripeIdentityVerificationSheetFragment : Fragment() {

  private var identityVerificationSheet: IdentityVerificationSheet? = null
  private var verificationSessionId: String? = null
  private var ephemeralKeySecret: String? = null

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    return FrameLayout(requireActivity())
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    verificationSessionId = arguments?.getString("sessionId").orEmpty()
    ephemeralKeySecret = arguments?.getString("ephemeralKeySecret").orEmpty()
    identityVerificationSheet = IdentityVerificationSheet.create(activity as ComponentActivity, IdentityVerificationSheet.Configuration(merchantLogo = 0))
  }

  fun present(promise: Promise) {
//    var sheet = identityVerificationSheet
//    if(sheet != null) {
//      sheet.present(
//          verificationSessionId = verificationSessionId,
//          ephemeralKeySecret = ephemeralKeySecret
//      ) {
//        promise.resolve("TRUE")
//      }
//    }
  }
}
