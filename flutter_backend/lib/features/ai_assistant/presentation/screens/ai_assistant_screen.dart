// Folder Path: lib/features/ai_assistant/presentation/screens/
// Dart Filename: ai_assistant_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AiAssistantScreen extends ConsumerStatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  ConsumerState<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends ConsumerState<AiAssistantScreen> {
  String _activeTab = 'chat'; // 'chat', 'knowledge', 'schemes'
  final TextEditingController _chatInputController = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'ai',
      'text': 'வணக்கம்! நான் உழவன்360 AI உதவியாளர். உங்களுக்கு இன்று என்ன உதவி வேண்டும்?',
    }
  ];
  final bool _isOffline = false; // Binds to sync service

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AI விவசாய உதவியாளர்', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'AI Agriculture Assistant', // English Subtitle
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
            child: Row(
              children: [
                Icon(
                  _isOffline ? Icons.wifi_off : Icons.wifi,
                  color: _isOffline ? Colors.orange : Colors.green,
                ),
                const SizedBox(width: 4),
                if (_isOffline)
                  const Text('Pending Sync (2)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Context Awareness Bar (Dynamic context values loaded)
          _buildContextAwareBar(context),

          // Menu Tabs Selector
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'chat',
                  label: Text('AI சாட் (Chat)'),
                  icon: Icon(Icons.chat),
                ),
                ButtonSegment(
                  value: 'knowledge',
                  label: Text('அறிவுத்தளம் (Library)'),
                  icon: Icon(Icons.menu_book),
                ),
                ButtonSegment(
                  value: 'schemes',
                  label: Text('திட்டங்கள் (Schemes)'),
                  icon: Icon(Icons.card_membership),
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
            child: _buildActiveTabContent(context),
          ),
        ],
      ),
    );
  }

  Widget _buildContextAwareBar(BuildContext context) {
    return Container(
      color: Colors.blue.shade50,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(Icons.psychology, size: 16, color: Colors.blueAccent),
              SizedBox(width: 6),
              Text(
                'சுயவிவர சூழல் (Context): தக்காளி | பூக்கும் பருவம்',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blueAccent),
              ),
            ],
          ),
          Text(
            'மதுரை கிழக்கு',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
          )
        ],
      ),
    );
  }

  Widget _buildActiveTabContent(BuildContext context) {
    switch (_activeTab) {
      case 'chat':
        return _buildChatView(context);
      case 'knowledge':
        return _buildKnowledgeView(context);
      case 'schemes':
        return _buildSchemesView(context);
      default:
        return const SizedBox.shrink();
    }
  }

  // =========================================================================
  // 1. AI CHAT VIEW (Tamil Speech to Text & Quick Chips)
  // =========================================================================

  Widget _buildChatView(BuildContext context) {
    return Column(
      children: [
        // Message list view
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              final isAi = msg['sender'] == 'ai';
              return Align(
                alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isAi ? Colors.grey.shade100 : Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: isAi ? Radius.zero : const Radius.circular(16),
                      bottomRight: isAi ? const Radius.circular(16) : Radius.zero,
                    ),
                  ),
                  child: Text(
                    msg['text']!,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
              );
            },
          ),
        ),

        // Quick Input suggestion chips
        _buildQuickChips(context),

        // Input Bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chatInputController,
                  decoration: const InputDecoration(
                    hintText: 'கேள்விகளை தட்டச்சு செய்யவும் (Ask AI...)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Mic voice record button (Large touch target)
              IconButton.filled(
                style: IconButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.all(16),
                ),
                onPressed: () => _showVoiceAssistantOverlay(context),
                icon: const Icon(Icons.mic, color: Colors.white, size: 28),
                tooltip: 'குரல் வழி பதிவு (Tamil Voice dictation)',
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: () {
                  if (_chatInputController.text.isNotEmpty) {
                    setState(() {
                      _messages.add({'sender': 'user', 'text': _chatInputController.text});
                      _chatInputController.clear();
                    });
                    // Simulates offline rule-based response trigger
                    Future.delayed(const Duration(milliseconds: 600), () {
                      setState(() {
                        _messages.add({
                          'sender': 'ai',
                          'text': 'தக்காளியில் இலை சுருட்டல் நோயைக் கட்டுப்படுத்த, வேப்ப எண்ணெய் கரைசல் 3% தெளிக்கப் பரிந்துரைக்கப்படுகிறது.',
                        });
                      });
                    });
                  }
                },
                icon: const Icon(Icons.send),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildQuickChips(BuildContext context) {
    final chips = [
      'தக்காளி உர அளவு (Tomato Fertilizer)',
      'பயிர் பூச்சி மேலாண்மை (Pest Guide)',
      'அரசு மானியங்கள் (Subsidies)',
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: chips.map((chipText) {
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: ActionChip(
              label: Text(chipText, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              onPressed: () {
                setState(() {
                  _chatInputController.text = chipText;
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  // =========================================================================
  // 2. KNOWLEDGE BASE VIEW (Offline manuals)
  // =========================================================================

  Widget _buildKnowledgeView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          child: ListTile(
            leading: const Icon(Icons.spa, color: Colors.green),
            title: const Text('தக்காளி சாகுபடி கையேடு (Tomato Crop Manual)', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('வெப்பநிலை: 18°C-28°C | பயிர் காலம்: 120 நாட்கள்'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.spa, color: Colors.green),
            title: const Text('நெல் சாகுபடி முறைகள் (Paddy Cultivation Guide)', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('மண் வகை: களிமண் | நீர் தேவை: அதிகம்'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // 3. GOVERNMENT SCHEMES VIEW
  // =========================================================================

  Widget _buildSchemesView(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          child: ListTile(
            leading: const Icon(Icons.card_giftcard, color: Colors.orange),
            title: const Text('சொட்டுநீர் பாசன மானியம் (Drip Irrigation Subsidy)', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('சிறு, குறு விவசாயிகளுக்கு 100% மானியம் வழங்கப்படும்.'),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () {},
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // VOICE DICTATION OVERLAY
  // =========================================================================

  void _showVoiceAssistantOverlay(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'குரல் வழி கேள்வி கேட்கவும்',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const Text(
              'Dictating in Tamil...',
              style: TextStyle(fontSize: 12, color: Colors.red),
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
              'கேட்க விரும்பும் கேள்வியை பேசவும்...\n(e.g., "தக்காளியில் உரம் போடும் முறை")',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('சரி (Done)'),
            )
          ],
        ),
      ),
    );
  }
}
