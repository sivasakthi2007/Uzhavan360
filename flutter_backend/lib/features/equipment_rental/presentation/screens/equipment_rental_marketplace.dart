// Folder Path: lib/features/equipment_rental/presentation/screens/
// Dart Filename: equipment_rental_marketplace.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EquipmentRentalMarketplace extends ConsumerStatefulWidget {
  const EquipmentRentalMarketplace({super.key});

  @override
  ConsumerState<EquipmentRentalMarketplace> createState() => _EquipmentRentalMarketplaceState();
}

class _EquipmentRentalMarketplaceState extends ConsumerState<EquipmentRentalMarketplace> {
  String _activeTab = 'farmer'; // 'farmer' or 'owner'
  final bool _isOffline = false; // Binds to network status

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'விவசாயக் கருவிகள் வாடகை', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Equipment Rental Marketplace', // English Subtitle
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
              _isOffline ? Icons.wifi_off : Icons.sync,
              color: _isOffline ? Colors.orange : Colors.green,
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Farmer vs Owner Mode Toggle
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'farmer',
                  label: Text('கருவிகள் தேவை (Need Equipment)'),
                  icon: Icon(Icons.handyman),
                ),
                ButtonSegment(
                  value: 'owner',
                  label: Text('கருவி உரிமையாளர் (Owner Hub)'),
                  icon: Icon(Icons.storefront),
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
                : _buildOwnerView(context),
          ),
          // Permanent Customer Support Assistance Card
          _buildCustomerCareCard(context),
        ],
      ),
    );
  }

  // =========================================================================
  // FARMER VIEW (Browse, AI Recommendation & Booking)
  // =========================================================================

  Widget _buildFarmerView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // Smart AI weather-based recommendation banner
        _buildAiRecommendationBanner(context),
        const SizedBox(height: 12),
        _buildSectionHeader('அருகிலுள்ள வாடகை கருவிகள்', 'Available Machinery Nearby'),
        const SizedBox(height: 8),
        _buildEquipmentCard(
          context,
          name: 'ஜான் டீயர் டிராக்டர் (John Deere Tractor 5050D)',
          type: 'டிராக்டர் (Tractor)',
          dailyRate: '₹2,500 / நாள் (Day)',
          hourlyRate: '₹350 / மணிநேரம் (Hour)',
          distance: '3.4 km',
          details: 'இயக்குநர் உண்டு (Operator included) | எரிபொருள் இல்லை (Fuel excluded)',
          status: 'கிடைக்கும் (Available)',
        ),
        _buildEquipmentCard(
          context,
          name: 'நெல் அறுவடை இயந்திரம் (Paddy Harvester - Kubota)',
          type: 'அறுவடை இயந்திரம் (Harvester)',
          dailyRate: '₹9,000 / நாள் (Day)',
          hourlyRate: '₹1,200 / மணிநேரம் (Hour)',
          distance: '5.1 km',
          details: 'இயக்குநர் உண்டு (Operator included) | எரிபொருள் உண்டு (Fuel included)',
          status: 'பதிவு செய்யப்பட்டது (Booked)',
        ),
      ],
    );
  }

  Widget _buildAiRecommendationBanner(BuildContext context) {
    return Card(
      color: Colors.green.shade50,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.green.shade200, width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome, color: Colors.green, size: 24),
                const SizedBox(width: 8),
                Text(
                  'AI பயிர் நுண்ணறிவுப் பரிந்துரை',
                  style: TextStyle(fontWeight: FontWeight.black, color: Colors.green.shade900, fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'அடுத்த 3 நாட்களுக்கு மழை இல்லை. பூச்சிக்கொல்லி தெளிக்க உகந்த வானிலை. ட்ரோன் தெளிப்பானை (Drone Sprayer) முன்பதிவு செய்யப் பரிந்துரைக்கிறோம்.',
              style: TextStyle(fontSize: 13, height: 1.4, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              style: FilledButton.styleFrom(backgroundColor: Colors.green),
              onPressed: () {
                // Instantly filters for Drone Sprayers
              },
              icon: const Icon(Icons.search),
              label: const Text('ட்ரோன் தெளிப்பானைத் தேடு (Search Drone Sprayers)'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildEquipmentCard(
    BuildContext context, {
    required String name,
    required String type,
    required String dailyRate,
    required String hourlyRate,
    required String distance,
    required String details,
    required String status,
  }) {
    final bool isAvailable = status.contains('கிடைக்கும்');

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
                Expanded(
                  child: Text(
                    name,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(distance, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
              ],
            ),
            const SizedBox(height: 4),
            Text('வகை (Type): $type', style: const TextStyle(fontSize: 13, color: Colors.grey)),
            const SizedBox(height: 8),
            Text('நாள் வாடகை: $dailyRate', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            Text('மணிநேர வாடகை: $hourlyRate', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.green)),
            Text(details, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: isAvailable ? null : Colors.grey.shade400,
                    ),
                    onPressed: isAvailable ? () => _showBookingCalendar(context, name) : null,
                    child: Text(isAvailable ? 'வாடகைக்கு எடு (Book Now)' : 'முன்பதிவு நிறைந்தது (Full)'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () {},
                  icon: const Icon(Icons.phone, color: Colors.green),
                ),
                IconButton.filledTonal(
                  onPressed: () {},
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
  // EQUIPMENT OWNER VIEW (Register & Management)
  // =========================================================================

  Widget _buildOwnerView(BuildContext context) {
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
                  'கருவி உரிமையாளர் மையம் (Owner Hub)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.black),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Register your tractors, rotavators, or power sprayers and set daily availability rates.',
                  style: TextStyle(fontSize: 12),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => _showRegisterEquipmentBottomSheet(context),
                  icon: const Icon(Icons.add_to_photos),
                  label: const Text('புதிய கருவி சேர் (Register Equipment)'),
                )
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _buildSectionHeader('உங்களது வாடகைக் கருவிகள்', 'Your Implements'),
        const SizedBox(height: 8),
        _buildOwnerEquipmentCard(context),
      ],
    );
  }

  Widget _buildOwnerEquipmentCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text('பவர் ஸ்பிரேயர் (Power Sprayer - ASPEE)', style: TextStyle(fontWeight: FontWeight.black, fontSize: 16)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(8)),
                  child: const Text('ACTIVE', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                )
              ],
            ),
            const SizedBox(height: 8),
            const Text('அடுத்த பராமரிப்பு (Maintenance): 15-08-2026'),
            const Text('வாடகை: ₹600 / நாள் (Day)'),
            const Divider(),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () {},
                  child: const Text('நீக்கு (Delete)'),
                ),
                const SizedBox(width: 12),
                FilledButton(
                  onPressed: () {},
                  child: const Text('நாட்காட்டி திருத்து (Edit Calendar)'),
                )
              ],
            )
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // GENERAL WIDGETS & MODAL OVERLAYS
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
          child: Icon(Icons.support_agent, color: Colors.white),
        ),
        title: const Text(
          'வாடிக்கையாளர் உதவி மையம் (Customer Care)',
          style: TextStyle(fontWeight: FontWeight.black, fontSize: 14),
        ),
        subtitle: const Text('மின்னணு பதிவு செய்யத் தெரியவில்லையா? உடனே எங்களை அழைக்கவும்.'),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {},
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

  void _showBookingCalendar(BuildContext context, String equipmentName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'வாடகை முன்பதிவு: $equipmentName',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            const Text(
              'நாட்கள் மற்றும் நேரம் தேர்ந்தெடுக்கவும்:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 12),
            // High-contrast date selector replacement representation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton(
                  onPressed: () {},
                  child: const Text('நாளை (Tomorrow)'),
                ),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text('தேதி தேர்வு (Select Date)'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const TextField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'தேவைப்படும் காலம் (Duration in hours/days)',
                border: OutlineInputBorder(),
              ),
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
                        const SnackBar(content: Text('கருவி வாடகை கோரிக்கை சமர்ப்பிக்கப்பட்டது! (Booking Requested!)')),
                      );
                    },
                    child: const Text('முன்பதிவு உறுதிசெய் (Confirm)'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showRegisterEquipmentBottomSheet(BuildContext context) {
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
              'புதிய கருவி பதிவு செய்தல்',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'கருவி பெயர் (Equipment Name - John Deere...)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'கருவி வகை (Type - Tractor/Harvester)',
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
                      labelText: 'நாள் வாடகை (Daily Rate in ₹)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'மணிநேர வாடகை (Hourly Rate in ₹)',
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
                        const SnackBar(content: Text('கருவி வெற்றிகரமாக பதிவு செய்யப்பட்டது! (Equipment Registered!)')),
                      );
                    },
                    child: const Text('கருவி சேர் (Register)'),
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
}
