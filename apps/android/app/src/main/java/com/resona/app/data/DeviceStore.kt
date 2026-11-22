package com.resona.app.data

import android.content.Context

/** Device key + display name, persisted locally (no account, D-002). */
class DeviceStore(context: Context) {
    private val prefs = context.applicationContext
        .getSharedPreferences("resona_device", Context.MODE_PRIVATE)

    val deviceKey: String? get() = prefs.getString(KEY_DEVICE, null)
    val displayName: String? get() = prefs.getString(KEY_NAME, null)
    val hasDevice: Boolean get() = !deviceKey.isNullOrBlank()

    fun save(registration: DeviceRegistration) {
        prefs.edit()
            .putString(KEY_DEVICE, registration.deviceKey)
            .putString(KEY_NAME, registration.displayName)
            .apply()
    }

    fun clear() {
        prefs.edit().remove(KEY_DEVICE).remove(KEY_NAME).apply()
    }

    private companion object {
        const val KEY_DEVICE = "device_key"
        const val KEY_NAME = "display_name"
    }
}
