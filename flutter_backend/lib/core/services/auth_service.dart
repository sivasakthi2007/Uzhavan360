// Folder Path: lib/core/services/
// Dart Filename: auth_service.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import 'secure_storage_service.dart';

class AuthService {
  final SupabaseClient _client;
  final SecureStorageService _secureStorage;

  AuthService(this._client, this._secureStorage);

  User? get currentUser => _client.auth.currentUser;

  Future<void> signInWithOtp(String emailOrPhone) async {
    await _client.auth.signInWithOtp(
      email: emailOrPhone.contains('@') ? emailOrPhone : null,
      phone: emailOrPhone.contains('@') ? null : emailOrPhone,
    );
  }

  Future<AuthResponse> verifyOtp(String emailOrPhone, String token) async {
    final response = await _client.auth.verifyOTP(
      email: emailOrPhone.contains('@') ? emailOrPhone : null,
      phone: emailOrPhone.contains('@') ? null : emailOrPhone,
      token: token,
      type: OtpType.sms,
    );

    if (response.session != null) {
      await _secureStorage.write('supabase_refresh_token', response.session!.refreshToken!);
    }
    return response;
  }

  Future<void> loginWithGoogle() async {
    await _client.auth.signInWithOAuth(
      OAuthProvider.google,
    );
  }

  Future<void> logout() async {
    await _client.auth.signOut();
    await _secureStorage.delete('supabase_refresh_token');
  }

  Future<void> checkSessionAndRefresh() async {
    final savedToken = await _secureStorage.read('supabase_refresh_token');
    if (savedToken != null) {
      final response = await _client.auth.setSession(savedToken);
      if (response.session != null) {
        await _secureStorage.write('supabase_refresh_token', response.session!.refreshToken!);
      }
    }
  }
}
