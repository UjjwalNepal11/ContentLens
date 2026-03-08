import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || !isValidName(name.trim())) {
      return NextResponse.json(
        { error: "Name should contain only letters" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const supportMessage = await prisma.supportMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json(
      { message: "Support message sent successfully", data: supportMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating support message:", error);
    return NextResponse.json(
      { error: "Failed to send support message" },
      { status: 500 }
    );
  }
}
