import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/domain/auth_state.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/driver/presentation/driver_dashboard.dart';
import 'features/shipper/presentation/shipper_dashboard.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Configure default animation duration for flutter_animate
  Animate.defaultDuration = const Duration(milliseconds: 600);

  runApp(const ProviderScope(child: LogineXApp()));
}

class LogineXApp extends ConsumerWidget {
  const LogineXApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'LogineX',
      theme: AppTheme.darkTheme, // Force dark theme for investor-ready look
      home: const RootNavigator(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class RootNavigator extends ConsumerWidget {
  const RootNavigator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 800),
      transitionBuilder: (Widget child, Animation<double> animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position:
                Tween<Offset>(
                  begin: const Offset(0, 0.1),
                  end: Offset.zero,
                ).animate(
                  CurvedAnimation(
                    parent: animation,
                    curve: Curves.easeOutCubic,
                  ),
                ),
            child: child,
          ),
        );
      },
      child: _buildScreen(authState),
    );
  }

  Widget _buildScreen(AuthState state) {
    if (!state.isAuthenticated) {
      return const LoginScreen(key: ValueKey('login'));
    }

    if (state.role == UserRole.driver) {
      return const DriverDashboard(key: ValueKey('driver'));
    } else {
      return const ShipperDashboard(key: ValueKey('shipper'));
    }
  }
}
