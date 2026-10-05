import 'package:flutter/material.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/models/ooru_models.dart';
import '../../../core/network/supabase_service.dart';
import '../../../shared/widgets/swipe_to_connect_widget.dart';

class DemandHomeScreen extends StatefulWidget {
  final VoidCallback onOpenLabourForm;
  final VoidCallback onOpenTechForm;
  final Function(ServiceRequestModel) onSelectRequest;
  const DemandHomeScreen({
    super.key,
    required this.onOpenLabourForm,
    required this.onOpenTechForm,
    required this.onSelectRequest,
  });

  @override
  State<DemandHomeScreen> createState() => _DemandHomeScreenState();
}

class _DemandHomeScreenState extends State<DemandHomeScreen> {
  int _currentIndex = 0;
  final List<ServiceRequestModel> _myRequests = [
    ServiceRequestModel(
      id: 'req_1',
      requesterId: 'current_user',
      requestType: 'labour_squad',
      skillName: 'Paddy Harvesting',
      requiredWorkers: 10,
      requiredDate: '2026-10-05',
      requiredTime: '7:00 AM',
      villageName: 'Vadugapalayam',
      status: 'broadcasting',
      createdAt: DateTime.now().toIso8601String(),
    )
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.location_on, color: Colors.white),
            const SizedBox(width: 8),
            Text('${AppStrings.appName} — Vadugapalayam'),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
      ),
      body: _buildCurrentTab(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: const Color(0xFF1B5E20),
        unselectedItemColor: Colors.grey[600],
        type: BottomNavigationBarType.fixed,
        onTap: (idx) => setState(() => _currentIndex = idx),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.swap_horizontal_circle), label: 'OoruConnect'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment), label: 'My Requests'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Nearby'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildCurrentTab() {
    switch (_currentIndex) {
      case 0:
        return _buildHomeActionsTab();
      case 1:
        return _buildOoruConnectTab();
      case 2:
        return _buildMyRequestsTab();
      case 3:
        return _buildNearbyTab();
      case 4:
      default:
        return _buildProfileTab();
    }
  }

  Widget _buildHomeActionsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Offline Status Notice Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF3E0),
              border: Border.all(color: Colors.orange),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.wifi_off, color: Colors.orange),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    AppStrings.offlineNotice,
                    style: const TextStyle(fontSize: 13, color: Colors.black87),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            AppStrings.quickActions,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
          ),
          const SizedBox(height: 16),

          // Primary Action 1: Labour Squad
          InkWell(
            onTap: widget.onOpenLabourForm,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 4))],
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.white24,
                    child: Icon(Icons.groups, size: 42, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppStrings.labourSquadNeed,
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          AppStrings.labourSquadSub,
                          style: const TextStyle(fontSize: 14, color: Color(0xFFC8E6C9)),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, color: Colors.white),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Primary Action 2: Technician
          InkWell(
            onTap: widget.onOpenTechForm,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 4))],
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.white24,
                    child: Icon(Icons.build_circle, size: 42, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppStrings.technicianNeed,
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          AppStrings.technicianSub,
                          style: const TextStyle(fontSize: 14, color: Color(0xFFBBDEFB)),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, color: Colors.white),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          // Voice Assistant Quick Button
          ElevatedButton.icon(
            icon: const Icon(Icons.mic, color: Colors.white, size: 24),
            label: const Text('🎙 பேசுங்கள் (Voice Access)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD81B60),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Voice Assistant activated: "Naalaikku 5 peru harvesting ku venum"')),
              );
            },
          ),

          const SizedBox(height: 24),
          // Context-Aware Swipe To Connect Widget
          const SwipeToConnectWidget(
            currentScreen: 'DemandHomeScreen',
            currentFeature: 'Harvest Squad Need',
          ),
        ],
      ),
    );
  }

  Widget _buildMyRequestsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _myRequests.length,
      itemBuilder: (ctx, idx) {
        final req = _myRequests[idx];
        return Card(
          child: ListTile(
            leading: Icon(
              req.requestType == 'labour_squad' ? Icons.groups : Icons.build,
              color: const Color(0xFF1B5E20),
              size: 36,
            ),
            title: Text('${req.skillName} (${req.requiredWorkers} workers)', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('தேதி: ${req.requiredDate} | status: ${req.status}'),
            trailing: ElevatedButton(
              onPressed: () => widget.onSelectRequest(req),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32), foregroundColor: Colors.white),
              child: const Text('View Match'),
            ),
          ),
        );
      },
    );
  }

  Widget _buildNearbyTab() {
    final seed = SupabaseService.seedProviders;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: seed.length,
      itemBuilder: (ctx, idx) {
        final p = seed[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: p.providerType == 'maistry' ? const Color(0xFF2E7D32) : const Color(0xFF1565C0),
              child: Icon(p.providerType == 'maistry' ? Icons.groups : Icons.build, color: Colors.white),
            ),
            title: Text(p.title, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${p.villageName} | 🟢 ${AppStrings.availableToday}'),
            trailing: Text('⭐ ${p.vouchesCount} vouches', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE65100))),
          ),
        );
      },
    );
  }

  Widget _buildOoruConnectTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  '🤝 OoruConnect',
                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 6),
                Text(
                  'உங்களுக்கு தேவையான சரியான நபருடன் இணைக்கிறோம்.',
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Voice Command Banner
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE65100),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.mic),
            label: const Text('🎙️ பேசுங்கள் (Speak your Need)', style: TextStyle(fontWeight: FontWeight.bold)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('குரல் மூலம் கோரிக்கை: "5 நபர்கள் அறுவடை தேவை" என்று கூறவும்')),
              );
            },
          ),

          const SizedBox(height: 20),

          // What Do You Need Categories
          const Text('உங்களுக்கு என்ன தேவை? (What do you need?)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),

          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 2.5,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            children: const [
              _CategoryChip(icon: Icons.groups, label: '👷 Labour / வேலையாள்'),
              _CategoryChip(icon: Icons.build, label: '🔧 Technician / டெக்னீசியன்'),
              _CategoryChip(icon: Icons.agriculture, label: '🚜 Equipment / கருவிகள்'),
              _CategoryChip(icon: Icons.store, label: '🏪 Buyer / சந்தை'),
              _CategoryChip(icon: Icons.local_shipping, label: '🚚 Transport / சரக்கு'),
              _CategoryChip(icon: Icons.ac_unit, label: '🏚️ Cold Storage / கிடங்கு'),
            ],
          ),

          const SizedBox(height: 20),

          // Context-Aware Connection Section
          const Text('நேரடி இணைப்பு (Context-Aware Connect)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),

          SwipeToConnectWidget(
            currentScreen: 'DemandHomeScreen',
            currentFeature: 'Harvesting Labour Squad',
            serviceType: 'labor',
            onCallInitiated: (contact) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Calling ${contact.name} (${contact.role}) at ${contact.phone}')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProfileTab() {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children: const [
          CircleAvatar(radius: 48, backgroundColor: Color(0xFF2E7D32), child: Icon(Icons.person, size: 64, color: Colors.white)),
          SizedBox(height: 16),
          Text('User / Farmer Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          Text('Vadugapalayam | Phone: 9842100000', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _CategoryChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF1B5E20), size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class ProviderHomeScreen extends StatefulWidget {
  const ProviderHomeScreen({super.key});

  @override
  State<ProviderHomeScreen> createState() => _ProviderHomeScreenState();
}

class _ProviderHomeScreenState extends State<ProviderHomeScreen> {
  String _currentStatus = 'available_today';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Maistry / Technician Hub'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(AppStrings.availabilityStatus, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    RadioListTile<String>(
                      title: Text(AppStrings.availableToday, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                      value: 'available_today',
                      groupValue: _currentStatus,
                      onChanged: (val) => setState(() => _currentStatus = val!),
                    ),
                    RadioListTile<String>(
                      title: Text(AppStrings.availableDate, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange)),
                      value: 'available_date',
                      groupValue: _currentStatus,
                      onChanged: (val) => setState(() => _currentStatus = val!),
                    ),
                    RadioListTile<String>(
                      title: Text(AppStrings.booked, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                      value: 'booked',
                      groupValue: _currentStatus,
                      onChanged: (val) => setState(() => _currentStatus = val!),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('புதிய கோரிக்கைகள் (Broadcast Alerts)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('🌾 Paddy Harvesting Squad (10 workers)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const Text('ஊர்: Vadugapalayam (3.2 km away) | 7:00 AM Tomorrow'),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32), foregroundColor: Colors.white),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Accepted Broadcast Request!')));
                            },
                            child: const Text('ஏற்றுக்கொள் (Accept)'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {},
                            child: const Text('Reject'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.adminDashboard),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(child: ListTile(leading: Icon(Icons.people), title: Text('Total Registered Profiles'), trailing: Text('142'))),
          Card(child: ListTile(leading: Icon(Icons.groups), title: Text('Active Maistries (Squad Leads)'), trailing: Text('28'))),
          Card(child: ListTile(leading: Icon(Icons.build), title: Text('Active Technicians'), trailing: Text('45'))),
          Card(child: ListTile(leading: Icon(Icons.assignment), title: Text('Active Broadcast Requests'), trailing: Text('19'))),
          Card(child: ListTile(leading: Icon(Icons.flag), title: Text('Pending User Reports'), trailing: Text('2'))),
        ],
      ),
    );
  }
}
