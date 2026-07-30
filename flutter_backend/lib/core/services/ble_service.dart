// Folder Path: lib/core/services/
// Dart Filename: ble_service.dart

import 'dart:async';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';

class BLEService {
  final FlutterReactiveBle _ble = FlutterReactiveBle();
  StreamSubscription<DiscoveredDevice>? _scanSubscription;

  // AgriMesh Service ID
  static final Uuid _meshServiceUuid = Uuid.parse("03600000-0000-0000-0000-000000000000");

  final StreamController<DiscoveredDevice> _peerDiscoveryController = StreamController.broadcast();
  Stream<DiscoveredDevice> get peerDevices => _peerDiscoveryController.stream;

  void startMeshScanning() {
    _scanSubscription?.cancel();
    _scanSubscription = _ble.scanForDevices(
      withServices: [_meshServiceUuid],
      scanMode: ScanMode.lowLatency,
    ).listen(
      (device) {
        _peerDiscoveryController.add(device);
      },
      onError: (err) {
        // Handle scanning exceptions
      },
    );
  }

  void stopMeshScanning() {
    _scanSubscription?.cancel();
  }

  Future<void> connectToPeerAndSync(String deviceId, Future<void> Function(QualifiedCharacteristic) syncCallback) async {
    _ble.connectToDevice(
      id: deviceId,
      connectionTimeout: const Duration(seconds: 10),
    ).listen((state) {
      if (state.connectionState == DeviceConnectionState.connected) {
        final characteristic = QualifiedCharacteristic(
          characteristicId: Uuid.parse("03600000-0000-0000-0000-000000000001"),
          serviceId: _meshServiceUuid,
          deviceId: deviceId,
        );
        syncCallback(characteristic);
      }
    });
  }

  void dispose() {
    _scanSubscription?.cancel();
    _peerDiscoveryController.close();
  }
}
