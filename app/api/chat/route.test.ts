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

jest.mock('@/lib/openaiClient', () => ({
  __esModule: true,
  getOpenAIClient: () => ({ // This function is returned when SUT calls getOpenAIClient()
    chat: {
      completions: {
        // The factory for jest.mock runs before other code in the module.
        // So, chat.completions.create will be this specific jest.fn() instance.
        create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'initial default fake LLM response from factory' } }] })
      }
    }
  })
}));

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

jest.mock('@/lib/chatUtils', () => ({
  ...jest.requireActual('@/lib/chatUtils'),
  getPersonaDetails: jest.fn(),
  analyzeSentiment: jest.fn(),
  getRelevantMemory: jest.fn(),
  saveMessage: jest.fn(),
}));

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
const { getPersonaDetails, analyzeSentiment, getRelevantMemory, saveMessage } = jest.requireMock('@/lib/chatUtils') as jest.Mocked<typeof import('@/lib/chatUtils')>;
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
  let mockCreateFn: jest.Mock; // To hold the reference to the mocked create function
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

    mockCreateFn.mockClear();
    mockCreateFn.mockResolvedValue({ choices: [{ message: { content: 'response from mockCreateFn in beforeEach (global path)' } }] });

    mockedDb.conversation.findFirst.mockReset();
    mockedDb.conversation.create.mockReset();
    mockedDb.conversation.update.mockReset();
    mockedDb.conversation.findMany.mockReset();
    mockedDb.message.create.mockReset();
    mockedDb.girlfriend.findUnique.mockReset();

    (getPersonaDetails as jest.Mock).mockResolvedValue({ id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] }); // Restored as per user feedback
    (analyzeSentiment as jest.Mock).mockResolvedValue('neutral'); // Restored as per user feedback
    (getRelevantMemory as jest.Mock).mockResolvedValue([]);
    (saveMessage as jest.Mock).mockImplementation(async (userId: string, conversationId: string, content: string, isUserMessage: boolean, prismaInstance: any): Promise<Message> => ({
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

  const createMockRequest = (body: any, searchParams?: Record<string, string>) => {
    const url = new URL('http://localhost/api/chat');
    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
    }
    return new NextRequest(url.toString(), {
      method: 'POST',
      body: JSON.stringify(body),
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
    mockRequest = createMockRequest({ message: 'Test message', characterId: 'persona-1' });
    await POST(mockRequest);
    expect(analyzeSentiment).toHaveBeenCalledWith('Test message');
    expect(getRelevantMemory).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'Test message');
  });

  it('should construct system prompt with persona and empathy note for negative sentiment', async () => {
    (getPersonaDetails as jest.Mock).mockClear().mockResolvedValueOnce({ id: 'lily-id', name: 'Lily', traits: ['witty', 'companion'] });
    (analyzeSentiment as jest.Mock).mockClear().mockResolvedValueOnce('negative');
    mockRequest = createMockRequest({ message: 'I am sad', characterId: 'lily-id' });
    await POST(mockRequest);
    // Assertion target changes to mockCreateFn as per user feedback implication
    expect(mockCreateFn).toHaveBeenCalled();
    const messagesArg = mockCreateFn.mock.calls[0][0].messages;
    const systemMessage = messagesArg.find((m: any) => m.role === 'system');
    expect(systemMessage.content).toContain('You are Lily. Traits: witty, companion.');
    expect(systemMessage.content).toContain('Remember to be extra understanding and empathetic.');
  });

  it('should construct system prompt without empathy note for non-negative sentiment', async () => {
    (getPersonaDetails as jest.Mock).mockClear().mockResolvedValueOnce({ id: 'persona-1', name: 'Test Persona', traits: ['neutral'] });
    (analyzeSentiment as jest.Mock).mockClear().mockResolvedValueOnce('neutral');
    mockRequest = createMockRequest({ message: 'Neutral message', characterId: 'persona-1' });
    await POST(mockRequest);
    expect(mockCreateFn).toHaveBeenCalled();
    const messagesArg = mockCreateFn.mock.calls[0][0].messages;
    const systemMessage = messagesArg.find((m: any) => m.role === 'system');
    expect(systemMessage.content).toContain('You are Test Persona. Traits: neutral.');
    expect(systemMessage.content).not.toContain('Remember to be extra understanding and empathetic.');
  });

  it('should assemble messages for LLM in correct order', async () => {
    (getPersonaDetails as jest.Mock).mockClear().mockResolvedValueOnce({ id: 'order-bot-id', name: 'OrderBot', traits: ['orderly'] });
    (analyzeSentiment as jest.Mock).mockClear().mockResolvedValueOnce('positive');
    (getRelevantMemory as jest.Mock).mockClear().mockResolvedValueOnce(['Memory: foo', 'Memory: bar']);
    mockRequest = createMockRequest({ message: 'User input', characterId: 'order-bot-id' });
    await POST(mockRequest);
    expect(mockCreateFn).toHaveBeenCalled();
    const messagesArg = mockCreateFn.mock.calls[0][0].messages;
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
    // Now, with the direct openaiClient mock, we expect mockCreateFn to be called
    // and its resolved value to be processed by the SUT.
    mockCreateFn.mockResolvedValueOnce({ choices: [{ message: { content: 'Extracted AI reply' } }] });
    mockRequest = createMockRequest({ message: 'Query', characterId: 'persona-1', stream: false }); // ensure non-streaming
    const response = await POST(mockRequest);
    const json = await response.json();
    expect(mockCreateFn).toHaveBeenCalled();
    expect(json.data.reply).toBe('Extracted AI reply');
  });

  it('should save user and AI messages', async () => {
    // Default mockCompletionsCreate provides 'default fake LLM response from beforeEach'
    // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
    mockRequest = createMockRequest({ message: 'Persist me', characterId: 'persona-1', stream: false });
    await POST(mockRequest);
    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(saveMessage).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'Persist me', true, db);
    // AI response should now come from mockCreateFn's default in beforeEach (global path)
    expect(saveMessage).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'response from mockCreateFn in beforeEach (global path)', false, db);
  });
  
  it('should return JSON response for non-streaming requests', async () => {
    // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
    // mockCreateFn will use its default from beforeEach for POST
    mockRequest = createMockRequest({ message: 'Non-stream test', stream: false });
    const response = await POST(mockRequest);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const json = await response.json();
    expect(json.success).toBe(true);
    // AI response should now come from mockCreateFn's default in beforeEach (global path)
    expect(json.data.reply).toBe('response from mockCreateFn in beforeEach (global path)');
  });

  describe('Streaming', () => {
    beforeEach(() => {
      const mockStreamData = {
        [Symbol.asyncIterator]: async function*() {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world' } }] };
        }
      };
      mockCreateFn.mockResolvedValue(mockStreamData as any); // Corrected typo: mockCompletionsCreate -> mockCreateFn
    });
    
    it('should return StreamingTextResponse for streaming requests', async () => {
      // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
      mockRequest = createMockRequest({ message: 'Stream test', characterId: 'persona-1' }, { stream: 'true' });
      const response = await POST(mockRequest);
      
      const { StreamingTextResponse: StreamingTextResponseMock } = jest.requireMock('ai');
      expect(StreamingTextResponseMock).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      // expect(actualMockGetOpenAIClient).toHaveBeenCalled(); // No longer relevant with new mock
      expect(mockCreateFn).toHaveBeenCalled(); // Corrected typo and target
    });
  
    it('should save AI message after streaming is complete', async () => {
      // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
      // The global mock for OpenAIStream in jest.mock('ai',...) should now handle onCompletion.
      // The beforeEach for streaming sets up mockCompletionsCreate to return mockStreamData
      mockRequest = createMockRequest({ message: 'Stream and save', characterId: 'persona-1' }, { stream: 'true' });
      await POST(mockRequest);
      
      await new Promise(resolve => setImmediate(resolve)); // Allow microtasks (like onCompletion) to run
      
      expect(saveMessage).toHaveBeenCalledTimes(2);
      expect(saveMessage).toHaveBeenCalledWith(mockUser.id, expect.any(String), 'Hello world', false, db); // Content from mockStreamData
      expect(mockCreateFn).toHaveBeenCalled(); // Corrected typo and target
    });
  });


  it('should return 500 for generic errors', async () => {
    // analyzeSentiment is called before getPersonaDetails in the SUT's try block
    (analyzeSentiment as jest.Mock).mockClear().mockResolvedValueOnce('neutral'); // Ensure it doesn't reject by default
    (getPersonaDetails as jest.Mock).mockClear().mockRejectedValueOnce(new Error('Generic error'));
    mockRequest = createMockRequest({ message: 'Error test' });
    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to process message. Please try again.');
  });

  it('should return 502 if LLM call fails (non-streaming)', async () => {
    // (getPersonaDetails and analyzeSentiment are using defaults from beforeEach)
    mockCreateFn.mockClear().mockRejectedValueOnce(new Error('LLM connection failed'));
    mockRequest = createMockRequest({ message: 'LLM error test', stream: false }); // ensure non-streaming
    const response = await POST(mockRequest);
    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.error).toBe('AI service temporarily unavailable. Please try again.');
  });
  
  it('should default to neutral sentiment and empty memory if fetching them fails', async () => {
    (getPersonaDetails as jest.Mock).mockClear().mockResolvedValueOnce({ id: 'persona-1', name: 'Test Persona', traits: ['helpful', 'kind'] }); // Ensure getPersonaDetails doesn't fail
    (analyzeSentiment as jest.Mock).mockClear().mockRejectedValueOnce(new Error('Sentiment API down'));
    (getRelevantMemory as jest.Mock).mockClear().mockRejectedValueOnce(new Error('Memory DB down'));
    mockRequest = createMockRequest({ message: 'Fallback test' });
    await POST(mockRequest);
    expect(mockCreateFn).toHaveBeenCalled();
    const messagesArg = mockCreateFn.mock.calls[0][0].messages;
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