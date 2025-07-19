import { z } from "genkit";
import { Client } from "pg";

// Define input schema for the database flow
const DbInputSchema = z.object({
  user: z.string(),
  host: z.string(),
  database: z.string(),
  password: z.string(),
  port: z.number(),
  query: z.string(),
});

// Define the PostgreSQL flow
export const postgresFlow = (ai: any) =>
  ai.defineFlow(
    {
      name: "postgresFlow",
      inputSchema: DbInputSchema,
      outputSchema: z.any(),
    },
    async (input: any) => {
      const client = new Client({
        user: input.user,
        host: input.host,
        database: input.database,
        password: input.password,
        port: input.port,
      });

      try {
        await client.connect();
        const res = await client.query(input.query);
        return res.rows;
      } finally {
        await client.end();
      }
    }
  );

// Define the read flow
export const read = (ai: any) => {
  const readSchema = DbInputSchema.extend({
    table: z.string(),
    where: z.string().optional(),
  });

  return ai.defineFlow(
    {
      name: "read",
      inputSchema: readSchema,
      outputSchema: z.any(),
    },
    async (input: any) => {
      const client = new Client({
        user: input.user,
        host: input.host,
        database: input.database,
        password: input.password,
        port: input.port,
      });

      try {
        await client.connect();
        const res = await client.query(
          `SELECT * FROM ${input.table} ${
            input.where ? `WHERE ${input.where}` : ""
          }`
        );
        return res.rows;
      } finally {
        await client.end();
      }
    }
  );
};

// Define the plugin
export const postgresPlugin = (ai: any) => {
  return {
    name: "postgres",
    flows: [postgresFlow(ai), read(ai)],
  };
};
