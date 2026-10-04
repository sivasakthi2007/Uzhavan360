import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/models/ooru_models.dart';
import '../../../core/network/supabase_service.dart';
import '../../../core/services/matching_engine.dart';

class MatchingProvidersScreen extends StatefulWidget {
  final ServiceRequestModel request;
  const MatchingProvidersScreen({super.key, required this.request});

  @override
  State<MatchingProvidersScreen> createState() => _MatchingProvidersScreenState();
}

class _MatchingProvidersScreenState extends State<MatchingProvidersScreen> {
  late Future<List<ServiceProviderModel>> _providersFuture;

  @override
  void initState() {
    super.initState();
    _providersFuture = SupabaseService.instance.getMatchingProviders(
      requestType: widget.request.requestType,
      skillName: widget.request.skillName,
      requiredWorkers: widget.request.requiredWorkers,
    );
  }

  Future<void> _makeCall(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    final cleaned = MatchingEngine.formatIndianPhoneNumber(phone);
    final Uri uri = Uri.parse('tel:+$cleaned');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cannot make call to $phone')),
        );
      }
    }
  }

  Future<void> _launchWhatsApp(String? phone, String title) async {
    if (phone == null || phone.isEmpty) return;
    final cleaned = MatchingEngine.formatIndianPhoneNumber(phone);
    final message = Uri.encodeComponent('வணக்கம் $title, Ooru Connect மூலம் தொடர்புகொள்கிறேன்.');
    final Uri uri = Uri.parse('https://wa.me/$cleaned?text=$message');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('WhatsApp not installed or cannot open.')),
        );
      }
    }
  }

  void _showVouchDialog(ServiceProviderModel provider) {
    final commentController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppStrings.addVouch),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('வழங்குபவர்: ${provider.title}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: commentController,
              decoration: const InputDecoration(
                labelText: 'நம்பிக்கை குறிப்பு (e.g. நல்ல வேலை செய்தார்)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('ரத்து')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32), foregroundColor: Colors.white),
            onPressed: () async {
              final vouch = VouchModel(
                id: 'v_${DateTime.now().millisecondsSinceEpoch}',
                voucherProfileId: 'current_user',
                targetProviderId: provider.id,
                voucherVillageName: widget.request.villageName ?? 'Vadugapalayam',
                comment: commentController.text,
                createdAt: DateTime.now().toIso8601String(),
              );
              await SupabaseService.instance.addVouch(vouch);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('நம்பிக்கை சான்று சேர்க்கப்பட்டது! (Vouch Added)')),
              );
            },
            child: const Text('சான்றளிக்கவும்'),
          ),
        ],
      ),
    );
  }

  void _showReportDialog(ServiceProviderModel provider) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppStrings.reportProvider),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            labelText: 'காரணம் (Reason for report)',
            border: OutlineInputBorder(),
          ),
          maxLines: 2,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('ரத்து')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700], foregroundColor: Colors.white),
            onPressed: () async {
              await SupabaseService.instance.submitReport('current_user', provider.profileId, 'User Report', reasonController.text);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('புகார் அனுப்பப்பட்டது (Report submitted)')),
              );
            },
            child: const Text('புகார் அளி'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.request.skillName} - 10 km'),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
      ),
      body: FutureBuilder<List<ServiceProviderModel>>(
        future: _providersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final providers = snapshot.data ?? [];
          if (providers.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.search_off, size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    const Text(
                      'இந்த பகுதியில் இப்போது matching provider கிடைக்கவில்லை.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32), foregroundColor: Colors.white),
                      onPressed: () => setState(() {
                        _providersFuture = SupabaseService.instance.getMatchingProviders(
                          requestType: widget.request.requestType,
                          skillName: widget.request.skillName,
                        );
                      }),
                      child: const Text('மீண்டும் தேடவும்'),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: providers.length,
            itemBuilder: (context, index) {
              final p = providers[index];
              final isMaistry = p.providerType == 'maistry';

              Color statusColor = Colors.green;
              String statusText = AppStrings.availableToday;
              if (p.availabilityStatus == 'booked') {
                statusColor = Colors.red;
                statusText = AppStrings.booked;
              } else if (p.availabilityStatus == 'available_date') {
                statusColor = Colors.orange;
                statusText = '${AppStrings.availableDate} (${p.availableDate ?? ''})';
              }

              return Card(
                elevation: 3,
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: isMaistry ? const Color(0xFF2E7D32) : const Color(0xFF1565C0),
                            child: Icon(isMaistry ? Icons.groups : Icons.build, color: Colors.white, size: 28),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(p.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                Text(
                                  '📍 ${p.villageName ?? "Vadugapalayam"} (3.5 km away)',
                                  style: TextStyle(color: Colors.grey[700], fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.flag_outlined, color: Colors.grey),
                            onPressed: () => _showReportDialog(p),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: statusColor.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                            child: Row(
                              children: [
                                CircleAvatar(radius: 4, backgroundColor: statusColor),
                                const SizedBox(width: 6),
                                Text(statusText, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          if (isMaistry)
                            Text(
                              '👷 ${AppStrings.squadSize}: ${p.squadSize} ஆட்கள்',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            )
                          else
                            Text(
                              '⭐ ${AppStrings.vouchedBy}: ${p.vouchesCount}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFFE65100)),
                            ),
                        ],
                      ),
                      if (p.baseRate != null) ...[
                        const SizedBox(height: 8),
                        Text('💰 கட்டணம்: ${p.baseRate}', style: const TextStyle(color: Colors.black87, fontSize: 14)),
                      ],
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.call, color: Colors.white),
                              label: Text(AppStrings.callNow),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2E7D32),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              onPressed: () => _makeCall(p.phone),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.chat, color: Colors.white),
                              label: const Text('WhatsApp'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF25D366),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              onPressed: () => _launchWhatsApp(p.phone, p.title),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton.icon(
                          icon: const Icon(Icons.verified, size: 18, color: Color(0xFF1B5E20)),
                          label: Text(AppStrings.addVouch, style: const TextStyle(color: Color(0xFF1B5E20))),
                          onPressed: () => _showVouchDialog(p),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
