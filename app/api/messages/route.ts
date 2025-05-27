export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('GET /api/messages: Error getting session:', sessionError);
      return NextResponse.json({ error: "Authentication error" }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    const messages = await db.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('POST /api/messages: Error getting session:', sessionError);
      return NextResponse.json({ error: "Authentication error" }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { content, isUserMessage, girlfriendId, conversationId } = body;

    if (!content || !girlfriendId || !conversationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Check user's subscription and message limits
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check message limits based on subscription plan
    if (isUserMessage) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const messageCount = await db.message.count({
        where: {
          conversation: {
            userId: userId,
          },
          isUserMessage: true,
          createdAt: {
            gte: today,
          },
        },
      });

      const FREE_TIER_LIMIT = 15;
      const BASIC_TIER_LIMIT = 150;

      if (
        (user.subscription?.plan === "FREE" && messageCount >= FREE_TIER_LIMIT) ||
        (user.subscription?.plan === "BASIC" && messageCount >= BASIC_TIER_LIMIT)
      ) {
        return NextResponse.json(
          { error: "Message limit reached for your subscription plan" },
          { status: 403 }
        );
      }
    }

    // Create message
    const message = await db.message.create({
      data: {
        content,
        isUserMessage,
        conversationId,
      },
    });

    // If it's a user message, extract potential memories
    if (isUserMessage) {
      // Simple memory extraction logic - in a real app, this would be more sophisticated
      const keywords = ["favorite", "like", "love", "hate", "enjoy", "birthday", "name", "live"];
      
      for (const keyword of keywords) {
        if (content.toLowerCase().includes(keyword)) {
          await db.memory.create({
            data: {
              key: `memory_${keyword}`,
              value: content,
              conversationId,
              userId,
            },
          });
          break; // Only create one memory per message
        }
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
