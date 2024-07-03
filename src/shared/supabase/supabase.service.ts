import { Injectable, Logger, Scope } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  getClient() {
    if (this.supabaseClient) {
      this.logger.log('Supabase client already created');
      return this.supabaseClient;
    }

    this.supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      },
    );

    return this.supabaseClient;
  }
}
