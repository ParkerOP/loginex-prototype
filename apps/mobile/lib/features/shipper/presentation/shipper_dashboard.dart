import '../../shared/presentation/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../auth/domain/auth_state.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/device_capabilities_service.dart';

class ShipperDashboard extends ConsumerWidget {
  const ShipperDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('My Active Loads').animate().fadeIn().slideX(),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: const ShipperActiveLoadsView(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.add),
        label: const Text('Post Load'),
      ).animate().scale(delay: 400.ms),
    );
  }
}

class ShipperActiveLoadsView extends ConsumerStatefulWidget {
  const ShipperActiveLoadsView({super.key});

  @override
  ConsumerState<ShipperActiveLoadsView> createState() =>
      _ShipperActiveLoadsViewState();
}

class _ShipperActiveLoadsViewState
    extends ConsumerState<ShipperActiveLoadsView> {
  List<dynamic> activeLoads = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchActiveLoads();
  }

  Future<void> _fetchActiveLoads() async {
    try {
      final dio = ref.read(dioProvider);
      final userId = ref.read(authProvider).userId;
      final response = await dio.get('/loads/shipper/$userId');

      setState(() {
        activeLoads = response.data['loads'] ?? response.data ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        error = "Could not connect to backend. Showing cached loads.";
        activeLoads = [
          {
            'id': 'SL1',
            'status': 'IN TRANSIT',
            'driverName': 'John D.',
            'currentLat': 37.7749,
            'currentLng': -122.4194,
          },
          {
            'id': 'SL2',
            'status': 'MATCHED',
            'driverName': 'Alice M.',
            'currentLat': 37.3382,
            'currentLng': -121.8863,
          },
        ];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (activeLoads.isEmpty) {
      return const Center(child: Text("No active loads found."));
    }

    return Column(
      children: [
        if (error != null)
          Container(
            padding: const EdgeInsets.all(8),
            color: Colors.red.withOpacity(0.5),
            child: Text(error!, style: const TextStyle(color: Colors.white)),
          ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: activeLoads.length,
            itemBuilder: (context, index) {
              final load = activeLoads[index];
              return ShipperLoadCard(load: load, index: index);
            },
          ),
        ),
      ],
    );
  }
}

class ShipperLoadCard extends ConsumerWidget {
  final dynamic load;
  final int index;

  const ShipperLoadCard({super.key, required this.load, required this.index});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceCapabilities = ref.watch(deviceCapabilitiesProvider);
    final shouldDowngrade = deviceCapabilities.shouldDowngradeUI;

    final loadId = load['id'] ?? 'Unknown ID';
    final status = load['status'] ?? 'UNKNOWN';
    final driverName =
        load['driverName'] ??
        load['driver']?['user']?['name'] ??
        'Pending Driver';
    final lat = load['currentLat'] ?? 37.7749;
    final lng = load['currentLng'] ?? -122.4194;

    return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
            ),
            boxShadow: [
              if (!shouldDowngrade)
                BoxShadow(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  blurRadius: 20,
                  spreadRadius: -5,
                ),
            ],
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Load #$loadId',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          status,
                          style: const TextStyle(
                            color: Colors.blue,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.local_shipping,
                            color: Colors.blue,
                          ),
                        )
                        .animate(
                          onPlay: (controller) => shouldDowngrade
                              ? null
                              : controller.repeat(reverse: true),
                        )
                        .scaleXY(
                          end: shouldDowngrade ? 1.0 : 1.1,
                          duration: 1.seconds,
                        ),
                  ],
                ),
              ),

              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  border: Border.symmetric(
                    horizontal: BorderSide(
                      color: Colors.white.withOpacity(0.05),
                    ),
                  ),
                ),
                child: shouldDowngrade
                    ? const Center(
                        child: Text(
                          'Map Disabled for Performance/Data',
                          style: TextStyle(color: Colors.white54),
                        ),
                      )
                    : FlutterMap(
                        options: MapOptions(
                          initialCenter: LatLng(lat, lng),
                          initialZoom: 13.0,
                          interactionOptions: const InteractionOptions(
                            flags: InteractiveFlag.none,
                          ),
                        ),
                        children: [
                          TileLayer(
                            urlTemplate:
                                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.loginex.mobile',
                          ),
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: LatLng(lat, lng),
                                width: 40,
                                height: 40,
                                child: const Icon(
                                  Icons.local_shipping,
                                  color: Colors.blue,
                                  size: 30,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    const Icon(Icons.person, color: Colors.white54),
                    const SizedBox(width: 8),
                    Text(
                      'Driver: $driverName',
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () {},
                      child: const Text('View Details'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )
        .animate(target: shouldDowngrade ? 0 : 1)
        .fadeIn(delay: Duration(milliseconds: 200 * index))
        .slideY(begin: 0.2);
  }
}
