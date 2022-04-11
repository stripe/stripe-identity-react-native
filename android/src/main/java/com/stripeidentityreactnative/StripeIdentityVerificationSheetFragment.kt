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
import com.stripe.android.identity.IdentityVerificationSheet.VerificationFlowResult

class StripeIdentityVerificationSheetFragment : Fragment() {

  private lateinit var identityVerificationSheet: IdentityVerificationSheet
  private lateinit var verificationSessionId: String
  private lateinit var ephemeralKeySecret: String

  private var promise: Promise? = null

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    identityVerificationSheet = createIdentityVerificationSheet()
    return FrameLayout(requireActivity()).also {
      it.visibility = View.GONE
    }
  }

  private fun createIdentityVerificationSheet(): IdentityVerificationSheet {
    verificationSessionId = arguments?.getString("sessionId").orEmpty()
    ephemeralKeySecret = arguments?.getString("ephemeralKeySecret").orEmpty()
    val imageUri = arguments?.getBundle("brandLogo")?.getString("uri").orEmpty()
    return IdentityVerificationSheet.create(this, IdentityVerificationSheet.Configuration(brandLogo = Uri.parse(imageUri))) {
      promise?.let { currentPromise ->
        val result = WritableNativeMap()
        when (it) {
          VerificationFlowResult.Completed -> result.putString("status", "FlowCompleted")
          VerificationFlowResult.Canceled -> result.putString("status", "FlowCanceled")
          else -> result.putString("status", "FlowFailed")
        }
        currentPromise.resolve(result)
      } ?: run {
        throw Exception("No promise is set to handle results")
      }

    }
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    identityVerificationSheet.present(
      verificationSessionId = verificationSessionId,
      ephemeralKeySecret = ephemeralKeySecret
    )
  }

  fun present(promise: Promise) {
    this.promise = promise
  }
}
