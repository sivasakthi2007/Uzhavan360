import 'package:flutter/material.dart';
import '../../../core/constants/app_strings.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onFinish;
  const SplashScreen({super.key, required this.onFinish});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), widget.onFinish);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1B5E20), // Forest Green
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: Colors.black26, blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: const Icon(Icons.people_alt, size: 64, color: Color(0xFF1B5E20)),
            ),
            const SizedBox(height: 24),
            Text(
              AppStrings.appName,
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Text(
                AppStrings.tagLine,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Color(0xFFC8E6C9)),
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}

class LanguageSelectionScreen extends StatelessWidget {
  final Function(AppLanguage) onSelectLanguage;
  const LanguageSelectionScreen({super.key, required this.onSelectLanguage});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.selectLanguage),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.g_translate, size: 72, color: Color(0xFF2E7D32)),
            const SizedBox(height: 24),
            Text(
              'மொழியைத் தேர்ந்தெடுக்கவும் / Choose Language',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => onSelectLanguage(AppLanguage.ta),
              child: const Text('தமிழ் (Tamil - Default)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.all(18),
                side: const BorderSide(color: Color(0xFF2E7D32), width: 2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => onSelectLanguage(AppLanguage.en),
              child: const Text('English', style: TextStyle(fontSize: 18, color: Color(0xFF2E7D32))),
            ),
          ],
        ),
      ),
    );
  }
}

class RoleSelectionScreen extends StatelessWidget {
  final Function(String role) onSelectRole;
  const RoleSelectionScreen({super.key, required this.onSelectRole});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.chooseRole),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            InkWell(
              onTap: () => onSelectRole('demand'),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  border: Border.all(color: const Color(0xFF2E7D32), width: 2),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 3))],
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 32,
                      backgroundColor: Color(0xFF2E7D32),
                      child: Icon(Icons.hail, size: 36, color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppStrings.needWork,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            AppStrings.needWorkSub,
                            style: const TextStyle(fontSize: 14, color: Colors.black87),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            InkWell(
              onTap: () => onSelectRole('provider'),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFE3F2FD),
                  border: Border.all(color: const Color(0xFF1565C0), width: 2),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 3))],
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 32,
                      backgroundColor: Color(0xFF1565C0),
                      child: Icon(Icons.engineering, size: 36, color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppStrings.provideWork,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            AppStrings.provideWorkSub,
                            style: const TextStyle(fontSize: 14, color: Colors.black87),
                          ),
                        ],
                      ),
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
