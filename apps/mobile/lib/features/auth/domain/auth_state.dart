import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/api_client.dart';

enum UserRole { driver, shipper, none }

class AuthState {
  final bool isAuthenticated;
  final UserRole role;
  final String? userId;

  AuthState({
    this.isAuthenticated = false,
    this.role = UserRole.none,
    this.userId,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    UserRole? role,
    String? userId,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      role: role ?? this.role,
      userId: userId ?? this.userId,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  late final FlutterSecureStorage _storage;

  @override
  AuthState build() {
    _storage = ref.read(secureStorageProvider);
    _checkAuth();
    return AuthState();
  }

  Future<void> _checkAuth() async {
    final userId = await _storage.read(key: 'x-user-id');
    final roleStr = await _storage.read(key: 'x-user-role');

    if (userId != null && roleStr != null) {
      final role = roleStr.toUpperCase() == 'DRIVER' ? UserRole.driver : UserRole.shipper;
      state = AuthState(isAuthenticated: true, role: role, userId: userId);
    }
  }

  Future<void> login(String phone, String roleStr) async {
    // For Prototype, just dummy auth
    final role = roleStr.toUpperCase() == 'DRIVER' ? UserRole.driver : UserRole.shipper;

    // Create a dummy ID
    final dummyId = 'usr_${DateTime.now().millisecondsSinceEpoch}';

    await _storage.write(key: 'x-user-id', value: dummyId);
    await _storage.write(key: 'x-user-role', value: roleStr.toUpperCase());

    state = AuthState(isAuthenticated: true, role: role, userId: dummyId);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'x-user-id');
    await _storage.delete(key: 'x-user-role');
    state = AuthState();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
