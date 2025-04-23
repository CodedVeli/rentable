import { Property, Payment, Application, Viewing, Lease, Message, User } from "@shared/schema";

// Demo dates
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);

const sixMonthsLater = new Date(today);
sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

const oneYearLater = new Date(today);
oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

// Demo users
export const demoUsers: Partial<User>[] = [
  {
    id: 1,
    username: "landlord1",
    email: "landlord@example.com",
    firstName: "Michael",
    lastName: "Johnson",
    role: "landlord",
    phoneNumber: "416-555-0101",
    profileImage: null,
    stripeCustomerId: "cus_123456789"
  },
  {
    id: 2,
    username: "tenant1",
    email: "tenant@example.com",
    firstName: "Sarah",
    lastName: "Williams",
    role: "tenant",
    phoneNumber: "416-555-0202",
    profileImage: null,
    stripeCustomerId: "cus_987654321"
  }
];

// Demo properties
export const demoProperties: Partial<Property>[] = [
  {
    id: 1,
    landlordId: 1,
    title: "Spacious Downtown Condo",
    description: "Modern condo in the heart of downtown with stunning city views. Features include hardwood floors, stainless steel appliances, and floor-to-ceiling windows with panoramic views of the Toronto skyline. Building amenities include 24-hour concierge, fitness center, and rooftop lounge.",
    propertyType: "condo",
    status: "rented",
    addressStreet: "100 Queen Street West",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M5H 2N2",
    bedrooms: 2,
    bathrooms: 2,
    areaSquareFeet: 1200,
    monthlyRent: 250000, // $2,500.00
    depositAmount: 250000, // $2,500.00
    availableFrom: yesterday,
    leaseEndDate: oneYearLater,
    photos: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    ], 
    amenities: "Concierge, Fitness center, Rooftop lounge, In-suite laundry, Central air conditioning",
    tenantId: 2,
    createdAt: new Date("2023-12-01")
  },
  {
    id: 2,
    landlordId: 1,
    title: "Charming Midtown Apartment",
    description: "Cozy and well-maintained apartment in a quiet neighborhood. Recently renovated with brand new kitchen, hardwood floors throughout, and plenty of natural light. Located within walking distance to the subway, restaurants, and shopping.",
    propertyType: "apartment",
    status: "available",
    addressStreet: "150 Eglinton Avenue East",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M4P 1E8",
    bedrooms: 1,
    bathrooms: 1,
    areaSquareFeet: 750,
    monthlyRent: 180000, // $1,800.00
    depositAmount: 180000, // $1,800.00
    availableFrom: today,
    leaseEndDate: null,
    photos: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2344&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    ],
    amenities: "Laundry facilities, Hardwood floors, New appliances, Storage locker, Bicycle parking",
    tenantId: null,
    createdAt: new Date("2024-01-15")
  },
  {
    id: 3,
    landlordId: 1,
    title: "Luxury Waterfront House",
    description: "Exceptional waterfront property with panoramic lake views. This prestigious home features an open concept layout, gourmet kitchen with high-end appliances, and a private deck overlooking Lake Ontario. Perfect for those seeking a luxurious lifestyle with easy access to downtown Toronto.",
    propertyType: "house",
    status: "available",
    addressStreet: "80 Marine Parade Drive",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M8V 4B1",
    bedrooms: 3,
    bathrooms: 3,
    areaSquareFeet: 2200,
    monthlyRent: 350000, // $3,500.00
    depositAmount: 350000, // $3,500.00
    availableFrom: nextWeek,
    leaseEndDate: null,
    photos: [
      "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    ],
    amenities: "Private waterfront deck, Smart home features, Gourmet kitchen, Heated floors, Double garage, Private garden",
    tenantId: null,
    createdAt: new Date("2024-02-01")
  }
];

// Demo leases
export const demoLeases: Partial<Lease>[] = [
  {
    id: 1,
    landlordId: 1,
    tenantId: 2,
    propertyId: 1,
    startDate: yesterday,
    endDate: oneYearLater,
    monthlyRent: 250000, // $2,500.00
    depositAmount: 250000, // $2,500.00
    status: "active",
    leaseTerms: "Ontario Standard Form Lease (Form 2229E) compliant with the Residential Tenancies Act, 2006. Includes all required disclosures, tenant protections, and maintenance responsibilities as mandated by Ontario law. 12-month fixed term with automatic month-to-month conversion after expiration.",
    signedByLandlord: true,
    signedByTenant: true,
    documentUrl: "https://www.forms.ssb.gov.on.ca/mbs/ssb/forms/ssbforms.nsf/GetFileAttach/047-2229E~1/$File/2229E.pdf",
    createdAt: yesterday
  }
];

// Demo payments
export const demoPayments: Partial<Payment>[] = [
  {
    id: 1,
    landlordId: 1,
    tenantId: 2,
    leaseId: 1,
    amount: 250000, // $2,500.00
    description: "April 2025 Rent Payment",
    dueDate: new Date("2025-04-01"),
    status: "paid",
    paidDate: new Date("2025-04-01"),
    paymentMethod: "credit_card",
    transactionId: "tx_1234567890",
    createdAt: new Date("2025-03-25")
  },
  {
    id: 2,
    landlordId: 1,
    tenantId: 2,
    leaseId: 1,
    amount: 250000, // $2,500.00
    description: "May 2025 Rent Payment",
    dueDate: new Date("2025-05-01"),
    status: "pending",
    paidDate: null,
    paymentMethod: null,
    transactionId: null,
    createdAt: today
  },
  {
    id: 3,
    landlordId: 1,
    tenantId: 2,
    leaseId: 1,
    amount: 7500, // $75.00
    description: "Late Fee - March 2025",
    dueDate: new Date("2025-03-15"),
    status: "paid",
    paidDate: new Date("2025-03-20"),
    paymentMethod: "credit_card",
    transactionId: "tx_0987654321",
    createdAt: new Date("2025-03-10")
  }
];

// Demo applications
export const demoApplications: Partial<Application>[] = [
  {
    id: 1,
    tenantId: 2,
    landlordId: 1,
    propertyId: 2,
    status: "pending",
    income: 8000000, // $80,000.00
    creditCheck: true,
    references: [
      {
        name: "Michael Thompson",
        relationship: "Previous Landlord",
        phone: "+1 (416) 555-2345",
        email: "mthompson@example.com"
      },
      {
        name: "Jennifer Wilson",
        relationship: "Employer",
        phone: "+1 (647) 555-6789",
        email: "jwilson@example.com"
      }
    ],
    notes: "Interested in a 12-month lease with possibility to extend. Equifax credit check completed with consent as per Ontario privacy laws. Includes Ontario standard rental application with N4L form for income verification.",
    createdAt: yesterday
  },
  {
    id: 2,
    tenantId: 2,
    landlordId: 1,
    propertyId: 3,
    status: "pending",
    income: 8000000, // $80,000.00
    creditCheck: true,
    references: [
      {
        name: "Michael Thompson",
        relationship: "Previous Landlord",
        phone: "+1 (416) 555-2345",
        email: "mthompson@example.com"
      },
      {
        name: "Jennifer Wilson",
        relationship: "Employer",
        phone: "+1 (647) 555-6789",
        email: "jwilson@example.com"
      }
    ],
    notes: "Looking for a long-term rental opportunity. Would like to discuss Landlord and Tenant Board (LTB) rules around property access and maintenance standards. Ready to provide additional documents if necessary.",
    createdAt: today
  }
];

// Demo viewings
export const demoViewings: Partial<Viewing>[] = [
  {
    id: 1,
    propertyId: 2,
    landlordId: 1,
    tenantId: 2,
    scheduledDateTime: nextWeek,
    status: "confirmed",
    notes: "Meeting at the property entrance",
    createdAt: yesterday
  },
  {
    id: 2,
    propertyId: 3,
    landlordId: 1,
    tenantId: 2,
    scheduledDateTime: new Date(nextWeek.getTime() + 86400000 * 2), // 2 days after next week
    status: "pending",
    notes: null,
    createdAt: today
  }
];

// Demo messages
export const demoMessages: Partial<Message>[] = [
  {
    id: 1,
    senderId: 2,
    receiverId: 1,
    content: "Hello, I'm interested in scheduling a viewing for the Midtown apartment.",
    isRead: true,
    propertyId: 2,
    createdAt: yesterday
  },
  {
    id: 2,
    senderId: 1,
    receiverId: 2,
    content: "Hi Sarah, I'd be happy to show you the apartment. Are you available next week?",
    isRead: true,
    propertyId: 2,
    createdAt: yesterday
  },
  {
    id: 3,
    senderId: 2,
    receiverId: 1,
    content: "Yes, I'm available next Tuesday afternoon. Would that work for you?",
    isRead: true,
    propertyId: 2,
    createdAt: yesterday
  },
  {
    id: 4,
    senderId: 1,
    receiverId: 2,
    content: "Tuesday at 2 PM works great. I've scheduled the viewing. Looking forward to meeting you!",
    isRead: false,
    propertyId: 2,
    createdAt: today
  }
];

// Recent activities (for dashboard)
export const demoRecentActivities = [
  {
    id: "app-1",
    type: "application",
    title: "New application submitted for Charming Midtown Apartment",
    date: yesterday,
    link: "/landlord/applications/1",
    linkText: "Review application",
    icon: "user-check"
  },
  {
    id: "payment-1",
    type: "payment",
    title: "Rent payment received from Sarah Williams",
    date: new Date("2025-04-01"),
    link: "/landlord/payments/1",
    linkText: "View payment",
    icon: "money-bill-wave"
  },
  {
    id: "viewing-1",
    type: "viewing",
    title: "Viewing scheduled for Charming Midtown Apartment",
    date: nextWeek,
    link: "/landlord/viewings/1",
    linkText: "Manage schedule",
    icon: "calendar"
  },
  {
    id: "app-2",
    type: "application",
    title: "New application submitted for Luxury Waterfront House",
    date: today,
    link: "/landlord/applications/2",
    linkText: "Review application",
    icon: "user-check"
  }
];

// Notifications (for dashboard)
export const demoNotifications = [
  {
    id: 1,
    title: "Rent payment reminder",
    message: "May 2025 rent payment is due in 7 days",
    date: today,
    read: false,
    type: "payment"
  },
  {
    id: 2,
    title: "Viewing confirmation",
    message: "Viewing for Charming Midtown Apartment confirmed for next week",
    date: yesterday,
    read: true,
    type: "viewing"
  },
  {
    id: 3,
    title: "Application update",
    message: "Your application for Charming Midtown Apartment is under review",
    date: yesterday,
    read: false,
    type: "application"
  }
];

// Demographics data for analytics
export const demoDemographics = {
  tenantAgeGroups: [
    { group: "18-25", count: 15 },
    { group: "26-35", count: 45 },
    { group: "36-45", count: 25 },
    { group: "46-55", count: 10 },
    { group: "56+", count: 5 }
  ],
  occupancyRate: 0.85,
  avgTenancyLength: 14, // months
  avgResponseTime: 5.2, // hours
};

// Financial data for analytics
export const demoFinancials = {
  monthlyRevenue: [
    { month: "Jan", amount: 750000 },
    { month: "Feb", amount: 780000 },
    { month: "Mar", amount: 800000 },
    { month: "Apr", amount: 820000 },
    { month: "May", amount: 850000 },
    { month: "Jun", amount: 870000 }
  ],
  occupancyTrend: [
    { month: "Jan", rate: 0.78 },
    { month: "Feb", rate: 0.82 },
    { month: "Mar", rate: 0.80 },
    { month: "Apr", rate: 0.85 },
    { month: "May", rate: 0.88 },
    { month: "Jun", rate: 0.90 }
  ],
  maintenanceCosts: [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 32000 },
    { month: "Mar", amount: 28000 },
    { month: "Apr", amount: 35000 },
    { month: "May", amount: 40000 },
    { month: "Jun", amount: 30000 }
  ]
};