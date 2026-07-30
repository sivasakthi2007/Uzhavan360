// Folder Path: lib/features/weather_intelligence/presentation/screens/
// Dart Filename: weather_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../consolidated_core_pack.dart';

class WeatherDashboardScreen extends ConsumerStatefulWidget {
  const WeatherDashboardScreen({super.key});

  @override
  ConsumerState<WeatherDashboardScreen> createState() => _WeatherDashboardScreenState();
}

class _WeatherDashboardScreenState extends ConsumerState<WeatherDashboardScreen> {
  final String _selectedDistrict = 'Madurai';
  final bool _isOffline = false; // Binds to sync state

  @override
  Widget build(BuildContext context) {
    final weatherAsync = ref.watch(weatherAdvisoryProvider(_selectedDistrict));

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'வானிலை நுண்ணறிவு', // Tamil Title
              style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
            ),
            Text(
              'Weather Intelligence', // English Subtitle
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
              _isOffline ? Icons.cloud_off : Icons.cloud_queue,
              color: _isOffline ? Colors.red : Colors.green,
            ),
          )
        ],
      ),
      body: weatherAsync.when(
        data: (advisory) => _buildWeatherContent(context, advisory),
        loading: () => _buildLoadingState(),
        error: (err, stack) => _buildErrorState(err.toString()),
      ),
    );
  }

  Widget _buildWeatherContent(BuildContext context, WeatherAdvisoryEntity advisory) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // Heat Stress / Flood Warnings Banner
        _buildAlertBanner(context, advisory.precipitationProbability),
        const SizedBox(height: 12),

        // Main Weather Card (Large text for accessibility)
        _buildMainWeatherCard(context, advisory),
        const SizedBox(height: 16),

        // Agricultural Advisories
        _buildAgriInsightsSection(context, advisory),
        const SizedBox(height: 16),

        // 7-Day Forecast (Horizontal Cards)
        _buildWeeklyForecast(context),
      ],
    );
  }

  Widget _buildAlertBanner(BuildContext context, double rainProb) {
    final bool hasHeavyRainAlert = rainProb > 70.0;

    return Card(
      color: hasHeavyRainAlert ? Colors.red.shade50 : Colors.amber.shade50,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: hasHeavyRainAlert ? Colors.red.shade200 : Colors.amber.shade200, width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(
              hasHeavyRainAlert ? Icons.warning_amber : Icons.wb_sunny,
              color: hasHeavyRainAlert ? Colors.red : Colors.orange,
              size: 28,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hasHeavyRainAlert ? 'அதிவேக மழை எச்சரிக்கை (Heavy Rain Warning)' : 'வெப்ப அலை எச்சரிக்கை (Heat Advisory)',
                    style: TextStyle(fontWeight: FontWeight.black, fontSize: 13, color: hasHeavyRainAlert ? Colors.red.shade900 : Colors.orange.shade900),
                  ),
                  Text(
                    hasHeavyRainAlert
                        ? 'அடுத்த 24 மணிநேரத்தில் கனமழை பெய்யக்கூடும். பயிர்களைப் பாதுகாக்கவும்.'
                        : 'அதிக வெயில் காரணமாக மதிய நேரத்தில் வேலை செய்வதைத் தவிர்க்கவும்.',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildMainWeatherCard(BuildContext context, WeatherAdvisoryEntity advisory) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      color: Colors.blue.shade100,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              'தற்போதைய வானிலை (Current Weather)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.blueAccent),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.wb_cloudy, size: 64, color: Colors.white),
                const SizedBox(width: 16),
                Text(
                  '${advisory.temperature}°C',
                  style: const TextStyle(fontSize: 54, fontWeight: FontWeight.black, color: Colors.black87),
                ),
              ],
            ),
            Text(
              advisory.condition.toUpperCase(),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black, letterSpacing: 1.5),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildWeatherStat(Icons.water_drop, '${advisory.humidity}%', 'ஈரப்பதம் (Humidity)'),
                _buildWeatherStat(Icons.wind_power, '14 km/h', 'காற்று (Wind)'),
                _buildWeatherStat(Icons.umbrella, '${advisory.precipitationProbability}%', 'மழை வாய்ப்பு (Rain)'),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherStat(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue.shade800, size: 24),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.black, fontSize: 15)),
        Text(label, style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildAgriInsightsSection(BuildContext context, WeatherAdvisoryEntity advisory) {
    final bool rainExpected = advisory.precipitationProbability > 50.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('விவசாய ஆலோசனைகள்', 'Smart Weather Advisories for Crops'),
        const SizedBox(height: 8),
        _buildInsightCard(
          context,
          title: 'நீர் பாசனம் (Irrigation Advisory)',
          advice: rainExpected
              ? 'மழை வர வாய்ப்புள்ளது, இன்று பயிர்களுக்கு தண்ணீர் பாய்ச்ச வேண்டாம் (Rain expected, skip irrigation).'
              : 'வெப்பநிலை அதிகம், மாலை வேளையில் தண்ணீர் பாய்ச்சவும் (High temperature, irrigate in the evening).',
          icon: Icons.opacity,
          color: rainExpected ? Colors.orange : Colors.green,
        ),
        _buildInsightCard(
          context,
          title: 'பூச்சிக்கொல்லி தெளித்தல் (Spraying Advisory)',
          advice: 'மிதமான காற்று வீசுவதால் மருந்து தெளிக்க உகந்த வானிலை (Wind speed is moderate, safe to spray).',
          icon: Icons.gas_meter_outlined,
          color: Colors.green,
        ),
      ],
    );
  }

  Widget _buildInsightCard(
    BuildContext context, {
    required String title,
    required String advice,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.black, fontSize: 14)),
        subtitle: Text(advice, style: const TextStyle(fontSize: 12, height: 1.4)),
      ),
    );
  }

  Widget _buildWeeklyForecast(BuildContext context) {
    final days = ['வியாழன் (Thu)', 'வெள்ளி (Fri)', 'சனி (Sat)', 'ஞாயிறு (Sun)', 'திங்கள் (Mon)'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('7 நாட்கள் முன்னறிவிப்பு', '7-Day Future Forecast'),
        const SizedBox(height: 8),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: days.length,
            itemBuilder: (context, index) {
              return Card(
                margin: const EdgeInsets.only(right: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Container(
                  width: 100,
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(days[index], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      const Icon(Icons.wb_sunny_outlined, color: Colors.orange, size: 24),
                      const Text('32° / 24°', style: TextStyle(fontWeight: FontWeight.black, fontSize: 13)),
                      const Text('20% Rain', style: TextStyle(fontSize: 9, color: Colors.blue)),
                    ],
                  ),
                ),
              );
            },
          ),
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

  Widget _buildLoadingState() {
    return const Center(child: CircularProgressIndicator());
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Text('Error: $message', style: const TextStyle(color: Colors.red)),
    );
  }
}
