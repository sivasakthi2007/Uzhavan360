package com.uzhavan360.vlink

import android.annotation.SuppressLint
import android.content.Context
import android.content.IntentFilter
import android.net.wifi.p2p.*
import android.util.Log
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors

/**
 * Android Native Wi-Fi Direct (Wi-Fi P2P) Manager for V-LINK Layer 2 Bulk Transport.
 * Automates Group Creation, Socket Binding on Port 1901, and Framing.
 */
class WifiDirectManager(private val context: Context) {

    companion object {
        private const val TAG = "VLINK_WIFI_P2P"
        const val MESH_P2P_PORT = 1901
    }

    private val manager: WifiP2pManager? by lazy {
        context.getSystemService(Context.WIFI_P2P_SERVICE) as WifiP2pManager?
    }

    private var channel: WifiP2pManager.Channel? = null
    private var serverSocket: ServerSocket? = null
    private val threadPool = Executors.newCachedThreadPool()

    var onPayloadReceived: ((String) -> Unit)? = null
    var onPeersAvailable: ((List<WifiP2pDevice>) -> Unit)? = null

    init {
        channel = manager?.initialize(context, context.mainLooper, null)
    }

    @SuppressLint("MissingPermission")
    fun discoverPeers() {
        manager?.discoverPeers(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                Log.i(TAG, "Wi-Fi Direct Peer Discovery Started")
            }

            override fun onFailure(reasonCode: Int) {
                Log.e(TAG, "Wi-Fi Direct Discovery Failed: reason $reasonCode")
            }
        })
    }

    @SuppressLint("MissingPermission")
    fun createP2PGroup(onSuccess: (String) -> Unit) {
        manager?.createGroup(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                Log.i(TAG, "Wi-Fi Direct Group Created (Group Owner)")
                startP2PServerSocket()
                manager?.requestConnectionInfo(channel) { info ->
                    info.groupOwnerAddress?.hostAddress?.let { ip ->
                        onSuccess(ip)
                    }
                }
            }

            override fun onFailure(reason: Int) {
                Log.e(TAG, "Failed to create Wi-Fi Direct Group: reason $reason")
            }
        })
    }

    private fun startP2PServerSocket() {
        threadPool.execute {
            try {
                serverSocket = ServerSocket(MESH_P2P_PORT)
                Log.i(TAG, "Wi-Fi Direct Server Socket Listening on Port $MESH_P2P_PORT")
                while (!serverSocket!!.isClosed) {
                    val clientSocket = serverSocket!!.accept()
                    handleClientConnection(clientSocket)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Server socket error", e)
            }
        }
    }

    private fun handleClientConnection(socket: Socket) {
        threadPool.execute {
            try {
                val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
                val payload = reader.readLine()
                if (payload != null) {
                    Log.i(TAG, "Received Wi-Fi Direct P2P Frame: $payload")
                    onPayloadReceived?.invoke(payload)
                }
                socket.close()
            } catch (e: Exception) {
                Log.e(TAG, "Failed handling P2P client payload", e)
            }
        }
    }

    fun sendPayload(targetIp: String, payloadJson: String, onResult: (Boolean) -> Unit) {
        threadPool.execute {
            try {
                val socket = Socket(targetIp, MESH_P2P_PORT)
                val writer = PrintWriter(socket.getOutputStream(), true)
                writer.println(payloadJson)
                socket.close()
                Log.i(TAG, "Successfully sent P2P payload to $targetIp")
                onResult(true)
            } catch (e: Exception) {
                Log.e(TAG, "Failed sending P2P payload to $targetIp", e)
                onResult(false)
            }
        }
    }

    fun stopGroup() {
        manager?.removeGroup(channel, null)
        serverSocket?.close()
        Log.i(TAG, "Wi-Fi Direct Group Removed & Server Socket Closed")
    }
}
