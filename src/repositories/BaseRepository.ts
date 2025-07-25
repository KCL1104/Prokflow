import { supabase } from '../lib/supabase';
import { handleSupabaseError, NotFoundError } from '../utils/errors';

// Base repository class with common CRUD operations
// Note: Currently disabled due to TypeScript issues with generic table names
// TODO: Refactor to use specific table types or implement proper type mapping
export abstract class BaseRepository<T extends Record<string, any>> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Create a new record
  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await (supabase as any)
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `Creating ${this.tableName}`);
      }

      return result as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Creating ${this.tableName}`);
    }
  }

  // Get a record by ID
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error, `Finding ${this.tableName} by ID`);
      }

      return data as T | null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Finding ${this.tableName} by ID`);
    }
  }

  // Get a record by ID or throw error if not found
  async findByIdOrThrow(id: string): Promise<T> {
    const result = await this.findById(id);
    if (!result) {
      throw new NotFoundError(this.tableName, id);
    }
    return result;
  }

  // Update a record by ID
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `Updating ${this.tableName}`);
      }

      if (!result) {
        throw new NotFoundError(this.tableName, id);
      }

      return result as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Updating ${this.tableName}`);
    }
  }

  // Delete a record by ID
  async delete(id: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, `Deleting ${this.tableName}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Deleting ${this.tableName}`);
    }
  }

  // Find records with conditions
  async findWhere(conditions: Partial<T>, options?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    try {
      let query = (supabase as any).from(this.tableName).select('*');

      // Apply conditions
      Object.entries(conditions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, `Finding ${this.tableName} with conditions`);
      }

      return (data || []) as T[];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Finding ${this.tableName} with conditions`);
    }
  }

  // Count records with conditions
  async count(conditions?: Partial<T>): Promise<number> {
    try {
      let query = (supabase as any).from(this.tableName).select('*', { count: 'exact', head: true });

      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        handleSupabaseError(error, `Counting ${this.tableName}`);
      }

      return count || 0;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Counting ${this.tableName}`);
    }
  }

  // Check if record exists
  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result !== null;
  }

  // Batch create records
  async createMany(records: Partial<T>[]): Promise<T[]> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .insert(records as any[])
        .select();

      if (error) {
        handleSupabaseError(error, `Batch creating ${this.tableName}`);
      }

      return (data || []) as T[];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Batch creating ${this.tableName}`);
    }
  }

  // Execute raw SQL query (use with caution)
  protected async executeRpc(functionName: string, params?: Record<string, any>): Promise<any> {
    try {
      const { data, error } = await (supabase as any).rpc(functionName, params);

      if (error) {
        handleSupabaseError(error, `Executing RPC ${functionName}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleSupabaseError(error, `Executing RPC ${functionName}`);
    }
  }
}