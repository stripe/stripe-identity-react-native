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

  private var identityVerificationSheet: IdentityVerificationSheet? = null
  private var verificationSessionId: String = ""
  private var ephemeralKeySecret: String = ""
  private var imageUriString: String = ""

  private var promise: Promise? = null
  private var pendingPresent: Boolean = false

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
      (brandLogo = getUrlOrResourceId(imageUriString))) { flowResult ->
      val currentPromise = promise ?: return@create

      val result = WritableNativeMap()
      when (flowResult) {
        VerificationFlowResult.Completed -> result.putString("status", "FlowCompleted")
        VerificationFlowResult.Canceled -> result.putString("status", "FlowCanceled")
        else -> result.putString("status", "FlowFailed")
      }
      currentPromise.resolve(result)
      promise = null

    }
  }

  private fun getUrlOrResourceId(uriString: String?): Uri {
    val value = uriString?.takeIf { it.isNotBlank() } ?: return Uri.parse("")

    return if (URLUtil.isValidUrl(value)) {
      // Debug mode, Image.resolveAssetSource resolves to local http:// URL
      Uri.parse(value)
    } else {
      // Release mode, Image.resolveAssetSource resolves to a drawable resource
      val brandLogoId = resources.getIdentifier(value, "drawable", context?.packageName) // int
      if (brandLogoId == 0) {
        Uri.parse("")
      } else {
        Uri.Builder()
          .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
          .authority(resources.getResourcePackageName(brandLogoId))
          .appendPath(resources.getResourceTypeName(brandLogoId))
          .appendPath(resources.getResourceEntryName(brandLogoId))
          .build()
      }
    }
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    maybePresent()
  }

  private fun maybePresent() {
    if (!pendingPresent) return
    val currentPromise = promise ?: return
    val sheet = identityVerificationSheet ?: return

    // Fragment may exist but not be attached yet if JS calls present immediately after init.
    if (!isAdded) return

    pendingPresent = false
    try {
      sheet.present(
        verificationSessionId = verificationSessionId,
        ephemeralKeySecret = ephemeralKeySecret
      )
    } catch (e: Exception) {
      currentPromise.reject("Error", "Failed to present identity verification sheet: ${e.message}", e)
    }
  }

  fun present(promise: Promise) {
    this.promise = promise
    pendingPresent = true
    maybePresent()
  }
}
