import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/features/auth/domain/auth_state.dart';

void main() {
  test('Initial AuthState is not authenticated', () {
    final state = AuthState();
    expect(state.isAuthenticated, false);
    expect(state.role, UserRole.none);
    expect(state.userId, null);
  });
}
