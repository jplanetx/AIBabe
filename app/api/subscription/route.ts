export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "User ID and plan are required" },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await db.subscription.findUnique({
      where: {
        userId,
      },
    });

    let subscription;

    if (existingSubscription) {
      // Update existing subscription
      subscription = await db.subscription.update({
        where: {
          userId,
        },
        data: {
          plan,
          active: true,
          endDate: null, // Reset end date if reactivating
        },
      });
    } else {
      // Create new subscription
      subscription = await db.subscription.create({
        data: {
          userId,
          plan,
          active: true,
        },
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating/updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create/update subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, active, plan } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (active !== undefined) {
      updateData.active = active;
      
      // If deactivating, set end date
      if (!active) {
        updateData.endDate = new Date();
      }
    }
    
    if (plan) {
      updateData.plan = plan;
    }

    const subscription = await db.subscription.update({
      where: {
        userId,
      },
      data: updateData,
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}