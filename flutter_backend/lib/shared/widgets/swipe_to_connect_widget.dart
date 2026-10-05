import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/services/context_connect_service.dart';
import '../../core/services/matching_engine.dart';

class SwipeToConnectWidget extends StatefulWidget {
  final String currentScreen;
  final String? currentFeature;
  final String? serviceType;
  final Function(ServiceContact)? onCallInitiated;

  const SwipeToConnectWidget({
    super.key,
    required this.currentScreen,
    this.currentFeature,
    this.serviceType,
    this.onCallInitiated,
  });

  @override
  State<SwipeToConnectWidget> createState() => _SwipeToConnectWidgetState();
}

class _SwipeToConnectWidgetState extends State<SwipeToConnectWidget> {
  double _dragValue = 0.0;

  void _showCallConfirmation(ServiceContact contact) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.shield, color: Color(0xFF1B5E20)),
            SizedBox(width: 8),
            Text('அழைப்பு உறுதிப்படுத்தல்', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(contact.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(contact.role, style: TextStyle(color: Colors.grey[700], fontSize: 14)),
            const SizedBox(height: 8),
            Text('📍 ${contact.village} • ${contact.contextDescription}', style: const TextStyle(color: Color(0xFF1B5E20), fontSize: 12)),
            const SizedBox(height: 16),
            Text('நீங்கள் ${contact.name} அவர்களை தொலைபேசியில் அழைக்க விரும்புகிறீர்களா?'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('ரத்து')),
          ElevatedButton.icon(
            icon: const Icon(Icons.call, color: Colors.white),
            label: const Text('அழைக்கவும் (Call)'),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1B5E20), foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              final cleaned = MatchingEngine.formatIndianPhoneNumber(contact.phone);
              final Uri uri = Uri.parse('tel:+$cleaned');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final contact = ContextConnectService.instance.resolveRelevantContact(
      currentScreen: widget.currentScreen,
      currentFeature: widget.currentFeature,
    );

    return Container(
      margin: const EdgeInsets.all(12),
      height: 60,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)]),
        borderRadius: BorderRadius.circular(30),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 3))],
      ),
      child: Stack(
        children: [
          Center(
            child: Text(
              'இணைக்க ஸ்வைப் செய்யவும் ➔ (${contact.name})',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
          Positioned(
            left: _dragValue,
            child: GestureDetector(
              onHorizontalDragUpdate: (details) {
                setState(() {
                  _dragValue = (_dragValue + details.delta.dx).clamp(0.0, MediaQuery.of(context).size.width - 120);
                });
              },
              onHorizontalDragEnd: (details) {
                if (_dragValue > MediaQuery.of(context).size.width * 0.5) {
                  _showCallConfirmation(contact);
                }
                setState(() => _dragValue = 0.0);
              },
              child: Container(
                width: 56,
                height: 56,
                margin: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
                ),
                child: const Icon(Icons.phone, color: Color(0xFF1B5E20), size: 28),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
