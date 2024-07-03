import { Module } from '@nestjs/common';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseStrategy } from './supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [PassportModule],
  providers: [SupabaseStrategy, SupabaseGuard, SupabaseService],
  exports: [SupabaseStrategy, SupabaseGuard, SupabaseService],
})
export class SupabaseModule {}
