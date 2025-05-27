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
      console.error('GET /api/conversations: Error getting session:', sessionError);
      return NextResponse.json({ error: "Authentication error" }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await db.conversation.findMany({
      where: {
        userId,
      },
      include: {
        girlfriend: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 10,
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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
      console.error('POST /api/conversations: Error getting session:', sessionError);
      return NextResponse.json({ error: "Authentication error" }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { girlfriendId } = body;

    if (!girlfriendId) {
      return NextResponse.json(
        { error: "Girlfriend ID is required" },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await db.conversation.findFirst({
      where: {
        userId,
        girlfriendId,
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        userId,
        girlfriendId,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
