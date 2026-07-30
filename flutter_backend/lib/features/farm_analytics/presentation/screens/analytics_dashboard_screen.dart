// Folder Path: lib/features/farm_analytics/presentation/screens/
// Dart Filename: analytics_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../consolidated_core_pack.dart';

class AnalyticsDashboardScreen extends ConsumerStatefulWidget {
  const AnalyticsDashboardScreen({super.key});

  @override
  ConsumerState<AnalyticsDashboardScreen> createState() => _AnalyticsDashboardScreenState();
}

class _AnalyticsDashboardScreenState extends ConsumerState<AnalyticsDashboardScreen> {
  final String _selectedFarmId = 'farm_demo_id';
  final bool _isOffline = false; // Binds to network status

  @override
  Widget build(BuildContext context) {
    final analyticsAsync = ref.watch(farmAnalyticsProvider(_selectedFarmId));

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'பண்ணை வருமான பகுப்பாய்வு', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Farm Analytics Dashboard', // English Subtitle
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
              _isOffline ? Icons.wifi_off : Icons.sync_done,
              color: _isOffline ? Colors.orange : Colors.green,
            ),
          )
        ],
      ),
      body: analyticsAsync.when(
        data: (data) => _buildDashboardContent(context, data),
        loading: () => _buildLoadingState(),
        error: (err, stack) => _buildErrorState(err.toString()),
      ),
    );
  }

  Widget _buildDashboardContent(BuildContext context, FarmAnalyticsEntity data) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // AI Smart Insights Card
        _buildAiInsightsCard(context),
        const SizedBox(height: 12),

        // Summary Cards Grid (High contrast, large targets)
        _buildSummaryGrid(context, data),
        const SizedBox(height: 16),

        // Expense Category Bar Chart (Custom Painter)
        _buildChartSection(context, data.categoryCosts),
        const SizedBox(height: 16),

        // Export Actions Section
        _buildExportActions(context),
      ],
    );
  }

  Widget _buildAiInsightsCard(BuildContext context) {
    return Card(
      color: Colors.green.shade50,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.green.shade200, width: 1.5),
      ),
      child: const Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.auto_awesome, color: Colors.green, size: 24),
                SizedBox(width: 8),
                Text(
                  'ஸ்மார்ட் பரிந்துரைகள் (AI Smart Insights)',
                  style: TextStyle(fontWeight: FontWeight.black, color: Colors.green, fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '• அதிக லாபம் தரும் பயிர் (Most Profitable): தக்காளி (Tomato)\n• அதிக செலவு கொண்ட பகுதி (Highest Expense): உரம் (Fertilizers)\n• சேமிப்பு வழிமுறை: பகிர்வு வாகனங்களை (Shared Transport) பயன்படுத்துவதன் மூலம் போக்குவரத்துச் செலவில் 35% வரை மிச்சப்படுத்தலாம்.',
              style: TextStyle(fontSize: 13, height: 1.5, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryGrid(BuildContext context, FarmAnalyticsEntity data) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _buildStatCard(
          context,
          title: 'மொத்த வருமானம் (Income)',
          amount: '₹${data.totalIncome}',
          color: Colors.green,
          icon: Icons.trending_up,
        ),
        _buildStatCard(
          context,
          title: 'மொத்த செலவு (Expenses)',
          amount: '₹${data.totalExpense}',
          color: Colors.red,
          icon: Icons.trending_down,
        ),
        _buildStatCard(
          context,
          title: 'நிகர லாபம் (Net Profit)',
          amount: '₹${data.netProfit}',
          color: data.netProfit >= 0 ? Colors.blue : Colors.orange,
          icon: Icons.account_balance_wallet,
        ),
        _buildStatCard(
          context,
          title: 'பயிர்கள் (Active Crops)',
          amount: 'தக்காளி, நெல்',
          color: Colors.purple,
          icon: Icons.agriculture,
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String amount,
    required Color color,
    required IconData icon,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Icon(icon, color: color, size: 24),
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                )
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(
                  amount,
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.black, color: color),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildChartSection(BuildContext context, Map<String, double> categoryCosts) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'செலவுப் பிரிவுகள் (Expenses Breakdown)',
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 16),
            ),
            const SizedBox(height: 16),
            if (categoryCosts.isEmpty)
              const Center(
                child: Text('செலவு விபரங்கள் இல்லை (No expense logs yet)'),
              )
            else
              Container(
                height: 160,
                width: double.infinity,
                padding: const EdgeInsets.only(top: 8),
                child: CustomPaint(
                  painter: ExpenseBarChartPainter(categoryCosts),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildExportActions(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'அறிக்கை பதிவிறக்கம் (Reports & Sharing)',
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.picture_as_pdf, color: Colors.red),
                    label: const Text('PDF அறிக்கை'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.grid_on, color: Colors.green),
                    label: const Text('Excel தாள்'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () {},
                  icon: const Icon(Icons.share),
                  tooltip: 'பகிர் (Share)',
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(child: CircularProgressIndicator());
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Text('Error: $message', style: const TextStyle(color: Colors.red)),
    );
  }
}

// Custom Painter to render high-contrast, offline-first Bar Charts
class ExpenseBarChartPainter extends CustomPainter {
  final Map<String, double> categoryCosts;
  ExpenseBarChartPainter(this.categoryCosts);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..strokeWidth = 2.0;

    final categories = categoryCosts.keys.toList();
    final values = categoryCosts.values.toList();
    if (values.isEmpty) return;

    final double maxVal = values.reduce((curr, next) => curr > next ? curr : next);
    final double stepX = size.width / categories.length;

    for (int i = 0; i < categories.length; i++) {
      final double barHeight = (values[i] / maxVal) * (size.height - 30);
      final double left = i * stepX + 12;
      final double right = (i + 1) * stepX - 12;
      final double top = size.height - barHeight - 20;
      final double bottom = size.height - 20;

      paint.color = Colors.red.shade400;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTRB(left, top, right, bottom),
          const Radius.circular(6),
        ),
        paint,
      );

      // Category labels
      final textPainter = TextPainter(
        text: TextSpan(
          text: categories[i].toUpperCase(),
          style: const TextStyle(fontSize: 8, color: Colors.black, fontWeight: FontWeight.bold),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, Offset(left + (right - left) / 2 - textPainter.width / 2, size.height - 15));

      // Value label
      final valuePainter = TextPainter(
        text: TextSpan(
          text: '₹${values[i].toInt()}',
          style: const TextStyle(fontSize: 8, color: Colors.red, fontWeight: FontWeight.bold),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      valuePainter.paint(canvas, Offset(left + (right - left) / 2 - valuePainter.width / 2, top - 12));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
