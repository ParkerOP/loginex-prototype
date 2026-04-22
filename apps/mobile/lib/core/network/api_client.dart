import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);

  final dio = Dio(BaseOptions(
    // Android emulator alias to localhost
    baseUrl: 'http://10.0.2.2:3000/v1',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      // For prototype, attach x-user-id and x-user-role
      final userId = await storage.read(key: 'x-user-id');
      final userRole = await storage.read(key: 'x-user-role');

      if (userId != null) {
        options.headers['x-user-id'] = userId;
      }
      if (userRole != null) {
        options.headers['x-user-role'] = userRole;
      }

      return handler.next(options);
    },
  ));

  return dio;
});
