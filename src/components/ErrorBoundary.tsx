/**
 * Catches React errors and shows them on screen for debugging.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null; errorInfo: ErrorInfo | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('App error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Debug: Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Text style={styles.label}>Stack:</Text>
          <Text style={styles.stack} selectable>
            {this.state.error.stack}
          </Text>
          {this.state.errorInfo && (
            <>
              <Text style={styles.label}>Component stack:</Text>
              <Text style={styles.stack} selectable>
                {this.state.errorInfo.componentStack}
              </Text>
            </>
          )}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '700', color: '#c62828', marginBottom: 8 },
  message: { fontSize: 16, color: '#333', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 12 },
  stack: { fontSize: 11, color: '#444', fontFamily: 'monospace', marginTop: 4 },
});
