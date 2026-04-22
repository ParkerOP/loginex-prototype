import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../auth/domain/auth_state.dart';

class ShipperDashboard extends ConsumerWidget {
  const ShipperDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Active Loads').animate().fadeIn().slideX(),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          )
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

class ShipperActiveLoadsView extends StatelessWidget {
  const ShipperActiveLoadsView({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 2, // Dummy count
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.3)),
            boxShadow: [
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
                        Text('Load #$index', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                        const SizedBox(height: 4),
                        const Text('IN TRANSIT', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.local_shipping, color: Colors.blue),
                    ).animate(onPlay: (controller) => controller.repeat(reverse: true))
                     .scaleXY(end: 1.1, duration: 1.seconds),
                  ],
                ),
              ),
              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  border: Border.symmetric(horizontal: BorderSide(color: Colors.white.withOpacity(0.05))),
                ),
                child: const Center(
                  child: Text('Live Map View', style: TextStyle(color: Colors.white54)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    const Icon(Icons.person, color: Colors.white54),
                    const SizedBox(width: 8),
                    const Text('Driver: John D.', style: TextStyle(fontWeight: FontWeight.w500)),
                    const Spacer(),
                    TextButton(
                      onPressed: () {},
                      child: const Text('View Details'),
                    )
                  ],
                ),
              ),
            ],
          ),
        ).animate()
         .fadeIn(delay: Duration(milliseconds: 200 * index))
         .slideY(begin: 0.2);
      },
    );
  }
}
