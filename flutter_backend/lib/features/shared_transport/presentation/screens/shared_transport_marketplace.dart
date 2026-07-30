// Folder Path: lib/features/shared_transport/presentation/screens/
// Dart Filename: shared_transport_marketplace.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/transport_entity.dart';
import '../controllers/transport_controller.dart';

class SharedTransportMarketplace extends ConsumerStatefulWidget {
  const SharedTransportMarketplace({super.key});

  @override
  ConsumerState<SharedTransportMarketplace> createState() => _SharedTransportMarketplaceState();
}

class _SharedTransportMarketplaceState extends ConsumerState<SharedTransportMarketplace> {
  String _activeTab = 'farmer'; // 'farmer', 'driver', or 'partner'
  final bool _isOffline = false; // Binds to connectivity stream

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'பகிர்வு வாகனச் சந்தை', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Shared Transport Marketplace', // English Subtitle
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Icon(
              _isOffline ? Icons.wifi_off : Icons.cloud_done,
              color: _isOffline ? Colors.orange : Colors.green,
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Role Mode Toggle
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'farmer',
                  label: Text('விவசாயி (Farmer)'),
                  icon: Icon(Icons.agriculture),
                ),
                ButtonSegment(
                  value: 'partner',
                  label: Text('உரிமையாளர் (Owner)'),
                  icon: Icon(Icons.local_shipping),
                ),
              ],
              selected: {_activeTab},
              onSelectionChanged: (set) {
                setState(() {
                  _activeTab = set.first;
                });
              },
            ),
          ),
          Expanded(
            child: _activeTab == 'farmer'
                ? _buildFarmerView(context)
                : _buildPartnerView(context),
          ),
          // Permanent Customer Care Assistance Card
          _buildCustomerCareCard(context),
        ],
      ),
    );
  }

  // =========================================================================
  // FARMER VIEW (Search & Booking)
  // =========================================================================

  Widget _buildFarmerView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        _buildSectionHeader('அருகிலுள்ள வாகனங்கள்', 'Available Shared Vehicles Nearby'),
        const SizedBox(height: 8),
        _buildVehicleCard(
          context,
          driverName: 'செல்வம் கே. (Selvam K.)',
          vehicleType: 'மினி லாரி (Mini Truck - Tata Ace)',
          capacityPercent: 60,
          route: 'மதுரை கிழக்கு (Madurai East) ➔ பரவை மண்டி (Paravai Mandi)',
          costDetails: '₹3 / kg | ₹60 / மூட்டை (Bag)',
          sharingBonusText: '3 விவசாயிகள் பகிர்கிறார்கள் (Fuel Reduced by 35%)',
        ),
        _buildVehicleCard(
          context,
          driverName: 'முத்துராஜ் வி. (Muthuraj V.)',
          vehicleType: 'பிக்கப் (Pickup - Mahindra Bolero)',
          capacityPercent: 85,
          route: 'மேலூர் (Melur) ➔ வடுகப்பட்டி (Vadugapatti)',
          costDetails: '₹4 / kg | ₹80 / மூட்டை (Bag)',
          sharingBonusText: '2 விவசாயிகள் பகிர்கிறார்கள் (Fuel Reduced by 15%)',
        ),
      ],
    );
  }

  Widget _buildVehicleCard(
    BuildContext context, {
    required String driverName,
    required String vehicleType,
    required int capacityPercent,
    required String route,
    required String costDetails,
    required String sharingBonusText,
  }) {
    final int availablePercent = 100 - capacityPercent;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text(driverName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black)),
                Text(vehicleType, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            Text('பாதை (Route): $route', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            Text('வாடகை விபரம் (Price): $costDetails', style: const TextStyle(fontSize: 14, color: Colors.green, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            
            // Smart Space Utilization Indicator
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text('பகிர்வு கொள்ளளவு (Capacity): $capacityPercent%'),
                Text('$availablePercent% காலி (Available)', style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 4),
            LinearProgressIndicator(
              value: capacityPercent / 100,
              backgroundColor: Colors.grey.shade200,
              color: capacityPercent > 80 ? Colors.orange : Colors.green,
              minHeight: 12,
              borderRadius: BorderRadius.circular(6),
            ),
            const SizedBox(height: 8),
            
            // Smart Fuel sharing bonus badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.energy_savings_leaf, size: 16, color: Colors.green),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      sharingBonusText,
                      style: const TextStyle(fontSize: 11, color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                  )
                ],
              ),
            ),

            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    onPressed: () => _showBookingDialog(context, driverName),
                    child: const Text('இட முன்பதிவு (Book Space)'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () {}, // Trigger call
                  icon: const Icon(Icons.phone, color: Colors.green),
                ),
                IconButton.filledTonal(
                  onPressed: () {}, // WhatsApp trigger
                  icon: const Icon(Icons.message, color: Colors.blue),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // VEHICLE PARTNER VIEW (Publish & Manage Route)
  // =========================================================================

  Widget _buildPartnerView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          color: Theme.of(context).colorScheme.primaryContainer,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'வாகன உரிமையாளர் தளம் (Partner Hub)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.black),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Publish crop logistics trips, coordinate farmer packages, and track earnings.',
                  style: TextStyle(fontSize: 12),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => _showPublishTripBottomSheet(context),
                  icon: const Icon(Icons.add_road),
                  label: const Text('புதிய பயணத்தை பகிர் (Publish New Trip)'),
                )
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _buildSectionHeader('உங்களது பயணங்கள்', 'Your Published Trips'),
        const SizedBox(height: 8),
        _buildDriverTripCard(context),
      ],
    );
  }

  Widget _buildDriverTripCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text('பயணம் #TRP-9023', style: TextStyle(fontWeight: FontWeight.black)),
                Text('நிலை: AVAILABLE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 8),
            const Text('பாதை: மதுரை கிழக்கு ➔ வடுகப்பட்டி மண்டி'),
            const Text('புறப்படும் நேரம்: நாளை காலை 05:30 AM'),
            const Divider(),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () {},
                  child: const Text('பயணத்தை ரத்து செய் (Cancel)'),
                ),
                const SizedBox(width: 12),
                FilledButton(
                  onPressed: () => _showQRPassDialog(context),
                  child: const Text('QR குறியீடு (QR Pass)'),
                )
              ],
            )
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // ADDITIONAL DIALOGS & GENERAL COMPONENTS
  // =========================================================================

  Widget _buildCustomerCareCard(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(12),
      color: Colors.amber.shade50,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.amber.shade200, width: 1.5),
      ),
      child: ListTile(
        leading: const CircleAvatar(
          backgroundColor: Colors.amber,
          child: Icon(Icons.phone, color: Colors.white),
        ),
        title: const Text(
          'உதவி தேவைப்படுகிறதா? (Need Help?)',
          style: TextStyle(fontWeight: FontWeight.black, fontSize: 14),
        ),
        subtitle: const Text('எங்கள் வாடிக்கையாளர் மையத்தைத் தொடர்பு கொண்டு வாகனங்களை முன்பதிவு செய்யவும்.'),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          // Triggers customer care support call
        },
      ),
    );
  }

  Widget _buildSectionHeader(String tamil, String english) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(tamil, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black)),
        Text(english, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
      ],
    );
  }

  void _showBookingDialog(BuildContext context, String driverName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 24,
          right: 24,
          top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'வாகன முன்பதிவு: $driverName',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'பயிர் வகை (Crop Type - e.g. Tomato)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'மூட்டைகள் (Bags count)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'எடை (Weight in kg)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('ரத்து (Cancel)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('முன்பதிவு விண்ணப்பிக்கப்பட்டது! (Booking Requested!)')),
                      );
                    },
                    child: const Text('முன்பதிவு செய் (Request Booking)'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _showPublishTripBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 24,
          right: 24,
          top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'புதிய பயணம் வெளியிடுதல்',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'புறப்படும் இடம் (From Location)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'சென்றடையும் இடம் (Destination)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'கொள்ளளவு (Capacity in kg)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'வாடகை ₹ / kg (Price per kg)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('மூடு (Close)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('பயணம் வெற்றிகரமாக வெளியிடப்பட்டது! (Trip Published!)')),
                      );
                    },
                    child: const Text('வெளியிடு (Publish Trip)'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _showQRPassDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('வருகைப்பதிவு QR கடந்து செல்ல (Booking QR Pass)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('அறுவடையை ஏற்றி இறக்கும் போது ஓட்டுநர் இந்த QR குறியீட்டை ஸ்கேன் செய்ய வேண்டும்.'),
            const SizedBox(height: 16),
            // Placeholder for QR code container
            Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black, width: 2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.qr_code_2, size: 140),
            ),
            const SizedBox(height: 8),
            const Text('உறுதிப்படுத்தப்பட்ட குறியீடு: #TRP-9023', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('சரி (OK)'),
          )
        ],
      ),
    );
  }
}
