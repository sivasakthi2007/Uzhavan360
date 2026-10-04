// Folder Path: lib/core/services/
// Dart Filename: wifi_direct_service.dart

import 'dart:async';
import 'package:flutter/services.dart';

class DiscoveredWifiDirectPeer {
  final String deviceName;
  final String deviceAddress;
  final bool isGroupOwner;

  DiscoveredWifiDirectPeer({
    required this.deviceName,
    required this.deviceAddress,
    this.isGroupOwner = false,
  });
}

class WifiDirectService {
  static const MethodChannel _channel = MethodChannel('com.uzhavan360.vlink/wifi_p2p');

  final StreamController<List<DiscoveredWifiDirectPeer>> _peersController = StreamController.broadcast();
  Stream<List<DiscoveredWifiDirectPeer>> get discoveredPeers => _peersController.stream;

  final StreamController<String> _payloadController = StreamController.broadcast();
  Stream<String> get incomingPayloads => _payloadController.stream;

  WifiDirectService() {
    _channel.setMethodCallHandler(_handleNativeCall);
  }

  Future<dynamic> _handleNativeCall(MethodCall call) async {
    switch (call.method) {
      case 'onPeersAvailable':
        final List<dynamic> rawPeers = call.arguments;
        final peers = rawPeers.map((p) => DiscoveredWifiDirectPeer(
          deviceName: p['deviceName'] ?? 'Unknown',
          deviceAddress: p['deviceAddress'] ?? '',
        )).toList();
        _peersController.add(peers);
        break;
      case 'onPayloadReceived':
        final String payload = call.arguments;
        _payloadController.add(payload);
        break;
    }
  }

  Future<void> startDiscovery() async {
    try {
      await _channel.invokeMethod('discoverPeers');
    } on PlatformException catch (_) {}
  }

  Future<String?> createP2PGroup() async {
    try {
      final String? groupOwnerIp = await _channel.invokeMethod('createGroup');
      return groupOwnerIp;
    } on PlatformException catch (_) {
      return null;
    }
  }

  Future<bool> sendPayload(String targetIp, String jsonPayload) async {
    try {
      final bool success = await _channel.invokeMethod('sendPayload', {
        'ip': targetIp,
        'payload': jsonPayload,
      });
      return success;
    } on PlatformException catch (_) {
      return false;
    }
  }

  Future<void> removeGroup() async {
    try {
      await _channel.invokeMethod('removeGroup');
    } on PlatformException catch (_) {}
  }

  void dispose() {
    _peersController.close();
    _payloadController.close();
  }
}
