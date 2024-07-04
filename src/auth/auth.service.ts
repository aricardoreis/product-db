import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../shared/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signIn(email: string, pass: string): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password: pass });

    if (error) {
      throw new UnauthorizedException();
    }

    const { access_token, expires_in, expires_at, refresh_token, token_type } =
      data.session;

    return { access_token, token_type, expires_in, expires_at, refresh_token };
  }
}
