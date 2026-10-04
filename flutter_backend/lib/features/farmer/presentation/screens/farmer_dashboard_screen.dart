// Folder Path: lib/features/farmer/presentation/screens/
// Dart Filename: farmer_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/providers.dart';
import '../../../../core/config/feature_flags.dart';
import '../../../../features/ai_assistant/presentation/screens/ai_assistant_screen.dart';
import '../../../../features/labour_exchange/presentation/screens/labour_exchange_screen.dart';
import '../../../../features/weather_intelligence/presentation/screens/weather_dashboard_screen.dart';
import '../../../../features/vlink/presentation/screens/vlink_diagnostics_screen.dart';

class FarmerDashboardScreen extends ConsumerStatefulWidget {
  const FarmerDashboardScreen({super.key});

  @override
  ConsumerState<FarmerDashboardScreen> createState() => _FarmerDashboardScreenState();
}

class _FarmerDashboardScreenState extends ConsumerState<FarmerDashboardScreen> {
  int _currentIndex = 0;

  List<String> get _titles {
    return [
      'Home (முகப்பு)',
      'Buy/Sell (சந்தை)',
      'AI Assistant (சக்தி AI)',
      'Weather (வானிலை)',
      if (enableLayer2) 'V-LINK Mesh'
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isOffline = false; // Binds to network sync provider

    final List<Widget> screens = [
      _buildHomeScreen(context),
      const LabourExchangeScreen(),
      const AiAssistantScreen(),
      const WeatherDashboardScreen(),
      if (enableLayer2) const VLinkDiagnosticsScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _titles[_currentIndex],
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
            ),
            if (enableLayer2)
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: isOffline ? Colors.amber : Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isOffline ? 'OFFLINE MESH MODE' : 'ONLINE DIRECT SYNC',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: isOffline ? Colors.amber[800] : Colors.green[800],
                    ),
                  ),
                ],
              )
          ],
        ),
        actions: [
          if (enableLayer2)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () {
                ref.read(syncEngineProvider).executeFullSync(force: true);
              },
            ),
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
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Colors.grey[600],
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.shopping_bag),
            label: 'Buy/Sell',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.psychology),
            label: 'Sakthi AI',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.cloud),
            label: 'Weather',
          ),
          if (enableLayer2)
            const BottomNavigationBarItem(
              icon: Icon(Icons.radio),
              label: 'V-LINK',
            ),
        ],
      ),
    );
  }

  Widget _buildHomeScreen(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Farmer Greeting Hero Card
          Card(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
              side: BorderSide(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'வணக்கம், விவசாயி 👋',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Madurai District, Tamil Nadu',
                    style: TextStyle(color: Colors.grey[700], fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildQuickStat(context, 'Wallet Balance', '₹4,850', Colors.green),
                      _buildQuickStat(context, 'Active Orders', '2 Pending', Colors.blue),
                    ],
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Estimated net profit calculator teaser
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ESTIMATED Net Profit Calculator',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Input transport and loading expenses to compute estimated yield profits before market handover.',
                    style: TextStyle(color: Colors.grey[600], fontSize: 11),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          initialValue: '28',
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Price (₹/kg)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          initialValue: '500',
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Yield (kg)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Calculate Net Returns'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStat(BuildContext context, String label, String value, Color color) {
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
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: color,
          ),
        )
      ],
    );
  }
}
