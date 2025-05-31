import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Middleware setup (must come before routes)
app.use(cors());
app.use(express.json());

// Root route - GET /
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Bitespeed Identity Reconciliation Service',
    version: '1.0.0',
    endpoints: {
      identify: {
        method: 'POST',
        path: '/identify',
        description: 'Identify and reconcile contact information'
      }
    }
  });
});

// POST /identify route
app.post('/identify', async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    // Input validation
    if (!email && !phoneNumber) {
      res.status(400).json({ error: 'email or phoneNumber is required' });
      return;
    }

    // Find matching contacts by email or phone number
    const matched = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email ?? undefined },
          { phoneNumber: phoneNumber ?? undefined }
        ]
      }
    });

    // Determine primary contact IDs
    const rootIds = new Set<number>();
    matched.forEach(c => rootIds.add(c.linkPrecedence === 'primary' ? c.id : c.linkedId!));
    const sortedIds = [...rootIds].sort((a, b) => a - b);
    const primaryId = sortedIds[0];

    // If no contact exists, create a new primary contact
    if (matched.length === 0) {
      const newPrimary = await prisma.contact.create({
        data: { email, phoneNumber, linkPrecedence: 'primary' }
      });

      res.json({
        contact: {
          primaryContactId: newPrimary.id,
          emails: [newPrimary.email].filter(Boolean),
          phoneNumbers: [newPrimary.phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
      return;
    }

    // If info is new, create a secondary contact
    const isExact = matched.some(c => c.email === email && c.phoneNumber === phoneNumber);
    if (!isExact) {
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: primaryId
        }
      });
    }

    // Fetch all related contacts
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: { in: sortedIds } },
          { linkedId: { in: sortedIds } }
        ]
      }
    });

    // Split primary and secondary contacts
    const primary = contacts.find(c => c.id === primaryId);
    const secondaries = contacts.filter(c => c.id !== primaryId);

    // Consolidate and deduplicate emails and phone numbers
    const emails = [...new Set([primary?.email, ...secondaries.map(c => c.email)].filter(Boolean))];
    const phones = [...new Set([primary?.phoneNumber, ...secondaries.map(c => c.phoneNumber)].filter(Boolean))];

    // Send final response
    res.json({
      contact: {
        primaryContactId: primary!.id,
        emails,
        phoneNumbers: phones,
        secondaryContactIds: secondaries.map(c => c.id)
      }
    });
  } catch (error) {
    console.error('Error in /identify route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});