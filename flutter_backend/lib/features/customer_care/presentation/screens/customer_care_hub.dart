// Folder Path: lib/features/customer_care/presentation/screens/
// Dart Filename: customer_care_hub.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CustomerCareHub extends ConsumerStatefulWidget {
  const CustomerCareHub({super.key});

  @override
  ConsumerState<CustomerCareHub> createState() => _CustomerCareHubState();
}

class _CustomerCareHubState extends ConsumerState<CustomerCareHub> {
  String _activeTab = 'farmer'; // 'farmer' (Raise Ticket & View Status) or 'agent' (Support Desk dashboard)
  final bool _isOffline = false; // Binds to connectivity stream

  // In-memory demo tickets tracker showing offline state warning
  final List<Map<String, dynamic>> _tickets = [
    {
      'id': 'TCK-201',
      'category': 'விவசாய பிரச்சனை (Crop Issue)',
      'description': 'தக்காளி இலைகள் மஞ்சள் நிறமாக மாறுகின்றன.',
      'status': 'expert_assigned',
      'created': '30-07-2026',
      'isOffline': false,
    },
    {
      'id': 'TCK-202',
      'category': 'பணப் பிரச்சனை (Payment Issue)',
      'description': 'அறுவடை முன்பதிவுக்கான முன்பணம் வரவில்லை.',
      'status': 'offline_saved',
      'created': '30-07-2026',
      'isOffline': true,
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'வாடிக்கையாளர் உதவி மையம்', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Customer Care & Support Hub', // English Subtitle
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
              _isOffline ? Icons.wifi_off : Icons.support_agent,
              color: _isOffline ? Colors.orange : Colors.green,
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Farmer view vs Support Desk Toggle
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'farmer',
                  label: Text('உதவி கேட்க (Farmer Help)'),
                  icon: Icon(Icons.help_outline),
                ),
                ButtonSegment(
                  value: 'agent',
                  label: Text('உதவி மையம் (Support Desk)'),
                  icon: Icon(Icons.dashboard),
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
                ? _buildFarmerHelpView(context)
                : _buildSupportAgentView(context),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // FARMER VIEW (File Ticket, Call Support, History)
  // =========================================================================

  Widget _buildFarmerHelpView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // One-Click Direct Helpdesk Call Card (Accessibility prioritized)
        Card(
          color: Colors.green.shade100,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.green.shade700,
                  child: const Icon(Icons.phone_in_talk, color: Colors.white, size: 32),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'நேரடி உதவி அழைப்பு (Direct Call)',
                        style: TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Colors.black87),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'கட்டணமில்லா எண்: 1800-425-1900',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.green),
                      ),
                      const SizedBox(height: 8),
                      FilledButton(
                        style: FilledButton.styleFrom(backgroundColor: Colors.green.shade700),
                        onPressed: () {
                          // One-click phone calling action trigger
                        },
                        child: const Text('இப்போதே அழைக்கவும் (Call Support)'),
                      )
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildSectionHeader('உங்களது புகார்கள்', 'Your Support Tickets'),
            FilledButton.icon(
              onPressed: () => _showCreateTicketBottomSheet(context),
              icon: const Icon(Icons.add_comment),
              label: const Text('புதிதாக பதிவு செய்'),
            )
          ],
        ),
        const SizedBox(height: 8),

        // Tickets History List
        ..._tickets.map((t) => _buildTicketCard(context, t)),
      ],
    );
  }

  Widget _buildTicketCard(BuildContext context, Map<String, dynamic> ticket) {
    final bool isOfflineSaved = ticket['status'] == 'offline_saved';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text(
                  ticket['id'],
                  style: const TextStyle(fontWeight: FontWeight.black, fontSize: 15),
                ),
                _buildStatusBadge(ticket['status']),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              ticket['category'],
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              ticket['description'],
              style: const TextStyle(fontSize: 13, color: Colors.black87),
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'தேதி (Date): ${ticket['created']}',
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
                if (isOfflineSaved)
                  const Row(
                    children: [
                      Icon(Icons.cloud_queue, size: 14, color: Colors.orange),
                      SizedBox(width: 4),
                      Text(
                        'தானாக ஒத்திசையும் (Will Auto Sync)',
                        style: TextStyle(fontSize: 9, color: Colors.orange, fontWeight: FontWeight.bold),
                      )
                    ],
                  ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'expert_assigned':
        bg = Colors.blue.shade50;
        fg = Colors.blue;
        label = 'நிபுணர் நியமிக்கப்பட்டுள்ளார் (Expert Assigned)';
        break;
      case 'offline_saved':
        bg = Colors.orange.shade50;
        fg = Colors.orange;
        label = 'இணைப்பற்று சேமிக்கப்பட்டது (Offline Staged)';
        break;
      case 'resolved':
        bg = Colors.green.shade50;
        fg = Colors.green;
        label = 'தீர்க்கப்பட்டது (Resolved)';
        break;
      default:
        bg = Colors.grey.shade100;
        fg = Colors.grey;
        label = 'நிலுவையில் (Pending)';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(
        label,
        style: TextStyle(color: fg, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  // =========================================================================
  // SUPPORT AGENT VIEW (Desk assignment dashboard)
  // =========================================================================

  Widget _buildSupportAgentView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        _buildSectionHeader('உள்வரும் விவசாயிகளின் புகார்கள் (Incoming Desk Queue)', 'Review & Update tickets'),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('விவசாயி: ஆறுமுகம் (Farmer Arumugam)', style: TextStyle(fontWeight: FontWeight.black)),
                    const Chip(label: Text('OPEN')),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('புகார்: வடுகப்பட்டி கிடங்கு இடஒதுக்கீடு செய்வதில் பிரச்சனை.'),
                const Divider(),
                const Text('நிபுணர் ஒதுக்கீடு (Assign Expert):', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                // Mock dropdown selector for agent desk
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {},
                        child: const Text('வேளாண் அதிகாரி ரவி (Officer Ravi)'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FilledButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('அதிகாரி நியமிக்கப்பட்டார்! (Expert Assigned!)')),
                        );
                      },
                      child: const Text('ஒதுக்கு (Assign)'),
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // CREATE SUPPORT TICKET SHEET
  // =========================================================================

  void _showCreateTicketBottomSheet(BuildContext context) {
    String selectedCategory = 'விவசாய பிரச்சனை (Crop Issue)';
    final descController = TextEditingController();

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
              const Text(
                'புதிய புகார் பதிவு செய் (New Support Ticket)',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedCategory,
                decoration: const InputDecoration(labelText: 'புகார் வகை (Category)', border: OutlineInputBorder()),
                items: [
                  'விவசாய பிரச்சனை (Crop Issue)',
                  'பணப் பிரச்சனை (Payment Issue)',
                  'வாங்குபவர் பிரச்சனை (Buyer Problem)',
                  'கிடங்கு பிரச்சனை (Warehouse Problem)',
                  'செயலி பிரச்சனை (App Problem)'
                ].map((String value) {
                  return DropdownMenuItem<String>(value: value, child: Text(value));
                }).toList(),
                onChanged: (val) {
                  setModalState(() {
                    selectedCategory = val!;
                  });
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'பிரச்சனையின் விளக்கம் (Description)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              // File attachments buttons
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('படம் (Photo)'),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.mic, color: Colors.red),
                    label: const Text('குரல் பதிவு (Voice)', style: TextStyle(color: Colors.red)),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Offline warnings logic representation
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.cloud_queue, color: Colors.orange),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _isOffline ? 'இணைப்பற்ற சேமிப்பு: நெட்வொர்க் திரும்பியதும் தானாக ஒத்திசையும்.' : 'இணைப்பு உள்ளது: உடனடியாக அனுப்பப்படும் (Direct upload enabled)',
                        style: const TextStyle(fontSize: 10, color: Colors.orange, fontWeight: FontWeight.bold),
                      ),
                    )
                  ],
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
                        setState(() {
                          _tickets.insert(0, {
                            'id': 'TCK-${_tickets.length + 201}',
                            'category': selectedCategory,
                            'description': descController.text,
                            'status': 'offline_saved',
                            'created': '30-07-2026',
                            'isOffline': true,
                          });
                        });
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('புகார் சேமிக்கப்பட்டது! (Ticket Registered!)')),
                        );
                      },
                      child: const Text('புகார் செய் (Submit Ticket)'),
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

  Widget _buildSectionHeader(String tamil, String english) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(tamil, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black)),
        Text(english, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
