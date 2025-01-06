import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authServiceMock = {
    signIn: jest.fn(),
    refreshSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('test method should return true', async () => {
    expect(controller.test).toBeDefined();

    expect(await controller.test()).toEqual(true);
  });

  it('should login and return token', async () => {
    const responseData = {
      access_token: '123456798',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 1720217827,
      refresh_token: '12345',
    };

    authServiceMock.signIn.mockReturnValue(responseData);

    expect(
      await controller.signIn({ email: 'email@email.com', password: '132456' }),
    ).toEqual(responseData);
  });

  it('should refresh token and return it', async () => {
    const responseData = {
      access_token: '123456798',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 1720217827,
      refresh_token: '12345',
    };

    authServiceMock.refreshSession.mockReturnValue(responseData);

    expect(
      await controller.refreshSession({ refreshToken: '123456789' }),
    ).toEqual(responseData);
  });
});
