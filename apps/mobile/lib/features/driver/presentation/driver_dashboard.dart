import "trip_execution_screen.dart";
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../auth/domain/auth_state.dart';

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
          )
        ],
      ),
      body: const LoadDiscoveryView(),
    );
  }
}

class LoadDiscoveryView extends StatefulWidget {
  const LoadDiscoveryView({super.key});

  @override
  State<LoadDiscoveryView> createState() => _LoadDiscoveryViewState();
}

class _LoadDiscoveryViewState extends State<LoadDiscoveryView> {
  // Dummy data for prototype
  final List<Map<String, dynamic>> loads = [
    {
      'id': 'L1',
      'origin': 'Downtown SF',
      'destination': 'San Jose Port',
      'price': 450,
      'distance': '45 mi',
      'weight': '12k lbs',
    },
    {
      'id': 'L2',
      'origin': 'Oakland',
      'destination': 'Sacramento',
      'price': 800,
      'distance': '85 mi',
      'weight': '24k lbs',
    },
    {
      'id': 'L3',
      'origin': 'San Mateo',
      'destination': 'Palo Alto',
      'price': 200,
      'distance': '15 mi',
      'weight': '5k lbs',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: loads.length,
      itemBuilder: (context, index) {
        final load = loads[index];
        return LoadCard(load: load, index: index);
      },
    );
  }
}

class LoadCard extends StatelessWidget {
  final Map<String, dynamic> load;
  final int index;

  const LoadCard({super.key, required this.load, required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        boxShadow: [
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
            onTap: () {
              // Show details modal
            },
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '\$${load['price']}',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ),
                      Text(
                        load['distance'],
                        style: TextStyle(color: Colors.white.withOpacity(0.5)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const Icon(Icons.my_location, color: Colors.blue, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          load['origin'],
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
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
                      const Icon(Icons.location_on, color: Colors.red, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          load['destination'],
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Weight: ${load['weight']}',
                        style: TextStyle(color: Colors.white.withOpacity(0.7)),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).push(MaterialPageRoute(builder: (_) => TripExecutionScreen(load: load)));
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
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
    ).animate()
     .fadeIn(delay: Duration(milliseconds: 100 * index))
     .slideY(begin: 0.1, duration: 400.ms, curve: Curves.easeOutQuad);
  }
}
