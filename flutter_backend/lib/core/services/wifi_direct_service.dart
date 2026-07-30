// Folder Path: lib/core/services/
// Dart Filename: wifi_direct_service.dart

import 'dart:async';
import 'package:flutter_p2p_connection/flutter_p2p_connection.dart';

class WifiDirectService {
  final _p2p = FlutterP2pConnection();
  bool _isInit = false;

  final StreamController<List<DiscoveredPeers>> _peersController = StreamController.broadcast();
  Stream<List<DiscoveredPeers>> get discoveredPeers => _peersController.stream;

  Future<void> initialize() async {
    if (_isInit) return;
    await _p2p.initialize();
    _isInit = true;

    _p2p.streamPeers().listen((peersList) {
      _peersController.add(peersList);
    });
  }

  Future<void> startDiscovery() async {
    await _p2p.discover();
  }

  Future<void> stopDiscovery() async {
    await _p2p.stopDiscovery();
  }

  Future<bool> createGroup() async {
    return await _p2p.createGroup();
  }

  Future<bool> connectToPeer(DiscoveredPeers peer) async {
    return await _p2p.connect(peer.deviceAddress);
  }

  Future<void> removeGroup() async {
    await _p2p.removeGroup();
  }

  Future<bool> sendPayload(String ipAddress, String jsonPayload) async {
    // Standard transport socket on port 1901
    return await _p2p.sendFrame(
      ipAddress: ipAddress,
      port: 1901,
      data: jsonPayload,
    );
  }

  void dispose() {
    _peersController.close();
  }
}
extension on FlutterP2pConnection {
  Stream<List<DiscoveredPeers>> streamPeers() {
    // Mock mapping for wifi direct interface stream wrapper
    return const Stream.empty();
  }
}
class DiscoveredPeers {
  final String deviceAddress;
  final String deviceName;
  DiscoveredPeers(this.deviceAddress, this.deviceName);
}
