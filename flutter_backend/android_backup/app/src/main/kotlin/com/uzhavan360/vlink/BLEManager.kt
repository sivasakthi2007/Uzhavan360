package com.uzhavan360.vlink

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.Build
import android.os.ParcelUuid
import android.util.Log
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Android Native BLE Manager for V-LINK Layer 2 Peer Discovery & GATT Messaging.
 * Implements BLE Advertising (Peripheral Mode) & Scanning (Central Mode).
 */
class BLEManager(private val context: Context) {

    companion object {
        private const val TAG = "VLINK_BLE"
        val MESH_SERVICE_UUID: UUID = UUID.fromString("03600000-0000-0000-0000-000000000000")
        val MESH_CHAR_UUID: UUID = UUID.fromString("03600000-0000-0000-0000-000000000001")
    }

    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        manager.adapter
    }

    private var bleAdvertiser: BluetoothLeAdvertiser? = null
    private var bleScanner: BluetoothLeScanner? = null
    private var gattServer: BluetoothGattServer? = null

    val discoveredPeers = ConcurrentHashMap<String, DiscoveredPeer>()
    var onPeerDiscovered: ((DiscoveredPeer) -> Unit)? = null
    var onMessageReceived: ((String, String) -> Unit)? = null

    data class DiscoveredPeer(
        val nodeId: String,
        val deviceAddress: String,
        val rssi: Int,
        val lastSeen: Long = System.currentTimeMillis()
    )

    @SuppressLint("MissingPermission")
    fun startAdvertising(nodeId: String) {
        if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
            Log.e(TAG, "Bluetooth not available or disabled")
            return
        }

        bleAdvertiser = bluetoothAdapter!!.bluetoothLeAdvertiser
        if (bleAdvertiser == null) {
            Log.e(TAG, "BLE Advertising not supported on this device")
            return
        }

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .build()

        val pUuid = ParcelUuid(MESH_SERVICE_UUID)
        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .addServiceUuid(pUuid)
            .addServiceData(pUuid, nodeId.toByteArray(StandardCharsets.UTF_8))
            .build()

        bleAdvertiser?.startAdvertising(settings, data, advertiseCallback)
        setupGattServer()
        Log.i(TAG, "V-LINK BLE Advertising started with Node ID: $nodeId")
    }

    @SuppressLint("MissingPermission")
    fun stopAdvertising() {
        bleAdvertiser?.stopAdvertising(advertiseCallback)
        gattServer?.close()
        Log.i(TAG, "V-LINK BLE Advertising stopped")
    }

    @SuppressLint("MissingPermission")
    fun startScanning() {
        if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) return
        bleScanner = bluetoothAdapter!!.bluetoothLeScanner

        val filter = ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(MESH_SERVICE_UUID))
            .build()

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        bleScanner?.startScan(listOf(filter), settings, scanCallback)
        Log.i(TAG, "V-LINK BLE Scanning started")
    }

    @SuppressLint("MissingPermission")
    fun stopScanning() {
        bleScanner?.stopScan(scanCallback)
        Log.i(TAG, "V-LINK BLE Scanning stopped")
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            Log.d(TAG, "BLE Advertise SUCCESS")
        }

        override fun onStartFailure(errorCode: Int) {
            Log.e(TAG, "BLE Advertise FAILURE, ErrorCode: $errorCode")
        }
    }

    private val scanCallback = object : ScanCallback() {
        @SuppressLint("MissingPermission")
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.let {
                val record = it.scanRecord ?: return
                val serviceData = record.getServiceData(ParcelUuid(MESH_SERVICE_UUID))
                val nodeId = serviceData?.let { bytes -> String(bytes, StandardCharsets.UTF_8) } ?: "VLK-UNKNOWN"

                val peer = DiscoveredPeer(
                    nodeId = nodeId,
                    deviceAddress = it.device.address,
                    rssi = it.rssi
                )
                discoveredPeers[nodeId] = peer
                onPeerDiscovered?.invoke(peer)
                Log.d(TAG, "Discovered V-LINK Peer: $nodeId [${it.device.address}] RSSI: ${it.rssi}")
            }
        }
    }

    @SuppressLint("MissingPermission")
    private fun setupGattServer() {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        gattServer = bluetoothManager.openGattServer(context, object : BluetoothGattServerCallback() {
            override fun onCharacteristicWriteRequest(
                device: BluetoothDevice?,
                requestId: Int,
                characteristic: BluetoothGattCharacteristic?,
                preparedWrite: Boolean,
                responseNeeded: Boolean,
                offset: Int,
                value: ByteArray?
            ) {
                if (characteristic?.uuid == MESH_CHAR_UUID && value != null) {
                    val payloadStr = String(value, StandardCharsets.UTF_8)
                    Log.i(TAG, "Received GATT write from ${device?.address}: $payloadStr")
                    onMessageReceived?.invoke(device?.address ?: "UNKNOWN", payloadStr)

                    if (responseNeeded) {
                        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                    }
                }
            }
        })

        val service = BluetoothGattService(MESH_SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        val char = BluetoothGattCharacteristic(
            MESH_CHAR_UUID,
            BluetoothGattCharacteristic.PROPERTY_WRITE or BluetoothGattCharacteristic.PROPERTY_READ,
            BluetoothGattCharacteristic.PERMISSION_WRITE or BluetoothGattCharacteristic.PERMISSION_READ
        )
        service.addCharacteristic(char)
        gattServer?.addService(service)
    }
}
