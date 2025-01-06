import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from '../shared/supabase/supabase.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const supabaseServiceMock = { getClient: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access token when credentials match', async () => {
    const token = '132456789';
    const authTokenResponseData = {
      data: { session: { access_token: token } },
    };

    supabaseServiceMock.getClient.mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue(authTokenResponseData),
      },
    });

    const { access_token } = await service.signIn('test', 'test');
    expect(access_token).toEqual(token);
  });

  it('should return new access token when refreshing token', async () => {
    const token = '132456789';
    const authTokenResponseData = {
      data: { session: { access_token: token } },
    };

    supabaseServiceMock.getClient.mockReturnValue({
      auth: {
        refreshSession: jest.fn().mockResolvedValue(authTokenResponseData),
      },
    });

    const { access_token } = await service.refreshSession('refresh_token');
    expect(access_token).toEqual(token);
  });

  it('should throw UnauthorizedException when credentials do not match', async () => {
    const authTokenResponseData = {
      error: { message: 'Invalid credentials' },
    };

    supabaseServiceMock.getClient.mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue(authTokenResponseData),
      },
    });

    await expect(service.signIn('test', 'test')).rejects.toThrowError(
      UnauthorizedException,
    );
  });
});
