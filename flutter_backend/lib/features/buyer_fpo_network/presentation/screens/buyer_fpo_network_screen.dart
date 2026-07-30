// Folder Path: lib/features/buyer_fpo_network/presentation/screens/
// Dart Filename: buyer_fpo_network_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BuyerFpoNetworkScreen extends ConsumerStatefulWidget {
  const BuyerFpoNetworkScreen({super.key});

  @override
  ConsumerState<BuyerFpoNetworkScreen> createState() => _BuyerFpoNetworkScreenState();
}

class _BuyerFpoNetworkScreenState extends ConsumerState<BuyerFpoNetworkScreen> {
  String _activeTab = 'buyers'; // 'buyers' or 'fpos'
  final bool _isOffline = false; // Binds to sync state

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'கொள்முதல் மற்றும் FPO நெட்வொர்க்', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Buyer & FPO Network Directory', // English Subtitle
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
          // Segmented Switcher (Buyers list vs FPOs list)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'buyers',
                  label: Text('கொள்முதல் நிறுவனங்கள் (Buyers)'),
                  icon: Icon(Icons.store),
                ),
                ButtonSegment(
                  value: 'fpos',
                  label: Text('உற்பத்தியாளர் கூட்டமைப்பு (FPO)'),
                  icon: Icon(Icons.groups),
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
            child: _activeTab == 'buyers'
                ? _buildBuyersView(context)
                : _buildFposView(context),
          ),
          // Permanent Support Ticket Call Assist
          _buildCustomerCareCard(context),
        ],
      ),
    );
  }

  // =========================================================================
  // BUYERS DIRECTORY VIEW (Crop demand, offered price, verified tags)
  // =========================================================================

  Widget _buildBuyersView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // AI Crop Demand Prediction Banner
        _buildAiDemandPredictionBanner(context),
        const SizedBox(height: 12),
        _buildSectionHeader('அருகிலுள்ள கொள்முதல் நிறுவனங்கள்', 'Verified Corporate & Local Buyers'),
        const SizedBox(height: 8),
        _buildBuyerCard(
          context,
          name: 'பிக்பாஸ்கெட் கொள்முதல் மையம் (BigBasket Hub)',
          requiredCrop: 'தக்காளி (Tomatoes) & வெண்டைக்காய் (Lady Finger)',
          qtyRequired: '5 டன்கள் (Tons)',
          priceOffered: '₹32.50 / kg',
          rating: 4.8,
          isVerified: true,
        ),
        _buildBuyerCard(
          context,
          name: 'ரிலையன்ஸ் ரீடெய்ல் லிமிடெட் (Reliance Retail Ltd)',
          requiredCrop: 'கத்தரிக்காய் (Brinjal) & வெங்காயம் (Onion)',
          qtyRequired: '10 டன்கள் (Tons)',
          priceOffered: '₹28.00 / kg',
          rating: 4.6,
          isVerified: true,
        ),
      ],
    );
  }

  Widget _buildAiDemandPredictionBanner(BuildContext context) {
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
                const Icon(Icons.trending_up, color: Colors.green, size: 24),
                const SizedBox(width: 8),
                Text(
                  'சந்தை பயிர் தேவை கணிப்பு (AI Demand Prediction)',
                  style: TextStyle(fontWeight: FontWeight.black, color: Colors.green.shade900, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'மதுரை மற்றும் சுற்றியுள்ள மாவட்டங்களில் அடுத்த மாதம் தக்காளிக்கான தேவை 40% அதிகரிக்க வாய்ப்புள்ளது. தற்போதைய ஒப்பந்த விலை ₹32/kg ஆகும். முன்பதிவு ஒப்பந்தங்களில் சேரப் பரிந்துரைக்கிறோம்.',
              style: TextStyle(fontSize: 13, height: 1.4, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              style: FilledButton.styleFrom(backgroundColor: Colors.green),
              onPressed: () {
                // Takes user directly to pre-harvest contract list
              },
              icon: const Icon(Icons.assignment_turned_in),
              label: const Text('ஒப்பந்தங்களைப் பார் (View Contracts)'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildBuyerCard(
    BuildContext context, {
    required String name,
    required String requiredCrop,
    required String qtyRequired,
    required String priceOffered,
    required double rating,
    required bool isVerified,
  }) {
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
              children: [
                Expanded(
                  child: Text(
                    name,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isVerified) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.verified, size: 20, color: Colors.blue),
                ]
              ],
            ),
            const SizedBox(height: 6),
            Text('தேவைப்படும் பயிர் (Crop): $requiredCrop', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            Text('தேவைப்படும் அளவு (Qty): $qtyRequired', style: const TextStyle(fontSize: 14)),
            const SizedBox(height: 4),
            Text('வழங்கும் விலை (Price): $priceOffered', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.black, color: Colors.green)),
            
            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => _showBuyerInquiryDialog(context, name),
                    icon: const Icon(Icons.chat_bubble_outline),
                    label: const Text('கொள்முதல் விபரம் (Send Inquiry)'),
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
  // FPO DIRECTORY VIEW (Membership enrollments, services list)
  // =========================================================================

  Widget _buildFposView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        _buildSectionHeader('உற்பத்தியாளர் கூட்டமைப்புகள்', 'Regional FPOs Directory'),
        const SizedBox(height: 8),
        _buildFpoCard(
          context,
          fpoName: 'மதுரை கிழக்கு விவசாய உற்பத்தியாளர் நிறுவனம் (Madurai East Farmer Producer Co.)',
          repName: 'முத்துவேல் இராமசாமி (Muthuvel Ramasamy)',
          district: 'மதுரை கிழக்கு (Madurai East)',
          memberCount: 840,
          services: ['ஒட்டுமொத்த கொள்முதல்', 'உர விநியோகம்', 'குளிர்சாதன கிடங்கு'],
        ),
        _buildFpoCard(
          context,
          fpoName: 'மேலூர் நவதானிய உற்பத்தியாளர் சங்கம் (Melur Organic Millets FPO)',
          repName: 'நாகப்பன் கே. (Nagappan K.)',
          district: 'மேலூர் வட்டம் (Melur)',
          memberCount: 520,
          services: ['விதை விநியோகம்', 'கருவி வாடகை', 'பயிற்சி வகுப்புகள்'],
        ),
      ],
    );
  }

  Widget _buildFpoCard(
    BuildContext context, {
    required String fpoName,
    required String repName,
    required String district,
    required int memberCount,
    required List<String> services,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fpoName, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.black)),
            const SizedBox(height: 4),
            Text('நிர்வாகி (Rep): $repName | மாவட்டம்: $district', style: const TextStyle(fontSize: 12, color: Colors.grey)),
            Text('உறுப்பினர்கள் (Members count): $memberCount', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            
            // FPO Service tags
            Wrap(
              spacing: 6,
              children: services.map((s) => Chip(
                label: Text(s, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              )).toList(),
            ),

            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('கூட்டமைப்பில் இணைய கோரிக்கை அனுப்பப்பட்டது! (Membership Requested!)')),
                      );
                    },
                    icon: const Icon(Icons.group_add),
                    label: const Text('உறுப்பினர் ஆகவும் (Join FPO)'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () {},
                  icon: const Icon(Icons.phone, color: Colors.green),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // GENERAL HELPER WIDGETS & MODAL OVERLAYS
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
        subtitle: const Text('சந்தையில் FPOக்களை தொடர்பு கொள்ள எங்களை அழைக்கலாம்.'),
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

  void _showBuyerInquiryDialog(BuildContext context, String buyerName) {
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
              'விலை விசாரிப்பு: $buyerName',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'விற்க உத்தேசித்துள்ள பயிர் (Crop Type)',
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
                      labelText: 'அளவு (Quantity in kg)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'எதிர்பார்க்கும் விலை ₹/kg',
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
                        const SnackBar(content: Text('விசாரிப்பு கோரிக்கை அனுப்பப்பட்டது! (Inquiry Sent!)')),
                      );
                    },
                    child: const Text('விசாரிப்பு அனுப்பு (Send Inquiry)'),
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
