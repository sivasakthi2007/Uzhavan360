// Folder Path: lib/features/farmer_community/presentation/screens/
// Dart Filename: farmer_community_forum.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/community_entity.dart';
import '../controllers/community_controller.dart';

class FarmerCommunityForum extends ConsumerStatefulWidget {
  const FarmerCommunityForum({super.key});

  @override
  ConsumerState<FarmerCommunityForum> createState() => _FarmerCommunityForumState();
}

class _FarmerCommunityForumState extends ConsumerState<FarmerCommunityForum> {
  String _selectedCategory = 'all'; // 'all', 'pests', 'tips', 'gov'
  final bool _isOffline = false; // Binds to sync state

  @override
  Widget build(BuildContext context) {
    final postsAsync = ref.watch(communityPostNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'விவசாயிகள் குழுமம்', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Farmer Community Forum', // English Subtitle
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
                  _isOffline ? Icons.wifi_off : Icons.sync,
                  color: _isOffline ? Colors.orange : Colors.green,
                ),
                const SizedBox(width: 6),
                Text(
                  _isOffline ? 'Offline' : 'Online',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                )
              ],
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Forum categories filters (Large high-contrast targets)
          _buildCategoryFilters(context),
          Expanded(
            child: _buildForumFeed(postsAsync),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreatePostBottomSheet(context),
        label: const Text('கேள்வி கேள் (Ask Question)', style: TextStyle(fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.edit_note, size: 24),
      ),
    );
  }

  Widget _buildCategoryFilters(BuildContext context) {
    final List<Map<String, String>> categories = [
      {'key': 'all', 'label': 'அனைத்தும் (All)'},
      {'key': 'pests', 'label': 'பூச்சி தாக்குதல் (Pests)'},
      {'key': 'tips', 'label': 'விவசாய குறிப்புகள் (Tips)'},
      {'key': 'gov', 'label': 'அரசு அறிவிப்புகள் (Gov)'},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: categories.map((cat) {
          final isSelected = _selectedCategory == cat['key'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              selected: isSelected,
              label: Text(
                cat['label']!,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : Colors.black85,
                ),
              ),
              selectedColor: Theme.of(context).colorScheme.primary,
              backgroundColor: Colors.grey.shade100,
              onSelected: (selected) {
                setState(() {
                  _selectedCategory = cat['key']!;
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildForumFeed(AsyncValue<List<CommunityPostEntity>> asyncState) {
    return asyncState.when(
      data: (posts) {
        final filteredPosts = _selectedCategory == 'all'
            ? posts
            : posts.where((p) => p.category == _selectedCategory).toList();

        if (filteredPosts.isEmpty) {
          return _buildEmptyState();
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          itemCount: filteredPosts.length,
          itemBuilder: (context, index) {
            final item = filteredPosts[index];
            return _buildPostCard(context, item);
          },
        );
      },
      loading: () => _buildShimmerLoading(),
      error: (err, stack) => _buildErrorState(err.toString()),
    );
  }

  Widget _buildPostCard(BuildContext context, CommunityPostEntity item) {
    // Detect badge details based on author roles in a real application
    final bool isExpert = item.authorId.contains('expert');
    final bool isGovOfficer = item.authorId.contains('gov');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Author row & expert badge indicators
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  child: const Icon(Icons.person),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'இராமலிங்கம் பி. (Ramalingam P.)',
                            style: TextStyle(fontWeight: FontWeight.black, fontSize: 14),
                          ),
                          if (isExpert) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, size: 16, color: Colors.green),
                          ],
                          if (isGovOfficer) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.shield, size: 16, color: Colors.blue),
                          ]
                        ],
                      ),
                      Text(
                        isExpert ? 'விவசாய நிபுணர் (Agri Expert)' : 'விவசாயி (Farmer)',
                        style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold),
                      )
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              item.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 6),
            Text(
              item.content,
              style: const TextStyle(fontSize: 14, height: 1.4, color: Colors.black87),
            ),
            const SizedBox(height: 12),

            // Smart features: Voice recording attachment player
            _buildVoicePlayer(context),

            const SizedBox(height: 12),
            // Tags row
            Wrap(
              spacing: 6,
              children: item.tags.map((tag) => Chip(
                label: Text('#$tag', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                backgroundColor: Colors.grey.shade100,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              )).toList(),
            ),

            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton.filledTonal(
                  onPressed: () {},
                  icon: const Row(
                    children: [
                      Icon(Icons.thumb_up_alt_outlined, size: 18),
                      SizedBox(width: 4),
                      Text('12 LIKES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () => _showCommentsBottomSheet(context, item.id),
                  icon: const Row(
                    children: [
                      Icon(Icons.comment_outlined, size: 18),
                      SizedBox(width: 4),
                      Text('4 COMMENTS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () {},
                  icon: const Icon(Icons.share, size: 18),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildVoicePlayer(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.play_circle_fill, size: 36, color: Colors.blue),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'குரல் பதிவு விளக்கம் (Voice Explanation)',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue),
                ),
                const SizedBox(height: 4),
                // Audio progress representation
                LinearProgressIndicator(
                  value: 0.45,
                  backgroundColor: Colors.grey.shade300,
                  color: Colors.blue,
                  minHeight: 4,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Text('0:18', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: 2,
      itemBuilder: (context, index) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Container(
          height: 180,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(backgroundColor: Colors.grey.shade300, radius: 20),
                  const SizedBox(width: 12),
                  Container(width: 150, height: 16, color: Colors.grey.shade200),
                ],
              ),
              const SizedBox(height: 16),
              Container(width: 250, height: 20, color: Colors.grey.shade300),
              const SizedBox(height: 8),
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
          Icon(Icons.speaker_notes_off, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          const Text(
            'விவாதங்கள் எதுவும் இல்லை\n(No community posts yet)',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Text('Error: $message', style: const TextStyle(color: Colors.red)),
    );
  }

  void _showCreatePostBottomSheet(BuildContext context) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final tagController = TextEditingController();

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
              'புதிய விவாதம் துவங்கு (Create Thread)',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'தலைப்பு (Subject Title)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: contentController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'கேள்வி அல்லது கருத்து விபரம் (Content)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: tagController,
              decoration: const InputDecoration(
                labelText: 'குறிச்சொற்கள் (Tags - e.g. tomato, blight)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton.icon(
                  onPressed: () {}, // Record voice description
                  icon: const Icon(Icons.mic, color: Colors.red),
                  label: const Text('பேசவும் (Record Voice)', style: TextStyle(color: Colors.red)),
                ),
                Text(
                  _isOffline ? 'இணைப்பற்ற சேமிப்பு (Offline Draft)' : 'உடனடி வெளியீடு (Auto Sync)',
                  style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                )
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
                      final newPost = CommunityPostEntity(
                        id: DateTime.now().millisecondsSinceEpoch.toString(),
                        authorId: 'farmer_demo_id',
                        title: titleController.text,
                        content: contentController.text,
                        tags: tagController.text.split(',').map((e) => e.trim()).toList(),
                        category: _selectedCategory == 'all' ? 'general' : _selectedCategory,
                        syncVersion: 1,
                        lastModifiedAt: DateTime.now(),
                        isDeleted: false,
                      );
                      ref.read(communityPostNotifierProvider.notifier).submitPost(newPost);
                      Navigator.pop(context);
                    },
                    child: const Text('வெளியிடு (Post)'),
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

  void _showCommentsBottomSheet(BuildContext context, String postId) {
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
            const Text('பதில்கள் & கருத்துக்கள் (Answers & Comments)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.black)),
            const SizedBox(height: 12),
            
            // Best Answer Highlight (Expert solution card)
            _buildBestAnswerCard(context),

            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'பதில் எழுதவும் (Write Answer...)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('சரி (Done)'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildBestAnswerCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.amber.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber, width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 20),
              const SizedBox(width: 6),
              Text(
                'சிறந்த பதில் (Best Expert Answer)',
                style: TextStyle(fontWeight: FontWeight.black, color: Colors.amber.shade900, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'மதுரை வேளாண் அதிகாரி இராமலிங்கம்:\n"நீங்கள் பரிந்துரைத்த தாமிர பூஞ்சை காளான் மருந்தை 15 லிட்டர் தண்ணீருக்கு 30 கிராம் என்ற அளவில் கலந்து தெளிக்கவும்."',
            style: TextStyle(fontSize: 13, height: 1.4, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
