// Folder Path: lib/features/vlink/presentation/screens/
// Dart Filename: vlink_diagnostics_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class VLinkDiagnosticsScreen extends ConsumerStatefulWidget {
  const VLinkDiagnosticsScreen({super.key});

  @override
  ConsumerState<VLinkDiagnosticsScreen> createState() => _VLinkDiagnosticsScreenState();
}

class _VLinkDiagnosticsScreenState extends ConsumerState<VLinkDiagnosticsScreen> {
  final String _nodeId = 'VLK-A12F';
  final bool _isOffline = true;

  final List<Map<String, dynamic>> _mockPeers = [
    {
      'nodeId': 'VLK-RELAY-02',
      'deviceName': 'Redmi Note 12 (Farmer)',
      'isGateway': false,
      'rssi': -68,
      'connectionType': 'BLE GATT (Android)'
    },
    {
      'nodeId': 'VLK-GATEWAY-03',
      'deviceName': 'Samsung A54 (FPO Center)',
      'isGateway': true,
      'rssi': -52,
      'connectionType': 'Wi-Fi Direct P2P'
    }
  ];

  final List<Map<String, dynamic>> _mockQueue = [
    {
      'messageId': 'VLK-MSG-9041',
      'payloadType': 'CROP_AVAILABILITY',
      'ttl': 7,
      'hopCount': 1,
      'status': 'RELAYED',
      'priority': 'normal'
    },
    {
      'messageId': 'VLK-MSG-9042',
      'payloadType': 'SCHEME_APPLICATION',
      'ttl': 8,
      'hopCount': 0,
      'status': 'QUEUED',
      'priority': 'normal'
    }
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Diagnostics Hub Banner
          Card(
            color: Colors.grey[900],
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.green[400]!),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Colors.greenAccent,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'V-LINK Layer 2 Active',
                              style: TextStyle(
                                color: Colors.greenAccent,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        'ID: $_nodeId',
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Device-to-Device Mesh Diagnostics',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Manages BLE scan/advertise advertisements and Wi-Fi Direct sockets.',
                    style: TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white12),
                  const SizedBox(height: 10),

                  // Diagnostics Info Grid
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildDiagIndicator('Node Status', _isOffline ? 'MESH ONLY' : 'GATEWAY ON', _isOffline ? Colors.amber : Colors.green),
                      _buildDiagIndicator('Active Peers', '${_mockPeers.length} Devices', Colors.blue),
                      _buildDiagIndicator('Pending Queue', '${_mockQueue.length} Packets', Colors.orange),
                    ],
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Discovery Peers Segment
          _buildSegmentHeader('Nearby Discovered Peers', _mockPeers.length),
          const SizedBox(height: 10),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _mockPeers.length,
            itemBuilder: (context, idx) {
              final peer = _mockPeers[idx];
              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: peer['isGateway'] ? Colors.green[100] : Colors.blue[100],
                    child: Icon(
                      peer['isGateway'] ? Icons.cloud : Icons.phone_android,
                      color: peer['isGateway'] ? Colors.green : Colors.blue,
                    ),
                  ),
                  title: Text(peer['deviceName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('${peer['connectionType']} • RSSI: ${peer['rssi']} dBm', style: const TextStyle(fontSize: 11)),
                  trailing: Text(peer['nodeId'], style: const TextStyle(fontFamily: 'monospace', fontSize: 11)),
                ),
              );
            },
          ),
          const SizedBox(height: 20),

          // Message Queue Segment
          _buildSegmentHeader('Persistent Message Queue', _mockQueue.length),
          const SizedBox(height: 10),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _mockQueue.length,
            itemBuilder: (context, idx) {
              final msg = _mockQueue[idx];
              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(msg['messageId'], style: const TextStyle(fontWeight: FontWeight.w900, fontFamily: 'monospace', fontSize: 13)),
                          const SizedBox(height: 4),
                          Text(msg['payloadType'], style: TextStyle(color: Colors.grey[600], fontSize: 11)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: msg['status'] == 'RELAYED' ? Colors.blue.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          msg['status'],
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: msg['status'] == 'RELAYED' ? Colors.blue : Colors.orange,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          )
        ],
      ),
    );
  }

  Widget _buildDiagIndicator(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 9)),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace'),
        ),
      ],
    );
  }

  Widget _buildSegmentHeader(String label, int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text('$count', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}
