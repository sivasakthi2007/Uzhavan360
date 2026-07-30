// Folder Path: lib/features/pre_booking/presentation/screens/
// Dart Filename: crop_intelligence_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/pre_booking_entity.dart';
import '../controllers/pre_booking_controller.dart';

class CropIntelligenceScreen extends ConsumerStatefulWidget {
  const CropIntelligenceScreen({super.key});

  @override
  ConsumerState<CropIntelligenceScreen> createState() => _CropIntelligenceScreenState();
}

class _CropIntelligenceScreenState extends ConsumerState<CropIntelligenceScreen> {
  String _selectedTab = 'nearby'; // 'nearby' or 'calendar'
  final bool _isOffline = false; // Binds to connectivity stream in production

  @override
  Widget build(BuildContext context) {
    final preBookingsAsync = ref.watch(preBookingNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'அருகிலுள்ள பயிர் விபரங்கள்', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Nearby Crop Intelligence', // English Subtitle
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
        actions: [
          // Offline & Sync Status Indicators
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Icon(
                  _isOffline ? Icons.wifi_off : Icons.cloud_done,
                  color: _isOffline ? Colors.red : Colors.green,
                  size: 20,
                ),
                const SizedBox(width: 4),
                Text(
                  _isOffline ? 'இணைப்பு இல்லை (Offline)' : 'ஒத்திசைக்கப்பட்டது (Synced)',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Segmented Tab Filter (Large touch targets for elderly farmers)
          Padding(
            padding: const EdgeInsets.all(12),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'nearby',
                  label: Text('அருகிலுள்ள பண்ணைகள் (Farms)'),
                  icon: Icon(Icons.location_on),
                ),
                ButtonSegment(
                  value: 'calendar',
                  label: Text('அறுவடை நாட்காட்டி (Calendar)'),
                  icon: Icon(Icons.calendar_month),
                ),
              ],
              selected: {_selectedTab},
              onSelectionChanged: (set) {
                setState(() {
                  _selectedTab = set.first;
                });
              },
            ),
          ),
          Expanded(
            child: _selectedTab == 'nearby'
                ? _buildNearbyList(preBookingsAsync)
                : _buildHarvestCalendar(preBookingsAsync),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddPreBookingDialog(context),
        label: const Text('முன்பதிவு சேர் (Add Pre-Booking)', style: TextStyle(fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.add, size: 24),
      ),
    );
  }

  Widget _buildNearbyList(AsyncValue<List<PreBookingEntity>> asyncState) {
    return asyncState.when(
      data: (bookings) {
        if (bookings.isEmpty) {
          return _buildEmptyState();
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          itemCount: bookings.length,
          itemBuilder: (context, index) {
            final item = bookings[index];
            return _buildFarmCard(context, item);
          },
        );
      },
      loading: () => _buildShimmerLoading(),
      error: (err, stack) => _buildErrorState(err.toString()),
    );
  }

  Widget _buildFarmCard(BuildContext context, PreBookingEntity item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showBookingDetailsBottomSheet(context, item),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  Text(
                    item.cropName,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.black),
                  ),
                  Chip(
                    label: Text(
                      item.status.toUpperCase(),
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    backgroundColor: item.status == 'contracted' ? Colors.green.shade100 : Colors.blue.shade100,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'எதிர்பார்க்கும் அளவு (Yield): ${item.estimatedQuantity} ${item.unit}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              Text(
                'ஒப்பந்த விலை (Agreed Price): ₹${item.agreedPricePerUnit} / ${item.unit}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.green),
              ),
              const Divider(height: 20),
              Row(
                children: [
                  const Icon(Icons.date_range, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    'அறுவடை தேதி: ${item.expectedHarvestDate.day}-${item.expectedHarvestDate.month}-${item.expectedHarvestDate.year}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHarvestCalendar(AsyncValue<List<PreBookingEntity>> asyncState) {
    return asyncState.when(
      data: (bookings) {
        if (bookings.isEmpty) return _buildEmptyState();
        return ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: bookings.length,
          itemBuilder: (context, index) {
            final item = bookings[index];
            return ListTile(
              leading: CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: const Icon(Icons.agriculture),
              ),
              title: Text(item.cropName, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Harvest Yield: ${item.estimatedQuantity} ${item.unit}'),
              trailing: Text(
                '${item.expectedHarvestDate.day}/${item.expectedHarvestDate.month}',
                style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16),
              ),
            );
          },
        );
      },
      loading: () => _buildShimmerLoading(),
      error: (err, stack) => _buildErrorState(err.toString()),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: 3,
      itemBuilder: (context, index) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Container(
          height: 120,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(width: 150, height: 20, color: Colors.grey.shade300),
              const SizedBox(height: 12),
              Container(width: 100, height: 16, color: Colors.grey.shade200),
              const SizedBox(height: 6),
              Container(width: 200, height: 16, color: Colors.grey.shade200),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.layers_clear, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          const Text(
            'விபரங்கள் எதுவும் இல்லை\n(No data available)',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'தவறு ஏற்பட்டது (Error occurred):\n$message',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddPreBookingDialog(BuildContext context) {
    final cropController = TextEditingController();
    final qtyController = TextEditingController();
    final priceController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('புதிய முன்பதிவு (Add Pre-Booking)'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: cropController,
                decoration: const InputDecoration(labelText: 'பயிர் பெயர் (Crop Name)'),
              ),
              TextField(
                controller: qtyController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'அளவு (Quantity in kg)'),
              ),
              TextField(
                controller: priceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'விலை (Price per kg)'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ரத்து செய் (Cancel)'),
          ),
          FilledButton(
            onPressed: () {
              final newBooking = PreBookingEntity(
                id: DateTime.now().millisecondsSinceEpoch.toString(),
                farmerId: 'farmer_demo_id',
                cropName: cropController.text,
                estimatedQuantity: double.tryParse(qtyController.text) ?? 0.0,
                unit: 'kg',
                agreedPricePerUnit: double.tryParse(priceController.text) ?? 0.0,
                escrowDeposit: 0,
                expectedHarvestDate: DateTime.now().add(const Duration(days: 30)),
                status: 'offered',
                syncVersion: 1,
                lastModifiedAt: DateTime.now(),
                isDeleted: false,
              );
              ref.read(preBookingNotifierProvider.notifier).addNewPreBooking(newBooking);
              Navigator.pop(context);
            },
            child: const Text('சேர் (Add)'),
          )
        ],
      ),
    );
  }

  void _showBookingDetailsBottomSheet(BuildContext context, PreBookingEntity item) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.cropName,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            Text('பயிர் அளவு (Quantity): ${item.estimatedQuantity} ${item.unit}'),
            Text('விலை (Agreed Price): ₹${item.agreedPricePerUnit} / ${item.unit}'),
            Text('வழங்கிய வைப்புத்தொகை (Escrow Locked): ₹${item.escrowDeposit}'),
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
                if (item.status == 'offered')
                  Expanded(
                    child: FilledButton(
                      onPressed: () {
                        ref.read(preBookingNotifierProvider.notifier).setBookingStatus(item.id, 'contracted');
                        Navigator.pop(context);
                      },
                      child: const Text('ஏற்கவும் (Accept Offer)'),
                    ),
                  ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
