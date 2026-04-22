import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum DeviceCapability { highEnd, lowEnd }

enum NetworkStrength { strong, weak, offline }

class DeviceCapabilitiesService {
  final Connectivity _connectivity = Connectivity();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  DeviceCapability _capability = DeviceCapability.highEnd;
  NetworkStrength _network = NetworkStrength.strong;

  DeviceCapability get capability => _capability;
  NetworkStrength get network => _network;

  Future<void> init() async {
    await _checkDeviceCapability();
    await _checkNetwork();

    _connectivity.onConnectivityChanged.listen((
      List<ConnectivityResult> results,
    ) {
      if (results.isEmpty) {
        _network = NetworkStrength.offline;
      } else {
        final result = results.first;
        if (result == ConnectivityResult.none) {
          _network = NetworkStrength.offline;
        } else if (result == ConnectivityResult.mobile) {
          _network = NetworkStrength.weak;
        } else {
          _network = NetworkStrength.strong;
        }
      }
    });
  }

  Future<void> _checkNetwork() async {
    final results = await _connectivity.checkConnectivity();
    if (results.isEmpty) {
      _network = NetworkStrength.offline;
      return;
    }
    final result = results.first;
    if (result == ConnectivityResult.none) {
      _network = NetworkStrength.offline;
    } else if (result == ConnectivityResult.mobile) {
      _network = NetworkStrength.weak;
    } else {
      _network = NetworkStrength.strong;
    }
  }

  Future<void> _checkDeviceCapability() async {
    if (kIsWeb) {
      _capability = DeviceCapability.highEnd;
      return;
    }

    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        final androidInfo = await _deviceInfo.androidInfo;
        if (androidInfo.version.sdkInt < 28) {
          _capability = DeviceCapability.lowEnd;
        }
      } else if (defaultTargetPlatform == TargetPlatform.iOS) {
        _capability = DeviceCapability.highEnd;
      }
    } catch (e) {
      _capability = DeviceCapability.lowEnd;
    }
  }

  bool get shouldDowngradeUI =>
      _capability == DeviceCapability.lowEnd ||
      _network == NetworkStrength.weak;
}

final deviceCapabilitiesProvider = Provider<DeviceCapabilitiesService>((ref) {
  throw UnimplementedError();
});
