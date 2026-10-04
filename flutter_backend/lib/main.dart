import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/constants/app_strings.dart';
import 'core/database/app_database.dart';
import 'core/models/ooru_models.dart';
import 'core/network/sync_engine.dart';

import 'features/auth/presentation/auth_flow_screens.dart';
import 'features/home/presentation/main_dashboards.dart';
import 'features/requests/presentation/request_forms_screens.dart';
import 'features/matching/presentation/matching_results_screens.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  try {
    await Supabase.initialize(
      url: 'https://hgmchcfrwcxadxrgqjbm.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWNoY2Zyd2N4YWR4cmdxamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTMzOTQsImV4cCI6MjA5NzUyOTM5NH0.EVW9Efpp5YAFkvYXH2RaAxI4EcV2E6cEDdRiL2iRCsM',
    );
  } catch (e) {
    debugPrint('Supabase init notice: $e');
  }

  // Initialize SQLite local DB & trigger offline sync queue check
  try {
    await AppDatabase.instance.database;
    SyncEngine.instance.syncPendingOutbox();
  } catch (e) {
    debugPrint('AppDatabase init notice: $e');
  }

  runApp(
    const ProviderScope(
      child: OoruConnectApp(),
    ),
  );
}

class OoruConnectApp extends StatefulWidget {
  const OoruConnectApp({super.key});

  @override
  State<OoruConnectApp> createState() => _OoruConnectAppState();
}

class _OoruConnectAppState extends State<OoruConnectApp> {
  bool _splashFinished = false;
  AppLanguage? _selectedLanguage;
  String? _selectedRole; // 'demand', 'provider', 'admin'

  ServiceRequestModel? _activeRequest;
  bool _showLabourForm = false;
  bool _showTechForm = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1B5E20),
          brightness: Brightness.light,
          primary: const Color(0xFF2E7D32),
          secondary: const Color(0xFF1565C0),
          surface: const Color(0xFFF1F8E9),
        ),
        fontFamily: 'Roboto',
      ),
      home: _buildCurrentScreen(),
    );
  }

  Widget _buildCurrentScreen() {
    if (!_splashFinished) {
      return SplashScreen(onFinish: () => setState(() => _splashFinished = true));
    }

    if (_selectedLanguage == null) {
      return LanguageSelectionScreen(
        onSelectLanguage: (lang) {
          setState(() {
            _selectedLanguage = lang;
            AppStrings.setLanguage(lang);
          });
        },
      );
    }

    if (_selectedRole == null) {
      return RoleSelectionScreen(
        onSelectRole: (role) {
          setState(() => _selectedRole = role);
        },
      );
    }

    if (_selectedRole == 'provider') {
      return const ProviderHomeScreen();
    }

    if (_selectedRole == 'admin') {
      return const AdminHomeScreen();
    }

    // Demand User Flows
    if (_activeRequest != null) {
      return Scaffold(
        body: MatchingProvidersScreen(request: _activeRequest!),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => setState(() => _activeRequest = null),
          icon: const Icon(Icons.arrow_back),
          label: const Text('Back to Home'),
          backgroundColor: const Color(0xFF1B5E20),
        ),
      );
    }

    if (_showLabourForm) {
      return LabourRequestScreen(
        onSubmitRequest: (req) {
          setState(() {
            _showLabourForm = false;
            _activeRequest = req;
          });
        },
      );
    }

    if (_showTechForm) {
      return TechnicianRequestScreen(
        onSubmitRequest: (req) {
          setState(() {
            _showTechForm = false;
            _activeRequest = req;
          });
        },
      );
    }

    return DemandHomeScreen(
      onOpenLabourForm: () => setState(() => _showLabourForm = true),
      onOpenTechForm: () => setState(() => _showTechForm = true),
      onSelectRequest: (req) => setState(() => _activeRequest = req),
    );
  }
}
