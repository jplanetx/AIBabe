import { checkConnections } from './semanticMemoryStore';

describe('Semantic Memory Store Connections', () => {
  it('should successfully connect to Pinecone', async () => {
    const connections = await checkConnections();
    expect(connections.pinecone).toBe(true);
  });
});