// Folder Path: lib/core/services/
// Dart Filename: ble_service.dart

import 'dart:async';
import 'package:flutter/services.dart';

class DiscoveredPeerDevice {
  final String nodeId;
  final String deviceAddress;
  final int rssi;
  final DateTime lastSeen;

  DiscoveredPeerDevice({
    required this.nodeId,
    required this.deviceAddress,
    required this.rssi,
    required this.lastSeen,
  });
}

class BLEService {
  static const MethodChannel _channel = MethodChannel('com.uzhavan360.vlink/ble');

  final StreamController<DiscoveredPeerDevice> _peerDiscoveryController = StreamController.broadcast();
  Stream<DiscoveredPeerDevice> get peerDevices => _peerDiscoveryController.stream;

  final Map<String, DiscoveredPeerDevice> _activePeers = {};
  List<DiscoveredPeerDevice> get currentPeers => _activePeers.values.toList();

  BLEService() {
    _channel.setMethodCallHandler(_handleNativeCall);
  }

  Future<dynamic> _handleNativeCall(MethodCall call) async {
    switch (call.method) {
      case 'onPeerDiscovered':
        final Map<String, dynamic> args = Map<String, dynamic>.from(call.arguments);
        final peer = DiscoveredPeerDevice(
          nodeId: args['nodeId'] ?? 'VLK-UNKNOWN',
          deviceAddress: args['deviceAddress'] ?? '',
          rssi: args['rssi'] ?? -70,
          lastSeen: DateTime.now(),
        );
        _activePeers[peer.nodeId] = peer;
        _peerDiscoveryController.add(peer);
        break;
      case 'onMessageReceived':
        // Handle incoming BLE payload write
        break;
    }
  }

  Future<void> startMeshAdvertising(String nodeId) async {
    try {
      await _channel.invokeMethod('startAdvertising', {'nodeId': nodeId});
    } on PlatformException catch (e) {
      // Fallback or handle platform error
    }
  }

  Future<void> stopMeshAdvertising() async {
    try {
      await _channel.invokeMethod('stopAdvertising');
    } on PlatformException catch (_) {}
  }

  Future<void> startMeshScanning() async {
    try {
      await _channel.invokeMethod('startScanning');
    } on PlatformException catch (_) {}
  }

  Future<void> stopMeshScanning() async {
    try {
      await _channel.invokeMethod('stopScanning');
    } on PlatformException catch (_) {}
  }

  Future<bool> sendMeshEnvelope(String targetAddress, String envelopeJson) async {
    try {
      final bool result = await _channel.invokeMethod('sendGattMessage', {
        'targetAddress': targetAddress,
        'payload': envelopeJson,
      });
      return result;
    } on PlatformException catch (_) {
      return false;
    }
  }

  void dispose() {
    stopMeshScanning();
    stopMeshAdvertising();
    _peerDiscoveryController.close();
  }
}
