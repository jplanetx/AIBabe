import fetch from 'node-fetch';

global.fetch = fetch;

jest.mock('./lib/prismaClient', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
  })),
}));