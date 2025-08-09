import { renderHook, act } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { useRealtime, useRealtimeSubscription } from '../useRealtime';
import { realtimeService } from '../../services/realtimeService';
import type { RealtimeChannelConfig, RealtimePayload } from '../../types/realtime';

// Mock the realtime service
vi.mock('../../services/realtimeService', () => ({
  realtimeService: {
    subscribe: vi.fn(),
    isConnected: vi.fn(),
    getConnectionStatus: vi.fn()
  }
}));

const mockRealtimeService = vi.mocked(realtimeService);

describe('useRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRealtimeService.isConnected.mockReturnValue(true);
    mockRealtimeService.getConnectionStatus.mockReturnValue({
      connected: true,
      channels: 0
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useRealtime());

    expect(result.current.connected).toBe(true);
    expect(result.current.connecting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.subscribe).toBe('function');
    expect(typeof result.current.unsubscribe).toBe('function');
    expect(typeof result.current.reconnect).toBe('function');
  });

  it('should handle subscription correctly', () => {
    const mockUnsubscribe = vi.fn();
    mockRealtimeService.subscribe.mockReturnValue(mockUnsubscribe);

    const { result } = renderHook(() => useRealtime());
    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'project_updates',
      projectId: 'test-project',
      userId: 'test-user'
    };

    act(() => {
      const unsubscribe = result.current.subscribe(config, mockCallback);
      expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(config, mockCallback);
      
      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  it('should initialize with disconnected state when service is disconnected', () => {
    mockRealtimeService.isConnected.mockReturnValue(false);
    mockRealtimeService.getConnectionStatus.mockReturnValue({
      connected: false,
      channels: 0
    });

    const { result } = renderHook(() => useRealtime());

    expect(result.current.connected).toBe(false);
  });

  it('should handle reconnection attempts', () => {
    const { result } = renderHook(() => useRealtime());

    act(() => {
      result.current.reconnect();
    });

    // Should set connecting state during reconnection
    expect(result.current.connecting).toBe(true);
  });

  it('should cleanup subscriptions on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockRealtimeService.subscribe.mockReturnValue(mockUnsubscribe);

    const { result, unmount } = renderHook(() => useRealtime());
    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'project_updates',
      projectId: 'test-project',
      userId: 'test-user'
    };

    act(() => {
      result.current.subscribe(config, mockCallback);
    });

    // Unmount should trigger cleanup
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle multiple subscriptions', () => {
    const mockUnsubscribe1 = vi.fn();
    const mockUnsubscribe2 = vi.fn();
    mockRealtimeService.subscribe
      .mockReturnValueOnce(mockUnsubscribe1)
      .mockReturnValueOnce(mockUnsubscribe2);

    const { result } = renderHook(() => useRealtime());
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();
    const config1: RealtimeChannelConfig = {
      type: 'project_updates',
      projectId: 'test-project-1',
      userId: 'test-user'
    };
    const config2: RealtimeChannelConfig = {
      type: 'work_item_updates',
      projectId: 'test-project-2',
      userId: 'test-user'
    };

    let unsubscribe1: (() => void) | undefined;

    act(() => {
      unsubscribe1 = result.current.subscribe(config1, mockCallback1);
      result.current.subscribe(config2, mockCallback2);
    });

    expect(mockRealtimeService.subscribe).toHaveBeenCalledTimes(2);
    expect(mockRealtimeService.subscribe).toHaveBeenNthCalledWith(1, config1, mockCallback1);
    expect(mockRealtimeService.subscribe).toHaveBeenNthCalledWith(2, config2, mockCallback2);

    // Test individual unsubscribe
    act(() => {
      unsubscribe1?.();
    });

    expect(mockUnsubscribe1).toHaveBeenCalled();
    expect(mockUnsubscribe2).not.toHaveBeenCalled();
  });
});

describe('useRealtimeSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRealtimeService.isConnected.mockReturnValue(true);
  });

  it('should subscribe when config is provided', () => {
    const mockUnsubscribe = vi.fn();
    mockRealtimeService.subscribe.mockReturnValue(mockUnsubscribe);

    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'work_item_updates',
      projectId: 'test-project',
      workItemId: 'test-work-item',
      userId: 'test-user'
    };

    const { unmount } = renderHook(() => 
      useRealtimeSubscription(config, mockCallback)
    );

    expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(
      config,
      expect.any(Function)
    );

    // Test cleanup on unmount
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should not subscribe when config is null', () => {
    const mockCallback = vi.fn();

    renderHook(() => 
      useRealtimeSubscription(null as RealtimeChannelConfig | null, mockCallback)
    );

    expect(mockRealtimeService.subscribe).not.toHaveBeenCalled();
  });

  it('should resubscribe when config changes', () => {
    const mockUnsubscribe1 = vi.fn();
    const mockUnsubscribe2 = vi.fn();
    mockRealtimeService.subscribe
      .mockReturnValueOnce(mockUnsubscribe1)
      .mockReturnValueOnce(mockUnsubscribe2);

    const mockCallback = vi.fn();
    const config1: RealtimeChannelConfig = {
      type: 'work_item_updates',
      projectId: 'test-project-1',
      userId: 'test-user'
    };
    const config2: RealtimeChannelConfig = {
      type: 'work_item_updates',
      projectId: 'test-project-2',
      userId: 'test-user'
    };

    const { rerender } = renderHook(
      ({ config }) => useRealtimeSubscription(config, mockCallback),
      { initialProps: { config: config1 } }
    );

    expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(
      config1,
      expect.any(Function)
    );

    // Change config
    rerender({ config: config2 });

    expect(mockUnsubscribe1).toHaveBeenCalled();
    expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(
      config2,
      expect.any(Function)
    );
  });

  it('should handle callback updates without resubscribing', () => {
    const mockUnsubscribe = vi.fn();
    mockRealtimeService.subscribe.mockReturnValue(mockUnsubscribe);

    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'project_updates',
      projectId: 'test-project',
      userId: 'test-user'
    };

    const { rerender } = renderHook(
      ({ callback }) => useRealtimeSubscription(config, callback),
      { initialProps: { callback: mockCallback1 } }
    );

    expect(mockRealtimeService.subscribe).toHaveBeenCalledTimes(1);

    // Change callback - should not resubscribe
    rerender({ callback: mockCallback2 });

    // Should still only have been called once
    expect(mockRealtimeService.subscribe).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });

  it('should handle config becoming null', () => {
    const mockUnsubscribe = vi.fn();
    mockRealtimeService.subscribe.mockReturnValue(mockUnsubscribe);

    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'project_updates',
      projectId: 'test-project',
      userId: 'test-user'
    };

    // First render with config
    renderHook(() => useRealtimeSubscription(config, mockCallback));
    
    expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(
      config,
      expect.any(Function)
    );

    // Second render with null config
    renderHook(() => useRealtimeSubscription(null, mockCallback));

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should pass through callback parameters correctly', () => {
    const mockUnsubscribe = vi.fn();
    let capturedCallback: ((payload: RealtimePayload<unknown>) => void) | undefined;
    
    mockRealtimeService.subscribe.mockImplementation((_config: RealtimeChannelConfig, callback: (payload: RealtimePayload<unknown>) => void) => {
      capturedCallback = callback;
      return mockUnsubscribe;
    });

    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'project_updates',
      projectId: 'test-project',
      userId: 'test-user'
    };

    renderHook(() => useRealtimeSubscription(config, mockCallback));

    // Simulate a real-time payload
    const testPayload: RealtimePayload<unknown> = {
      eventType: 'UPDATE',
      new: { id: 'test', name: 'Test Project' },
      schema: 'public',
      table: 'projects',
      commit_timestamp: new Date().toISOString()
    };

    act(() => {
      capturedCallback?.(testPayload);
    });

    expect(mockCallback).toHaveBeenCalledWith(testPayload);
  });

  it('should handle config with different properties', () => {
    const mockUnsubscribe = vi.fn();
    mockRealtimeService.subscribe.mockReturnValue(mockUnsubscribe);

    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'sprint_updates',
      projectId: 'test-project',
      sprintId: 'test-sprint',
      userId: 'test-user'
    };

    renderHook(() => useRealtimeSubscription(config, mockCallback));

    expect(mockRealtimeService.subscribe).toHaveBeenCalledWith(
      config,
      expect.any(Function)
    );
  });

  it('should handle dependency array changes', () => {
    const mockUnsubscribe1 = vi.fn();
    const mockUnsubscribe2 = vi.fn();
    mockRealtimeService.subscribe
      .mockReturnValueOnce(mockUnsubscribe1)
      .mockReturnValueOnce(mockUnsubscribe2);

    const mockCallback = vi.fn();
    const config: RealtimeChannelConfig = {
      type: 'work_item_updates',
      projectId: 'test-project',
      workItemId: 'test-work-item-1',
      userId: 'test-user'
    };

    const { rerender } = renderHook(
      ({ deps }) => useRealtimeSubscription(config, mockCallback, deps),
      { initialProps: { deps: ['dep1'] } }
    );

    expect(mockRealtimeService.subscribe).toHaveBeenCalledTimes(1);

    // Change dependencies
    rerender({ deps: ['dep2'] });

    expect(mockUnsubscribe1).toHaveBeenCalled();
    expect(mockRealtimeService.subscribe).toHaveBeenCalledTimes(2);
  });
});