package com.stripeidentityreactnative

import android.content.ContentResolver
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.URLUtil
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
    val imageUriString = arguments?.getBundle("brandLogo")?.getString("uri").orEmpty()
    return IdentityVerificationSheet.create(this, IdentityVerificationSheet.Configuration
      (brandLogo = getUrlOrResourceId(imageUriString))) {
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

  private fun getUrlOrResourceId(uriString: String?): Uri {
    return uriString?.let {
      if (URLUtil.isValidUrl(it)) {
        // Debug mode, Image.resolveAssetSource resolves to local http:// URL
        Uri.parse(it)
      } else {
        // Release mode, Image.resolveAssetSource resolves to a drawable resource
        val brandLogoId = resources.getIdentifier(it, "drawable", context?.packageName) // int
        Uri.Builder()
          .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
          .authority(resources.getResourcePackageName(brandLogoId))
          .appendPath(resources.getResourceTypeName(brandLogoId))
          .appendPath(resources.getResourceEntryName(brandLogoId))
          .build()

      }
    } ?: Uri.parse("")
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
