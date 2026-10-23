const audit = ['id', 'createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate'];

// Public API properties only. Passwords, reset/activation keys and SQL expressions
// must never be accepted as sortable identifiers, even on administrator endpoints.
export const allowedSortFields = {
  user: [...audit, 'login', 'firstName', 'lastName', 'email', 'activated', 'langKey'],
  person: [...audit, 'fullName', 'documentNumber', 'phone', 'email', 'status', 'createdAt', 'subscriberNumber', 'stratum', 'address.id'],
  address: [...audit, 'neighborhood', 'street', 'houseNumber', 'city', 'latitude', 'longitude'],
  meter: [...audit, 'waterMeasure', 'readingDate', 'observation', 'createdAt', 'person.id', 'address.id'],
  invoice: [
    ...audit,
    'issueDate',
    'dueDate',
    'consumptionM3',
    'amountDue',
    'ratePerM3',
    'fixedCharge',
    'subsidyPercent',
    'additionalCharges',
    'status',
    'createdAt',
    'meter.id',
    'person.id',
  ],
  noticia: [...audit, 'title', 'summary', 'category', 'status', 'publishDate'],
  reporte: [...audit, 'type', 'description', 'status', 'createdAt', 'person.id'],
} as const;
