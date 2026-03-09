import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Feedback Portal API",
      version: "1.0.0",
      description: "API documentation for the Employee Feedback Portal system",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Employee: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            department: { type: "string" },
            avgRating: { type: "number", nullable: true },
            feedbackCount: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Feedback: {
          type: "object",
          properties: {
            _id: { type: "string" },
            givenBy: { type: "string" },
            givenTo: { type: "string" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            status: { type: "integer" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
