package com.stripeidentityreactnative

import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.Fragment
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap
import com.stripe.android.identity.IdentityVerificationSheet
import com.stripe.android.identity.IdentityVerificationSheet.VerificationResult

class StripeIdentityVerificationSheetFragment : Fragment() {

  private lateinit var identityVerificationSheet: IdentityVerificationSheet
  private lateinit var verificationSessionId: String
  private lateinit var ephemeralKeySecret: String

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
    val imageUri = arguments?.getBundle("merchantLogo")?.getString("uri").orEmpty()
    identityVerificationSheet = IdentityVerificationSheet.create(this, IdentityVerificationSheet.Configuration(brandLogo = Uri.parse(imageUri)))
  }

  fun present(promise: Promise) {
    identityVerificationSheet.present(
      verificationSessionId = verificationSessionId,
      ephemeralKeySecret = ephemeralKeySecret
    ) {
      val result = WritableNativeMap()
      when (it) {
        VerificationResult.Completed -> result.putString("status", "Completed")
        VerificationResult.Canceled -> result.putString("status", "Canceled")
        else -> result.putString("status", "Failed")
      }
      promise.resolve(result)
    }

  }
}
