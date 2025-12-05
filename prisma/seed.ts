/**
 * Fleet Feast - Database Seed Script
 *
 * Creates comprehensive development data including:
 * - 3 admin users
 * - 10 sample vendors (various cuisines, statuses)
 * - 20 sample customers
 * - 30 sample bookings (various statuses)
 * - Related payments, messages, reviews
 * - Sample violations and disputes
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Helper: Random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Random element from array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// NYC Addresses for realistic data
const NYC_ADDRESSES = [
  { location: '40.7589,-73.9851', address: '123 Broadway, New York, NY 10006' },
  { location: '40.7614,-73.9776', address: '456 Park Ave, New York, NY 10022' },
  { location: '40.7580,-73.9855', address: '789 5th Ave, New York, NY 10019' },
  { location: '40.7505,-73.9934', address: '321 W 34th St, New York, NY 10001' },
  { location: '40.7282,-73.9942', address: '555 E Houston St, New York, NY 10002' },
  { location: '40.7061,-74.0087', address: '200 Vesey St, New York, NY 10281' },
  { location: '40.7128,-74.0060', address: '100 Wall St, New York, NY 10005' },
  { location: '40.7589,-73.9920', address: '888 8th Ave, New York, NY 10019' },
  { location: '40.7614,-73.9630', address: '700 Lexington Ave, New York, NY 10022' },
  { location: '40.7489,-73.9680', address: '405 E 42nd St, New York, NY 10017' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // 1. CREATE ADMIN USERS
  // ============================================================================
  console.log('\n👤 Creating admin users...');

  const adminPassword = await hashPassword('Admin123!');

  const admins = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@fleetfeast.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'support@fleetfeast.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@fleetfeast.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ Created ${admins.length} admin users`);

  // ============================================================================
  // 2. CREATE CUSTOMERS
  // ============================================================================
  console.log('\n👥 Creating customer accounts...');

  const customerPassword = await hashPassword('Customer123!');
  const customerNames = [
    'john.doe', 'jane.smith', 'mike.johnson', 'sarah.williams', 'david.brown',
    'emily.davis', 'chris.miller', 'amanda.wilson', 'robert.moore', 'lisa.taylor',
    'james.anderson', 'maria.thomas', 'kevin.jackson', 'linda.white', 'daniel.harris',
    'patricia.martin', 'mark.thompson', 'jennifer.garcia', 'paul.martinez', 'nancy.robinson',
  ];

  const customers = await Promise.all(
    customerNames.map((name) =>
      prisma.user.create({
        data: {
          email: `${name}@example.com`,
          passwordHash: customerPassword,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      })
    )
  );

  console.log(`✅ Created ${customers.length} customer accounts`);

  // ============================================================================
  // 3. CREATE VENDOR USERS & PROFILES
  // ============================================================================
  console.log('\n🚚 Creating vendor accounts and profiles...');

  const vendorPassword = await hashPassword('Vendor123!');

  const vendorData = [
    {
      email: 'tacos.loco@fleetfeast.com',
      businessName: "Tacos Loco NYC",
      cuisineType: 'MEXICAN',
      description: 'Authentic Mexican street tacos with homemade tortillas and fresh ingredients. Family recipes passed down for generations.',
      priceRange: 'MODERATE',
      capacityMin: 25,
      capacityMax: 200,
      serviceArea: 'Manhattan, Brooklyn',
      status: 'APPROVED',
      approvedAt: new Date('2024-10-15'),
      stripeConnected: true,
    },
    {
      email: 'bbq.masters@fleetfeast.com',
      businessName: "BBQ Masters",
      cuisineType: 'BBQ',
      description: 'Slow-smoked meats, signature sauces, and classic Southern sides. Perfected over 20 years of BBQ competition.',
      priceRange: 'PREMIUM',
      capacityMin: 30,
      capacityMax: 250,
      serviceArea: 'Manhattan, Queens, Brooklyn',
      status: 'APPROVED',
      approvedAt: new Date('2024-09-20'),
      stripeConnected: true,
    },
    {
      email: 'asian.fusion@fleetfeast.com',
      businessName: "Asian Fusion Express",
      cuisineType: 'ASIAN',
      description: 'Modern Asian fusion cuisine blending Japanese, Thai, and Korean flavors. Creative dishes with bold taste profiles.',
      priceRange: 'MODERATE',
      capacityMin: 20,
      capacityMax: 150,
      serviceArea: 'Manhattan',
      status: 'APPROVED',
      approvedAt: new Date('2024-11-01'),
      stripeConnected: true,
    },
    {
      email: 'italian.delight@fleetfeast.com',
      businessName: "Italian Delight Truck",
      cuisineType: 'ITALIAN',
      description: 'Wood-fired pizza, fresh pasta, and classic Italian dishes. Made with imported ingredients from Italy.',
      priceRange: 'PREMIUM',
      capacityMin: 25,
      capacityMax: 180,
      serviceArea: 'Manhattan, Brooklyn, Queens',
      status: 'APPROVED',
      approvedAt: new Date('2024-08-10'),
      stripeConnected: true,
    },
    {
      email: 'vegan.vibes@fleetfeast.com',
      businessName: "Vegan Vibes",
      cuisineType: 'VEGAN',
      description: '100% plant-based comfort food. Delicious vegan burgers, tacos, and desserts that everyone will love.',
      priceRange: 'MODERATE',
      capacityMin: 15,
      capacityMax: 120,
      serviceArea: 'Manhattan, Brooklyn',
      status: 'APPROVED',
      approvedAt: new Date('2024-10-05'),
      stripeConnected: true,
    },
    {
      email: 'seafood.shack@fleetfeast.com',
      businessName: "Seafood Shack on Wheels",
      cuisineType: 'SEAFOOD',
      description: 'Fresh catch daily. Lobster rolls, fish tacos, clam chowder, and more. Sourced from sustainable fisheries.',
      priceRange: 'LUXURY',
      capacityMin: 20,
      capacityMax: 150,
      serviceArea: 'Manhattan',
      status: 'APPROVED',
      approvedAt: new Date('2024-09-15'),
      stripeConnected: true,
    },
    {
      email: 'coffee.cart@fleetfeast.com',
      businessName: "Artisan Coffee Cart",
      cuisineType: 'COFFEE',
      description: 'Specialty coffee, artisan pastries, and breakfast sandwiches. Perfect for morning events and corporate catering.',
      priceRange: 'BUDGET',
      capacityMin: 10,
      capacityMax: 100,
      serviceArea: 'Manhattan, Brooklyn, Queens',
      status: 'APPROVED',
      approvedAt: new Date('2024-11-10'),
      stripeConnected: true,
    },
    {
      email: 'dessert.dreams@fleetfeast.com',
      businessName: "Dessert Dreams",
      cuisineType: 'DESSERTS',
      description: 'Gourmet ice cream, churros, funnel cakes, and custom desserts. We make any event sweeter!',
      priceRange: 'MODERATE',
      capacityMin: 15,
      capacityMax: 200,
      serviceArea: 'Manhattan, Brooklyn',
      status: 'APPROVED',
      approvedAt: new Date('2024-10-25'),
      stripeConnected: true,
    },
    {
      email: 'pending.vendor@fleetfeast.com',
      businessName: "New American Food Co",
      cuisineType: 'AMERICAN',
      description: 'Classic American comfort food with a modern twist. Burgers, hot dogs, mac & cheese, and more.',
      priceRange: 'MODERATE',
      capacityMin: 20,
      capacityMax: 150,
      serviceArea: 'Brooklyn',
      status: 'PENDING',
      approvedAt: null,
      stripeConnected: false,
    },
    {
      email: 'suspended.vendor@fleetfeast.com',
      businessName: "Spicy Street Food",
      cuisineType: 'ASIAN',
      description: 'Bold flavors from Southeast Asia. Temporarily suspended for policy review.',
      priceRange: 'BUDGET',
      capacityMin: 15,
      capacityMax: 100,
      serviceArea: 'Manhattan',
      status: 'SUSPENDED',
      approvedAt: new Date('2024-07-01'),
      stripeConnected: true,
    },
  ];

  const vendors = [];
  for (const vendor of vendorData) {
    const user = await prisma.user.create({
      data: {
        email: vendor.email,
        passwordHash: vendorPassword,
        role: 'VENDOR',
        status: vendor.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      },
    });

    const location = randomElement(NYC_ADDRESSES);

    const vendorProfile = await prisma.vendor.create({
      data: {
        userId: user.id,
        businessName: vendor.businessName,
        cuisineType: vendor.cuisineType as any,
        description: vendor.description,
        priceRange: vendor.priceRange as any,
        capacityMin: vendor.capacityMin,
        capacityMax: vendor.capacityMax,
        serviceArea: vendor.serviceArea,
        location: location.location,
        status: vendor.status as any,
        approvedAt: vendor.approvedAt,
        approvedBy: vendor.approvedAt ? admins[0].id : null,
        stripeAccountId: vendor.stripeConnected ? `acct_${user.id.substring(0, 16)}` : null,
        stripeConnected: vendor.stripeConnected,
      },
    });

    vendors.push({ user, vendor: vendorProfile });

    // Create sample menu for approved vendors
    if (vendor.status === 'APPROVED') {
      await prisma.vendorMenu.create({
        data: {
          vendorId: vendorProfile.id,
          pricingModel: 'per_person',
          items: [
            {
              id: `${vendorProfile.id}-item-1`,
              name: 'Signature Dish #1',
              description: 'Our most popular item',
              price: 12.99,
              category: 'main',
              dietary_tags: ['gluten-free-option'],
            },
            {
              id: `${vendorProfile.id}-item-2`,
              name: 'Signature Dish #2',
              description: 'A customer favorite',
              price: 14.99,
              category: 'main',
              dietary_tags: ['vegetarian'],
            },
            {
              id: `${vendorProfile.id}-item-3`,
              name: 'Side Dish',
              description: 'Perfect accompaniment',
              price: 5.99,
              category: 'side',
              dietary_tags: [],
            },
            {
              id: `${vendorProfile.id}-item-4`,
              name: 'Dessert Special',
              description: 'Sweet ending',
              price: 6.99,
              category: 'dessert',
              dietary_tags: ['vegetarian'],
            },
          ],
        },
      });

      // Create availability for next 30 days
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Make some dates unavailable (randomly)
        const isAvailable = Math.random() > 0.2; // 80% available

        await prisma.availability.create({
          data: {
            vendorId: vendorProfile.id,
            date: date,
            isAvailable,
            notes: !isAvailable ? 'Already booked' : null,
          },
        });
      }

      // Create sample documents for approved vendors
      await prisma.vendorDocument.createMany({
        data: [
          {
            vendorId: vendorProfile.id,
            type: 'BUSINESS_LICENSE',
            fileName: 'business-license.pdf',
            fileUrl: `s3://fleet-feast-docs/${vendorProfile.id}/business-license.pdf`,
            fileSize: 245678,
            verified: true,
            verifiedAt: vendor.approvedAt,
            verifiedBy: admins[0].id,
          },
          {
            vendorId: vendorProfile.id,
            type: 'HEALTH_PERMIT',
            fileName: 'health-permit.pdf',
            fileUrl: `s3://fleet-feast-docs/${vendorProfile.id}/health-permit.pdf`,
            fileSize: 189234,
            verified: true,
            verifiedAt: vendor.approvedAt,
            verifiedBy: admins[0].id,
          },
          {
            vendorId: vendorProfile.id,
            type: 'INSURANCE',
            fileName: 'insurance-policy.pdf',
            fileUrl: `s3://fleet-feast-docs/${vendorProfile.id}/insurance.pdf`,
            fileSize: 567890,
            verified: true,
            verifiedAt: vendor.approvedAt,
            verifiedBy: admins[0].id,
          },
        ],
      });
    }
  }

  console.log(`✅ Created ${vendors.length} vendor accounts with profiles`);

  // ============================================================================
  // 4. CREATE BOOKINGS & PAYMENTS
  // ============================================================================
  console.log('\n📅 Creating bookings with payments...');

  const approvedVendors = vendors.filter(v => v.vendor.status === 'APPROVED');
  const bookingsData = [];

  // Helper to create booking with payment
  async function createBookingWithPayment(data: any) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({ data: data.booking });
      const payment = await tx.payment.create({ data: { ...data.payment, bookingId: booking.id } });
      return { booking, payment };
    });
  }

  // Past completed bookings (for review history)
  for (let i = 0; i < 10; i++) {
    const customer = randomElement(customers);
    const vendor = randomElement(approvedVendors);
    const eventDate = randomDate(new Date('2024-09-01'), new Date('2024-11-15'));
    const totalAmount = Math.floor(Math.random() * 1000) + 500;
    const platformFee = totalAmount * 0.15;
    const vendorPayout = totalAmount - platformFee;

    const result = await createBookingWithPayment({
      booking: {
        customerId: customer.id,
        vendorId: vendor.user.id,
        eventDate,
        eventTime: '18:00',
        eventType: randomElement(['CORPORATE', 'WEDDING', 'BIRTHDAY', 'PRIVATE_PARTY']),
        location: randomElement(NYC_ADDRESSES).address,
        guestCount: Math.floor(Math.random() * 100) + 30,
        specialRequests: 'Please arrive 30 minutes early for setup.',
        totalAmount,
        platformFee,
        vendorPayout,
        status: 'COMPLETED',
        acceptedAt: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        respondedAt: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      payment: {
        amount: totalAmount,
        status: 'RELEASED',
        stripePaymentIntentId: `pi_${Math.random().toString(36).substring(7)}`,
        stripeTransferId: `tr_${Math.random().toString(36).substring(7)}`,
        authorizedAt: new Date(eventDate.getTime() - 6 * 24 * 60 * 60 * 1000),
        capturedAt: eventDate,
        releasedAt: new Date(eventDate.getTime() + 8 * 24 * 60 * 60 * 1000),
      },
    });

    bookingsData.push(result);

    // Add review for some completed bookings
    if (Math.random() > 0.5) {
      await prisma.review.create({
        data: {
          bookingId: result.booking.id,
          reviewerId: customer.id,
          revieweeId: vendor.user.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          content: 'Great service! The food was delicious and the truck was on time. Highly recommend!',
          flagged: false,
          hidden: false,
        },
      });
    }
  }

  // Upcoming confirmed bookings
  for (let i = 0; i < 8; i++) {
    const customer = randomElement(customers);
    const vendor = randomElement(approvedVendors);
    const eventDate = randomDate(new Date(), new Date('2025-01-15'));
    const totalAmount = Math.floor(Math.random() * 1200) + 600;
    const platformFee = totalAmount * 0.15;
    const vendorPayout = totalAmount - platformFee;

    const result = await createBookingWithPayment({
      booking: {
        customerId: customer.id,
        vendorId: vendor.user.id,
        eventDate,
        eventTime: randomElement(['12:00', '13:00', '18:00', '19:00']),
        eventType: randomElement(['CORPORATE', 'WEDDING', 'BIRTHDAY', 'FESTIVAL']),
        location: randomElement(NYC_ADDRESSES).address,
        guestCount: Math.floor(Math.random() * 120) + 40,
        specialRequests: 'Vegetarian options needed for 10 guests.',
        totalAmount,
        platformFee,
        vendorPayout,
        status: 'CONFIRMED',
        acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      payment: {
        amount: totalAmount,
        status: 'AUTHORIZED',
        stripePaymentIntentId: `pi_${Math.random().toString(36).substring(7)}`,
        authorizedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    bookingsData.push(result);
  }

  // Pending bookings (awaiting vendor response)
  for (let i = 0; i < 5; i++) {
    const customer = randomElement(customers);
    const vendor = randomElement(approvedVendors);
    const eventDate = randomDate(new Date('2024-12-15'), new Date('2025-01-30'));
    const totalAmount = Math.floor(Math.random() * 900) + 400;
    const platformFee = totalAmount * 0.15;
    const vendorPayout = totalAmount - platformFee;

    const result = await createBookingWithPayment({
      booking: {
        customerId: customer.id,
        vendorId: vendor.user.id,
        eventDate,
        eventTime: randomElement(['11:00', '12:00', '17:00', '18:00']),
        eventType: randomElement(['CORPORATE', 'PRIVATE_PARTY', 'BIRTHDAY']),
        location: randomElement(NYC_ADDRESSES).address,
        guestCount: Math.floor(Math.random() * 80) + 25,
        specialRequests: null,
        totalAmount,
        platformFee,
        vendorPayout,
        status: 'PENDING',
      },
      payment: {
        amount: totalAmount,
        status: 'PENDING',
      },
    });

    bookingsData.push(result);
  }

  // Cancelled bookings (with refunds)
  for (let i = 0; i < 3; i++) {
    const customer = randomElement(customers);
    const vendor = randomElement(approvedVendors);
    const eventDate = randomDate(new Date('2024-12-20'), new Date('2025-01-20'));
    const totalAmount = Math.floor(Math.random() * 800) + 500;
    const platformFee = totalAmount * 0.15;
    const vendorPayout = totalAmount - platformFee;
    const refundAmount = totalAmount * 0.5; // 50% refund

    const result = await createBookingWithPayment({
      booking: {
        customerId: customer.id,
        vendorId: vendor.user.id,
        eventDate,
        eventTime: '18:00',
        eventType: 'CORPORATE',
        location: randomElement(NYC_ADDRESSES).address,
        guestCount: Math.floor(Math.random() * 60) + 30,
        totalAmount,
        platformFee,
        vendorPayout,
        status: 'CANCELLED',
        acceptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        respondedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        cancelledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        cancelledBy: customer.id,
        cancellationReason: 'Event postponed due to scheduling conflict',
        refundAmount,
      },
      payment: {
        amount: totalAmount,
        status: 'REFUNDED',
        stripePaymentIntentId: `pi_${Math.random().toString(36).substring(7)}`,
        authorizedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        refundedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });

    bookingsData.push(result);
  }

  // Booking with active dispute
  const customer = randomElement(customers);
  const vendor = randomElement(approvedVendors);
  const eventDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const totalAmount = 1200;
  const platformFee = totalAmount * 0.15;
  const vendorPayout = totalAmount - platformFee;

  const disputedBooking = await createBookingWithPayment({
    booking: {
      customerId: customer.id,
      vendorId: vendor.user.id,
      eventDate,
      eventTime: '18:00',
      eventType: 'WEDDING',
      location: randomElement(NYC_ADDRESSES).address,
      guestCount: 100,
      specialRequests: 'Setup required by 5:30 PM',
      totalAmount,
      platformFee,
      vendorPayout,
      status: 'DISPUTED',
      acceptedAt: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
    payment: {
      amount: totalAmount,
      status: 'CAPTURED',
      stripePaymentIntentId: `pi_${Math.random().toString(36).substring(7)}`,
      authorizedAt: new Date(eventDate.getTime() - 13 * 24 * 60 * 60 * 1000),
      capturedAt: eventDate,
    },
  });

  bookingsData.push(disputedBooking);

  console.log(`✅ Created ${bookingsData.length} bookings with payments`);

  // ============================================================================
  // 5. CREATE MESSAGES
  // ============================================================================
  console.log('\n💬 Creating messages...');

  let messageCount = 0;
  let flaggedCount = 0;

  // Add messages to some bookings
  for (const bookingData of bookingsData.slice(0, 15)) {
    const booking = bookingData.booking;
    const messageCount2 = Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < messageCount2; i++) {
      const isCustomerMessage = i % 2 === 0;
      const sender = isCustomerMessage ? booking.customerId : booking.vendorId;

      // Create some flagged messages for testing
      const shouldFlag = Math.random() > 0.85;
      const flaggedContent = shouldFlag
        ? 'You can reach me at 555-123-4567 to discuss details.'
        : null;

      const normalMessages = [
        'Hi! Looking forward to the event. Do you have vegetarian options?',
        'Yes, we have several vegetarian dishes available. Would you like to see the menu?',
        'That would be great! Also, can you arrive 30 minutes early for setup?',
        'Absolutely! We always arrive early to ensure everything is ready.',
        'Perfect! See you at the event.',
        'Thank you for booking with us!',
        'Do you provide serving staff as well?',
        'Yes, we include 2 staff members for events over 50 guests.',
      ];

      const content = flaggedContent || randomElement(normalMessages);

      const message = await prisma.message.create({
        data: {
          bookingId: booking.id,
          senderId: sender,
          content,
          flagged: shouldFlag,
          flagReason: shouldFlag ? 'Phone number detected' : null,
          flagSeverity: shouldFlag ? 'HIGH' : 'NONE',
          createdAt: new Date(booking.createdAt.getTime() + i * 3600000), // 1 hour apart
        },
      });

      messageCount++;
      if (shouldFlag) flaggedCount++;
    }
  }

  console.log(`✅ Created ${messageCount} messages (${flaggedCount} flagged for review)`);

  // ============================================================================
  // 6. CREATE VIOLATIONS
  // ============================================================================
  console.log('\n⚠️  Creating sample violations...');

  // Create violations for flagged messages
  const flaggedMessages = await prisma.message.findMany({
    where: { flagged: true },
    include: { booking: true },
  });

  for (const message of flaggedMessages.slice(0, 5)) {
    await prisma.violation.create({
      data: {
        userId: message.senderId,
        type: 'CONTACT_INFO_SHARING',
        description: `Shared contact information in message: "${message.flagReason}"`,
        severity: message.flagSeverity as any,
        relatedMessageId: message.id,
        relatedBookingId: message.bookingId,
        actionTaken: 'warning',
        resolvedAt: null,
      },
    });
  }

  console.log(`✅ Created ${Math.min(flaggedMessages.length, 5)} violations`);

  // ============================================================================
  // 7. CREATE DISPUTE
  // ============================================================================
  console.log('\n⚖️  Creating sample dispute...');

  await prisma.dispute.create({
    data: {
      bookingId: disputedBooking.booking.id,
      initiatorId: disputedBooking.booking.customerId,
      reason: 'Vendor arrived 45 minutes late and several menu items were unavailable. Event was negatively impacted.',
      evidence: [
        'https://s3.amazonaws.com/fleet-feast/disputes/photo1.jpg',
        'https://s3.amazonaws.com/fleet-feast/disputes/photo2.jpg',
      ],
      status: 'INVESTIGATING',
    },
  });

  console.log('✅ Created 1 active dispute');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Admins: ${admins.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Vendors: ${vendors.length} (${approvedVendors.length} approved)`);
  console.log(`   - Bookings: ${bookingsData.length}`);
  console.log(`   - Messages: ${messageCount} (${flaggedCount} flagged)`);
  console.log(`   - Violations: ${Math.min(flaggedMessages.length, 5)}`);
  console.log(`   - Disputes: 1 active`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@fleetfeast.com / Admin123!');
  console.log('   Customer: john.doe@example.com / Customer123!');
  console.log('   Vendor: tacos.loco@fleetfeast.com / Vendor123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
