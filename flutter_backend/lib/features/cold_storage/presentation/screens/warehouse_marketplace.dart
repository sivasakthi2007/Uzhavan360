// Folder Path: lib/features/cold_storage/presentation/screens/
// Dart Filename: warehouse_marketplace.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/warehouse_entity.dart';
import '../controllers/warehouse_controller.dart';

class WarehouseMarketplace extends ConsumerStatefulWidget {
  const WarehouseMarketplace({super.key});

  @override
  ConsumerState<WarehouseMarketplace> createState() => _WarehouseMarketplaceState();
}

class _WarehouseMarketplaceState extends ConsumerState<WarehouseMarketplace> {
  String _selectedType = 'all'; // 'all', 'cold', 'dry'
  final bool _isOffline = false; // Binds to sync state

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'கிடங்கு மற்றும் குளிர்பதனச் சேமிப்பு', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Warehouse & Cold Storage Registry', // English Subtitle
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
          // Filter Chips (Cold storage vs Dry storage)
          _buildFilterChips(context),
          Expanded(
            child: _buildWarehouseList(context),
          ),
          // Permanent Customer Care Card
          _buildCustomerCareCard(context),
        ],
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          FilterChip(
            selected: _selectedType == 'all',
            label: const Text('அனைத்தும் (All)', style: TextStyle(fontWeight: FontWeight.bold)),
            onSelected: (val) => setState(() => _selectedType = 'all'),
          ),
          const SizedBox(width: 8),
          FilterChip(
            selected: _selectedType == 'cold',
            label: const Text('குளிர்பதன கிடங்கு (Cold Storage)', style: TextStyle(fontWeight: FontWeight.bold)),
            onSelected: (val) => setState(() => _selectedType = 'cold'),
          ),
          const SizedBox(width: 8),
          FilterChip(
            selected: _selectedType == 'dry',
            label: const Text('சாதாரண கிடங்கு (Dry Storage)', style: TextStyle(fontWeight: FontWeight.bold)),
            onSelected: (val) => setState(() => _selectedType = 'dry'),
          ),
        ],
      ),
    );
  }

  Widget _buildWarehouseList(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      children: [
        // AI Crop Storage & Temperature recommendation banner
        _buildAiStorageRecommendation(context),
        const SizedBox(height: 12),
        _buildWarehouseCard(
          context,
          name: 'மதுரை கூட்டுறவு குளிர்பதன கிடங்கு (Madurai Cooperative Cold Storage)',
          location: 'மாட்டுத்தாவணி, மதுரை (Mattuthavani, Madurai)',
          capacityPercent: 65,
          charges: '₹1.50 / kg / நாள் (Day)',
          tempRange: '2°C - 8°C (Adjustable)',
          isCold: true,
        ),
        _buildWarehouseCard(
          context,
          name: 'அரசு தானிய சேமிப்பு கிடங்கு (Govt Grain Dry Warehouse)',
          location: 'வாடிப்பட்டி, மதுரை (Vadipatti, Madurai)',
          capacityPercent: 85,
          charges: '₹0.75 / kg / நாள் (Day)',
          tempRange: 'சாதாரண வெப்பநிலை (Room Temp)',
          isCold: false,
        ),
      ],
    );
  }

  Widget _buildAiStorageRecommendation(BuildContext context) {
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
                const Icon(Icons.tips_and_updates, color: Colors.green, size: 24),
                const SizedBox(width: 8),
                Text(
                  'பாதுகாப்பு வெப்பநிலை பரிந்துரை (AI Storage Advisor)',
                  style: TextStyle(fontWeight: FontWeight.black, color: Colors.green.shade900, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'தக்காளி (Tomatoes) நீண்ட நாட்கள் கெடாமல் இருக்க 10°C - 12°C வெப்பநிலையில் சேமிக்கவும். இதன் மூலம் வாழ்நாள் 21 நாட்கள் வரை அதிகரிக்கும்.',
              style: TextStyle(fontSize: 13, height: 1.4, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWarehouseCard(
    BuildContext context, {
    required String name,
    required String location,
    required int capacityPercent,
    required String charges,
    required String tempRange,
    required bool isCold,
  }) {
    if (_selectedType == 'cold' && !isCold) return const SizedBox.shrink();
    if (_selectedType == 'dry' && isCold) return const SizedBox.shrink();

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
                Expanded(
                  child: Text(name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.black)),
                ),
                Icon(
                  isCold ? Icons.ac_unit : Icons.wb_sunny_outlined,
                  color: isCold ? Colors.blue : Colors.orange,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text('அமைவிடம் (Location): $location', style: const TextStyle(fontSize: 13, color: Colors.grey)),
            Text('வெப்பநிலை (Temp): $tempRange', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('சேமிப்பு கட்டணம்: $charges', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.green)),
            
            const SizedBox(height: 12),
            // Smart capacity indicator representation
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text('கிடங்கு கொள்ளளவு (Capacity): $capacityPercent%'),
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

            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => _showBookingForm(context, name, isCold),
                    icon: const Icon(Icons.calendar_month),
                    label: const Text('இட முன்பதிவு செய்\n(Book Storage Space)'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () => _showQRPassDialog(context),
                  icon: const Icon(Icons.qr_code),
                  tooltip: 'முன்பதிவு QR குறியீடு (QR Pass)',
                )
              ],
            )
          ],
        ),
      ),
    );
  }

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
          'உதவி தேவைப்படுகிறதா? (Need Help?)',
          style: TextStyle(fontWeight: FontWeight.black, fontSize: 14),
        ),
        subtitle: const Text('எங்கள் வாடிக்கையாளர் மையத்தைத் தொடர்பு கொண்டு கிடங்கு இடங்களை முன்பதிவு செய்யவும்.'),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {},
      ),
    );
  }

  void _showBookingForm(BuildContext context, String warehouseName, bool isCold) {
    final qtyController = TextEditingController();
    final daysController = TextEditingController();
    double estimatedCost = 0.0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
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
                'கிடங்கு முன்பதிவு: $warehouseName',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
              ),
              const SizedBox(height: 16),
              const TextField(
                decoration: InputDecoration(
                  labelText: 'பயிர் பெயர் (Crop Name - e.g. Tomato)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: qtyController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'அளவு (Weight in kg)',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (val) {
                        final qty = double.tryParse(val) ?? 0.0;
                        final days = double.tryParse(daysController.text) ?? 0.0;
                        final rate = isCold ? 1.50 : 0.75;
                        setModalState(() {
                          estimatedCost = qty * days * rate;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: daysController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'நாட்கள் (Duration days)',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (val) {
                        final qty = double.tryParse(qtyController.text) ?? 0.0;
                        final days = double.tryParse(val) ?? 0.0;
                        final rate = isCold ? 1.50 : 0.75;
                        setModalState(() {
                          estimatedCost = qty * days * rate;
                        });
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (isCold) ...[
                const Text('வெப்பநிலை தேர்வு (Temperature Preference):', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    ChoiceChip(label: const Text('4°C - உருளைக்கிழங்கு'), selected: false, onSelected: (val) {}),
                    ChoiceChip(label: const Text('10°C - தக்காளி'), selected: true, onSelected: (val) {}),
                    ChoiceChip(label: const Text('0°C - வெங்காயம்'), selected: false, onSelected: (val) {}),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              // Smart cost calculator indicator
              Container(
                padding: const EdgeInsets.all(12),
                width: double.infinity,
                decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12)),
                child: Text(
                  'மதிப்பிடப்பட்ட கட்டணம் (Estimated Cost): ₹$estimatedCost',
                  style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Colors.green),
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
                          const SnackBar(content: Text('கிடங்கு முன்பதிவு கோரப்பட்டது! (Storage Booked!)')),
                        );
                      },
                      child: const Text('முன்பதிவு செய் (Confirm Storage)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  void _showQRPassDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('கிடங்கு நுழைவுச்சீட்டு (Storage Check-in Pass)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('அறுவடையை கிடங்கிற்குள் கொண்டு வரும் போது மேலாளரிடம் இந்த QR குறியீட்டை காண்பிக்கவும்.'),
            const SizedBox(height: 16),
            Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black, width: 2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.qr_code, size: 140),
            ),
            const SizedBox(height: 8),
            const Text('குறியீடு: #STG-80921', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold)),
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
