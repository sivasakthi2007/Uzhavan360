// Folder Path: lib/features/labour_exchange/presentation/screens/
// Dart Filename: labour_exchange_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/labour_entity.dart';
import '../controllers/labour_controller.dart';

class LabourExchangeScreen extends ConsumerStatefulWidget {
  const LabourExchangeScreen({super.key});

  @override
  ConsumerState<LabourExchangeScreen> createState() => _LabourExchangeScreenState();
}

class _LabourExchangeScreenState extends ConsumerState<LabourExchangeScreen> {
  String _currentMode = 'hire'; // 'hire' (Farmer looking for work) or 'work' (Worker looking for job)
  final bool _isOffline = false; // Binds to connectivity stream in production

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(labourBookingNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'வேலைவாய்ப்பு பரிமாற்றம்', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Agricultural Labour Exchange', // English Subtitle
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
        actions: [
          // Connection & Sync status banner
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
          // High-contrast Mode Selector (Large touch targets for elderly)
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: _currentMode == 'hire'
                          ? Theme.of(context).colorScheme.primaryContainer
                          : null,
                      side: BorderSide(
                        color: _currentMode == 'hire'
                            ? Theme.of(context).colorScheme.primary
                            : Colors.grey,
                        width: 2,
                      ),
                    ),
                    onPressed: () => setState(() => _currentMode = 'hire'),
                    icon: const Icon(Icons.people, size: 24),
                    label: const Text(
                      'ஆட்கள் தேவை\n(Need Labour)',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: _currentMode == 'work'
                          ? Theme.of(context).colorScheme.primaryContainer
                          : null,
                      side: BorderSide(
                        color: _currentMode == 'work'
                            ? Theme.of(context).colorScheme.primary
                            : Colors.grey,
                        width: 2,
                      ),
                    ),
                    onPressed: () => setState(() => _currentMode = 'work'),
                    icon: const Icon(Icons.work, size: 24),
                    label: const Text(
                      'வேலை வேண்டும்\n(Need Work)',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _currentMode == 'hire'
                ? _buildNeedLabourView(bookingsAsync)
                : _buildNeedWorkView(bookingsAsync),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showVoiceRequestBottomSheet(context),
        label: const Text('குரல் பதிவு (Voice Request)', style: TextStyle(fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.mic, size: 24),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildNeedLabourView(AsyncValue<List<LabourBookingEntity>> asyncState) {
    // Large verified workers directory list with quick action triggers
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        _buildSectionHeader('அருகிலுள்ள வேலையாட்கள்', 'Available Labourers Nearby'),
        const SizedBox(height: 8),
        _buildLabourCard(
          context,
          name: 'சுப்பிரமணியன் பி. (Subramanian P.)',
          skills: 'அறுவடை (Harvesting), களை எடுத்தல் (Weeding)',
          wage: '₹450 / நாள் (Day)',
          phone: '+919081234567',
        ),
        _buildLabourCard(
          context,
          name: 'காளியம்மாள் எம். (Kaliammal M.)',
          skills: 'நாற்று நடுதல் (Transplantation)',
          wage: '₹400 / நாள் (Day)',
          phone: '+919081234568',
        ),
      ],
    );
  }

  Widget _buildNeedWorkView(AsyncValue<List<LabourBookingEntity>> asyncState) {
    // Shows registered job offers and attendance checklists
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        _buildSectionHeader('உங்களது தற்போதைய வேலைகள்', 'Your Active Jobs & Attendance'),
        const SizedBox(height: 8),
        _buildActiveJobCard(
          context,
          jobTitle: 'நெல் அறுவடை (Paddy Harvesting)',
          employerName: 'இராமநாதன் (Farmer Ramanathan)',
          wages: '₹450 / நாள்',
          duration: '5 நாட்கள் (Days)',
        ),
      ],
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

  Widget _buildLabourCard(
    BuildContext context, {
    required String name,
    required String skills,
    required String wage,
    required String phone,
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
            Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black)),
            const SizedBox(height: 4),
            Text('திறமைகள் (Skills): $skills', style: const TextStyle(fontSize: 13, color: Colors.grey)),
            const SizedBox(height: 6),
            Text('கேட்கும் சம்பளம் (Wage): $wage', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.black, color: Colors.green)),
            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
                    onPressed: () => _showHiringForm(context, name),
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text('வேலைக்கு கூப்பிடு\n(Hire Worker)'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () {
                    // One-click phone calling action trigger
                  },
                  icon: const Icon(Icons.phone, color: Colors.green),
                  tooltip: 'அழைக்க (Call Worker)',
                ),
                IconButton.filledTonal(
                  onPressed: () {
                    // WhatsApp fallback redirect callback
                  },
                  icon: const Icon(Icons.message, color: Colors.blue),
                  tooltip: 'வாட்ஸ்அப் (WhatsApp)',
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildActiveJobCard(
    BuildContext context, {
    required String jobTitle,
    required String employerName,
    required String wages,
    required String duration,
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
            Text(jobTitle, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black)),
            Text(employerName, style: const TextStyle(fontSize: 13, color: Colors.grey)),
            const SizedBox(height: 8),
            Text('சம்பளம் (Wages): $wages | காலம்: $duration'),
            const Divider(height: 24),
            const Text(
              'இன்றைய வருகைப்பதிவு (Mark Attendance):',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('வருகைப்பதிவு செய்யப்பட்டது (Attendance Marked!)')),
                      );
                    },
                    icon: const Icon(Icons.fingerprint),
                    label: const Text('வந்தேன்\n(Present)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: Colors.red, width: 2),
                    ),
                    onPressed: () {},
                    child: const Text('வரவில்லை\n(Absent)', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  void _showHiringForm(BuildContext context, String workerName) {
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
              'வேலை ஒப்பந்தம்: $workerName',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'வேலை விபரம் (Job Description)',
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
                      labelText: 'நாட்கள் (Days)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'தினசரி கூலி (Daily Wage in ₹)',
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
                        const SnackBar(content: Text('வேலை அழைப்பு அனுப்பப்பட்டது (Hiring Request Sent!)')),
                      );
                    },
                    child: const Text('அழைப்பு அனுப்பு (Send Invite)'),
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

  void _showVoiceRequestBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'குரல் வழி வேலை கோரிக்கை',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const Text(
              'Voice Booking Assistant',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.red.shade100,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.mic, size: 40, color: Colors.red),
            ),
            const SizedBox(height: 16),
            const Text(
              'பொத்தானை அழுத்தி பேசவும்\n"எனக்கு தக்காளி பறிக்க 3 வேலையாட்கள் தேவை..."',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('மூடு (Close)'),
            )
          ],
        ),
      ),
    );
  }
}
