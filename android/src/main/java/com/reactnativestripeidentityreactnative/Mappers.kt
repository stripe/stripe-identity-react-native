package com.reactnativestripeidentityreactnative

import android.os.Bundle
import android.util.Log
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType

internal fun toBundleObject(readableMap: ReadableMap?): Bundle? {
  val result = Bundle()
  if (readableMap == null) {
    return result
  }
  val iterator = readableMap.keySetIterator()
  while (iterator.hasNextKey()) {
    val key = iterator.nextKey()
    when (readableMap.getType(key)) {
      ReadableType.Null -> result.putString(key, null)
      ReadableType.Boolean -> result.putBoolean(key, readableMap.getBoolean(key))
      ReadableType.Number -> try {
        result.putInt(key, readableMap.getInt(key))
      } catch (e: Exception) {
        result.putDouble(key, readableMap.getDouble(key))
      }
      ReadableType.String -> result.putString(key, readableMap.getString(key))
      ReadableType.Map -> result.putBundle(key, toBundleObject(readableMap.getMap(key)))
      ReadableType.Array -> Log.e("toBundleException", "Cannot put arrays of objects into bundles. Failed on: $key.")
      else -> Log.e("toBundleException", "Could not convert object with key: $key.")
    }
  }
  return result
}
