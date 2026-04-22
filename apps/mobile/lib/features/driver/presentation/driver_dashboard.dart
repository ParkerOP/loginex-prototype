import "trip_execution_screen.dart";
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../auth/domain/auth_state.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/device_capabilities_service.dart';

class DriverDashboard extends ConsumerWidget {
  const DriverDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Loads').animate().fadeIn().slideX(),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: const LoadDiscoveryView(),
    );
  }
}

class LoadDiscoveryView extends ConsumerStatefulWidget {
  const LoadDiscoveryView({super.key});

  @override
  ConsumerState<LoadDiscoveryView> createState() => _LoadDiscoveryViewState();
}

class _LoadDiscoveryViewState extends ConsumerState<LoadDiscoveryView> {
  List<dynamic> loads = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchLoads();
  }

  Future<void> _fetchLoads() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/matching/available');

      setState(() {
        loads = response.data['matches'] ?? response.data ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        error = "Could not connect to backend. Showing cached loads.";
        loads = [
          {
            'id': 'L1',
            'origin': {'address': 'Downtown SF'},
            'destination': {'address': 'San Jose Port'},
            'price': 450,
            'distance': '45 mi',
            'weight': 12000,
          },
          {
            'id': 'L2',
            'origin': {'address': 'Oakland'},
            'destination': {'address': 'Sacramento'},
            'price': 800,
            'distance': '85 mi',
            'weight': 24000,
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

    if (loads.isEmpty) {
      return const Center(child: Text("No loads available right now."));
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
            itemCount: loads.length,
            itemBuilder: (context, index) {
              final load = loads[index];
              return LoadCard(load: load, index: index);
            },
          ),
        ),
      ],
    );
  }
}

class LoadCard extends ConsumerWidget {
  final dynamic load;
  final int index;

  const LoadCard({super.key, required this.load, required this.index});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceCapabilities = ref.watch(deviceCapabilitiesProvider);
    final shouldDowngrade = deviceCapabilities.shouldDowngradeUI;

    final price = load['price'] ?? 0;
    final originAddress =
        load['origin']?['address'] ?? load['origin'] ?? 'Unknown Origin';
    final destAddress =
        load['destination']?['address'] ??
        load['destination'] ??
        'Unknown Destination';
    final distance = load['distance'] ?? 'N/A';
    final weight = load['weight'] ?? 'N/A';

    return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
            boxShadow: [
              if (!shouldDowngrade)
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {},
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Theme.of(
                                context,
                              ).colorScheme.primary.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '\$$price',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ),
                          Text(
                            distance.toString(),
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          const Icon(
                            Icons.my_location,
                            color: Colors.blue,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              originAddress,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 9.0),
                        child: Container(
                          width: 2,
                          height: 20,
                          color: Colors.white.withOpacity(0.2),
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            color: Colors.red,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              destAddress,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Weight: $weight',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) =>
                                      TripExecutionScreen(load: load),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                            child: const Text('Accept Load'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        )
        .animate(target: shouldDowngrade ? 0 : 1)
        .fadeIn(delay: Duration(milliseconds: 100 * index))
        .slideY(begin: 0.1, duration: 400.ms, curve: Curves.easeOutQuad);
  }
}
