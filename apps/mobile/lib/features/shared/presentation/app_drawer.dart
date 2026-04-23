import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/domain/auth_state.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../trips/presentation/my_trips_screen.dart';
import '../../billing/presentation/billing_screen.dart';
import '../../earnings/presentation/earnings_screen.dart';
import '../../drivers/presentation/drivers_screen.dart';

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isDriver =
        authState.role.toString().split('.').last == 'DRIVER' ||
        authState.role.toString() == 'UserRole.DRIVER';

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Icon(Icons.local_shipping, size: 48, color: Colors.white),
                SizedBox(height: 16),
                Text(
                  'LogineX',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Profile'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              );
            },
          ),
          if (isDriver) ...[
            ListTile(
              leading: const Icon(Icons.route),
              title: const Text('My Trips'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MyTripsScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.monetization_on),
              title: const Text('Earnings'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EarningsScreen()),
                );
              },
            ),
          ] else ...[
            ListTile(
              leading: const Icon(Icons.receipt),
              title: const Text('Billing'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const BillingScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Drivers'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DriversScreen()),
                );
              },
            ),
          ],
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Logout'),
            onTap: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
    );
  }
}
