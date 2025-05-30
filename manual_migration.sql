
[+] Added tables
  - User
  - Girlfriend
  - Character
  - Conversation
  - Message
  - Subscription
  - Memory
  - UserPreference
  - ConversationSummary
  - Feedback
  - UserProfile
  - profiles

[*] Changed the `ConversationSummary` table
  [+] Added unique index on columns (conversationId)

[*] Changed the `Feedback` table
  [+] Added index on columns (conversationId)
  [+] Added index on columns (userId)

[*] Changed the `Memory` table
  [+] Added unique index on columns (key, conversationId)

[*] Changed the `Subscription` table
  [+] Added unique index on columns (userId)

[*] Changed the `User` table
  [+] Added unique index on columns (email)

[*] Changed the `UserPreference` table
  [+] Added unique index on columns (userId, key)

[*] Changed the `UserProfile` table
  [+] Added unique index on columns (userId)

[*] Changed the `profiles` table
  [+] Added unique index on columns (email)
