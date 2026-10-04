// Folder Path: lib/features/fpo/presentation/screens/
// Dart Filename: fpo_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../features/buyer_fpo_network/presentation/screens/buyer_fpo_network_screen.dart';

class FpoDashboardScreen extends ConsumerStatefulWidget {
  const FpoDashboardScreen({super.key});

  @override
  ConsumerState<FpoDashboardScreen> createState() => _FpoDashboardScreenState();
}

class _FpoDashboardScreenState extends ConsumerState<FpoDashboardScreen> {
  int _currentIndex = 0;

  final List<String> _titles = [
    'FPO Coordination Home',
    'Buyer Network Matches',
  ];

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      _buildFpoHomeView(context),
      const BuyerFpoNetworkScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _titles[_currentIndex],
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: Theme.of(context).colorScheme.primary,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.handshake),
            label: 'Buyer Connection',
          ),
        ],
      ),
    );
  }

  Widget _buildFpoHomeView(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // FPO Welcome Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Madurai Agri-Producer FPO 👥',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'District Coordination Hub • 45 active farmer members',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSummaryStat('Aggregated Supply', '5.5 Tonnes'),
                      _buildSummaryStat('Active Offers', '3 Bids'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Aggregation batches
          const Text(
            'Aggregated Batches (எடை சேகரிப்பு)',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
          ),
          const SizedBox(height: 12),
          _buildBatchItem(context, 'Tomato (T-56)', '2,000 kg', 'Farmer contributions: 3 farmers', Colors.green),
          const SizedBox(height: 10),
          _buildBatchItem(context, 'Paddy (Co-51)', '3,500 kg', 'Farmer contributions: 5 farmers', Colors.blue),
        ],
      ),
    );
  }

  Widget _buildSummaryStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.grey),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        )
      ],
    );
  }

  Widget _buildBatchItem(BuildContext context, String cropName, String quantity, String details, Color accentColor) {
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
                Text(
                  cropName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  details,
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                quantity,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: accentColor,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
