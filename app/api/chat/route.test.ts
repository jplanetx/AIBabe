// Global mock for 'openai' to catch rogue `new OpenAI()` calls
// This should be at the VERY TOP of the file.
jest.mock('openai', () => {
  const mockCreateMethod = jest.fn().mockResolvedValue({
    choices: [{ message: { content: 'globally mocked OpenAI response from general mock factory' } }]
  });
  
  const MockedOpenAIClass = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreateMethod
      }
    }
  }));

  // Attach a way to access the internal mockCreateMethod
  (MockedOpenAIClass as any)._getGlobalMockCreateMethod = () => mockCreateMethod;

  return MockedOpenAIClass; // This becomes the default export
});
// Revised mocking strategy for openaiClient to avoid hoisting issues

// Revised mocking strategy for openaiClient to ensure tests control the correct mock instance.
// The mock factory for jest.mock() cannot access out-of-scope variables directly.
// So, we create the mock function inside the factory and provide a way to access it.

jest.mock('@/lib/openaiClient', () => {
  // This function is created when the mock factory runs (due to hoisting).
  const actualMockCreateInstance = jest.fn();
  return {
    __esModule: true,
    getOpenAIClient: () => ({ // This is what the SUT calls
      chat: {
        completions: {
          create: actualMockCreateInstance, // SUT uses this instance
        },
      },
    }),
    // Provide a way for tests to get a reference to this specific mock instance
    _getActualMockCreateInstance: () => actualMockCreateInstance,
  };
});

// IMPORTS - Order can be important. SUT and its dependencies should see mocks.
import { NextRequest, NextResponse } from 'next/server';
// Import the SUT; it will receive the mocked version of getOpenAIClient
import { POST, GET } from '@/app/api/chat/route';

// No longer need to import getOpenAIClient from '@/lib/openaiClient' for manual mocking setup here.
// The SUT will get the version from the jest.mock factory above.

// Other imports follow
import { db } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { Conversation, Message } from '@prisma/client'; 
import OriginalOpenAI from 'openai'; 

// Mock 'ai' package with more robust implementations
jest.mock('ai', () => {
  const createReadableStreamFromAsyncIterator = (iterator: AsyncIterable<any>, callbacks?: { onCompletion?: (fullCompletion: string) => Promise<void> | void }) => {
    let fullContent = '';
    return new ReadableStream({
      async start(controller) {
        try {
          if (iterator && typeof iterator[Symbol.asyncIterator] === 'function') {
            for await (const chunk of iterator) {
              const content = chunk?.choices?.[0]?.delta?.content || '';
              fullContent += content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
          }
          if (callbacks?.onCompletion) {
            await callbacks.onCompletion(fullContent);
          }
        } catch (err) {
          // console.error('Mock OpenAIStream: error in start', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });
  };

  return {
    OpenAIStream: jest.fn((stream, callbacks) => createReadableStreamFromAsyncIterator(stream, callbacks)),
    StreamingTextResponse: jest.fn((stream) => {
      // Ensure Response is available (it should be in JSDOM for Next.js tests)
      if (typeof Response !== 'undefined') {
        return new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }
      // Fallback minimal mock if Response is not defined (should not happen in JSDOM)
      return { 
        status: 200, 
        headers: { 'Content-Type': 'text/event-stream' }, 
        body: stream, 
        async text() { return "mock stream text fallback"; } 
      } as any;
    }),
  };
});

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('@/lib/db', () => {
  const mockConversationFindFirst = jest.fn();
  const mockConversationCreate = jest.fn();
  const mockConversationUpdate = jest.fn();
  const mockConversationFindMany = jest.fn();
  const mockMessageCreate = jest.fn();
  const mockGirlfriendFindUnique = jest.fn();

  return {
    __esModule: true, 
    db: {
      conversation: {
        findFirst: mockConversationFindFirst,
        create: mockConversationCreate,
        update: mockConversationUpdate,
        findMany: mockConversationFindMany,
      },
      message: {
        create: mockMessageCreate,
      },
      girlfriend: {
        findUnique: mockGirlfriendFindUnique,
      },
      _mockFunctions: { 
        mockConversationFindFirst,
        mockConversationCreate,
        mockConversationUpdate,
        mockConversationFindMany,
        mockMessageCreate,
        mockGirlfriendFindUnique,
      }
    },
  };
});

jest.mock('@/lib/chatUtils', () => {
  const originalModule = jest.requireActual('@/lib/chatUtils');
  return {
    __esModule: true,
    ...originalModule,
    getPersonaDetails: jest.fn(() => Promise.resolve({ id: 'default-persona-id', name: 'Default Persona from Mock Factory', traits: ['default'] })),
    analyzeSentiment: jest.fn(() => Promise.resolve('neutral')),
    getRelevantMemory: jest.fn(() => Promise.resolve([])),
    saveMessage: jest.fn((userId: string, conversationId: string, content: string, isUserMessage: boolean) => Promise.resolve({
      id: `msg-${Date.now()}`,
      conversationId,
      content,
      isUserMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
});

jest.mock('@/lib/llm_service', () => {
  const originalModule = jest.requireActual('@/lib/llm_service');
  return {
    __esModule: true,
    ...originalModule, // Use original implementations by default
    // getChatCompletion: originalModule.getChatCompletion, // Explicitly use original, or let spread handle it
    createPersonaPrompt: jest.fn((name, traits, context) => `System Prompt: You are ${name}. Traits: ${traits.join(', ')}. Context: ${context}`), // Keep this one specifically mocked
  };
});

jest.mock('@/lib/vector_db', () => ({
  ingestMessageToVectorDB: jest.fn().mockResolvedValue(undefined),
}));


const mockSupabase = createServerClient as jest.Mock;
// Import the whole module to allow spying on its methods
import * as chatUtils from '@/lib/chatUtils';
import type { Persona } from '@/lib/chatUtils'; // ADDED Persona type import
const { getChatCompletion } = jest.requireMock('@/lib/llm_service') as jest.Mocked<typeof import('@/lib/llm_service')>;

const mockedDb = db as unknown as {
  conversation: {
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findMany: jest.Mock;
  };
  message: {
    create: jest.Mock;
  };
  girlfriend: {
    findUnique: jest.Mock;
  };
  _mockFunctions: { 
    mockConversationFindFirst: jest.Mock;
    mockConversationCreate: jest.Mock;
  };
};


describe('/api/chat POST', () => {
  let mockRequest: NextRequest;
  let mockCreateFn: jest.Mock; // For non-streaming OpenAI calls (via global 'openai' mock)
  let streamingPathMockCreateFn: jest.Mock; // For streaming OpenAI calls (via '@/lib/openaiClient' mock)
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSession = { user: mockUser, expires_at: Date.now() + 3600000, access_token: 'token', refresh_token: 'refresh' };

  beforeEach(() => {
    jest.clearAllMocks(); 
        
    // Dynamically get the mock instance for chat.completions.create
    // This ensures we are interacting with the exact mock instance the SUT will use.
    
    // The SUT (`@/app/api/chat/route`) imports `getOpenAIClient` from `'@/lib/openaiClient'`.
    // If lib/llm_service.ts uses its own `new OpenAI()`, we need to target that mock.
    
    const MockedOpenAI = jest.requireMock('openai');
    // Access the exposed mock create method from the globally mocked OpenAI class
    mockCreateFn = (MockedOpenAI as any)._getGlobalMockCreateMethod();

    mockCreateFn.mockClear(); // This is for the global 'openai' mock
    mockCreateFn.mockResolvedValue({ choices: [{ message: { content: 'response from mockCreateFn in beforeEach (global path)' } }] });

    // Get the mock for the streaming path from the '@/lib/openaiClient' mock
    const openAIClientModuleMock = jest.requireMock('@/lib/openaiClient');
    // Retrieve the actual mock instance created within the factory
    streamingPathMockCreateFn = openAIClientModuleMock._getActualMockCreateInstance();
    
    // Reset and provide a default implementation for this mock before each test
    streamingPathMockCreateFn.mockClear().mockResolvedValue({
      choices: [{ message: { content: 'Default mock response from _getActualMockCreateInstance for @/lib/openaiClient (non-streaming)' } }],
      // Provide a default async iterator for streaming tests as well
      [Symbol.asyncIterator]: async function*() {
        yield { choices: [{ delta: { content: 'default stream chunk from _getActualMockCreateInstance' } }] };
      }
    });

    mockedDb.conversation.findFirst.mockReset();
    mockedDb.conversation.create.mockReset();
    mockedDb.conversation.update.mockReset();
    mockedDb.conversation.findMany.mockReset();
    mockedDb.message.create.mockReset();
    mockedDb.girlfriend.findUnique.mockReset();

    // Default mocks are now set in the factory, but can be overridden here if needed for all tests in describe block
    // For instance, if a common persona is used across many tests:
    // Revert to allowing the module factory mock to provide the default for getPersonaDetails.
    // Individual tests will use spyOn for specific overrides.
    // jest.spyOn(chatUtils, 'getPersonaDetails').mockResolvedValue({ id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] });
    (chatUtils.getPersonaDetails as jest.Mock).mockResolvedValue({ id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] }); // Default from factory
    jest.spyOn(chatUtils, 'analyzeSentiment').mockResolvedValue('neutral'); // Keep spy for this as it's consistently overridden
    jest.spyOn(chatUtils, 'getRelevantMemory').mockResolvedValue([]);
    jest.spyOn(chatUtils, 'saveMessage').mockImplementation(async (userId: string, conversationId: string, content: string, isUserMessage: boolean, prismaInstance: any): Promise<Message> => ({
      id: isUserMessage ? 'user-msg-id' : 'ai-msg-id',
      conversationId,
      content,
      isUserMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Message));
    // (getChatCompletion as jest.Mock).mockResolvedValue('Mocked AI reply'); // Removed: We want the actual getChatCompletion to run
    
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      },
    });
    
    mockedDb.conversation.create.mockImplementation(async (args: { data: any }): Promise<Conversation> => ({
        id: 'new-conv-id',
        userId: args.data.userId,
        girlfriendId: args.data.girlfriendId,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Conversation));

    mockedDb.conversation.findFirst.mockResolvedValue({
        id: 'existing-conv-id',
        userId: mockUser.id,
        girlfriendId: 'persona-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Conversation);
    mockedDb.conversation.update.mockResolvedValue({} as Conversation);
  });

it('should correctly initialize and provide access to the global OpenAI mockCreateMethod', () => {
    // This test specifically verifies that the _getGlobalMockCreateMethod
    // on the globally mocked 'openai' module is accessible and returns a valid Jest mock function.
    // This is crucial for preventing hoisting-related ReferenceErrors.

    const MockedOpenAI = jest.requireMock('openai');
    expect(MockedOpenAI._getGlobalMockCreateMethod).toBeDefined();
    expect(typeof MockedOpenAI._getGlobalMockCreateMethod).toBe('function');

    const retrievedMockCreateFn = (MockedOpenAI as any)._getGlobalMockCreateMethod();
    expect(retrievedMockCreateFn).toBeDefined();
    
    // Verify it's a Jest mock function by checking for the .mock property
    expect(retrievedMockCreateFn.mock).toBeDefined();
    expect(typeof retrievedMockCreateFn.mock.calls).toBe('object'); // .calls is an array on a Jest mock

    // Ensure it can be called without throwing an immediate ReferenceError due to initialization problems.
    // The beforeEach for this describe block would have already run and potentially set a resolved value.
    // The key here is that the function itself is accessible and behaves like a mock.
    expect(async () => {
      await retrievedMockCreateFn({ messages: [{ role: 'user', content: 'test call from mock verification test' }] });
    }).not.toThrow();

    // Further check if it's the same instance as the one set up in beforeEach,
    // which implies it's correctly shared and initialized.
    expect(retrievedMockCreateFn).toBe(mockCreateFn); 
  });
  const createMockRequest = (body: any, searchParams?: Record<string, string>) => {
    const url = new URL('http://localhost/api/chat');
    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
    }
    // Ensure essential fields for new conversations are present if not explicitly provided
    const requestBody = {
      characterId: 'default-char-id-for-new-conv', // Default if not testing specific character
      ...body
    };
    return new NextRequest(url.toString(), {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  it('should return 401 if user is unauthenticated', async () => {
    mockSupabase.mockReturnValueOnce({
      auth: {
        getSession: jest.fn().mockResolvedValueOnce({ data: { session: null }, error: null }),
      },
    });
    mockRequest = createMockRequest({ message: 'Hello' });
    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized - Please log in');
  });

  it('should return 500 if session check fails', async () => {
    mockSupabase.mockReturnValueOnce({
      auth: {
        getSession: jest.fn().mockResolvedValueOnce({ data: { session: null }, error: { message: 'Session error', name: 'AuthSessionError', status: 500 } }),
      },
    });
    mockRequest = createMockRequest({ message: 'Hello' });
    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Authentication error');
  });
  
  it('should call analyzeSentiment and getRelevantMemory', async () => {
    mockRequest = createMockRequest({ message: 'Test message', characterId: 'persona-1', conversationId: 'existing-conv-id' });
    await POST(mockRequest);
    expect(chatUtils.analyzeSentiment).toHaveBeenCalledWith('Test message');
    expect(chatUtils.getRelevantMemory).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'Test message');
  });

  it('should construct system prompt with persona and empathy note for negative sentiment', async () => {
    // This spy needs to cover the call for 'lily-id' (from request)
    // AND potentially for 'new-conv-id's girlfriendId if it differs after creation.
    // The SUT calls getPersonaDetails(characterId) then getPersonaDetails(conversation.girlfriendId)
    // For a new conversation, conversation.girlfriendId becomes the ID from the first call.
    // So, one mock for the specific characterId should suffice.
    jest.spyOn(chatUtils, 'getPersonaDetails').mockImplementation(async (characterId?: string) => {
      if (characterId === 'lily-id') {
        return { id: 'lily-id', name: 'Lily', traits: ['witty', 'companion'] } as Persona;
      }
      // Fallback for the second call if conversation.girlfriendId is different or for other tests
      if (characterId === 'persona-1') { // Default ID from beforeEach if new conv was created with it
        return { id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] } as Persona;
      }
      return { id: 'default-fallback-id', name: 'Default Fallback Persona', traits: ['fallback'] } as Persona;
    });
    jest.spyOn(chatUtils, 'analyzeSentiment').mockResolvedValueOnce('negative');
    
    mockRequest = createMockRequest({ message: 'I am sad', characterId: 'lily-id', conversationId: 'new-conv-for-lily' });
    await POST(mockRequest);
    
    expect(streamingPathMockCreateFn).toHaveBeenCalled();
    const messagesArg = streamingPathMockCreateFn.mock.calls[0][0].messages;
    const systemMessage = messagesArg.find((m: any) => m.role === 'system');
    expect(systemMessage.content).toContain('You are Lily. Traits: witty, companion.');
    expect(systemMessage.content).toContain('Remember to be extra understanding and empathetic.');
  });

  it('should construct system prompt without empathy note for non-negative sentiment', async () => {
    jest.spyOn(chatUtils, 'getPersonaDetails').mockImplementation(async (characterId?: string) => {
      if (characterId === 'persona-neutral-test') { // Use a distinct characterId for this test
        return { id: 'persona-neutral-test', name: 'Neutral Persona', traits: ['neutral'] } as Persona;
      }
      if (characterId === 'persona-1') {
        return { id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] } as Persona;
      }
      return { id: 'default-fallback-id', name: 'Default Fallback Persona', traits: ['fallback'] } as Persona;
    });
    jest.spyOn(chatUtils, 'analyzeSentiment').mockResolvedValueOnce('neutral');
    
    mockRequest = createMockRequest({ message: 'Neutral message', characterId: 'persona-neutral-test', conversationId: 'new-conv-neutral' });
    await POST(mockRequest);
    
    expect(streamingPathMockCreateFn).toHaveBeenCalled();
    const messagesArg = streamingPathMockCreateFn.mock.calls[0][0].messages;
    const systemMessage = messagesArg.find((m: any) => m.role === 'system');
    expect(systemMessage.content).toContain('You are Neutral Persona. Traits: neutral.');
    expect(systemMessage.content).not.toContain('Remember to be extra understanding and empathetic.');
  });

  it('should assemble messages for LLM in correct order', async () => {
    jest.spyOn(chatUtils, 'getPersonaDetails').mockImplementation(async (characterId?: string) => {
      if (characterId === 'order-bot-id') {
        return { id: 'order-bot-id', name: 'OrderBot', traits: ['orderly'] } as Persona;
      }
      if (characterId === 'persona-1') {
        return { id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] } as Persona;
      }
      return { id: 'default-fallback-id', name: 'Default Fallback Persona', traits: ['fallback'] } as Persona;
    });
    jest.spyOn(chatUtils, 'analyzeSentiment').mockResolvedValueOnce('positive');
    jest.spyOn(chatUtils, 'getRelevantMemory').mockResolvedValueOnce(['Memory: foo', 'Memory: bar']);
    
    mockRequest = createMockRequest({ message: 'User input', characterId: 'order-bot-id', conversationId: 'new-conv-order' });
    await POST(mockRequest);
    
    expect(streamingPathMockCreateFn).toHaveBeenCalled();
    const messagesArg = streamingPathMockCreateFn.mock.calls[0][0].messages;
    expect(messagesArg.length).toBe(4);
    expect(messagesArg[0].role).toBe('system');
    expect(messagesArg[0].content).toContain('You are OrderBot. Traits: orderly.');
    expect(messagesArg[1].role).toBe('system');
    expect(messagesArg[1].content).toBe('Memory: foo');
    expect(messagesArg[2].role).toBe('system');
    expect(messagesArg[2].content).toBe('Memory: bar');
    expect(messagesArg[3].role).toBe('user');
    expect(messagesArg[3].content).toBe('User input');
  });

  it('should call LLM and extract reply for non-streaming', async () => {
    // This test was checking getChatCompletion from llm_service.
    // Now, with the direct openaiClient mock (streamingPathMockCreateFn), we expect it to be called
    // and its resolved value to be processed by the SUT for non-streaming too.
    streamingPathMockCreateFn.mockResolvedValueOnce({ choices: [{ message: { content: 'Extracted AI reply' } }] });
    mockRequest = createMockRequest({ message: 'Query', characterId: 'persona-1', stream: false, conversationId: 'new-conv-query' }); // ensure non-streaming
    const response = await POST(mockRequest);
    const json = await response.json();
    expect(streamingPathMockCreateFn).toHaveBeenCalled();
    expect(json.data.reply).toBe('Extracted AI reply');
  });

  it('should save user and AI messages', async () => {
    // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
    // The non-streaming path now uses streamingPathMockCreateFn.
    // Its default in beforeEach is: 'Default mock response from _getActualMockCreateInstance for @/lib/openaiClient (non-streaming)'
    streamingPathMockCreateFn.mockResolvedValueOnce({ choices: [{ message: { content: 'AI response for save test' } }] });
    mockRequest = createMockRequest({ message: 'Persist me', characterId: 'persona-1', stream: false, conversationId: 'new-conv-persist' });
    await POST(mockRequest);
    expect(chatUtils.saveMessage).toHaveBeenCalledTimes(2);
    expect(chatUtils.saveMessage).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'Persist me', true, db);
    expect(chatUtils.saveMessage).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'AI response for save test', false, db);
  });
  
  it('should return JSON response for non-streaming requests', async () => {
    // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
    // The non-streaming path now uses streamingPathMockCreateFn.
    streamingPathMockCreateFn.mockResolvedValueOnce({ choices: [{ message: { content: 'AI response for JSON test' } }] });
    mockRequest = createMockRequest({ message: 'Non-stream test', characterId: 'persona-1', stream: false, conversationId: 'new-conv-nonstream' });
    const response = await POST(mockRequest);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.reply).toBe('AI response for JSON test');
  });

  describe('Streaming', () => {
    beforeEach(() => {
      // Specific mock for streaming tests, targeting the correct mock instance
      const mockStreamData = {
        [Symbol.asyncIterator]: async function*() {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world' } }] };
        }
      };
      streamingPathMockCreateFn.mockResolvedValue(mockStreamData as any);
    });
    
    it('should return StreamingTextResponse for streaming requests', async () => {
      // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
      mockRequest = createMockRequest({ message: 'Stream test', characterId: 'persona-1', conversationId: 'new-conv-stream' }, { stream: 'true' });
      const response = await POST(mockRequest);
      
      const { StreamingTextResponse: StreamingTextResponseMock } = jest.requireMock('ai');
      expect(StreamingTextResponseMock).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      // expect(actualMockGetOpenAIClient).toHaveBeenCalled(); // No longer relevant with new mock
      expect(streamingPathMockCreateFn).toHaveBeenCalled();
    });
  
    it('should save AI message after streaming is complete', async () => {
      // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
      // The global mock for OpenAIStream in jest.mock('ai',...) should now handle onCompletion.
      // The beforeEach for streaming sets up mockCompletionsCreate to return mockStreamData
      mockRequest = createMockRequest({ message: 'Stream and save', characterId: 'persona-1', conversationId: 'new-conv-streamsave' }, { stream: 'true' });
      await POST(mockRequest);
      
      await new Promise(resolve => setImmediate(resolve)); // Allow microtasks (like onCompletion) to run
      
      expect(chatUtils.saveMessage).toHaveBeenCalledTimes(2);
      expect(chatUtils.saveMessage).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'Hello world', false, db); // Content from mockStreamData
      expect(streamingPathMockCreateFn).toHaveBeenCalled();
    });
  });


  it('should return 500 for generic errors', async () => {
    // analyzeSentiment is called before getPersonaDetails in the SUT's try block
    jest.spyOn(chatUtils, 'analyzeSentiment').mockResolvedValueOnce('neutral'); // Ensure it doesn't reject by default
    jest.spyOn(chatUtils, 'getPersonaDetails').mockRejectedValueOnce(new Error('Generic error'));
    mockRequest = createMockRequest({ message: 'Error test', characterId: 'persona-error-test', conversationId: 'new-conv-errortest' });
    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to process message. Please try again.');
  });

  it('should return 502 if LLM call fails (non-streaming)', async () => {
    // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
    streamingPathMockCreateFn.mockClear().mockRejectedValueOnce(new Error('LLM connection failed'));
    mockRequest = createMockRequest({ message: 'LLM error test', characterId: 'persona-llm-error', stream: false, conversationId: 'new-conv-llmerror' }); // ensure non-streaming
    const response = await POST(mockRequest);
    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.error).toBe('AI service temporarily unavailable. Please try again.');
  });
  
  it('should default to neutral sentiment and empty memory if fetching them fails', async () => {
    jest.spyOn(chatUtils, 'getPersonaDetails').mockResolvedValueOnce({ id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] }); // Ensure getPersonaDetails doesn't fail
    jest.spyOn(chatUtils, 'analyzeSentiment').mockRejectedValueOnce(new Error('Sentiment API down'));
    jest.spyOn(chatUtils, 'getRelevantMemory').mockRejectedValueOnce(new Error('Memory DB down'));
    mockRequest = createMockRequest({ message: 'Fallback test', characterId: 'persona-fallback', conversationId: 'new-conv-fallback' });
    await POST(mockRequest);
    expect(streamingPathMockCreateFn).toHaveBeenCalled();
    const messagesArg = streamingPathMockCreateFn.mock.calls[0][0].messages;
    const systemMessage = messagesArg.find((m: any) => m.role === 'system');
    expect(systemMessage.content).not.toContain('Remember to be extra understanding and empathetic.');
    expect(messagesArg.filter((m:any) => m.role === 'system' && m.content.startsWith('Memory:')).length).toBe(0);
  });
});

describe('/api/chat GET', () => {
    let mockRequest: NextRequest;
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser, expires_at: Date.now() + 3600000, access_token: 'token', refresh_token: 'refresh' };

    beforeEach(() => {
        jest.clearAllMocks();
        // actualMockGetOpenAIClient.mockReturnValue(mockOpenAIInstanceForChatRoute); // Removed: These variables are no longer defined globally
        mockedDb.conversation.findMany.mockReset();

        mockSupabase.mockReturnValue({
          auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
          },
        });
        mockedDb.conversation.findMany.mockResolvedValue([ 
            { id: 'conv1', userId: mockUser.id, girlfriendId: 'gf1', createdAt: new Date(), updatedAt: new Date(), messages: [{id: 'm1', content: 'Hi', isUserMessage:true, createdAt: new Date(), updatedAt: new Date(), conversationId: 'conv1'}], _count: {messages: 1} } as any
        ]);
         mockRequest = new NextRequest('http://localhost/api/chat', { method: 'GET' });
    });

    it('should return 401 if unauthenticated', async () => {
        mockSupabase.mockReturnValueOnce({
          auth: {
            getSession: jest.fn().mockResolvedValueOnce({ data: { session: null }, error: null }),
          },
        });
        const response = await GET(mockRequest);
        expect(response.status).toBe(401);
    });

    it('should return chat history if authenticated', async () => {
        const response = await GET(mockRequest);
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.data.length).toBe(1);
        expect(json.data[0].id).toBe('conv1');
    });
});