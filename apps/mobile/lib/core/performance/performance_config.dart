import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/api_client.dart';

// Provides true if animations and heavy features should be degraded
final performanceConfigProvider = Provider<bool>((ref) {
  final dio = ref.watch(dioProvider);
  final baseUrl = dio.options.baseUrl;

  // If we are pointing to localhost/emulator, disable degradation to allow all heavy animations
  if (baseUrl.contains('10.0.2.2') ||
      baseUrl.contains('localhost') ||
      baseUrl.contains('127.0.0.1')) {
    return false; // degrade = false
  }

  // Otherwise, we could implement actual logic for device/network checks
  // For the prototype, we return false here too unless explicitly handled
  return false;
});
