const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PeoplePay360 HR & Payroll API',
      version: '1.0.0',
      description: 'HR Manager Employee CRUD APIs',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    tags: [
      {
        name: 'Employees',
        description: 'HR Manager employee management',
      },
    ],
    components: {
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66b1a2c3d4e5f6789012345a' },
            employeeCode: { type: 'string', example: 'EMP-001' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@company.com' },
            phone: { type: 'string', example: '+1-555-0100' },
            department: { type: 'string', example: 'Engineering' },
            jobPosition: { type: 'string', example: 'Software Engineer' },
            manager: {
              type: 'string',
              nullable: true,
              description: 'Existing employee MongoDB ID or full name (e.g. John Doe). Omit if no manager.',
              example: '66b1a2c3d4e5f6789012345b',
            },
            workingSchedule: { type: 'string', nullable: true, example: 'Standard 40h Week' },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'on_leave', 'terminated'],
              example: 'active',
            },
            hireDate: { type: 'string', format: 'date', example: '2024-01-15' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                country: { type: 'string', example: 'USA' },
                zipCode: { type: 'string', example: '10001' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EmployeeInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'department', 'jobPosition'],
          properties: {
            employeeCode: { type: 'string', example: 'EMP-001' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@company.com' },
            phone: { type: 'string', example: '+1-555-0100' },
            department: { type: 'string', example: 'Engineering' },
            jobPosition: { type: 'string', example: 'Software Engineer' },
            manager: {
              type: 'string',
              nullable: true,
              description: 'Existing employee MongoDB ID or full name (e.g. John Doe). Omit if no manager.',
            },
            workingSchedule: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'on_leave', 'terminated'],
              example: 'active',
            },
            hireDate: { type: 'string', format: 'date', example: '2024-01-15' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                zipCode: { type: 'string' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { $ref: '#/components/schemas/Employee' },
          },
        },
        EmployeeListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            count: { type: 'integer', example: 10 },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
